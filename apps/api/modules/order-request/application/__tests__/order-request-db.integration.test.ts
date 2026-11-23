import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { InventoryModel } from '../../../inventory/infrastructure/inventory.model';
import { OrderItemsModel } from '../../../order-items/infrastructure/order-item.model';
import { OrderRequestModel } from '../../infrastructure/order-request.model';
import {
  integrationEnabled,
  type ApiData,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';
import {
  createSecurityKit,
  expectRejected,
  expectUnauthorized,
  type AttackResult,
  type SecurityKit,
} from '../../../../testing/security-kit';

let kit: SecurityKit;
let harness: ApiIntegrationHarness;

function errorCode(result: AttackResult): string {
  const body = result.body as { error?: { code?: string } } | null;
  return body?.error?.code ?? 'unknown';
}

async function createRequest(
  context: { orderId: string; itemId: string },
  overrides: Record<string, unknown> = {},
) {
  const result = await kit.send('buyer', '/order-request/my', {
    method: 'POST',
    body: {
      orderId: context.orderId,
      orderItemId: context.itemId,
      type: 'return',
      reason: 'Damaged item arrived.',
      ...overrides,
    },
  });
  if (result.accepted) {
    const data = (result.body as { data?: ApiData }).data;
    if (data) harness.track(harness.idFromData(data));
  }
  return result;
}

async function placeOrder(catalog: { addressId: string; variantId: string }) {
  const data = harness.expectSuccess<ApiData>(
    await harness.requestAs('buyer', '/order/my', {
      method: 'POST',
      body: {
        idempotentKey: Id.create().value,
        addressId: catalog.addressId,
        safeOrder: true,
        waitingTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        items: [{ variantId: catalog.variantId, quantity: 1 }],
      },
    }),
  );
  const orderId = harness.track(harness.idFromData(data));
  harness.trackCleanup(() => OrderItemsModel.deleteMany({ orderId }));
  const items = await OrderItemsModel.find({ orderId }).lean();
  const itemId = harness.track(String(items[0]?._id));
  return { orderId, itemId };
}

async function stock(inventoryId: string) {
  const doc = await InventoryModel.findById(inventoryId).lean();
  return {
    available: doc?.available ?? -1,
    reserved: doc?.reserved ?? -1,
    soldOut: doc?.soldOut ?? -1,
  };
}

async function seedConfirmedReturnRequest() {
  const context = await harness.seedOrder({ available: 10, quantity: 2 });
  harness.expectSuccess(
    await harness.requestAs('vendor', `/order-items/vendor/${context.itemId}/confirm`, {
      method: 'POST',
    }),
  );
  const created = harness.expectSuccess<{ message?: string }>(
    await harness.requestAs('buyer', '/order-request/my', {
      method: 'POST',
      body: {
        orderId: context.orderId,
        orderItemId: context.itemId,
        type: 'return',
        reason: 'Damaged item arrived.',
        note: 'Box was damaged during delivery.',
        images: ['https://example.com/evidence.png'],
      },
    }),
    201,
  );
  expect(typeof created.message).toBe('string');
  const request = await OrderRequestModel.findOne({
    orderId: context.orderId,
    orderItemId: context.itemId,
  }).lean();
  if (!request) throw new Error('Order request creation did not persist a request.');
  const requestId = String(request._id);
  harness.track(requestId);
  return { ...context, requestId };
}

describe.skipIf(!integrationEnabled)('order-request API database integration', () => {
  beforeAll(async () => {
    kit = await createSecurityKit();
    harness = kit.harness;
  }, 30_000);

  beforeEach(() => {
    harness.events.length = 0;
  });

  afterEach(async () => {
    await harness.cleanup();
  });

  afterAll(async () => {
    if (kit) await kit.dispose();
  });

  it('accepts a return request and rolls the item and inventory back once', async () => {
    const context = await seedConfirmedReturnRequest();
    harness.events.length = 0;

    harness.expectSuccess(
      await harness.requestAs('vendor', `/order-request/vendor/${context.requestId}/accept`, {
        method: 'POST',
        body: { note: 'Approved by vendor.' },
      }),
    );

    expect((await OrderRequestModel.findById(context.requestId).lean())?.status).toBe('accepted');
    expect((await OrderItemsModel.findById(context.itemId).lean())?.status).toBe('returned');
    const inventory = await InventoryModel.findById(context.inventoryId).lean();
    expect(inventory?.available).toBe(10);
    expect(inventory?.reserved).toBe(0);
    expect(inventory?.soldOut).toBe(0);
    expect(harness.events).toContain('order-request.accepted');
    expect(harness.events).toContain('order-item.returned');
  }, 30_000);

  it('rejects a request without changing the order item or stock', async () => {
    const context = await seedConfirmedReturnRequest();
    harness.events.length = 0;

    harness.expectSuccess(
      await harness.requestAs('vendor', `/order-request/vendor/${context.requestId}/reject`, {
        method: 'POST',
        body: { reason: 'Evidence was unclear.' },
      }),
    );

    expect((await OrderRequestModel.findById(context.requestId).lean())?.status).toBe('rejected');
    expect((await OrderItemsModel.findById(context.itemId).lean())?.status).toBe('confirmed');
    const inventory = await InventoryModel.findById(context.inventoryId).lean();
    expect(inventory?.available).toBe(8);
    expect(inventory?.soldOut).toBe(2);
    expect(harness.events).toContain('order-request.rejected');
    expect(harness.events).not.toContain('order-item.returned');
  }, 30_000);

  it('cancels a buyer request without changing the order item or stock', async () => {
    const context = await seedConfirmedReturnRequest();
    harness.events.length = 0;

    harness.expectSuccess(
      await harness.requestAs('buyer', `/order-request/my/${context.requestId}/cancel`, {
        method: 'PATCH',
      }),
    );

    expect((await OrderRequestModel.findById(context.requestId).lean())?.status).toBe('cancelled');
    expect((await OrderItemsModel.findById(context.itemId).lean())?.status).toBe('confirmed');
    const inventory = await InventoryModel.findById(context.inventoryId).lean();
    expect(inventory?.available).toBe(8);
    expect(inventory?.soldOut).toBe(2);
    expect(harness.events).toContain('order-request.cancelled');
  }, 30_000);

  it('OREQ-01 keeps another buyer out of the request by read and cancel', async () => {
    const context = await seedConfirmedReturnRequest();
    const read = await kit.send('buyerAlt', `/order-request/my/${context.requestId}`);
    const cancel = await kit.send('buyerAlt', `/order-request/my/${context.requestId}/cancel`, {
      method: 'PATCH',
    });
    const list = await kit.send('buyerAlt', '/order-request/my');
    const doc = await OrderRequestModel.findById(context.requestId).lean();

    kit.evidence('OREQ-01', {
      readStatus: read.status,
      cancelStatus: cancel.status,
      altRows: ((list.body as { data?: { data?: unknown[] } }).data?.data ?? []).length,
      status: doc?.status,
    });
    expectRejected(read, 'cross-tenant request read');
    expectRejected(cancel, 'cross-tenant request cancel');
    expect(((list.body as { data?: { data?: unknown[] } }).data?.data ?? []).length).toBe(0);
    expect(doc?.status).toBe('pending');
    expect(read.text).not.toContain('Damaged item arrived.');
  }, 30_000);

  it('OREQ-02 refuses a vendor that does not own the request', async () => {
    const context = await seedConfirmedReturnRequest();
    await kit.vendorProfileFor('vendorAlt');
    const before = await stock(context.inventoryId);

    const read = await kit.send('vendorAlt', `/order-request/vendor/${context.requestId}`);
    const accept = await kit.send(
      'vendorAlt',
      `/order-request/vendor/${context.requestId}/accept`,
      {
        method: 'POST',
        body: { note: 'Not my order.' },
      },
    );
    const reject = await kit.send(
      'vendorAlt',
      `/order-request/vendor/${context.requestId}/reject`,
      {
        method: 'POST',
        body: { reason: 'Not my order either.' },
      },
    );
    const list = await kit.send('vendorAlt', '/order-request/vendor/all');

    kit.evidence('OREQ-02', {
      readStatus: read.status,
      acceptStatus: accept.status,
      rejectStatus: reject.status,
      altRows: ((list.body as { data?: { data?: unknown[] } }).data?.data ?? []).length,
      requestStatus: (await OrderRequestModel.findById(context.requestId).lean())?.status,
      itemStatus: (await OrderItemsModel.findById(context.itemId).lean())?.status,
      ...(await stock(context.inventoryId)),
    });
    for (const attempt of [read, accept, reject]) {
      expectUnauthorized(attempt, 'foreign vendor request write');
    }
    expect(((list.body as { data?: { data?: unknown[] } }).data?.data ?? []).length).toBe(0);
    expect((await OrderRequestModel.findById(context.requestId).lean())?.status).toBe('pending');
    expect((await OrderItemsModel.findById(context.itemId).lean())?.status).toBe('confirmed');
    expect(await stock(context.inventoryId)).toEqual(before);
  }, 30_000);

  it('OREQ-03 keeps buyers and vendors out of the admin surface', async () => {
    const context = await seedConfirmedReturnRequest();
    const attempts = [
      await kit.send('buyer', '/order-request/admin/all'),
      await kit.send('buyer', `/order-request/admin/${context.requestId}`),
      await kit.send('buyer', `/order-request/admin/${context.requestId}/accept`, {
        method: 'POST',
        body: {},
      }),
      await kit.send('vendor', `/order-request/admin/${context.requestId}/accept`, {
        method: 'POST',
        body: {},
      }),
      await kit.send('vendor', `/order-request/admin/${context.requestId}/cancel`, {
        method: 'POST',
      }),
      await kit.sendAnonymously(`/order-request/my/${context.requestId}/cancel`, {
        method: 'PATCH',
      }),
    ];

    kit.evidence('OREQ-03', {
      statuses: kit.statuses(attempts).join(','),
      requestStatus: (await OrderRequestModel.findById(context.requestId).lean())?.status,
    });
    for (const attempt of attempts) expectUnauthorized(attempt, 'admin surface access');
    expect((await OrderRequestModel.findById(context.requestId).lean())?.status).toBe('pending');
  }, 30_000);

  it('OREQ-04 accepts once and refuses the replay without moving stock again', async () => {
    const context = await seedConfirmedReturnRequest();
    const first = await kit.send('vendor', `/order-request/vendor/${context.requestId}/accept`, {
      method: 'POST',
      body: { note: 'Approved by vendor.' },
    });
    const afterFirst = await stock(context.inventoryId);
    const replay = await kit.send('vendor', `/order-request/vendor/${context.requestId}/accept`, {
      method: 'POST',
      body: { note: 'Approved again.' },
    });

    kit.evidence('OREQ-04', {
      firstStatus: first.status,
      replayStatus: replay.status,
      replayCode: errorCode(replay),
      ...(await stock(context.inventoryId)),
    });
    expect(first.accepted).toBe(true);
    expectRejected(replay, 'accept replay');
    expect(await stock(context.inventoryId)).toEqual(afterFirst);
    expect(afterFirst).toEqual({ available: 10, reserved: 0, soldOut: 0 });
  }, 30_000);

  it('OREQ-05 restocks one line only once when accepts race', async () => {
    const context = await seedConfirmedReturnRequest();
    harness.events.length = 0;
    const attempts = await kit.race(5, async () =>
      kit.send('vendor', `/order-request/vendor/${context.requestId}/accept`, {
        method: 'POST',
        body: { note: 'Raced approval.' },
      }),
    );
    const after = await stock(context.inventoryId);
    const returnEvents = harness.events.filter((event) => event === 'order-item.returned');

    kit.evidence('OREQ-05', {
      statuses: kit.statuses(attempts).join(','),
      accepted: kit.accepted(attempts).length,
      ...after,
      returnEvents: returnEvents.length,
      requestStatus: (await OrderRequestModel.findById(context.requestId).lean())?.status,
    });
    expect(kit.accepted(attempts).length).toBe(1);
    expect(after).toEqual({ available: 10, reserved: 0, soldOut: 0 });
    expect(returnEvents.length).toBe(1);
  }, 60_000);

  it('OREQ-06 does not restock the same line twice through two requests', async () => {
    const context = await seedConfirmedReturnRequest();
    const second = await createRequest(context, { reason: 'Second claim on the same line.' });
    expect(second.accepted, 'the second pending request must exist for this attack').toBe(true);
    const secondId = harness.idFromData((second.body as { data: ApiData }).data);

    const firstAccept = await kit.send(
      'vendor',
      `/order-request/vendor/${context.requestId}/accept`,
      {
        method: 'POST',
        body: { note: 'First approval.' },
      },
    );
    const secondAccept = await kit.send('vendor', `/order-request/vendor/${secondId}/accept`, {
      method: 'POST',
      body: { note: 'Second approval.' },
    });
    const after = await stock(context.inventoryId);

    kit.evidence('OREQ-06', {
      firstAcceptStatus: firstAccept.status,
      secondAcceptStatus: secondAccept.status,
      secondAcceptCode: errorCode(secondAccept),
      ...after,
      itemStatus: (await OrderItemsModel.findById(context.itemId).lean())?.status,
    });
    expect(firstAccept.accepted).toBe(true);
    expect(after.available).toBeLessThanOrEqual(10);
    expect(after.soldOut).toBeGreaterThanOrEqual(0);
  }, 60_000);

  it('OREQ-07 closes every transition out of a settled request', async () => {
    const cancelled = await seedConfirmedReturnRequest();
    await kit.send('buyer', `/order-request/my/${cancelled.requestId}/cancel`, { method: 'PATCH' });
    const acceptCancelled = await kit.send(
      'vendor',
      `/order-request/vendor/${cancelled.requestId}/accept`,
      { method: 'POST', body: {} },
    );
    const rejectCancelled = await kit.send(
      'vendor',
      `/order-request/vendor/${cancelled.requestId}/reject`,
      { method: 'POST', body: { reason: 'Too late to reject.' } },
    );

    const fresh = await createRequest(cancelled, { reason: 'A second claim to settle.' });
    expect(fresh.accepted, 'the second request must exist for this attack').toBe(true);
    const acceptedId = harness.idFromData((fresh.body as { data: ApiData }).data);
    await kit.send('vendor', `/order-request/vendor/${acceptedId}/accept`, {
      method: 'POST',
      body: {},
    });
    const cancelAccepted = await kit.send('buyer', `/order-request/my/${acceptedId}/cancel`, {
      method: 'PATCH',
    });
    const rejectAccepted = await kit.send('vendor', `/order-request/vendor/${acceptedId}/reject`, {
      method: 'POST',
      body: { reason: 'Reversing an approval.' },
    });

    kit.evidence('OREQ-07', {
      acceptCancelledStatus: acceptCancelled.status,
      rejectCancelledStatus: rejectCancelled.status,
      cancelAcceptedStatus: cancelAccepted.status,
      rejectAcceptedStatus: rejectAccepted.status,
      cancelledStatus: (await OrderRequestModel.findById(cancelled.requestId).lean())?.status,
      acceptedStatus: (await OrderRequestModel.findById(acceptedId).lean())?.status,
    });
    for (const attempt of [acceptCancelled, rejectCancelled, cancelAccepted, rejectAccepted]) {
      expectRejected(attempt, 'transition out of a settled request');
    }
    expect((await OrderRequestModel.findById(cancelled.requestId).lean())?.status).toBe(
      'cancelled',
    );
    expect((await OrderRequestModel.findById(acceptedId).lean())?.status).toBe('accepted');
  }, 60_000);

  it('OREQ-08 refuses a request on an order the caller does not own', async () => {
    const context = await seedConfirmedReturnRequest();
    const attempt = await kit.send('buyerAlt', '/order-request/my', {
      method: 'POST',
      body: {
        orderId: context.orderId,
        orderItemId: context.itemId,
        type: 'return',
        reason: 'Claiming somebody else order.',
      },
    });
    const rows = await OrderRequestModel.countDocuments({ orderId: context.orderId });

    kit.evidence('OREQ-08', { status: attempt.status, code: errorCode(attempt), rows });
    expectUnauthorized(attempt, 'request on a foreign order');
    expect(rows).toBe(1);
  }, 30_000);

  it('OREQ-09 refuses an order item that belongs to a different order', async () => {
    const context = await seedConfirmedReturnRequest();
    const other = await placeOrder(context);
    const attempt = await createRequest(context, {
      orderItemId: other.itemId,
      reason: 'Cross-order line substitution.',
    });
    const rows = await OrderRequestModel.countDocuments({ orderId: context.orderId });

    kit.evidence('OREQ-09', {
      status: attempt.status,
      code: errorCode(attempt),
      rows,
      otherOrderId: other.orderId,
    });
    expectRejected(attempt, 'order item from another order');
    expect(rows).toBe(1);
  }, 60_000);

  it('OREQ-10 refuses a return before the line is confirmed', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const attempt = await createRequest(context, { reason: 'Returning an unconfirmed line.' });
    const rows = await OrderRequestModel.countDocuments({ orderId: context.orderId });

    kit.evidence('OREQ-10', {
      status: attempt.status,
      code: errorCode(attempt),
      rows,
      itemStatus: (await OrderItemsModel.findById(context.itemId).lean())?.status,
    });
    expectRejected(attempt, 'return of an unconfirmed line');
    expect(rows).toBe(0);
  }, 30_000);

  it('OREQ-11 does not restock a returned line a second time through a refund', async () => {
    const context = await seedConfirmedReturnRequest();
    await kit.send('vendor', `/order-request/vendor/${context.requestId}/accept`, {
      method: 'POST',
      body: {},
    });
    const afterReturn = await stock(context.inventoryId);

    const refund = await createRequest(context, {
      type: 'refund',
      reason: 'Refunding an already returned line.',
    });
    const refundId = refund.accepted
      ? harness.idFromData((refund.body as { data: ApiData }).data)
      : '';
    const accept = refundId
      ? await kit.send('vendor', `/order-request/vendor/${refundId}/accept`, {
          method: 'POST',
          body: {},
        })
      : refund;

    kit.evidence('OREQ-11', {
      refundCreateStatus: refund.status,
      refundAcceptStatus: accept.status,
      afterReturn: JSON.stringify(afterReturn),
      ...(await stock(context.inventoryId)),
    });
    expect(refund.accepted).toBe(true);
    expect(accept.accepted).toBe(true);
    expect(await stock(context.inventoryId)).toEqual(afterReturn);
  }, 60_000);

  it('OREQ-12 rejects abusive create and query payloads', async () => {
    const context = await seedConfirmedReturnRequest();
    const attempts = [
      await createRequest(context, { type: 'exchange' }),
      await createRequest(context, { reason: 'short' }),
      await createRequest(context, { reason: 'x'.repeat(10_000) }),
      await createRequest(context, { images: Array(6).fill('https://example.com/a.png') }),
      await createRequest(context, { images: ['not a url'] }),
      await createRequest(context, { orderId: Id.create().value }),
      await kit.send('buyer', '/order-request/my?limit=0'),
      await kit.send('buyer', '/order-request/my?limit=101'),
      await kit.send('buyer', '/order-request/my?status=bogus'),
      await kit.send('buyer', '/order-request/my?direction=sideways'),
    ];
    const rows = await OrderRequestModel.countDocuments({ orderId: context.orderId });

    kit.evidence('OREQ-12', {
      statuses: kit.statuses(attempts).join(','),
      codes: attempts.map(errorCode).join(','),
      rows,
    });
    for (const attempt of attempts) expectRejected(attempt, 'abusive order-request payload');
    expect(rows).toBe(1);
  }, 60_000);

  it('OREQ-13 ignores mass-assigned ownership and status on create', async () => {
    const context = await seedConfirmedReturnRequest();
    const attackerId = Id.create().value;
    const created = await createRequest(context, {
      id: attackerId,
      buyerId: attackerId,
      vendorId: attackerId,
      status: 'accepted',
      reason: 'Mass assignment probe on create.',
    });
    expect(created.accepted, 'the probe request must be created').toBe(true);
    const requestId = harness.idFromData((created.body as { data: ApiData }).data);
    const doc = await OrderRequestModel.findById(requestId).lean();

    kit.evidence('OREQ-13', {
      status: created.status,
      attackerId,
      storedId: doc?._id,
      storedBuyerId: doc?.buyerId,
      storedVendorId: doc?.vendorId,
      storedStatus: doc?.status,
    });
    expect(doc?._id).not.toBe(attackerId);
    expect(doc?.buyerId).toBe(harness.userIds.buyer);
    expect(doc?.vendorId).toBe(context.vendorId);
    expect(doc?.status).toBe('pending');
  }, 30_000);

  it('OREQ-14 lets an admin close a pending request and blocks the buyer afterwards', async () => {
    const context = await seedConfirmedReturnRequest();
    const before = await stock(context.inventoryId);
    const adminCancel = await kit.send(
      'admin',
      `/order-request/admin/${context.requestId}/cancel`,
      {
        method: 'POST',
      },
    );
    const buyerCancel = await kit.send('buyer', `/order-request/my/${context.requestId}/cancel`, {
      method: 'PATCH',
    });
    const accept = await kit.send('vendor', `/order-request/vendor/${context.requestId}/accept`, {
      method: 'POST',
      body: {},
    });

    kit.evidence('OREQ-14', {
      adminCancelStatus: adminCancel.status,
      buyerCancelStatus: buyerCancel.status,
      acceptStatus: accept.status,
      status: (await OrderRequestModel.findById(context.requestId).lean())?.status,
      ...(await stock(context.inventoryId)),
    });
    expect(adminCancel.accepted).toBe(true);
    expectRejected(buyerCancel, 'buyer cancel after admin cancel');
    expectRejected(accept, 'accept after admin cancel');
    expect((await OrderRequestModel.findById(context.requestId).lean())?.status).toBe('cancelled');
    expect(await stock(context.inventoryId)).toEqual(before);
  }, 30_000);
});
