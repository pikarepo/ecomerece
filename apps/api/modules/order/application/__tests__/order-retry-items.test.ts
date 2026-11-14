import { describe, expect, it } from 'bun:test';
import { OrderAggregate } from '@ecomerece/domain';
import type { IEvent } from '@ecomerece/domain/events/event-bus.interface';
import { OrderStatusVO } from '@ecomerece/domain/modules/order/value-objects/order-status.vo';
import { DeleteInfoVO } from '@ecomerece/domain/value-objects/delete-info.vo';
import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Money } from '@ecomerece/domain/value-objects/money.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { FullAddressVO } from '@ecomerece/domain/value-objects/street-address.vo';
import { OrderApplicationService } from '../order.app.service';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`).value;

const actor = { _id: id(1), image: '', name: { fullName: 'Test Buyer' } };

function buildOrder(status: string, totalPrice: number, buyerId: string = id(1)) {
  return OrderAggregate.rehydrate(
    Id.create(id(10)),
    Id.create(id(20)),
    Id.create(buyerId),
    Money.create(totalPrice),
    FullAddressVO.create('123 Main Street, Springfield'),
    OrderStatusVO.fromString(status),
    DeleteInfoVO.none(),
    Quantity.rehydrate(1),
    EffectiveDate.today(),
  );
}

function buildService(
  options: {
    status?: string;
    failedItems?: { _id: string; variantId: string; quantity: number }[];
    canReserve?: boolean;
    noFailures?: boolean;
    buyerId?: string;
    itemNotFound?: boolean;
  } = {},
) {
  const calls: string[] = [];
  const published: IEvent[] = [];
  const savedTotals: number[] = [];
  const quotes: { id: { value: string }; price: { value: number } }[] = [];
  const itemEvent = { type: 'order-item.updated', payload: {} } as IEvent;

  const orderRepo = {
    FindByIdOrThrow: async () => buildOrder(options.status ?? 'pending', 20, options.buyerId),
    Save: async (order: { totalPrice: { value: number } }) => {
      calls.push('save-order');
      savedTotals.push(order.totalPrice.value);
    },
  };

  const unitOfWork = {
    transaction: async <T>(callback: () => Promise<T>): Promise<T> => {
      calls.push('begin');
      try {
        const result = await callback();
        calls.push('commit');
        return result;
      } catch (error) {
        calls.push('abort');
        throw error;
      }
    },
  };

  const eventBus = {
    publish: async (events: IEvent | IEvent[]) => {
      calls.push('publish');
      published.push(...(Array.isArray(events) ? events : [events]));
    },
  };

  const variantQueries = {
    verifyAndGet: async () => ({
      variantReadModel: [{ id: id(5), productId: id(6), price: 7 }],
      notFoundIds: [],
      deletedIds: [],
      nonActiveIds: [],
    }),
  };
  const productQueries = {
    verifyAndGet: async () => ({ productReadModel: [{ id: id(6), vendorId: id(4) }] }),
  };
  const inventoryReservation = {
    reserve: async (lines: { variantId: Id }[]) => {
      calls.push('reserve');
      const reserved = options.canReserve ?? true;
      return {
        buyableIds: reserved ? [Id.create(id(5))] : [],
        lines: lines.map((line) => ({
          variantId: line.variantId,
          reserved,
          reason: reserved ? null : 'out_of_stock',
        })),
      };
    },
  };

  const orderItemsWriter = {
    restoreFailures: async (items: typeof quotes) => {
      calls.push('restore-items');
      quotes.push(...items);
      return items.length === 0 ? [] : [itemEvent];
    },
  };

  const failedItems =
    options.failedItems ??
    (options.noFailures ? [] : [{ _id: id(30), variantId: id(5), quantity: 2, totalPrice: 0 }]);

  // Mirrors the adapter: failed lines are filtered out of the valid-item read.
  const orderItemsQueries = {
    getFailedByOrderId: async () => {
      calls.push('read-failed');
      return failedItems;
    },
    getFailedById: async (itemId: Id) => {
      calls.push('read-failed-item');
      if (options.itemNotFound) return null;
      return failedItems.find((item) => item._id === itemId.value) ?? null;
    },
    getByOrderId: async () => {
      calls.push('read-items');
      return [{ _id: id(31), totalPrice: 20 }];
    },
  };

  const service = new OrderApplicationService(
    orderRepo as never,
    {} as never,
    variantQueries as never,
    productQueries as never,
    eventBus as never,
    inventoryReservation as never,
    orderItemsWriter as never,
    orderItemsQueries as never,
    unitOfWork as never,
  );

  return { service, calls, published, savedTotals, quotes, itemEvent };
}

describe('OrderApplicationService.retryMyOrderItems', () => {
  it('restores a failed line at the current price and re-prices the order', async () => {
    const { service, calls, published, savedTotals, quotes, itemEvent } = buildService();

    const result = await service.retryMyOrderItems(id(20), actor);

    expect(calls).toEqual([
      'begin',
      'read-failed',
      'reserve',
      'restore-items',
      'read-items',
      'save-order',
      'commit',
      'publish',
    ]);
    // The failed row is addressed by its own id, never re-created.
    expect(quotes).toHaveLength(1);
    expect(quotes[0]).toMatchObject({ id: { value: id(30) }, price: { value: 7 } });
    // Existing 20.00 plus the restored line (2 x 7.00).
    expect(savedTotals).toEqual([34]);
    expect(published).toEqual([itemEvent, expect.objectContaining({ type: 'order.updated' })]);
    expect(result.message).toContain('1 item(s) restored, 0 still unfulfilled');
  });

  it('refuses to re-price a closed order before reserving or writing anything', async () => {
    const { service, calls, published, quotes } = buildService({ status: 'completed' });

    await expect(service.retryMyOrderItems(id(20), actor)).rejects.toThrow(
      'Cannot retry items on a completed order.',
    );

    expect(calls).toEqual(['begin', 'abort']);
    expect(quotes).toEqual([]);
    expect(published).toEqual([]);
  });

  it('keeps a line rejected when stock is still unavailable and does not re-price', async () => {
    const { service, calls, savedTotals } = buildService({ canReserve: false });

    const result = await service.retryMyOrderItems(id(20), actor);

    // Nothing was written and no order event was raised, so nothing publishes.
    expect(calls).toEqual(['begin', 'read-failed', 'reserve', 'commit']);
    expect(savedTotals).toEqual([]);
    expect(result.message).toContain('0 item(s) restored, 1 still unfulfilled');
  });

  it('rejects an order that has no failed items', async () => {
    const { service, calls } = buildService({ noFailures: true });

    await expect(service.retryMyOrderItems(id(20), actor)).rejects.toThrow(
      'Order has no failed items to retry.',
    );

    expect(calls).toEqual(['begin', 'read-failed', 'abort']);
  });

  it("refuses another buyer's order before reading or reserving anything", async () => {
    // The order belongs to buyer 2, while the actor is buyer 1.
    const { service, calls, quotes } = buildService({ buyerId: id(2) });

    await expect(service.retryMyOrderItems(id(20), actor)).rejects.toThrow(
      'You do not own this order.',
    );

    expect(calls).toEqual(['begin', 'abort']);
    expect(quotes).toEqual([]);
  });
});

describe('OrderApplicationService.retryMyOrderItem', () => {
  it('restores only the requested line and re-prices the order', async () => {
    const { service, calls, savedTotals, quotes } = buildService();

    const result = await service.retryMyOrderItem(id(30), actor);

    expect(calls).toEqual([
      'begin',
      'read-failed-item',
      'reserve',
      'restore-items',
      'read-items',
      'save-order',
      'commit',
      'publish',
    ]);
    expect(quotes).toHaveLength(1);
    expect(quotes[0]).toMatchObject({ id: { value: id(30) }, price: { value: 7 } });
    expect(savedTotals).toEqual([34]);
    expect(result.message).toContain('1 item(s) restored, 0 still unfulfilled');
  });

  it('leaves the line failed while stock is still unavailable', async () => {
    const { service, calls, savedTotals } = buildService({ canReserve: false });

    const result = await service.retryMyOrderItem(id(30), actor);

    expect(calls).toEqual(['begin', 'read-failed-item', 'reserve', 'commit']);
    expect(savedTotals).toEqual([]);
    expect(result.message).toContain('0 item(s) restored, 1 still unfulfilled');
  });

  it('rejects an item id that is not a failed line', async () => {
    const { service, calls } = buildService({ itemNotFound: true });

    await expect(service.retryMyOrderItem(id(30), actor)).rejects.toThrow(
      'Failed order item not found.',
    );

    expect(calls).toEqual(['begin', 'read-failed-item', 'abort']);
  });

  it("refuses another buyer's item", async () => {
    const { service, calls } = buildService({ buyerId: id(2) });

    await expect(service.retryMyOrderItem(id(30), actor)).rejects.toThrow(
      'You do not own this order.',
    );

    expect(calls).toEqual(['begin', 'read-failed-item', 'abort']);
  });
});
