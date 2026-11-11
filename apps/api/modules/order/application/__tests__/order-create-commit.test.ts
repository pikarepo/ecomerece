import type { IEvent } from '@ecomerece/domain/events/event-bus.interface';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { describe, expect, it } from 'bun:test';
import type { createMyOrderDtoType } from '@ecomerece/shared';
import { OrderApplicationService } from '../order.app.service';

const id = (n: number) =>
  Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`).value;

const actor = {
  _id: id(1),
  image: '',
  name: { fullName: 'Test Buyer' },
};

const orderInput: createMyOrderDtoType = {
  idempotentKey: id(10),
  addressId: id(11),
  waitingTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
  items: [{ variantId: id(2), quantity: 3 }],
};

function buildService(options: { saveFails?: boolean } = {}) {
  const calls: string[] = [];
  const published: IEvent[] = [];
  const itemEvent = { type: 'order-item.created', payload: {} } as IEvent;

  const orderRepo = {
    EnsureUniqueImpodentKey: async () => {
      calls.push('ensure-unique');
    },
    Create: async () => {
      if (options.saveFails) throw new Error('db down');
      calls.push('save-order');
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

  const queryBus = {
    execute: async (query: { type: string }) => {
      if (query.type === 'EnsureActiveAddressGetByIdQuery') {
        return { address: { fullAddress: '123 Main Street, Springfield' }, active: true };
      }
      if (query.type === 'VerifyVariantsAndGetQuery') {
        return {
          variantReadModel: [{ id: id(2), productId: id(3), price: 10, discountedPrice: 10 }],
        };
      }
      if (query.type === 'VerifyProductAndGetQuery') {
        return { productReadModel: [{ id: id(3), vendorId: id(4) }] };
      }
      throw new Error(`Unexpected query: ${query.type}`);
    },
  };

  const inventoryReservation = {
    reserve: async () => {
      calls.push('reserve');
      return { buyableIds: [Id.create(id(2))] };
    },
  };

  const orderItemsWriter = {
    create: async () => {
      calls.push('write-items');
      return [itemEvent];
    },
  };

  const service = new OrderApplicationService(
    orderRepo as never,
    queryBus as never,
    eventBus as never,
    inventoryReservation as never,
    orderItemsWriter as never,
    unitOfWork as never,
  );

  return { service, calls, published, itemEvent };
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
});
