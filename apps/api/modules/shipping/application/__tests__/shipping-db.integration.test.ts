import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { ShipmentModel } from '../../infrastructure/shipment.model';
import {
  createApiIntegrationHarness,
  integrationEnabled,
  type ApiData,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';

let harness: ApiIntegrationHarness;

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
    harness = await createApiIntegrationHarness();
  }, 30_000);

  beforeEach(() => {
    harness.events.length = 0;
  });

  afterEach(async () => {
    await harness.cleanup();
  });

  afterAll(async () => {
    if (harness) await harness.close();
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
});
