import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { ProductModel } from '../../../product/infrastructure/product.model';
import { InventoryModel } from '../../infrastructure/inventory.model';
import {
  createApiIntegrationHarness,
  integrationEnabled,
  type ApiData,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';

let harness: ApiIntegrationHarness;

describe.skipIf(!integrationEnabled)('inventory API database integration', () => {
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

  it('persists vendor stock changes and syncs product availability', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    const created = harness.expectSuccess<ApiData>(
      await harness.requestAs('vendor', '/product-inventory/vendor', {
        method: 'POST',
        body: { variantId: context.variantId, lowStockThreshold: 1, available: 5 },
      }),
    );
    const inventoryId = harness.track(harness.idFromData(created));

    expect((await InventoryModel.findById(inventoryId).lean())?.available).toBe(5);
    expect((await ProductModel.findById(context.productId).lean())?.inStock).toBe(true);

    harness.expectSuccess<ApiData>(
      await harness.requestAs('vendor', `/product-inventory/vendor/${inventoryId}/purchase`, {
        method: 'PATCH',
        body: { quantity: 2 },
      }),
    );
    harness.expectSuccess<ApiData>(
      await harness.requestAs('vendor', `/product-inventory/vendor/${inventoryId}/remove`, {
        method: 'PATCH',
        body: { quantity: 3 },
      }),
    );
    harness.expectSuccess<ApiData>(
      await harness.requestAs('vendor', `/product-inventory/vendor/${inventoryId}/threshold`, {
        method: 'PATCH',
        body: { lowStockThreshold: 2 },
      }),
    );

    const inventory = await InventoryModel.findById(inventoryId).lean();
    expect(inventory?.available).toBe(4);
    expect(inventory?.lowStockThreshold).toBe(2);
    expect(inventory?.reserved).toBe(0);
    expect(harness.events).toContain('inventory.bought');
    expect(harness.events).toContain('inventory.stock-removed');
    expect(harness.events).toContain('inventory.low-stock-threshold-updated');

    harness.expectSuccess<ApiData>(
      await harness.requestAs('vendor', `/product-inventory/vendor/${inventoryId}/remove`, {
        method: 'PATCH',
        body: { quantity: 4 },
      }),
    );
    harness.expectSuccess<ApiData>(
      await harness.requestAs('vendor', `/product-inventory/vendor/${inventoryId}`, {
        method: 'DELETE',
        body: { reason: 'Integration delete' },
      }),
    );
    expect((await InventoryModel.findById(inventoryId).lean())?.deleted.deleted).toBe(true);
    expect((await ProductModel.findById(context.productId).lean())?.inStock).toBe(false);
    expect(harness.events).toContain('inventory.deleted');
  }, 30_000);

  it('rejects a duplicate variant inventory and leaves stock untouched', async () => {
    const context = await harness.seedCatalog({ available: 6 });
    harness.events.length = 0;

    const duplicate = await harness.requestAs<ApiData>('admin', '/product-inventory/admin', {
      method: 'POST',
      body: { variantId: context.variantId, lowStockThreshold: 1, available: 9 },
    });
    const error = harness.expectError(duplicate, 400);
    expect(error.message.length).toBeGreaterThan(0);

    expect(await InventoryModel.countDocuments({ variantId: context.variantId })).toBe(1);
    expect((await InventoryModel.findById(context.inventoryId).lean())?.available).toBe(6);
    expect(harness.events).toEqual([]);
  }, 30_000);

  it('exposes persisted stock through the public variant lookup', async () => {
    const context = await harness.seedCatalog({ available: 7 });
    harness.events.length = 0;

    const result = harness.expectSuccess<{ variantId: string; available: number; inStock: boolean }>(
      await harness.requestAs('buyer', `/product-inventory/variant/${context.variantId}`),
    );

    expect(result.variantId).toBe(context.variantId);
    expect(result.available).toBe(7);
    expect(result.inStock).toBe(true);
    expect(harness.events).toEqual([]);
  }, 30_000);
});
