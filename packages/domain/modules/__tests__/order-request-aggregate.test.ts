import { describe, expect, it } from 'bun:test';
import { BadRequestError, ForbiddenError } from '../../errors/app-error';
import { Id, Reason, UrlVO } from '../../value-objects';
import { OrderRequestAggregate } from '../order-request/order-request.aggregate';
import { OrderRequestImageVO } from '../order-request/value-objects/order-request-image.vo';
import { OrderRequestStatusVO } from '../order-request/value-objects/order-request-status.vo';
import { OrderRequestTypeVO } from '../order-request/value-objects/order-request-type.vo';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`);
const reason = () => Reason.create('damaged in transit');
const image = () =>
  OrderRequestImageVO.create(UrlVO.create('https://cdn.example.com/evidence.png'), 'evidence.png');

function request(overrides: { type?: OrderRequestTypeVO; orderItemId?: Id | null } = {}) {
  return OrderRequestAggregate.create({
    id: id(50),
    orderId: id(20),
    orderItemId: overrides.orderItemId ?? id(30),
    vendorId: id(4),
    buyerId: id(7),
    type: overrides.type ?? OrderRequestTypeVO.return(),
    reason: reason(),
    note: 'the box was crushed',
    images: [image()],
  });
}

function accepted() {
  const aggregate = request();
  aggregate.accept(id(4), 'approved');
  aggregate.clearEvents();
  return aggregate;
}

describe('OrderRequestAggregate creation', () => {
  it('starts pending and raises order-request.created with the request facts', () => {
    const aggregate = request();
    const [event] = aggregate.pullEvents();

    expect(aggregate.status.isPending).toBe(true);
    expect(aggregate.vendorResponseNote).toBeNull();
    expect(event?.type).toBe('order-request.created');
    expect(event?.payload).toMatchObject({
      requestId: id(50),
      orderId: id(20),
      orderItemId: id(30),
      vendorId: id(4),
      buyerId: id(7),
      note: 'the box was crushed',
    });
  });

  it('defaults the note to null and images to an empty list', () => {
    const aggregate = OrderRequestAggregate.create({
      id: id(50),
      orderId: id(20),
      orderItemId: null,
      vendorId: id(4),
      buyerId: id(7),
      type: OrderRequestTypeVO.refund(),
      reason: reason(),
    });

    expect(aggregate.note).toBeNull();
    expect(aggregate.images).toEqual([]);
    expect(aggregate.orderItemId).toBeNull();
    expect(aggregate.pullEvents()[0]?.payload).toMatchObject({ note: null });
  });

  it('does not let a caller mutate the image list', () => {
    const aggregate = request();
    aggregate.images.push(image());

    expect(aggregate.images).toHaveLength(1);
  });
});

describe('OrderRequestAggregate acceptance', () => {
  it('accepts a pending request with a vendor response note', () => {
    const aggregate = request();
    aggregate.clearEvents();

    aggregate.accept(id(4), 'approved after review');

    expect(aggregate.status.isAccepted).toBe(true);
    expect(aggregate.vendorResponseNote).toBe('approved after review');
    const [event] = aggregate.pullEvents();
    expect(event?.type).toBe('order-request.accepted');
    expect(event?.payload).toMatchObject({
      actorId: id(4),
      vendorResponseNote: 'approved after review',
    });
  });

  it('leaves the response note null when none is supplied', () => {
    const aggregate = request();

    aggregate.accept(id(4));

    expect(aggregate.vendorResponseNote).toBeNull();
  });

  it('refuses a second acceptance or acceptance after another decision', () => {
    expect(() => accepted().accept(id(4))).toThrow(BadRequestError);

    const rejected = request();
    rejected.reject(id(4), reason());
    expect(() => rejected.accept(id(4))).toThrow(BadRequestError);
  });
});

describe('OrderRequestAggregate rejection', () => {
  it('rejects with the reason stored as the vendor response', () => {
    const aggregate = request();
    aggregate.clearEvents();

    aggregate.reject(id(4), Reason.create('outside the return window'));

    expect(aggregate.status.isRejected).toBe(true);
    expect(aggregate.vendorResponseNote).toBe('outside the return window');
    const [event] = aggregate.pullEvents();
    expect(event?.type).toBe('order-request.rejected');
    expect(event?.payload).toMatchObject({
      rejectionReason: Reason.create('outside the return window'),
    });
  });

  it('refuses rejecting a request that already moved on', () => {
    expect(() => accepted().reject(id(4), reason())).toThrow(BadRequestError);
  });
});

describe('OrderRequestAggregate cancellation', () => {
  it('lets the owning buyer cancel a pending request', () => {
    const aggregate = request();
    aggregate.clearEvents();

    aggregate.cancel(id(7));

    expect(aggregate.status.isCancelled).toBe(true);
    expect(aggregate.pullEvents()[0]?.type).toBe('order-request.cancelled');
  });

  it('refuses cancellation by anyone but the buyer', () => {
    expect(() => request().cancel(id(8))).toThrow(ForbiddenError);
    expect(request().status.isPending).toBe(true);
  });

  it('refuses cancelling a decided request', () => {
    expect(() => accepted().cancel(id(7))).toThrow(BadRequestError);
  });

  it('lets an admin cancel a pending request without ownership', () => {
    const aggregate = request();
    aggregate.clearEvents();

    aggregate.cancelByAdmin(id(9));

    expect(aggregate.status.isCancelled).toBe(true);
    expect(aggregate.pullEvents()[0]?.type).toBe('order-request.cancelled');
  });

  it('refuses an admin cancel once the request is decided', () => {
    expect(() => accepted().cancelByAdmin(id(9))).toThrow(BadRequestError);
  });
});

describe('OrderRequestStatusVO and OrderRequestTypeVO', () => {
  it('normalizes and validates status values', () => {
    expect(OrderRequestStatusVO.create(' ACCEPTED ').value).toBe('accepted');
    expect(OrderRequestStatusVO.create('rejected').isRejected).toBe(true);
    expect(OrderRequestStatusVO.create('cancelled').isCancelled).toBe(true);
    expect(() => OrderRequestStatusVO.create('lost')).toThrow(BadRequestError);
  });

  it('compares status values by value', () => {
    expect(OrderRequestStatusVO.pending().equals(OrderRequestStatusVO.create('pending'))).toBe(
      true,
    );
    expect(OrderRequestStatusVO.pending().equals(OrderRequestStatusVO.accepted())).toBe(false);
  });

  it('normalizes and validates request types', () => {
    expect(OrderRequestTypeVO.create(' RETURN ').isReturn).toBe(true);
    expect(OrderRequestTypeVO.refund().isRefund).toBe(true);
    expect(OrderRequestTypeVO.return().equals(OrderRequestTypeVO.create('return'))).toBe(true);
    expect(() => OrderRequestTypeVO.create('exchange')).toThrow(BadRequestError);
  });
});
