import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { ShipmentModel } from '../../infrastructure/shipment.model';
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
  type Tenant,
} from '../../../../testing/security-kit';

let kit: SecurityKit;
let harness: ApiIntegrationHarness;

function errorCode(result: AttackResult): string {
  const body = result.body as { error?: { code?: string } } | null;
  return body?.error?.code ?? 'unknown';
}

async function createShipment(
  context: { orderId: string },
  overrides: Record<string, unknown> = {},
) {
  const result = await kit.send('vendor', '/shipping/vendor', {
    method: 'POST',
    body: {
      orderId: context.orderId,
      carrier: 'local',
      shippingMethod: 'standard',
      cost: 50,
      weightGrams: 500,
      ...overrides,
    },
  });
  if (result.accepted) {
    const data = (result.body as { data?: ApiData }).data;
    if (data) harness.track(harness.idFromData(data));
  }
  return result;
}

async function shipmentId(context: { orderId: string }) {
  const created = await createShipment(context);
  if (!created.accepted) {
    kit.evidence('SHIP-FIXTURE', { status: created.status, body: created.text.slice(0, 300) });
  }
  expect(created.accepted, 'shipment fixture must exist').toBe(true);
  return harness.idFromData((created.body as { data: ApiData }).data);
}

async function lifecycle(
  tenant: Tenant,
  id: string,
  action: 'dispatch' | 'in-transit' | 'out-for-delivery' | 'deliver' | 'fail' | 'return' | 'cancel',
  body: Record<string, unknown> = {},
) {
  return await kit.send(
    tenant,
    `/shipping/${tenant === 'admin' ? 'admin' : 'vendor'}/${id}/${action}`,
    {
      method: 'POST',
      body:
        action === 'fail' || action === 'return' || action === 'cancel'
          ? { reason: 'Lifecycle probe reason.', ...body }
          : body,
    },
  );
}

async function trackingAs(tenant: 'vendor' | 'vendorAlt' | 'admin', id: string, number: string) {
  const scope = tenant === 'admin' ? 'admin' : 'vendor';
  return await kit.send(tenant, `/shipping/${scope}/${id}`, {
    method: 'PATCH',
    body: {
      carrier: 'local',
      shippingMethod: 'standard',
      trackingNumber: number,
      cost: 50,
    },
  });
}

async function tracking(id: string, number: string) {
  return await trackingAs('vendor', id, number);
}

function rows(result: AttackResult): { id: string }[] {
  const body = result.body as { data?: { data?: { id: string }[] } } | null;
  return body?.data?.data ?? [];
}

async function seedShipment() {
  const context = await harness.seedOrder({ available: 10, quantity: 2 });
  const created = harness.expectSuccess<ApiData>(
    await harness.requestAs('vendor', '/shipping/vendor', {
      method: 'POST',
      body: {
        orderId: context.orderId,
        carrier: 'local',
        shippingMethod: 'standard',
        cost: 50,
        weightGrams: 500,
      },
    }),
    201,
  );
  const shipmentId = harness.track(harness.idFromData(created));
  return { ...context, shipmentId };
}

