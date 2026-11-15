import { describe, expect, it } from 'bun:test';
import { BadRequestError } from '../../errors/app-error';
import { EffectiveDate, FullAddressVO, Id, Money, Reason } from '../../value-objects';
import { OrderAggregate } from '../order/order.aggregate';
import { OrderReturnedEvent } from '../order/events/order-returned.event';
import { OrderStatusVO } from '../order/value-objects/order-status.vo';
import { OrderTypeVO } from '../order/value-objects/order-type.vo';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`);
const reason = () => Reason.create('violates the marketplace policy');
const address = () => FullAddressVO.create('12 Main Street, Springfield, Illinois, 62701, USA');

function order(overrides: { vendorIds?: Id[]; orderType?: OrderTypeVO; buyerId?: Id } = {}) {
  const vendorIds = overrides.vendorIds ?? [id(4)];
  return OrderAggregate.create({
    id: id(1),
    idempotentKey: id(2),
    buyerId: overrides.buyerId ?? id(7),
    vendorIds,
    orderType: overrides.orderType ?? OrderTypeVO.forVendors(vendorIds.length),
    totalPrice: Money.create(50),
    address: address(),
  });
}

function confirmed() {
  const aggregate = order();
  aggregate.confirmOrder(id(4));
  aggregate.clearEvents();
  return aggregate;
}

function completed() {
  const aggregate = confirmed();
  aggregate.completeOrder(id(4));
  aggregate.clearEvents();
  return aggregate;
}

function cancelled() {
  const aggregate = order();
  aggregate.cancelOrder(reason(), id(7));
  aggregate.clearEvents();
  return aggregate;
}

describe('OrderAggregate creation invariants', () => {
  it('starts pending, undeleted, with zero version and no buffered events', () => {
    const aggregate = order();

    expect(aggregate.status.value).toBe('pending');
    expect(aggregate.delete.isDeleted).toBe(false);
    expect(aggregate.version.value).toBe(0);
    expect(aggregate.pullEvents()).toEqual([]);
  });

  it('refuses an order without a vendor', () => {
    expect(() =>
      OrderAggregate.create({
        id: id(1),
        idempotentKey: id(2),
        buyerId: id(7),
        vendorIds: [],
        orderType: OrderTypeVO.cart(),
        totalPrice: Money.create(1),
        address: address(),
      }),
    ).toThrow(BadRequestError);
  });

  it('refuses a single order spanning several vendors', () => {
    expect(() =>
      OrderAggregate.create({
        id: id(1),
        idempotentKey: id(2),
        buyerId: id(7),
        vendorIds: [id(4), id(5)],
        orderType: OrderTypeVO.single(),
        totalPrice: Money.create(1),
        address: address(),
      }),
    ).toThrow('A single order can only belong to one vendor.');
  });

  it('allows a cart order with one vendor and one with many', () => {
    expect(() =>
      OrderAggregate.create({
        id: id(1),
        idempotentKey: id(2),
        buyerId: id(7),
        vendorIds: [id(4)],
        orderType: OrderTypeVO.cart(),
        totalPrice: Money.create(1),
        address: address(),
      }),
    ).not.toThrow();
    expect(() =>
      OrderAggregate.create({
        id: id(1),
        idempotentKey: id(2),
        buyerId: id(7),
        vendorIds: [id(4), id(5)],
        orderType: OrderTypeVO.cart(),
        totalPrice: Money.create(1),
        address: address(),
      }),
    ).not.toThrow();
  });

  it('does not let a caller mutate the vendor list through the getter', () => {
    const aggregate = order({ vendorIds: [id(4)] });
    aggregate.vendorIds.push(id(5));

    expect(aggregate.vendorIds).toHaveLength(1);
  });
});

describe('OrderAggregate creation and update events', () => {
  it('raises order.created for the buyer', () => {
    const aggregate = order();
    aggregate.createOrder();
    const [event] = aggregate.pullEvents();

    expect(event?.type).toBe('order.created');
    expect(event?.payload).toMatchObject({ orderId: aggregate.id, actorId: aggregate.buyerId });
    expect(event?.occurredOn).toBeInstanceOf(EffectiveDate);
  });

  it('pullEvents drains the buffer exactly once', () => {
    const aggregate = order();
    aggregate.confirmOrder(id(4));

    expect(aggregate.pullEvents()).toHaveLength(1);
    expect(aggregate.pullEvents()).toEqual([]);
  });

  it('updates the price and address with a single order.updated event', () => {
    const aggregate = order();
    aggregate.clearEvents();

    aggregate.updateOrder(Money.create(75), address(), id(9));

    expect(aggregate.totalPrice.value).toBe(75);
    const [event] = aggregate.pullEvents();
    expect(event?.type).toBe('order.updated');
    expect(event?.payload).toMatchObject({ orderId: aggregate.id, actorId: id(9) });
  });
});

describe('OrderAggregate status machine', () => {
  it('confirms a pending order once', () => {
    const aggregate = order();

    aggregate.confirmOrder(id(4));

    expect(aggregate.status.value).toBe('confirmed');
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual(['order.confirmed']);
    expect(() => aggregate.confirmOrder(id(4))).toThrow(BadRequestError);
  });

  it('completes only a confirmed order', () => {
    const pending = order();
    expect(() => pending.completeOrder(id(4))).toThrow(BadRequestError);

    const aggregate = confirmed();
    aggregate.completeOrder(id(4));
    expect(aggregate.status.value).toBe('completed');
    expect(() => aggregate.completeOrder(id(4))).toThrow(BadRequestError);
  });

  it('cancels pending and confirmed orders but not closed ones', () => {
    expect(cancelled().status.value).toBe('cancelled');

    const confirmedOrder = confirmed();
    confirmedOrder.cancelOrder(reason(), id(7));
    expect(confirmedOrder.status.value).toBe('cancelled');

    expect(() => completed().cancelOrder(reason(), id(7))).toThrow(BadRequestError);
    expect(() => cancelled().cancelOrder(reason(), id(7))).toThrow(BadRequestError);
  });

  it('returns only confirmed or completed orders', () => {
    const confirmedOrder = confirmed();
    confirmedOrder.returnOrder(reason(), id(7));
    expect(confirmedOrder.status.value).toBe('returned');

    const completedOrder = completed();
    completedOrder.returnOrder(reason(), id(7));
    expect(completedOrder.status.value).toBe('returned');

    expect(() => order().returnOrder(reason(), id(7))).toThrow(BadRequestError);
    expect(() => cancelled().returnOrder(reason(), id(7))).toThrow(BadRequestError);
  });

  it('refunds confirmed, completed and returned orders exactly once', () => {
    const confirmedOrder = confirmed();
    confirmedOrder.refundOrder(reason(), id(9));
    expect(confirmedOrder.status.value).toBe('refunded');
    expect(() => confirmedOrder.refundOrder(reason(), id(9))).toThrow(BadRequestError);

    const completedOrder = completed();
    completedOrder.refundOrder(reason(), id(9));
    expect(completedOrder.status.value).toBe('refunded');

    const returnedOrder = confirmed();
    returnedOrder.returnOrder(reason(), id(7));
    returnedOrder.refundOrder(reason(), id(9));
    expect(returnedOrder.status.value).toBe('refunded');
  });

  it('does not refund a pending or cancelled order', () => {
    expect(() => order().refundOrder(reason(), id(9))).toThrow(BadRequestError);
    expect(() => cancelled().refundOrder(reason(), id(9))).toThrow(BadRequestError);
  });

  it('carries the reason and actor on cancel, return and refund events', () => {
    const aggregate = confirmed();
    aggregate.returnOrder(reason(), id(7));
    const [returned] = aggregate.pullEvents();
    expect(returned).toBeInstanceOf(OrderReturnedEvent);
    expect(returned?.payload).toMatchObject({ actorId: id(7), reason: reason() });

    aggregate.refundOrder(reason(), id(9));
    const [refunded] = aggregate.pullEvents();
    expect(refunded?.type).toBe('order.refunded');
    expect(refunded?.payload).toMatchObject({ actorId: id(9), reason: reason() });
  });
});

describe('OrderAggregate ownership and vendor scoping', () => {
  it('compares ownership by value', () => {
    const aggregate = order({ buyerId: id(7) });

    expect(() => aggregate.ensureOwnedBy(id(8))).toThrow('You do not own this order.');
    expect(() => aggregate.ensureOwnedBy(Id.create(id(7).value))).not.toThrow();
  });

  it('reports membership of every vendor by value', () => {
    const aggregate = order({ vendorIds: [id(4), id(5)], orderType: OrderTypeVO.cart() });

    expect(aggregate.hasVendor(Id.create(id(5).value))).toBe(true);
    expect(aggregate.hasVendor(id(6))).toBe(false);
  });
});

describe('OrderAggregate re-pricing recovered items', () => {
  it('replaces the total with the sum of the recovered line totals', () => {
    const aggregate = order();

    aggregate.applyRecoveredItems([Money.create(10), Money.create(15.5)], id(9));

    expect(aggregate.totalPrice.value).toBe(25.5);
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual(['order.updated']);
  });

  it('requires at least one recovered line', () => {
    expect(() => order().applyRecoveredItems([], id(9))).toThrow(BadRequestError);
  });

  it('refuses to re-price a closed order', () => {
    const returned = confirmed();
    returned.returnOrder(reason(), id(7));

    const refunded = confirmed();
    refunded.refundOrder(reason(), id(9));

    for (const aggregate of [completed(), cancelled(), returned, refunded]) {
      expect(() => aggregate.applyRecoveredItems([Money.create(1)], id(9))).toThrow(
        BadRequestError,
      );
    }
  });
});

describe('OrderAggregate soft delete and recovery', () => {
  it('deletes only a terminal order', () => {
    expect(() => order().deleteOrder(reason(), id(9))).toThrow(BadRequestError);

    for (const aggregate of [completed(), cancelled()]) {
      aggregate.deleteOrder(reason(), id(9));
      expect(aggregate.delete.isDeleted).toBe(true);
      expect(aggregate.pullEvents().map((event) => event.type)).toEqual(['order.deleted']);
    }
  });

  it('deletes returned and refunded orders too', () => {
    const returned = confirmed();
    returned.returnOrder(reason(), id(7));
    expect(() => returned.deleteOrder(reason(), id(9))).not.toThrow();

    const refunded = confirmed();
    refunded.refundOrder(reason(), id(9));
    expect(() => refunded.deleteOrder(reason(), id(9))).not.toThrow();
  });

  it('refuses a second delete', () => {
    const aggregate = cancelled();
    aggregate.deleteOrder(reason(), id(9));

    expect(() => aggregate.deleteOrder(reason(), id(9))).toThrow('Order is already deleted.');
  });

  it('recovers a deleted order exactly once', () => {
    const aggregate = cancelled();
    aggregate.deleteOrder(reason(), id(9));
    aggregate.clearEvents();

    aggregate.recoverOrder(id(9));

    expect(aggregate.delete.isDeleted).toBe(false);
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual(['order.recovered']);
    expect(() => aggregate.recoverOrder(id(9))).toThrow('Order is not deleted.');
  });

  it('blocks every mutation while deleted except recovery', () => {
    const aggregate = completed();
    aggregate.deleteOrder(reason(), id(9));
    aggregate.clearEvents();

    expect(() => aggregate.confirmOrder(id(4))).toThrow(BadRequestError);
    expect(() => aggregate.completeOrder(id(4))).toThrow(BadRequestError);
    expect(() => aggregate.cancelOrder(reason(), id(7))).toThrow(BadRequestError);
    expect(() => aggregate.returnOrder(reason(), id(7))).toThrow(BadRequestError);
    expect(() => aggregate.refundOrder(reason(), id(9))).toThrow(BadRequestError);
    expect(() => aggregate.updateOrder(Money.create(1), address(), id(9))).toThrow(BadRequestError);
    expect(() => aggregate.applyRecoveredItems([Money.create(1)], id(9))).toThrow(BadRequestError);
  });
});

describe('OrderStatusVO transition matrix', () => {
  it('matches the aggregate rules for every source status', () => {
    const transitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled', 'returned', 'refunded'],
      completed: ['returned', 'refunded'],
      returned: ['refunded', 'cancelled'],
      refunded: [],
      cancelled: [],
    };

    for (const [source, allowed] of Object.entries(transitions)) {
      const status = OrderStatusVO.fromString(source);
      const attempts: Record<string, () => unknown> = {
        confirmed: () => status.confirm(),
        completed: () => status.complete(),
        cancelled: () => status.cancel(),
        returned: () => status.return(),
        refunded: () => status.refund(),
      };

      for (const [target, attempt] of Object.entries(attempts)) {
        if (allowed.includes(target)) expect(attempt).not.toThrow();
        else expect(attempt).toThrow(BadRequestError);
      }
    }
  });

  it('rejects an unknown status string', () => {
    expect(() => OrderStatusVO.fromString('lost')).toThrow(BadRequestError);
  });
});
