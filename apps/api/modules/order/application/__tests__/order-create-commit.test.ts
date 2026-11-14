import { describe, expect, it } from 'bun:test';
import type { IEvent } from '@ecomerece/domain/events/event-bus.interface';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { createMyOrderDtoType } from '@ecomerece/shared';
import { OrderApplicationService } from '../order.app.service';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`).value;

const actor = {
  _id: id(1),
  image: '',
  name: { fullName: 'Test Buyer' },
};

const orderInput: createMyOrderDtoType = {
  idempotentKey: id(10),
  addressId: id(11),
  safeOrder: false,
  // Order creation caps waiting time at 4 hours.
  waitingTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
  items: [{ variantId: id(2), quantity: 3 }],
};

function buildService(options: { saveFails?: boolean; rejectLine?: boolean } = {}) {
  const calls: string[] = [];
  const published: IEvent[] = [];
  const createdTotals: number[] = [];
  const recordedFailures: { variantId: { value: string }; reason: string }[] = [];
  const itemEvent = { type: 'order-item.created', payload: {} } as IEvent;

  const orderRepo = {
    EnsureUniqueImpodentKey: async () => {
      calls.push('ensure-unique');
    },
    Create: async (order: { totalPrice: { value: number } }) => {
      if (options.saveFails) throw new Error('db down');
      calls.push('save-order');
      createdTotals.push(order.totalPrice.value);
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

  const addressQueries = {
    ensureActiveById: async (addressId: Id, userId: Id) => {
      if (!addressId || !userId) {
        throw new Error('Address query must carry addressId and userId');
      }
      return { address: { fullAddress: '123 Main Street, Springfield' }, active: true };
    },
  };

  const variantQueries = {
    verifyAndGet: async () => ({
      variantReadModel: [{ id: id(2), productId: id(3), price: 10, discountedPrice: 10 }],
      notFoundIds: [],
      deletedIds: [],
      nonActiveIds: [],
    }),
  };

  const productQueries = {
    verifyAndGet: async () => ({ productReadModel: [{ id: id(3), vendorId: id(4) }] }),
  };

  const inventoryReservation = {
    reserve: async (lines: { variantId: Id }[]) => {
      calls.push('reserve');
      return {
        buyableIds: options.rejectLine ? [] : [Id.create(id(2))],
        lines: lines.map((line) => ({
          variantId: line.variantId,
          reserved: !options.rejectLine,
          reason: options.rejectLine ? 'insufficient_stock' : null,
        })),
      };
    },
  };

  const orderItemsWriter = {
    create: async (items: { id: Id }[]) => {
      calls.push('write-items');
      // Mirrors the real writer: no items means no events.
      return items.length === 0 ? [] : [itemEvent];
    },
    recordFailures: async (items: typeof recordedFailures) => {
      calls.push('record-failures');
      recordedFailures.push(...items);
      return [];
    },
  };

  const orderItemsQueries = {
    getByOrderId: async () => [],
  };

  const service = new OrderApplicationService(
    orderRepo as never,
    addressQueries as never,
    variantQueries as never,
    productQueries as never,
    eventBus as never,
    inventoryReservation as never,
    orderItemsWriter as never,
    orderItemsQueries as never,
    unitOfWork as never,
  );

  return { service, calls, published, itemEvent, createdTotals, recordedFailures };
}

describe('OrderApplicationService.createMyOrder', () => {
  it('publishes item and order events only after the transaction commits', async () => {
    const { service, calls, published, itemEvent } = buildService();

    await service.createMyOrder(orderInput, actor);

    expect(calls).toEqual([
      'begin',
      'ensure-unique',
      'reserve',
      'write-items',
      'save-order',
      'commit',
      'publish',
    ]);
    expect(published).toHaveLength(2);
    expect(published[0]).toBe(itemEvent);
    expect(published[1]).toMatchObject({ type: 'order.created' });
  });

  it('does not publish events when the transaction callback fails', async () => {
    const { service, calls, published } = buildService({ saveFails: true });

    await expect(service.createMyOrder(orderInput, actor)).rejects.toThrow('db down');

    expect(calls).toEqual(['begin', 'ensure-unique', 'reserve', 'write-items', 'abort']);
    expect(published).toHaveLength(0);
  });

  it('aborts the whole order when safeOrder is on and a line is rejected', async () => {
    const { service, calls, published, createdTotals, recordedFailures } = buildService({
      rejectLine: true,
    });

    await expect(service.createMyOrder({ ...orderInput, safeOrder: true }, actor)).rejects.toThrow(
      'Order rejected: 1 item(s) could not be fulfilled (insufficient_stock).',
    );

    // Nothing was written: no item rows, no failure rows, no order, no events.
    expect(calls).toEqual(['begin', 'ensure-unique', 'reserve', 'abort']);
    expect(createdTotals).toEqual([]);
    expect(recordedFailures).toEqual([]);
    expect(published).toHaveLength(0);
  });

  it('records the failure reason and charges nothing when safeOrder is off', async () => {
    const { service, calls, published, createdTotals, recordedFailures } = buildService({
      rejectLine: true,
    });

    await service.createMyOrder({ ...orderInput, safeOrder: false }, actor);

    expect(calls).toEqual([
      'begin',
      'ensure-unique',
      'reserve',
      'write-items',
      'record-failures',
      'save-order',
      'commit',
      'publish',
    ]);
    // No buyable line, so the order total is zero.
    expect(createdTotals).toEqual([0]);
    expect(recordedFailures).toHaveLength(1);
    expect(recordedFailures[0]).toMatchObject({
      variantId: { value: id(2) },
      reason: 'insufficient_stock',
    });
    expect(published).toHaveLength(1);
  });
});
