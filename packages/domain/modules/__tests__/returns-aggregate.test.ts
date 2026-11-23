import { describe, expect, it } from 'bun:test';
import { BadRequestError } from '../../errors/app-error';
import { DeleteInfoVO, EffectiveDate, Id, Quantity, Reason } from '../../value-objects';
import { ReturnRequestAggregate } from '../returns/returns.aggregate';
import { ReturnStatusVO } from '../returns/value-objects/return-status.vo';
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

function domainEvidence(tag: string, data: Record<string, unknown>) {
  console.log(`[DOM-${tag}] ${JSON.stringify(data)}`);
}

function deletedReturn(status: ReturnStatusVO) {
  return ReturnRequestAggregate.rehydrate(
    id(800),
    id(1),
    id(2),
    id(3),
    id(4),
    Quantity.create(2),
    ReturnTypeVO.create('refund'),
    reason(),
    status,
    null,
    EffectiveDate.today(),
    null,
    null,
    DeleteInfoVO.create(actor, reason()),
    Quantity.create(1),
    EffectiveDate.today(),
  );
}

describe('hostile return decisions', () => {
  it('DOM-T14-CONTROL rejects a wrong vendor through the ownership helper', () => {
    const aggregate = request();
    expect(aggregate.vendorId).toEqual(id(3));
    expect(() => aggregate.ensureOwnedByVendor(id(3))).not.toThrow();
    expect(() => aggregate.ensureOwnedByVendor(id(5))).toThrow(BadRequestError);
  });

  it.failing('DOM-T14 approve accepts an actor who does not own the return', () => {
    const aggregate = request();
    expect(aggregate.vendorId).toEqual(id(3));
    expect(aggregate.status.value).toBe('requested');
    aggregate.clearEvents();

    aggregate.approve(id(5));
    const events = aggregate.pullEvents();

    domainEvidence('T14-APPROVE', {
      vendorId: aggregate.vendorId.value,
      actorId: id(5).value,
      status: aggregate.status.value,
      events: events.map((event) => event.type),
    });
    expect(events.map((event) => event.type)).not.toContain('return.approved');
    expect(() => request().approve(id(5))).toThrow(BadRequestError);
  });

  it.failing('DOM-T14 reject accepts an actor who does not own the return', () => {
    const aggregate = request();
    expect(aggregate.vendorId).toEqual(id(3));
    expect(aggregate.status.value).toBe('requested');
    aggregate.clearEvents();

    aggregate.reject(reason(), id(5));
    const events = aggregate.pullEvents();

    domainEvidence('T14-REJECT', {
      vendorId: aggregate.vendorId.value,
      actorId: id(5).value,
      status: aggregate.status.value,
      decisionReason: aggregate.decisionReason?.value,
      events: events.map((event) => event.type),
    });
    expect(events.map((event) => event.type)).not.toContain('return.rejected');
    expect(() => request().reject(reason(), id(5))).toThrow(BadRequestError);
  });
});

describe('hostile return recovery', () => {
  it('DOM-T15-CONTROL keeps the delete and recover guards strict', () => {
    expect(() => request().deleteRequest(reason(), actor)).toThrow(
      'Only a closed return request can be deleted.',
    );
    expect(() => request().recoverRequest()).toThrow('Return request is not deleted.');
  });

  it.failing('DOM-T15 recoverRequest revives a deleted open request', () => {
    const aggregate = deletedReturn(ReturnStatusVO.requested());
    expect(aggregate.delete.isDeleted).toBe(true);
    expect(aggregate.status.isFinal).toBe(false);
    aggregate.clearEvents();

    aggregate.recoverRequest();

    domainEvidence('T15-OPEN', {
      status: aggregate.status.value,
      isFinal: aggregate.status.isFinal,
      deleted: aggregate.delete.isDeleted,
      events: aggregate.pullEvents().map((event) => event.type),
    });
    expect(aggregate.delete.isDeleted).toBe(true);
    expect(() => deletedReturn(ReturnStatusVO.requested()).recoverRequest()).toThrow(
      BadRequestError,
    );
  });

  it.failing('DOM-T15 recoverRequest changes deletion state without an event', () => {
    const aggregate = approved();
    aggregate.markReceived(actor);
    aggregate.deleteRequest(reason(), actor);
    aggregate.clearEvents();
    expect(aggregate.delete.isDeleted).toBe(true);
    expect(aggregate.status.isFinal).toBe(true);

    aggregate.recoverRequest();
    const events = aggregate.pullEvents();

    domainEvidence('T15-EVENT', {
      status: aggregate.status.value,
      deleted: aggregate.delete.isDeleted,
      events: events.map((event) => event.type),
    });
    expect(events.length).toBeGreaterThan(0);
  });
});

describe('hostile return quantities', () => {
  it('DOM-H2-CONTROL rejects a zero-quantity request', () => {
    expect(request(2).quantity.value).toBe(2);
    expect(() => request(0)).toThrow(BadRequestError);
  });

  it.failing('DOM-H2 accepts a fractional return quantity', () => {
    expect(request(2).quantity.value).toBe(2);
    const exploit = request(1.5);

    domainEvidence('H2', { quantity: exploit.quantity.value, status: exploit.status.value });
    expect(() => request(1.5)).toThrow(BadRequestError);
  });
});
