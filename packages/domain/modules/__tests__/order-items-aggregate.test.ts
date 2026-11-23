import { describe, expect, it } from 'bun:test';
import { BadRequestError } from '../../errors/app-error';
import { ExpirationDate, Id, Money, Quantity, Reason } from '../../value-objects';
import { OrderItemsAggregate } from '../order-items/order-items.aggregate';
import { StatusVo } from '../order-items/value-objects/status.vo';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`);
const reason = () => Reason.create('violates the marketplace policy');
const waitingTime = () => ExpirationDate.fromDays(3);

function orderItem(overrides: { quantity?: Quantity; price?: Money } = {}) {
  return OrderItemsAggregate.create({
    id: id(100),
    orderId: id(20),
    vendorId: id(4),
    productId: id(300),
    variantId: id(301),
    quantity: overrides.quantity ?? Quantity.create(2),
    waitingTime: waitingTime(),
    price: overrides.price ?? Money.create(10),
  });
}

function confirmed() {
  const item = orderItem();
  item.confirm();
  item.clearEvents();
  return item;
}

function completed() {
  const item = confirmed();
  item.complete();
  item.clearEvents();
  return item;
}

describe('OrderItemsAggregate creation', () => {
  it('derives the total from quantity and unit price', () => {
    const item = orderItem({ quantity: Quantity.create(3), price: Money.create(4.5) });

    expect(item.totalPrice.value).toBe(13.5);
    expect(item.price.value).toBe(4.5);
    expect(item.status.value).toBe('pending');
    expect(item.version.value).toBe(1);
  });

  it('raises one created event carrying the full line snapshot', () => {
    const item = orderItem();
    const [event] = item.pullEvents();

    expect(event?.type).toBe('order-item.created');
    expect(event?.payload).toMatchObject({
      orderItemId: item.id,
      orderId: item.orderId,
      vendorId: item.vendorId,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.totalPrice,
    });
  });
});

describe('OrderItemsAggregate lifecycle', () => {
  it('confirms and completes in order', () => {
    const item = orderItem();

    item.confirm();
    expect(item.status.value).toBe('confirmed');
    item.complete();
    expect(item.status.value).toBe('completed');
    expect(item.pullEvents().map((event) => event.type)).toEqual([
      'order-item.created',
      'order-item.confirmed',
      'order-item.completed',
    ]);
  });

  it('refuses to confirm a non-pending line or complete a non-confirmed one', () => {
    const item = orderItem();
    expect(() => item.complete()).toThrow(BadRequestError);

    item.confirm();
    expect(() => item.confirm()).toThrow(BadRequestError);
    item.complete();
    expect(() => item.complete()).toThrow(BadRequestError);
  });

  it('cancels pending and confirmed lines but not closed ones', () => {
    const pending = orderItem();
    pending.cancel();
    expect(pending.status.value).toBe('cancelled');

    const confirmedItem = confirmed();
    confirmedItem.cancel();
    expect(confirmedItem.status.value).toBe('cancelled');

    expect(() => completed().cancel()).toThrow(BadRequestError);
  });

  it('returns confirmed or completed lines with a snapshot event', () => {
    const confirmedItem = confirmed();
    confirmedItem.returnItem();
    expect(confirmedItem.status.value).toBe('returned');

    const completedItem = completed();
    completedItem.returnItem();
    expect(completedItem.status.value).toBe('returned');

    expect(() => orderItem().returnItem()).toThrow(BadRequestError);
  });

  it('refunds confirmed, completed and returned lines exactly once', () => {
    const confirmedItem = confirmed();
    confirmedItem.refund();
    expect(confirmedItem.status.value).toBe('refunded');
    expect(() => confirmedItem.refund()).toThrow(BadRequestError);

    const returnedItem = confirmed();
    returnedItem.returnItem();
    returnedItem.refund();
    expect(returnedItem.status.value).toBe('refunded');

    const completedItem = completed();
    completedItem.refund();
    expect(completedItem.status.value).toBe('refunded');
  });

  it('keeps emitted lifecycle events aligned with the line total', () => {
    const item = orderItem();
    item.confirm();
    const [event] = item.pullEvents().slice(1);

    expect(event?.type).toBe('order-item.confirmed');
    expect(event?.payload).toMatchObject({ totalPrice: item.totalPrice, price: item.price });
  });
});

describe('OrderItemsAggregate updates', () => {
  it('recomputes the total when quantity and price change', () => {
    const item = orderItem();

    item.update({
      quantity: Quantity.create(5),
      waitingTime: ExpirationDate.fromDays(6),
      price: Money.create(3),
    });

    expect(item.quantity.value).toBe(5);
    expect(item.price.value).toBe(3);
    expect(item.totalPrice.value).toBe(15);
    expect(item.waitingTime.value.getTime()).toBeGreaterThan(Date.now());
    expect(item.pullEvents().map((event) => event.type)).toContain('order-item.updated');
  });

  it('does not allow an update on a deleted line', () => {
    const item = orderItem();
    item.deleteItem(reason(), id(9));

    expect(() =>
      item.update({
        quantity: Quantity.create(1),
        waitingTime: waitingTime(),
        price: Money.create(1),
      }),
    ).toThrow(BadRequestError);
  });
});

describe('OrderItemsAggregate soft delete and recovery', () => {
  it('deletes exactly once and recovers exactly once', () => {
    const item = orderItem();

    item.deleteItem(reason(), id(9));
    expect(item.delete.isDeleted).toBe(true);
    expect(() => item.deleteItem(reason(), id(9))).toThrow(BadRequestError);
    expect(item.pullEvents().map((event) => event.type)).toContain('order-item.deleted');

    item.recoverItem(id(9));
    expect(item.delete.isDeleted).toBe(false);
    expect(item.pullEvents().map((event) => event.type)).toContain('order-item.recovered');
    expect(() => item.recoverItem(id(9))).toThrow(BadRequestError);
  });

  it('blocks every status transition while deleted', () => {
    const item = orderItem();
    item.deleteItem(reason(), id(9));

    expect(() => item.confirm()).toThrow(BadRequestError);
    expect(() => item.complete()).toThrow(BadRequestError);
    expect(() => item.cancel()).toThrow(BadRequestError);
    expect(() => item.returnItem()).toThrow(BadRequestError);
    expect(() => item.refund()).toThrow(BadRequestError);
  });
});

describe('OrderItemsAggregate restoreFromFailure', () => {
  const props = () => ({
    id: id(100),
    orderId: id(20),
    variantId: id(301),
    quantity: Quantity.create(2),
    waitingTime: waitingTime(),
    status: 'failed',
    failureReason: 'out_of_stock' as const,
    productId: id(300),
    vendorId: id(4),
    price: Money.create(7),
    version: Quantity.create(1),
    createdAt: orderItem().createdAt,
  });

  it('reopens a failed line as pending with a fresh total', () => {
    const restored = OrderItemsAggregate.restoreFromFailure(props());

    expect(restored.status.value).toBe('pending');
    expect(restored.totalPrice.value).toBe(14);
    expect(restored.price.value).toBe(7);
    expect(restored.pullEvents().map((event) => event.type)).toEqual(['order-item.updated']);
  });

  it('refuses a line without a failure reason', () => {
    expect(() =>
      OrderItemsAggregate.restoreFromFailure({ ...props(), failureReason: null }),
    ).toThrow('Only a failed order item can be restored.');
  });

  it('refuses to restart a line that was not failed', () => {
    for (const status of [
      'pending',
      'confirmed',
      'completed',
      'cancelled',
      'returned',
      'refunded',
    ]) {
      expect(() => OrderItemsAggregate.restoreFromFailure({ ...props(), status })).toThrow(
        BadRequestError,
      );
    }
  });
});

describe('StatusVo transition matrix', () => {
  it('only allows the documented transitions', () => {
    const transitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled', 'returned', 'refunded'],
      completed: ['returned', 'refunded'],
      returned: ['refunded', 'cancelled'],
      failed: ['cancelled'],
      refunded: [],
      cancelled: ['cancelled'],
    };

    for (const [source, allowed] of Object.entries(transitions)) {
      const status = StatusVo.fromString(source);
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

  it('restores only a failed status, always into pending', () => {
    expect(StatusVo.failed().restore().value).toBe('pending');
    expect(() => StatusVo.pending().restore()).toThrow(BadRequestError);
  });

  it('exposes boolean helpers that match the value', () => {
    expect(StatusVo.failed().isFailed()).toBe(true);
    expect(StatusVo.confirmed().isConfirmed()).toBe(true);
    expect(StatusVo.completed().isCompleted()).toBe(true);
    expect(StatusVo.returned().isReturned()).toBe(true);
    expect(StatusVo.refunded().isRefunded()).toBe(true);
    expect(StatusVo.cancelled().isCancelled()).toBe(true);
    expect(StatusVo.pending().isPending()).toBe(true);
    expect(StatusVo.fromString('pending').toStatusType()).toBe('pending');
    expect(StatusVo.pending().toString()).toBe('pending');
  });

  it('rejects an unknown status string', () => {
    expect(() => StatusVo.fromString('lost')).toThrow(BadRequestError);
  });
});

function domainEvidence(tag: string, data: Record<string, unknown>) {
  console.log(`[DOM-${tag}] ${JSON.stringify(data)}`);
}

describe('hostile order line repricing', () => {
  const revised = () => ({
    quantity: Quantity.create(5),
    waitingTime: ExpirationDate.fromDays(6),
    price: Money.create(3),
  });

  const returned = () => {
    const item = confirmed();
    item.returnItem();
    item.clearEvents();
    return item;
  };

  const refunded = () => {
    const item = confirmed();
    item.refund();
    item.clearEvents();
    return item;
  };

  const cancelled = () => {
    const item = orderItem();
    item.cancel();
    item.clearEvents();
    return item;
  };

  it('DOM-T5-CONTROL repricing a pending line is allowed', () => {
    const item = orderItem();
    item.update(revised());

    expect(item.totalPrice.value).toBe(15);
  });

  it.failing('DOM-T5 update reprices confirmed and terminal lines', () => {
    expect(orderItem().status.value).toBe('pending');

    const fixtures: [string, () => OrderItemsAggregate][] = [
      ['confirmed', confirmed],
      ['completed', completed],
      ['returned', returned],
      ['refunded', refunded],
      ['cancelled', cancelled],
    ];
    const exploit = fixtures.map(([status, fixture]) => {
      const item = fixture();
      item.update(revised());

      return {
        status,
        quantity: item.quantity.value,
        totalPrice: item.totalPrice.value,
        events: item.pullEvents().map((event) => event.type),
      };
    });

    domainEvidence('T5', { exploit });
    for (const [, fixture] of fixtures) {
      expect(() => fixture().update(revised())).toThrow(BadRequestError);
    }
  });
});
