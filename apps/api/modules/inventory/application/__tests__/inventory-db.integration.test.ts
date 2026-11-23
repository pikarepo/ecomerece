import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { ProductModel } from '../../../product/infrastructure/product.model';
import { InventoryModel } from '../../infrastructure/inventory.model';
import {
  integrationEnabled,
  type ApiData,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';
import {
  createSecurityKit,
  expectRejected,
  type AttackResult,
  type SecurityKit,
} from '../../../../testing/security-kit';

let kit: SecurityKit;
let harness: ApiIntegrationHarness;

describe.skipIf(!integrationEnabled)('inventory API database integration', () => {
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

  // ------------------------------------------------------------- exploit set

  const stockOf = async (inventoryId: string) => {
    const row = await InventoryModel.findById(inventoryId).lean();
    if (row === null) throw new Error('Inventory row disappeared.');
    return row;
  };

  it('rejects fractional stock and fractional movements', async () => {
    const context = await harness.seedCatalog({ createInventory: false });

    const fractional = await kit.send('vendor', '/product-inventory/vendor', {
      method: 'POST',
      body: { variantId: context.variantId, lowStockThreshold: 1, available: 2.5 },
    });
    const body = fractional.body as { data?: { updatedData?: { _id?: string } } };
    const inventoryId = body.data?.updatedData?._id;
    if (inventoryId !== undefined) harness.track(inventoryId);
    expect(inventoryId, 'Setup: fractional create did not return a row id.').toBeDefined();

    const fractionalMove = await kit.send(
      'vendor',
      `/product-inventory/vendor/${inventoryId}/purchase`,
      { method: 'PATCH', body: { quantity: 1.5 } },
    );
    const row = await stockOf(inventoryId as string);

    kit.evidence('INV-01', {
      fractionalCreateStatus: fractional.status,
      fractionalMoveStatus: fractionalMove.status,
      storedAvailable: row.available,
    });

    expect(fractional.status, 'Fractional stock must be refused.').toBe(400);
    expect(fractionalMove.status, 'Fractional movement must be refused.').toBe(400);
    expect(Number.isInteger(row.available)).toBe(true);
  }, 30_000);

  it('does not lose stock when restocks arrive together', async () => {
    const context = await harness.seedCatalog({ available: 1 });
    const attempts = 5;

    const results: AttackResult[] = await Promise.all(
      Array.from(
        { length: attempts },
        async () =>
          await kit.send('vendor', `/product-inventory/vendor/${context.inventoryId}/purchase`, {
            method: 'PATCH',
            body: { quantity: 1 },
          }),
      ),
    );

    const row = await stockOf(context.inventoryId);
    kit.evidence('INV-02', {
      attempts,
      statuses: kit.statuses(results),
      storedAvailable: row.available,
      storedVersion: row.version,
    });

    // Optimistic locking may reject some writes, but it must never lose one:
    // what is on the shelf has to equal the opening stock plus what was accepted.
    expect(row.available).toBe(1 + kit.accepted(results).length);
    for (const result of results) {
      expect(result.status, 'A conflict must not surface as a server error.').toBeLessThan(500);
    }
  }, 30_000);

  it('does not oversell when removals arrive together', async () => {
    const context = await harness.seedCatalog({ available: 3 });
    const attempts = 5;

    const results: AttackResult[] = await Promise.all(
      Array.from(
        { length: attempts },
        async () =>
          await kit.send('vendor', `/product-inventory/vendor/${context.inventoryId}/remove`, {
            method: 'PATCH',
            body: { quantity: 2 },
          }),
      ),
    );

    const row = await stockOf(context.inventoryId);
    kit.evidence('INV-03', {
      attempts,
      requestedEach: 2,
      statuses: kit.statuses(results),
      storedAvailable: row.available,
    });

    expect(kit.accepted(results).length).toBeLessThanOrEqual(1);
    expect(row.available).toBeGreaterThanOrEqual(0);
    expect(row.available).toBe(3 - kit.accepted(results).length * 2);
  }, 30_000);

  it('creates at most one inventory row for a variant under a create race', async () => {
    const context = await harness.seedCatalog({ createInventory: false });

    const results = await Promise.all([
      kit.send('vendor', '/product-inventory/vendor', {
        method: 'POST',
        body: { variantId: context.variantId, lowStockThreshold: 1, available: 5 },
      }),
      kit.send('vendor', '/product-inventory/vendor', {
        method: 'POST',
        body: { variantId: context.variantId, lowStockThreshold: 1, available: 9 },
      }),
    ]);

    const rows = await InventoryModel.find({ variantId: context.variantId }).lean();
    for (const row of rows) harness.track(row._id.toString());

    kit.evidence('INV-04', {
      statuses: kit.statuses(results),
      rows: rows.length,
      availables: rows.map((row) => row.available),
    });

    expect(rows.length, 'Two concurrent creates produced two stock rows.').toBe(1);
    for (const result of results) {
      expect(result.status, 'A duplicate race must not surface as a server error.').toBeLessThan(500);
    }
  }, 30_000);

  it('refuses stock writes against another vendor inventory', async () => {
    const context = await harness.seedCatalog({ available: 5 });
    await kit.vendorProfileFor('vendorAlt');

    const purchase = await kit.send(
      'vendorAlt',
      `/product-inventory/vendor/${context.inventoryId}/purchase`,
      { method: 'PATCH', body: { quantity: 100 } },
    );
    const removal = await kit.send('vendorAlt', `/product-inventory/vendor/${context.inventoryId}/remove`, {
      method: 'PATCH',
      body: { quantity: 5 },
    });
    const read = await kit.send('vendorAlt', `/product-inventory/vendor/${context.inventoryId}`);

    kit.evidence('INV-05', {
      purchaseStatus: purchase.status,
      removalStatus: removal.status,
      readStatus: read.status,
      storedAvailable: (await stockOf(context.inventoryId)).available,
    });

    expectRejected(purchase, 'Foreign vendor restock');
    expectRejected(removal, 'Foreign vendor removal');
    expectRejected(read, 'Foreign vendor inventory read');
    expect((await stockOf(context.inventoryId)).available).toBe(5);
  }, 30_000);

  it('refuses stock writes on a deleted inventory row', async () => {
    const context = await harness.seedCatalog({ available: 1 });

    harness.expectSuccess<ApiData>(
      await harness.requestAs('vendor', `/product-inventory/vendor/${context.inventoryId}/remove`, {
        method: 'PATCH',
        body: { quantity: 1 },
      }),
    );
    harness.expectSuccess<ApiData>(
      await harness.requestAs('vendor', `/product-inventory/vendor/${context.inventoryId}`, {
        method: 'DELETE',
        body: { reason: 'Exploit delete after emptying' },
      }),
    );

    const purchase = await kit.send(
      'vendor',
      `/product-inventory/vendor/${context.inventoryId}/purchase`,
      { method: 'PATCH', body: { quantity: 10 } },
    );
    const row = await stockOf(context.inventoryId);

    kit.evidence('INV-06', {
      purchaseStatus: purchase.status,
      storedAvailable: row.available,
      deleted: row.deleted.deleted,
    });

    expectRejected(purchase, 'Restock on deleted inventory');
    expect(row.available).toBe(0);
  }, 30_000);

  it('keeps stock untouched when a removal exceeds availability', async () => {
    const context = await harness.seedCatalog({ available: 5 });

    const removal = await kit.send(
      'vendor',
      `/product-inventory/vendor/${context.inventoryId}/remove`,
      { method: 'PATCH', body: { quantity: 6 } },
    );

    kit.evidence('INV-07', {
      removalStatus: removal.status,
      storedAvailable: (await stockOf(context.inventoryId)).available,
    });

    expect(removal.status).toBe(400);
    expect((await stockOf(context.inventoryId)).available).toBe(5);
  }, 30_000);

  it('refuses buyer access to stock management routes', async () => {
    const context = await harness.seedCatalog({ available: 5 });

    const vendorRoute = await kit.send('buyer', `/product-inventory/vendor/${context.inventoryId}`, {
      method: 'DELETE',
      body: { reason: 'Buyer deleting stock' },
    });
    const adminRoute = await kit.send('buyer', `/product-inventory/admin/${context.inventoryId}`, {
      method: 'DELETE',
      body: { reason: 'Buyer deleting stock as admin' },
    });

    kit.evidence('INV-08', {
      vendorRouteStatus: vendorRoute.status,
      adminRouteStatus: adminRoute.status,
    });

    expect([403, 401]).toContain(vendorRoute.status);
    expect([403, 401]).toContain(adminRoute.status);
    expect((await stockOf(context.inventoryId)).deleted.deleted).toBe(false);
  }, 30_000);
});
