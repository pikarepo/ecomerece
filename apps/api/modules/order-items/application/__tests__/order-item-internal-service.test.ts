import { describe, expect, it } from 'bun:test';
import { OrderItemsAggregate } from '@ecomerece/domain';
import { StatusVo } from '@ecomerece/domain/modules/order-items/value-objects/status.vo';
import { DeleteInfoVO } from '@ecomerece/domain/value-objects/delete-info.vo';
import { EffectiveDate } from '@ecomerece/domain/value-objects/effective-date.vo';
import { ExpirationDate } from '@ecomerece/domain/value-objects/expiration-date.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { Money } from '@ecomerece/domain/value-objects/money.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { OrderItemsInternalService } from '../order-item.internal';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`);

const waitingTime = () => ExpirationDate.create(new Date(Date.now() + 60 * 60 * 1000));

function orderItem(variantNumber: number, quantity: number, price: number) {
  return OrderItemsAggregate.rehydrate(
    id(100 + variantNumber),
    id(10),
    id(4),
    id(3),
    id(variantNumber),
    Quantity.create(quantity),
    waitingTime(),
    StatusVo.pending(),
    Money.create(quantity * price),
    Money.create(price),
    DeleteInfoVO.none(),
    Quantity.create(1),
    EffectiveDate.today(),
  );
}

function buildService(existingItems: OrderItemsAggregate[] = []) {
  const saved: OrderItemsAggregate[] = [];
  const created: OrderItemsAggregate[] = [];

  const service = new OrderItemsInternalService({
    FindByIds: async (ids: Id[]) =>
      existingItems.filter((item) => ids.some((itemId) => itemId.equals(item.id))),
    SaveMany: async (items: OrderItemsAggregate[]) => {
      saved.push(...items);
    },
    createMany: async (items: OrderItemsAggregate[]) => {
      created.push(...items);
    },
    FindFailedByIds: async () => [
      {
        _id: id(30).value,
        orderId: id(10).value,
        variantId: id(2).value,
        quantity: 2,
        waitingTime: waitingTime().value,
        status: 'failed',
        failureReason: 'out_of_stock',
        price: 0,
        totalPrice: 0,
        vendorId: null,
        productId: null,
        version: 0,
        deleted: { deleted: false, deletedFrom: null, deletedBy: null, reason: null },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  } as never);

  return { service, saved, created };
}

describe('OrderItemsInternalService.updateOrderItems', () => {
  it('applies each update to the item with the matching id', async () => {
    const first = orderItem(2, 1, 10);
    const second = orderItem(3, 2, 5);
    const { service, saved } = buildService([first, second]);

    await service.updateOrderItems([
      {
        id: first.id,
        quantity: Quantity.create(4),
        waitingTime: waitingTime(),
        price: Money.create(7),
      },
      {
        id: second.id,
        quantity: Quantity.create(3),
        waitingTime: waitingTime(),
        price: Money.create(2),
      },
    ]);

    expect(first.quantity.value).toBe(4);
    expect(first.price.value).toBe(7);
    expect(first.totalPrice.value).toBe(28);
    expect(second.quantity.value).toBe(3);
    expect(second.price.value).toBe(2);
    expect(second.totalPrice.value).toBe(6);
    expect(saved).toEqual([first, second]);
  });
});

describe('OrderItemsInternalService.restoreOrderItemFailures', () => {
  it('reopens the failed line with the quote that matches its id', async () => {
    const { service, saved } = buildService();

    const events = await service.restoreOrderItemFailures([
      { id: id(30), productId: id(3), vendorId: id(4), price: Money.create(7) },
    ]);

    expect(saved).toHaveLength(1);
    expect(saved[0].id.value).toBe(id(30).value);
    expect(saved[0].productId.value).toBe(id(3).value);
    expect(saved[0].vendorId.value).toBe(id(4).value);
    expect(saved[0].price.value).toBe(7);
    expect(saved[0].status.value).toBe('pending');
    expect(events).toHaveLength(1);
  });
});

describe('OrderItemsInternalService.createOrderItems', () => {
  it('creates one aggregate and one event per input line', async () => {
    const { service, created } = buildService();

    const events = await service.createOrderItems([
      {
        id: id(50),
        orderId: id(10),
        vendorId: id(4),
        productId: id(3),
        variantId: id(2),
        quantity: Quantity.create(2),
        waitingTime: waitingTime(),
        price: Money.create(9),
      },
    ]);

    expect(created).toHaveLength(1);
    expect(created[0].id.value).toBe(id(50).value);
    expect(created[0].totalPrice.value).toBe(18);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ type: 'order-item.created' });
  });
});
