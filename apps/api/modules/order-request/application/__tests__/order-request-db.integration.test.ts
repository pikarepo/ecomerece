import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { InventoryModel } from '../../../inventory/infrastructure/inventory.model';
import { OrderItemsModel } from '../../../order-items/infrastructure/order-item.model';
import { OrderRequestModel } from '../../infrastructure/order-request.model';
import {
  createApiIntegrationHarness,
  integrationEnabled,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';

let harness: ApiIntegrationHarness;

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
});
