import { describe, expect, it } from 'bun:test';
import type { IEvent } from '@ecomerece/domain/events/event-bus.interface';
import { OrderAggregate } from '@ecomerece/domain/modules/order/order.aggregate';
import { OrderTypeVO } from '@ecomerece/domain/modules/order/value-objects/order-type.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { OrderApplicationService } from '../order.app.service';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`).value;

const actor = { _id: id(1), image: '', name: { fullName: 'Test Buyer' } };
const buyerId = Id.create(actor._id);

function buildOrder(
  status: 'pending' | 'confirmed' | 'completed' | 'returned',
  vendorIds: string[] = [id(4)],
) {
  const order = OrderAggregate.create({
    id: Id.create(id(20)),
    idempotentKey: Id.create(id(21)),
    totalPrice: { value: 300 } as never,
    buyerId,
    vendorIds: vendorIds.map((vendorId) => Id.create(vendorId)),
    orderType: OrderTypeVO.forVendors(vendorIds.length),
    address: { fullAddress: '123 Main Street, Springfield' } as never,
  });
  if (status !== 'pending') order.confirmOrder(buyerId);
  if (status === 'completed' || status === 'returned') order.completeOrder(buyerId);
  if (status === 'returned') order.returnOrder({ value: 'damaged' } as never, buyerId);
  // Transitions load a rehydrated aggregate, which has no buffered events.
  order.clearEvents();
  return order;
}

