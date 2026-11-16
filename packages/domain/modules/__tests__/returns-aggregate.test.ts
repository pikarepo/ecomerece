import { describe, expect, it } from 'bun:test';
import { BadRequestError } from '../../errors/app-error';
import { Id, Quantity, Reason } from '../../value-objects';
import { ReturnRequestAggregate } from '../returns/returns.aggregate';
import { ReturnTypeVO } from '../returns/value-objects/return-type.vo';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`);
const actor = id(9);
const reason = () => Reason.create('the item arrived with a cracked housing');

function request(quantity = 2) {
  return ReturnRequestAggregate.create({
    id: id(800),
    orderId: id(1),
    orderItemId: id(2),
    vendorId: id(3),
    buyerId: id(4),
    quantity: Quantity.create(quantity),
    returnType: ReturnTypeVO.create('refund'),
    reason: reason(),
  });
}

function approved() {
  const aggregate = request();
  aggregate.approve(actor);
  aggregate.clearEvents();
  return aggregate;
}

describe('ReturnRequestAggregate creation', () => {
  it('starts requested with the buyer reason and no decision', () => {
    const aggregate = request();

    expect(aggregate.status.value).toBe('requested');
    expect(aggregate.returnType.value).toBe('refund');
    expect(aggregate.decisionReason).toBeNull();
    expect(aggregate.decidedAt).toBeNull();
    expect(aggregate.receivedAt).toBeNull();
    expect(aggregate.delete.isDeleted).toBe(false);
  });

  it('refuses a request that covers no units', () => {
    expect(() => request(0)).toThrow(BadRequestError);
  });

  it('raises return.requested once the app service registers it', () => {
    const aggregate = request();

    aggregate.requestReturn();

    const [event] = aggregate.pullEvents();
    expect(event?.type).toBe('return.requested');
    expect(event?.payload).toMatchObject({ returnId: id(800), orderId: id(1), buyerId: id(4) });
  });
});

describe('ReturnRequestAggregate decision', () => {
  it('approves only a requested return', () => {
    const aggregate = request();

    aggregate.approve(actor);

    expect(aggregate.status.value).toBe('approved');
    expect(aggregate.decidedAt).not.toBeNull();
    expect(aggregate.pullEvents().at(-1)?.type).toBe('return.approved');
    expect(() => aggregate.approve(actor)).toThrow(BadRequestError);
  });

  it('records the rejection reason and closes the request', () => {
    const aggregate = request();

    aggregate.reject(reason(), actor);

    expect(aggregate.status.value).toBe('rejected');
    expect(aggregate.status.isFinal).toBe(true);
    expect(aggregate.decisionReason?.value).toBe(reason().value);
    expect(aggregate.pullEvents().at(-1)?.type).toBe('return.rejected');
  });

  it('cannot reject an approved request', () => {
    expect(() => approved().reject(reason(), actor)).toThrow(BadRequestError);
  });
});

describe('ReturnRequestAggregate goods movement', () => {
  it('moves approved -> shipped_back -> received', () => {
    const aggregate = approved();

    aggregate.markShippedBack(actor);
    expect(aggregate.status.value).toBe('shipped_back');
    expect(aggregate.pullEvents().at(-1)?.type).toBe('return.shipped-back');

    aggregate.markReceived(actor);
    expect(aggregate.status.value).toBe('received');
    expect(aggregate.receivedAt).not.toBeNull();
    expect(aggregate.status.isFinal).toBe(true);
    expect(aggregate.pullEvents().at(-1)?.type).toBe('return.received');
  });

  it('receives an approved return without an explicit shipped-back step', () => {
    const aggregate = approved();

    aggregate.markReceived(actor);

    expect(aggregate.status.value).toBe('received');
  });

  it('refuses to receive a request that was never approved', () => {
    expect(() => request().markReceived(actor)).toThrow(BadRequestError);
  });

  it('refuses to ship back a request that was never approved', () => {
    expect(() => request().markShippedBack(actor)).toThrow(BadRequestError);
  });
});

describe('ReturnRequestAggregate cancellation', () => {
  it('cancels a requested or approved return only', () => {
    const pending = request();
    pending.cancel(reason(), actor);
    expect(pending.status.value).toBe('cancelled');
    expect(pending.status.isFinal).toBe(true);

    const approvedRequest = approved();
    approvedRequest.cancel(reason(), actor);
    expect(approvedRequest.status.value).toBe('cancelled');

    const received = approved();
    received.markReceived(actor);
    expect(() => received.cancel(reason(), actor)).toThrow(BadRequestError);
  });
});

describe('ReturnRequestAggregate deletion and ownership', () => {
  it('deletes only a closed request and can recover it', () => {
    const received = approved();
    received.markReceived(actor);
    received.clearEvents();

    received.deleteRequest(reason(), actor);
    expect(received.delete.isDeleted).toBe(true);
    expect(received.pullEvents().at(-1)?.type).toBe('return.cancelled');

    received.recoverRequest();
    expect(received.delete.isDeleted).toBe(false);
  });

  it('refuses to delete an open request', () => {
    expect(() => request().deleteRequest(reason(), actor)).toThrow(
      'Only a closed return request can be deleted.',
    );
  });

  it('refuses a redundant delete, recover, or command after deletion', () => {
    const received = approved();
    received.markReceived(actor);
    received.deleteRequest(reason(), actor);

    expect(() => received.deleteRequest(reason(), actor)).toThrow(BadRequestError);
    expect(() => approved().recoverRequest()).toThrow(BadRequestError);
    expect(() => received.approve(actor)).toThrow(BadRequestError);
  });

  it('checks vendor and buyer ownership', () => {
    const aggregate = request();

    expect(() => aggregate.ensureOwnedByVendor(id(3))).not.toThrow();
    expect(() => aggregate.ensureOwnedByVendor(id(5))).toThrow(BadRequestError);
    expect(aggregate.isOwnedByBuyer(id(4))).toBe(true);
    expect(aggregate.isOwnedByBuyer(id(6))).toBe(false);
  });
});
