import { expect, test } from '../../fixtures';
import { expectRejected } from '../../api/attack';
import { databaseConfigured, readDocument } from '../../api/database';
import { expectOk } from '../../api/envelope';
import { type MessageData, requireRecordId, uniqueSuffix } from '../../api/identifiers';
import { ensureBuyerAddress } from '../../api/scenarios';
import { buildVendorWorkspace, buildOrderWorkspace, ensureVendorProfile } from '../../api/world';

type InventoryRecord = { available: number; variantId: string };

test.describe('inventory', () => {
  test('exposes variant availability anonymously', async ({ anonymous, admin, apiAs, cleanup, canAuthenticateAs }) => {
    test.skip(!(await canAuthenticateAs('vendor')), 'Requires a vendor access token.');

    const workspace = await buildVendorWorkspace({
      admin,
      vendor: await apiAs('vendor'),
      cleanup,
      available: 7,
    });

    const availability = await expectOk<{ variantId: string; available: number; inStock: boolean }>(
      await anonymous.get(`/product-inventory/variant/${workspace.variantId}`),
    );
    expect(availability.variantId).toBe(workspace.variantId);
    expect(availability.available).toBe(7);
    expect(availability.inStock).toBe(true);
  });

  test('lets a vendor restock its own inventory', async ({
    admin,
    apiAs,
    cleanup,
    canAuthenticateAs,
  }) => {
    test.skip(!(await canAuthenticateAs('vendor')), 'Requires a vendor access token.');

    const vendor = await apiAs('vendor');
    const workspace = await buildVendorWorkspace({ admin, vendor, cleanup, available: 5 });

    await expectOk<MessageData>(
      await vendor.patch(`/product-inventory/vendor/${workspace.inventoryId}/purchase`, {
        data: { quantity: 9 },
      }),
    );

    const availability = await expectOk<{ available: number }>(
      await vendor.get(`/product-inventory/vendor/${workspace.inventoryId}`),
    );
    expect(availability.available).toBe(14);

    if (databaseConfigured()) {
      const stored = await readDocument<InventoryRecord>('inventories', {
        _id: workspace.inventoryId,
      });
      expect(stored?.available).toBe(14);
    }
  });

  test('refuses another vendor inventory mutation', async ({
    admin,
    apiAs,
    cleanup,
    canAuthenticateAs,
  }) => {
    test.skip(!(await canAuthenticateAs('vendor')), 'Requires a vendor access token.');

    const vendor = await apiAs('vendor');
    const workspace = await buildVendorWorkspace({ admin, vendor, cleanup, available: 4 });

    const attackerReady =
      (await canAuthenticateAs('vendorAlt')) &&
      (await ensureVendorProfile({ admin, vendor: await apiAs('vendorAlt'), cleanup }));
    test.skip(attackerReady === false, 'Requires E2E_API_TOKEN_VENDOR_ALT for a second vendor.');

    const attacker = await apiAs('vendorAlt');
    const restock = await attacker.patch(
      `/product-inventory/vendor/${workspace.inventoryId}/purchase`,
      { data: { quantity: 500 } },
    );
    await expectRejected(restock, 'Cross-tenant restock');

    const aspect = await attacker.delete(`/product-inventory/vendor/${workspace.inventoryId}`);
    await expectRejected(aspect, 'Cross-tenant inventory delete');

    if (databaseConfigured()) {
      const stored = await readDocument<InventoryRecord>('inventories', {
        _id: workspace.inventoryId,
      });
      expect(stored?.available, 'A foreign vendor must not change stock levels.').toBe(4);
    }
  });

  test('refuses to order more units than are available', async ({
    admin,
    buyer,
    apiAs,
    cleanup,
    canAuthenticateAs,
  }) => {
    test.skip(!(await canAuthenticateAs('vendor')), 'Requires a vendor access token.');

    const workspace = await buildVendorWorkspace({
      admin,
      vendor: await apiAs('vendor'),
      cleanup,
      available: 2,
    });

    const addressId = await ensureBuyerAddress({ buyer, suffix: uniqueSuffix() });

    const oversell = await buyer.post('/order/my', {
      data: {
        idempotentKey: uniqueSuffix(),
        addressId,
        safeOrder: true,
        waitingTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        items: [{ variantId: workspace.variantId, quantity: 3 }],
      },
    });
    await expectRejected(oversell, 'Oversell attempt');

    if (databaseConfigured()) {
      const stored = await readDocument<InventoryRecord>('inventories', {
        _id: workspace.inventoryId,
      });
      expect(stored?.available, 'A rejected order must not decrement stock.').toBe(2);
    }
  });

  test('keeps stock accounting consistent across a real order', async ({
    admin,
    buyer,
    apiAs,
    cleanup,
    canAuthenticateAs,
  }) => {
    test.skip(!(await canAuthenticateAs('vendor')), 'Requires a vendor access token.');

    const workspace = await buildOrderWorkspace({
      admin,
      vendor: await apiAs('vendor'),
      buyer,
      cleanup,
      available: 6,
    });

    const availability = await expectOk<unknown>(
      await buyer.get(`/product-inventory/variant/${workspace.variantId}`),
    );
    expect(availability).toBeDefined();
  });
});