function buildService(
  status: 'pending' | 'confirmed' | 'completed' | 'returned',
  vendorIds: string[] = [id(4)],
  itemStatuses?: string[],
) {
  const calls: string[] = [];
  const published: IEvent[] = [];
  const inventoryLines: { variantId: string; quantity: number }[][] = [];
  const order = buildOrder(status, vendorIds);
  const itemEvent = { type: 'order-item.completed', payload: {} } as IEvent;

  const orderRepo = {
    FindByIdOrThrow: async () => {
      calls.push('load-order');
      return order;
    },
    Save: async () => {
      calls.push('save-order');
    },
  };

  const inventoryReservation = {
    reserve: async () => ({ buyableIds: [] }),
    complete: async (lines: { variantId: Id; quantity: { value: number } }[]) => {
      calls.push('inventory:complete');
      inventoryLines.push(
        lines.map((line) => ({ variantId: line.variantId.value, quantity: line.quantity.value })),
      );
    },
    release: async (lines: { variantId: Id; quantity: { value: number } }[]) => {
      calls.push('inventory:release');
      inventoryLines.push(
        lines.map((line) => ({ variantId: line.variantId.value, quantity: line.quantity.value })),
      );
    },
    restock: async (lines: { variantId: Id; quantity: { value: number } }[]) => {
      calls.push('inventory:restock');
      inventoryLines.push(
        lines.map((line) => ({ variantId: line.variantId.value, quantity: line.quantity.value })),
      );
    },
    soldOut: async (lines: { variantId: Id; quantity: { value: number } }[]) => {
      calls.push('inventory:soldOut');
      inventoryLines.push(
        lines.map((line) => ({ variantId: line.variantId.value, quantity: line.quantity.value })),
      );
    },
    unsold: async (lines: { variantId: Id; quantity: { value: number } }[]) => {
      calls.push('inventory:unsold');
      inventoryLines.push(
        lines.map((line) => ({ variantId: line.variantId.value, quantity: line.quantity.value })),
      );
    },
  };

  const orderItemsWriter = {
    confirm: async () => {
      calls.push('write-items:confirm');
      return [itemEvent];
    },
    complete: async () => {
      calls.push('write-items:complete');
      return [itemEvent];
    },
    cancel: async () => {
      calls.push('write-items:cancel');
      return [itemEvent];
    },
    returnItems: async () => {
      calls.push('write-items:return');
      return [itemEvent];
    },
    refund: async () => {
      calls.push('write-items:refund');
      return [itemEvent];
    },
  };

  const vendorQueries = {
    ensureActiveByUserId: async () => ({ vendor: { id: id(4) }, active: true }),
  };

  const statuses = itemStatuses ?? [status === 'returned' ? 'returned' : status];
  const orderItemsQueries = {
    getByOrderId: async () => {
      calls.push('read-items');
      return statuses.map(
        (itemStatus, index) =>
          ({ _id: id(30 + index), variantId: id(2), quantity: 2, status: itemStatus }) as never,
      );
    },
  };

  const unitOfWork = {
    deferAfterCommit: async (work: () => Promise<void>) => work(),
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

  const service = new OrderApplicationService(
    orderRepo as never,
    {} as never,
    {} as never,
    {} as never,
    eventBus as never,
    inventoryReservation as never,
    orderItemsWriter as never,
    orderItemsQueries as never,
    unitOfWork as never,
    vendorQueries as never,
  );

  return { service, calls, published, inventoryLines };
}

describe('OrderApplicationService inventory contract', () => {
  it('does not touch inventory when an order is completed after confirmation', async () => {
    const { service, calls, inventoryLines } = buildService('confirmed');

    await service.completeOrder(id(20), actor);

    expect(calls).toEqual([
      'begin',
      'load-order',
      'read-items',
      'write-items:complete',
      'save-order',
      'commit',
      'publish',
    ]);
    expect(inventoryLines).toEqual([]);
  });

  it('releases the reservation when a buyer cancels before fulfilment', async () => {
    const { service, calls, inventoryLines } = buildService('pending');

    await service.cancelMyOrder(id(20), { reason: 'changed my mind' }, actor);

    expect(calls).toContain('inventory:release');
    expect(inventoryLines).toEqual([[{ variantId: id(2), quantity: 2 }]]);
  });

  it('puts sold-out stock back when a confirmed order is cancelled', async () => {
    const { service, calls } = buildService('confirmed');

    await service.cancelMyOrder(id(20), { reason: 'changed my mind' }, actor);

    expect(calls).toContain('inventory:unsold');
    expect(calls).not.toContain('inventory:release');
  });

  it('refuses to cancel an order that was already returned', async () => {
    const { service, calls } = buildService('returned');

    await expect(
      service.cancelMyOrder(id(20), { reason: 'changed my mind' }, actor),
    ).rejects.toThrow('Cannot cancel an order that is already returned.');
    expect(calls).not.toContain('save-order');
  });

  it('puts sold-out stock back on a completed return', async () => {
    const { service, calls } = buildService('completed');

    await service.returnOrder(id(20), { reason: 'damaged in transit' }, actor);

    expect(calls).toContain('inventory:unsold');
    expect(calls).not.toContain('inventory:release');
  });

  it('marks stock as sold-out when an order is confirmed', async () => {
    const { service, calls, inventoryLines } = buildService('pending');

    await service.confirmOrder(id(20), actor);

    expect(calls).toContain('inventory:soldOut');
    expect(inventoryLines).toEqual([[{ variantId: id(2), quantity: 2 }]]);
  });

  it('moves sold-out stock to available when a confirmed order is returned', async () => {
    const { service, calls } = buildService('confirmed');

    await service.returnOrder(id(20), { reason: 'damaged in transit' }, actor);

    expect(calls).toContain('inventory:unsold');
    expect(calls).not.toContain('inventory:restock');
  });

  it('refunds a confirmed order and puts its sold-out stock back', async () => {
    const { service, calls } = buildService('confirmed');

    await service.refundOrder(id(20), { reason: 'approved by support' }, actor);

    expect(calls).toContain('write-items:refund');
    expect(calls).toContain('inventory:unsold');
  });

  it('does not touch inventory when refunding an already returned order', async () => {
    const { service, calls } = buildService('returned');

    await service.refundOrder(id(20), { reason: 'approved by support' }, actor);

    expect(calls).toContain('write-items:refund');
    expect(calls).not.toContain('inventory:unsold');
  });

  it('returns stock only for lines that were not already returned on an order refund', async () => {
    const { service, inventoryLines } = buildService(
      'confirmed',
      [id(4)],
      ['returned', 'confirmed'],
    );

    await service.refundOrder(id(20), { reason: 'approved by support' }, actor);

    expect(inventoryLines).toEqual([[{ variantId: id(2), quantity: 2 }]]);
  });

  it('refuses vendor-wide transitions for multi-vendor orders', async () => {
    const { service, calls } = buildService('pending', [id(4), id(5)]);

    await expect(service.confirmOrder(id(20), actor)).rejects.toThrow(
      'Vendors must use order-item actions for a multi-vendor order.',
    );
    expect(calls).not.toContain('save-order');
  });

  it('does not change stock or publish events when the status transition is rejected', async () => {
    const { service, calls, published } = buildService('pending');

    await expect(service.completeOrder(id(20), actor)).rejects.toThrow(
      'Cannot complete an order that is not confirmed',
    );

    expect(calls).toContain('abort');
    expect(calls).not.toContain('write-items:complete');
    expect(calls).not.toContain('inventory:complete');
    expect(calls).not.toContain('save-order');
    expect(published).toHaveLength(0);
  });
});
