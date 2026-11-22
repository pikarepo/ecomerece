import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { InventoryModel } from '../../../inventory/infrastructure/inventory.model';
import { OrderItemsModel } from '../../infrastructure/order-item.model';
import {
  createApiIntegrationHarness,
  integrationEnabled,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';

let harness: ApiIntegrationHarness;

describe.skipIf(!integrationEnabled)('order-items API database integration', () => {
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

  it('moves reserved stock to sold-out on vendor confirmation and keeps it on completion', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    harness.events.length = 0;

    harness.expectSuccess(
      await harness.requestAs('vendor', `/order-items/vendor/${context.itemId}/confirm`, {
        method: 'POST',
      }),
    );

    expect((await OrderItemsModel.findById(context.itemId).lean())?.status).toBe('confirmed');
    const confirmedInventory = await InventoryModel.findById(context.inventoryId).lean();
    expect(confirmedInventory?.reserved).toBe(0);
    expect(confirmedInventory?.soldOut).toBe(2);
    expect(harness.events).toContain('order-item.confirmed');

    harness.events.length = 0;
    harness.expectSuccess(
      await harness.requestAs('vendor', `/order-items/vendor/${context.itemId}/complete`, {
        method: 'POST',
      }),
    );

    expect((await OrderItemsModel.findById(context.itemId).lean())?.status).toBe('completed');
    const completedInventory = await InventoryModel.findById(context.inventoryId).lean();
    expect(completedInventory?.reserved).toBe(0);
    expect(completedInventory?.soldOut).toBe(2);
    expect(completedInventory?.available).toBe(8);
    expect(harness.events).toContain('order-item.completed');
  }, 30_000);

  it('returns stock once when an item is returned and then refunded', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    harness.expectSuccess(
      await harness.requestAs('vendor', `/order-items/vendor/${context.itemId}/confirm`, {
        method: 'POST',
      }),
    );
    harness.events.length = 0;

    harness.expectSuccess(
      await harness.requestAs('vendor', `/order-items/vendor/${context.itemId}/return`, {
        method: 'POST',
      }),
    );

    expect((await OrderItemsModel.findById(context.itemId).lean())?.status).toBe('returned');
    const returnedInventory = await InventoryModel.findById(context.inventoryId).lean();
    expect(returnedInventory?.available).toBe(10);
    expect(returnedInventory?.soldOut).toBe(0);
    expect(harness.events).toContain('order-item.returned');

    harness.events.length = 0;
    harness.expectSuccess(
      await harness.requestAs('vendor', `/order-items/vendor/${context.itemId}/refund`, {
        method: 'POST',
      }),
    );

    expect((await OrderItemsModel.findById(context.itemId).lean())?.status).toBe('refunded');
    const refundedInventory = await InventoryModel.findById(context.inventoryId).lean();
    expect(refundedInventory?.available).toBe(10);
    expect(refundedInventory?.soldOut).toBe(0);
    expect(harness.events).toContain('order-item.refunded');
  }, 30_000);

  it('releases reserved stock when the buyer cancels a pending item', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });
    harness.events.length = 0;

    harness.expectSuccess(
      await harness.requestAs('buyer', '/order-items/my/cancel', {
        method: 'POST',
        body: { orderId: context.orderId, itemIds: [context.itemId] },
      }),
    );

    expect((await OrderItemsModel.findById(context.itemId).lean())?.status).toBe('cancelled');
    const inventory = await InventoryModel.findById(context.inventoryId).lean();
    expect(inventory?.available).toBe(10);
    expect(inventory?.reserved).toBe(0);
    expect(inventory?.soldOut).toBe(0);
    expect(harness.events).toContain('order-item.cancelled');
  }, 30_000);
});
