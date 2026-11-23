import { expect, test } from '../../fixtures';
import { expectNoLeak, expectRejected } from '../../api/attack';
import { databaseConfigured, readDocument } from '../../api/database';
import { expectOk } from '../../api/envelope';
import { type MessageData, uniqueSuffix } from '../../api/identifiers';
import { buildVendorWorkspace, ensureVendorProfile } from '../../api/world';

type ProductRecord = {
  _id: string;
  title: string;
  vendorId: string;
  deleted?: { deleted?: boolean };
  stats?: Record<string, number>;
};

test.describe('catalog', () => {
  test('serves the public catalog without a session', async ({ anonymous }) => {
    const products = await expectOk<{ data: unknown[]; meta: { hasMore: boolean } }>(
      await anonymous.get('/product?limit=5'),
    );
    expect(Array.isArray(products.data)).toBe(true);
    expect(typeof products.meta.hasMore).toBe('boolean');

    const categories = await expectOk<{ data: unknown[] }>(await anonymous.get('/category?limit=10'));
    expect(Array.isArray(categories.data)).toBe(true);

    const home = await anonymous.get('/home');
    expect(home.status(), 'The storefront home must be readable anonymously.').toBe(200);
  });

  test('publishes a vendor product to the public catalog', async ({
    admin,
    api,
    apiAs,
    cleanup,
    canAuthenticateAs,
  }) => {
    test.skip(!(await canAuthenticateAs('vendor')), 'Requires a vendor access token.');

    const vendor = await apiAs('vendor');
    const workspace = await buildVendorWorkspace({ admin, vendor, cleanup });

    const detail = await expectOk<{ id: string; title: string }>(
      await api.get(`/product/${workspace.productId}`),
    );
    expect(detail.id).toBe(workspace.productId);

    const listing = await expectOk<{ data: Array<{ id: string }> }>(
      await api.get(`/product?limit=50&categoryId=${workspace.categoryId}`),
    );
    expect(
      listing.data.map((product) => product.id),
      'A newly published product must appear in the public listing.',
    ).toContain(workspace.productId);
  });

  test('a second vendor cannot rewrite another vendor product', async ({
    admin,
    api,
    apiAs,
    cleanup,
    canAuthenticateAs,
  }) => {
    test.skip(!(await canAuthenticateAs('vendor')), 'Requires a vendor access token.');

    const vendor = await apiAs('vendor');
    const workspace = await buildVendorWorkspace({ admin, vendor, cleanup });

    const attackerReady =
      (await canAuthenticateAs('vendorAlt')) &&
      (await ensureVendorProfile({ admin, vendor: await apiAs('vendorAlt'), cleanup }));
    test.skip(attackerReady === false, 'Requires E2E_API_TOKEN_VENDOR_ALT for a second vendor.');

    const attacker = await apiAs('vendorAlt');
    const hijack = await attacker.patch('/product/vendor/meta', {
      data: {
        productId: workspace.productId,
        title: 'Owned by the attacker',
        description: 'Cross-tenant overwrite attempt.',
      },
    });
    await expectRejected(hijack, 'Cross-tenant product rewrite');
    await expectNoLeak(hijack, ['Owned by the attacker'], 'Cross-tenant product rewrite');

    const detail = await expectOk<{ title: string }>(
      await api.get(`/product/${workspace.productId}`),
    );
    expect(detail.title).not.toBe('Owned by the attacker');

    if (databaseConfigured()) {
      const stored = await readDocument<ProductRecord>('products', { _id: workspace.productId });
      expect(stored?.title).not.toBe('Owned by the attacker');
      expect(stored?.vendorId).toBe(workspace.vendorId);
    }
  });

  test('ignores client-supplied ownership and counters on create', async ({
    admin,
    api,
    apiAs,
    cleanup,
    canAuthenticateAs,
  }) => {
    test.skip(!(await canAuthenticateAs('vendor')), 'Requires a vendor access token.');

    const vendor = await apiAs('vendor');
    const victim = await buildVendorWorkspace({ admin, vendor, cleanup });
    const suffix = uniqueSuffix();

    const created = await expectOk<MessageData>(
      await vendor.post('/product/vendor', {
        data: {
          title: `Mass assignment product ${suffix}`,
          categoryId: victim.categoryId,
          appearance: 'public',
          description: 'Attempts to set server-owned fields.',
          ingredient: { isIngredients: false, ingredients: [] },
          disclaimer: { isDisclaimer: false, disclaimers: [] },
          image: {
            images: [
              { url: 'https://example.com/mass.png', alt: 'mass', default: true },
            ],
          },
          vendorId: victim.vendorId,
          _id: '0190f2c2-0000-7000-8000-000000000001',
          stats: { views: 999999 },
          statsInfo: { views: 999999 },
          verified: true,
          blocked: true,
        },
      }),
    );

    const productId = created.message?.match(/[0-9a-f-]{36}/)?.[0];
    expect(productId, 'Product creation must report the server-generated id.').toBeDefined();
    if (productId === undefined) return;
    cleanup.addRequest('product', vendor, 'delete', '/product/vendor', {
      productId,
      reason: 'E2E cleanup.',
    });

    expect(productId).not.toBe('0190f2c2-0000-7000-8000-000000000001');

    const detail = await expectOk<{ id: string; title: string }>(
      await api.get(`/product/${productId}`),
    );
    expect(detail.id).toBe(productId);

    if (databaseConfigured()) {
      const stored = await readDocument<ProductRecord>('products', { _id: productId });
      expect(stored?.vendorId, 'Ownership must come from the session, not the body.').toBe(
        victim.vendorId,
      );
      expect(stored?.stats?.views ?? 0, 'Client-supplied counters must be dropped.').toBe(0);
    }
  });

  test('removes a soft-deleted product from the public listing', async ({
    admin,
    api,
    apiAs,
    cleanup,
    canAuthenticateAs,
  }) => {
    test.skip(!(await canAuthenticateAs('vendor')), 'Requires a vendor access token.');

    const vendor = await apiAs('vendor');
    const workspace = await buildVendorWorkspace({ admin, vendor, cleanup });

    await expectOk(
      await vendor.delete('/product/vendor', {
        data: { productId: workspace.productId, reason: 'E2E soft delete.' },
      }),
    );

    const listing = await expectOk<{ data: Array<{ id: string }> }>(
      await api.get(`/product?limit=50&categoryId=${workspace.categoryId}`),
    );
    expect(listing.data.map((product) => product.id)).not.toContain(workspace.productId);
  });
});