describe.skipIf(!integrationEnabled)('shipping API database integration', () => {
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

  it('creates a pending shipment for the order and vendor', async () => {
    const context = await seedShipment();

    const shipment = await ShipmentModel.findById(context.shipmentId).lean();
    expect(shipment?.orderId).toBe(context.orderId);
    expect(shipment?.vendorId).toBe(context.vendorId);
    expect(shipment?.buyerId).toBe(harness.userIds.buyer);
    expect(shipment?.status).toBe('pending');
    expect(shipment?.cost).toBe(50);
    expect(shipment?.weightGrams).toBe(500);
    expect(shipment?.deleted.deleted).toBe(false);
    expect(harness.events).toContain('shipment.created');
  }, 30_000);

  it('assigns tracking, dispatches, and delivers the shipment', async () => {
    const context = await seedShipment();
    const trackingNumber = `TRACK-${harness.runId}`.toUpperCase();
    harness.events.length = 0;

    harness.expectSuccess(
      await harness.requestAs('vendor', `/shipping/vendor/${context.shipmentId}`, {
        method: 'PATCH',
        body: {
          carrier: 'local',
          shippingMethod: 'standard',
          trackingNumber,
          cost: 50,
        },
      }),
    );
    harness.expectSuccess(
      await harness.requestAs('vendor', `/shipping/vendor/${context.shipmentId}/dispatch`, {
        method: 'POST',
      }),
    );
    expect((await ShipmentModel.findById(context.shipmentId).lean())?.status).toBe('dispatched');
    expect(harness.events).toContain('shipment.tracking-assigned');
    expect(harness.events).toContain('shipment.dispatched');

    harness.events.length = 0;
    harness.expectSuccess(
      await harness.requestAs('vendor', `/shipping/vendor/${context.shipmentId}/deliver`, {
        method: 'POST',
      }),
    );

    const shipment = await ShipmentModel.findById(context.shipmentId).lean();
    expect(shipment?.status).toBe('delivered');
    expect(shipment?.deliveredAt).not.toBeNull();
    expect(harness.events).toContain('shipment.delivered');
  }, 30_000);

  it('SHIP-01 refuses every create and lifecycle write from a foreign vendor', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    await kit.vendorProfileFor('vendorAlt');
    const id = await shipmentId(context);
    const before = await ShipmentModel.findById(id).lean();

    const create = await kit.send('vendorAlt', '/shipping/vendor', {
      method: 'POST',
      body: {
        orderId: context.orderId,
        carrier: 'local',
        shippingMethod: 'standard',
        cost: 50,
        weightGrams: 500,
      },
    });
    const attempts = [
      await trackingAs('vendorAlt', id, `TRACK-ALT-${kit.runId}`.toUpperCase()),
      await lifecycle('vendorAlt', id, 'dispatch'),
      await lifecycle('vendorAlt', id, 'deliver'),
      await lifecycle('vendorAlt', id, 'cancel'),
      await kit.send('vendorAlt', `/shipping/vendor/${id}`, { method: 'DELETE' }),
    ];
    const after = await ShipmentModel.findById(id).lean();

    kit.evidence('SHIP-01', {
      createStatus: create.status,
      statuses: kit.statuses(attempts).join(','),
      statusBefore: before?.status,
      statusAfter: after?.status,
      trackingAfter: after?.trackingNumber,
    });
    expectRejected(create, 'create on a foreign order');
    for (const attempt of attempts) expectRejected(attempt, 'foreign vendor shipment write');
    expect(after?.status).toBe(before?.status);
    expect(after?.trackingNumber).toBe(before?.trackingNumber);
  }, 60_000);

  it('SHIP-02 keeps another buyer out of the parcel by id and list', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const id = await shipmentId(context);
    const read = await kit.send('buyerAlt', `/shipping/my/${id}`);
    const list = await kit.send('buyerAlt', '/shipping/my/all');
    const mine = await kit.send('buyer', '/shipping/my/all');

    kit.evidence('SHIP-02', {
      readStatus: read.status,
      altRows: rows(list).length,
      buyerRows: rows(mine).length,
    });
    expectRejected(read, 'cross-tenant shipment read');
    expect(rows(list)).toHaveLength(0);
    expect(rows(mine).map((row) => row.id)).toContain(id);
    expect(read.text).not.toContain(context.orderId);
  }, 30_000);

  it('SHIP-03 keeps buyers, vendors and anonymous callers out of admin routes', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const id = await shipmentId(context);
    const attempts = [
      await kit.send('buyer', '/shipping/admin/all'),
      await kit.send('vendor', '/shipping/admin/all'),
      await kit.send('buyer', `/shipping/admin/${id}`),
      await kit.send('vendor', `/shipping/admin/${id}/dispatch`, { method: 'POST' }),
      await kit.send('buyer', `/shipping/admin/${id}`, {
        method: 'DELETE',
        body: { reason: 'Trying to hide a parcel.' },
      }),
      await kit.sendAnonymously('/shipping/admin/all'),
      await kit.sendAnonymously(`/shipping/my/${id}`),
    ];

    kit.evidence('SHIP-03', {
      statuses: kit.statuses(attempts).join(','),
      status: (await ShipmentModel.findById(id).lean())?.status,
    });
    for (const attempt of attempts) expectUnauthorized(attempt, 'admin or buyer route access');
    expect((await ShipmentModel.findById(id).lean())?.status).toBe('pending');
  }, 30_000);

  it('SHIP-04 tracks by number without exposing buyer, order or address', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const id = await shipmentId(context);
    const number = `TRACK-PUB-${kit.runId}`.toUpperCase();
    await tracking(id, number);
    const publicRead = await kit.sendAnonymously(`/shipping/track/${number}`);
    const text = publicRead.text;

    kit.evidence('SHIP-04', {
      status: publicRead.status,
      leaksBuyerId: text.includes(harness.userIds.buyer),
      leaksOrderId: text.includes(context.orderId),
      leaksAddress: text.includes('2 Integration Street'),
      leaksVendorId: text.includes(context.vendorId),
      leaksInternalId: text.includes(id),
    });
    expect(publicRead.accepted).toBe(true);
    expect(text).not.toContain(harness.userIds.buyer);
    expect(text).not.toContain(context.orderId);
    expect(text).not.toContain('2 Integration Street');
    expect(text).not.toContain(context.vendorId);
    expect(text).not.toContain(id);
  }, 30_000);

  it('SHIP-05 refuses to move a parcel without a label or in a skipped order', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const id = await shipmentId(context);
    const dispatch = await lifecycle('vendor', id, 'dispatch');
    await tracking(id, `TRACK-SEQ-${kit.runId}`.toUpperCase());
    const deliverFromPending = await lifecycle('vendor', id, 'deliver');
    const dispatchNow = await lifecycle('vendor', id, 'dispatch');
    const doubleDispatch = await lifecycle('vendor', id, 'dispatch');

    kit.evidence('SHIP-05', {
      dispatchStatus: dispatch.status,
      deliverFromPendingStatus: deliverFromPending.status,
      deliverFromPendingCode: errorCode(deliverFromPending),
      dispatchNowStatus: dispatchNow.status,
      doubleDispatchStatus: doubleDispatch.status,
      finalStatus: (await ShipmentModel.findById(id).lean())?.status,
    });
    expectRejected(dispatch, 'dispatch without a tracking number');
    expectRejected(deliverFromPending, 'delivery without dispatch');
    expect(dispatchNow.accepted).toBe(true);
    expectRejected(doubleDispatch, 'second dispatch');
  }, 30_000);

  it('SHIP-06 closes the lifecycle against reversal after delivery', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const id = await shipmentId(context);
    await tracking(id, `TRACK-FINAL-${kit.runId}`.toUpperCase());
    await lifecycle('vendor', id, 'dispatch');
    const delivered = await lifecycle('vendor', id, 'deliver');
    const attempts = [
      await lifecycle('vendor', id, 'cancel'),
      await lifecycle('vendor', id, 'fail'),
      await lifecycle('vendor', id, 'dispatch'),
      await tracking(id, `TRACK-REWRITE-${kit.runId}`.toUpperCase()),
    ];
    const doc = await ShipmentModel.findById(id).lean();

    kit.evidence('SHIP-06', {
      deliveredStatus: delivered.status,
      statuses: kit.statuses(attempts).join(','),
      finalStatus: doc?.status,
      tracking: doc?.trackingNumber,
      scanCount: doc?.events.length,
    });
    expect(delivered.accepted).toBe(true);
    for (const attempt of attempts) expectRejected(attempt, 'reversal of a delivered parcel');
    expect(doc?.status).toBe('delivered');
    expect(doc?.trackingNumber).toContain('TRACK-FINAL');
  }, 30_000);

  it('SHIP-07 keeps one label per parcel when the same number is assigned concurrently', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const id = await shipmentId(context);
    const number = `TRACK-RACE-${kit.runId}`.toUpperCase();
    const attempts = await kit.race(2, async () => await tracking(id, number));
    const doc = await ShipmentModel.findById(id).lean();

    kit.evidence('SHIP-07', {
      statuses: kit.statuses(attempts).join(','),
      codes: attempts.map(errorCode).join(','),
      accepted: kit.accepted(attempts).length,
      version: doc?.version,
      rowsWithNumber: await ShipmentModel.countDocuments({ trackingNumber: number }),
    });
    expect(kit.accepted(attempts).length).toBe(1);
    expect(doc?.version).toBe(1);
    expect(await ShipmentModel.countDocuments({ trackingNumber: number })).toBe(1);
  }, 60_000);

  it('SHIP-08 keeps label rewrites consistent when they race', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const id = await shipmentId(context);
    const attempts = await kit.race(5, async (index) =>
      tracking(id, `TRACK-MULTI-${index}-${kit.runId}`.toUpperCase()),
    );
    const doc = await ShipmentModel.findById(id).lean();

    kit.evidence('SHIP-08', {
      statuses: kit.statuses(attempts).join(','),
      accepted: kit.accepted(attempts).length,
      version: doc?.version,
      scans: doc?.events.length,
      tracking: doc?.trackingNumber,
    });
    expect(kit.accepted(attempts).length).toBeGreaterThan(0);
    expect(doc?.version).toBe(kit.accepted(attempts).length);
  }, 60_000);

  it('SHIP-09 ignores mass-assigned identity and deletion on create', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const attackerId = Id.create().value;
    const created = await createShipment(context, {
      id: attackerId,
      _id: attackerId,
      buyerId: attackerId,
      vendorId: attackerId,
      deleted: { deleted: true },
      status: 'delivered',
    });
    expect(created.accepted, 'the probe shipment must be created').toBe(true);
    const id = harness.idFromData((created.body as { data: ApiData }).data);
    const doc = await ShipmentModel.findById(id).lean();

    kit.evidence('SHIP-09', {
      attackerId,
      storedId: doc?._id,
      buyerId: doc?.buyerId,
      vendorId: doc?.vendorId,
      status: doc?.status,
      deleted: doc?.deleted.deleted,
    });
    expect(doc?._id).not.toBe(attackerId);
    expect(doc?.buyerId).toBe(harness.userIds.buyer);
    expect(doc?.vendorId).toBe(context.vendorId);
    expect(doc?.status).toBe('pending');
    expect(doc?.deleted.deleted).toBe(false);
  }, 30_000);

  it('SHIP-10 rejects abusive carriers, weights, costs and order ids', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const attempts = [
      await createShipment(context, { carrier: 'carrier-pigeon' }),
      await createShipment(context, { shippingMethod: 'teleport' }),
      await createShipment(context, { cost: -1 }),
      await createShipment(context, { cost: 'free' }),
      await createShipment(context, { weightGrams: 0 }),
      await createShipment(context, { weightGrams: 1.5 }),
      await createShipment(context, { orderId: Id.create().value }),
      await createShipment(context, { estimatedDelivery: 'not a date' }),
      await kit.send('vendor', '/shipping/vendor/all?limit=0'),
      await kit.send('vendor', '/shipping/vendor/all?limit=101'),
      await kit.send('vendor', '/shipping/vendor/all?status=bogus'),
    ];

    kit.evidence('SHIP-10', {
      statuses: kit.statuses(attempts).join(','),
      codes: attempts.map(errorCode).join(','),
      shipments: await ShipmentModel.countDocuments({ orderId: context.orderId }),
    });
    for (const attempt of attempts) expectRejected(attempt, 'abusive shipment payload');
    expect(await ShipmentModel.countDocuments({ orderId: context.orderId })).toBe(0);
  }, 60_000);

  it.failing('SHIP-11 honours deleted=false as a live-rows-only admin filter', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const id = await shipmentId(context);
    const before = await kit.send('admin', '/shipping/admin/all?deleted=false&limit=100');
    await tracking(id, `TRACK-DEL-${kit.runId}`.toUpperCase());
    await lifecycle('vendor', id, 'dispatch');
    await lifecycle('vendor', id, 'deliver');
    const deleted = await kit.send('admin', `/shipping/admin/${id}`, {
      method: 'DELETE',
      body: { reason: 'Filter inversion probe.' },
    });
    const filtered = await kit.send('admin', '/shipping/admin/all?deleted=false&limit=100');

    kit.evidence('SHIP-11', {
      before: rows(before)
        .map((row) => row.id)
        .includes(id),
      deleteStatus: deleted.status,
      status: filtered.status,
      returned: rows(filtered).length,
      containsDeleted: rows(filtered)
        .map((row) => row.id)
        .includes(id),
    });
    expect(rows(before).map((row) => row.id)).toContain(id);
    expect(deleted.accepted).toBe(true);
    expect(filtered.accepted).toBe(true);
    expect(rows(filtered).map((row) => row.id)).not.toContain(id);
  }, 60_000);

  it('SHIP-12 deletes only closed parcels and refuses a second delete', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const id = await shipmentId(context);
    const early = await kit.send('admin', `/shipping/admin/${id}`, {
      method: 'DELETE',
      body: { reason: 'Trying to hide an open parcel.' },
    });
    await tracking(id, `TRACK-CLOSE-${kit.runId}`.toUpperCase());
    await lifecycle('vendor', id, 'dispatch');
    await lifecycle('vendor', id, 'deliver');
    const deleted = await kit.send('admin', `/shipping/admin/${id}`, {
      method: 'DELETE',
      body: { reason: 'Closed parcel cleanup.' },
    });
    const again = await kit.send('admin', `/shipping/admin/${id}`, {
      method: 'DELETE',
      body: { reason: 'Deleting it a second time.' },
    });
    const track = await kit.sendAnonymously(`/shipping/track/TRACK-CLOSE-${kit.runId}`);
    const recovered = await kit.send('admin', `/shipping/admin/${id}/recover`, {
      method: 'PATCH',
    });

    kit.evidence('SHIP-12', {
      earlyStatus: early.status,
      deletedStatus: deleted.status,
      againStatus: again.status,
      trackStatus: track.status,
      recoveredStatus: recovered.status,
      deletedAfter: (await ShipmentModel.findById(id).lean())?.deleted.deleted,
    });
    expectRejected(early, 'deleting an open parcel');
    expect(deleted.accepted).toBe(true);
    expectRejected(again, 'second delete');
    expectRejected(track, 'tracking a hidden parcel');
    expect(recovered.accepted).toBe(true);
    expect((await ShipmentModel.findById(id).lean())?.deleted.deleted).toBe(false);
  }, 60_000);

  it('SHIP-13 rejects malformed tracking numbers', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const id = await shipmentId(context);
    const attempts = [
      await tracking(id, 'SHORT'),
      await tracking(id, 'X'.repeat(41)),
      await tracking(id, 'TRACK WITH SPACES'),
      await tracking(id, 'TRACK$INJECT'),
      await tracking(id, ''),
    ];
    const doc = await ShipmentModel.findById(id).lean();

    kit.evidence('SHIP-13', {
      statuses: kit.statuses(attempts).join(','),
      codes: attempts.map(errorCode).join(','),
      tracking: doc?.trackingNumber,
    });
    for (const attempt of attempts) expectRejected(attempt, 'malformed tracking number');
    expect(doc?.trackingNumber).toBeNull();
  }, 30_000);

  it.failing('SHIP-14 allows more than one unlabelled shipment to exist', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const first = await createShipment(context);
    const second = await createShipment(context);

    kit.evidence('SHIP-14', {
      firstStatus: first.status,
      secondStatus: second.status,
      secondBody: second.text.slice(0, 200),
    });
    expect(first.accepted).toBe(true);
    expect(second.accepted).toBe(true);
  }, 30_000);

  it.failing('SHIP-15 keeps a delivered parcel out of the return path', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const id = await shipmentId(context);
    await tracking(id, `TRACK-RET-${kit.runId}`.toUpperCase());
    await lifecycle('vendor', id, 'dispatch');
    const delivered = await lifecycle('vendor', id, 'deliver');
    const returned = await lifecycle('vendor', id, 'return');
    const doc = await ShipmentModel.findById(id).lean();

    kit.evidence('SHIP-15', {
      deliveredStatus: delivered.status,
      returnedStatus: returned.status,
      finalStatus: doc?.status,
    });
    expect(delivered.accepted).toBe(true);
    expectRejected(returned, 'returning a delivered parcel');
    expect(doc?.status).toBe('delivered');
  }, 30_000);

  it('SHIP-16 hides closed parcels from the default admin list', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    const id = await shipmentId(context);
    const before = await kit.send('admin', '/shipping/admin/all?limit=100');
    await tracking(id, `TRACK-HIDE-${kit.runId}`.toUpperCase());
    await lifecycle('vendor', id, 'dispatch');
    await lifecycle('vendor', id, 'deliver');
    const deleted = await kit.send('admin', `/shipping/admin/${id}`, {
      method: 'DELETE',
      body: { reason: 'Default list probe.' },
    });
    const after = await kit.send('admin', '/shipping/admin/all?limit=100');
    const withDeleted = await kit.send('admin', '/shipping/admin/all?deleted=true&limit=100');

    kit.evidence('SHIP-16', {
      before: rows(before)
        .map((row) => row.id)
        .includes(id),
      deleteStatus: deleted.status,
      after: rows(after)
        .map((row) => row.id)
        .includes(id),
      withDeleted: rows(withDeleted)
        .map((row) => row.id)
        .includes(id),
    });
    expect(rows(before).map((row) => row.id)).toContain(id);
    expect(deleted.accepted).toBe(true);
    expect(rows(after).map((row) => row.id)).not.toContain(id);
    expect(rows(withDeleted).map((row) => row.id)).toContain(id);
  }, 60_000);
});
