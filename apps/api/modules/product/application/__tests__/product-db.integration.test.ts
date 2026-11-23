import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { ProductModel } from '../../infrastructure/product.model';
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

describe.skipIf(!integrationEnabled)('product API database integration', () => {
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

  it('persists a vendor product with its defaults and publishes product.created', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    const title = `Integration product ${Id.create().value.slice(0, 8)}`;
    const created = harness.expectSuccess<ApiData>(
      await harness.requestAs('vendor', '/product/vendor', {
        method: 'POST',
        body: {
          title,
          categoryId: context.categoryId,
          appearance: 'public',
          description: 'Integration product for product database coverage.',
          ingredient: { isIngredients: false, ingredients: [] },
          disclaimer: { isDisclaimer: false, disclaimers: [] },
          image: {
            images: [{ url: 'https://example.com/product-2.png', alt: title, default: true }],
          },
        },
      }),
    );
    const productId = harness.track(harness.idFromMessage(created.message, 'Product'));

    const product = await ProductModel.findById(productId).lean();
    expect(product?.title).toBe(title);
    expect(product?.vendorId).toBe(context.vendorId);
    expect(product?.categoryId).toBe(context.categoryId);
    expect(product?.appearance).toBe('public');
    expect(product?.deleted.deleted).toBe(false);
    expect(product?.block.blocked).toBe(false);
    expect(harness.events).toContain('product.created');
  }, 30_000);

  it('updates product metadata and stock in the database', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    harness.events.length = 0;
    const title = `Updated product ${Id.create().value.slice(0, 8)}`;

    harness.expectSuccess(
      await harness.requestAs('vendor', '/product/vendor/meta', {
        method: 'PATCH',
        body: {
          productId: context.productId,
          title,
          description: 'Updated integration product description.',
        },
      }),
    );
    harness.expectSuccess(
      await harness.requestAs('vendor', '/product/vendor/stock', {
        method: 'PATCH',
        body: { productId: context.productId, inStock: false },
      }),
    );

    const product = await ProductModel.findById(context.productId).lean();
    expect(product?.title).toBe(title);
    expect(product?.inStock).toBe(false);
    expect(harness.events).toContain('product.meta-updated');
    expect(harness.events).toContain('product.in-stock-updated');
  }, 30_000);

  // ------------------------------------------------------------- exploit set

  /**
   * FINDING PRO-01 — `GET /product/:id` loads by id only. A soft-deleted
   * product, a blocked product and a private product all stay fully readable
   * by anyone who kept the id, including the vendor contact details.
   */
  it.failing('hides a soft-deleted product from the public id lookup', async () => {
    const context = await harness.seedCatalog({ available: 5 });

    harness.expectSuccess<ApiData>(
      await harness.requestAs('vendor', '/product/vendor', {
        method: 'DELETE',
        body: { productId: context.productId, reason: 'Vendor removed the product.' },
      }),
    );
    const read = await kit.sendAnonymously(`/product/${context.productId}`);
    const product = await ProductModel.findById(context.productId).lean();

    kit.evidence('PRO-01', {
      deleted: product?.deleted.deleted,
      publicReadStatus: read.status,
      titleLeaked: read.text.includes(product?.title ?? 'no-title'),
    });

    expect(product?.deleted.deleted).toBe(true);
    expect(read.status, 'A deleted product stayed publicly readable.').toBe(404);
  }, 30_000);

  /** FINDING PRO-02 — the same id lookup serves a vendor-blocked product. */
  it.failing('hides a blocked product from the public id lookup', async () => {
    const context = await harness.seedCatalog({ available: 5 });

    harness.expectSuccess<ApiData>(
      await harness.requestAs('admin', '/product/admin/block', {
        method: 'PATCH',
        body: { productId: context.productId, reason: 'Admin blocked the product.' },
      }),
    );
    const read = await kit.sendAnonymously(`/product/${context.productId}`);
    const product = await ProductModel.findById(context.productId).lean();

    kit.evidence('PRO-02', {
      blocked: product?.block.blocked,
      publicReadStatus: read.status,
    });

    expect(product?.block.blocked).toBe(true);
    expect(read.status, 'A blocked product stayed publicly readable.').toBe(404);
  }, 30_000);

  /** FINDING PRO-03 — a private draft product is readable by id too. */
  it.failing('hides a private product from the public id lookup', async () => {
    const context = await harness.seedCatalog({ available: 5 });

    harness.expectSuccess<ApiData>(
      await harness.requestAs('vendor', '/product/vendor/state/private', {
        method: 'PATCH',
        body: { productId: context.productId },
      }),
    );
    const read = await kit.sendAnonymously(`/product/${context.productId}`);
    const product = await ProductModel.findById(context.productId).lean();

    kit.evidence('PRO-03', { appearance: product?.appearance, publicReadStatus: read.status });

    expect(product?.appearance).toBe('private');
    expect(read.status, 'A private product stayed publicly readable.').toBe(404);
  }, 30_000);

  it('keeps deleted and blocked products out of the public list', async () => {
    const context = await harness.seedCatalog({ available: 5 });
    harness.expectSuccess<ApiData>(
      await harness.requestAs('vendor', '/product/vendor', {
        method: 'DELETE',
        body: { productId: context.productId, reason: 'Vendor removed the product.' },
      }),
    );

    const listResponse = await kit.sendAnonymously('/product');
    const listed = (listResponse.body as { data: { data: Array<{ id: string }> } }).data.data;

    kit.evidence('PRO-04', {
      deletedId: context.productId,
      listedIdsContainsDeleted: listed.some((item) => item.id === context.productId),
      listSize: listed.length,
    });

    expect(listed.some((item) => item.id === context.productId)).toBe(false);
  }, 30_000);

  it('refuses product writes against another vendor product', async () => {
    const context = await harness.seedCatalog({ available: 5 });
    await kit.vendorProfileFor('vendorAlt');

    const remove: AttackResult = await kit.send('vendorAlt', '/product/vendor', {
      method: 'DELETE',
      body: { productId: context.productId, reason: 'Foreign vendor deletes the product.' },
    });
    const privatise = await kit.send('vendorAlt', '/product/vendor/state/private', {
      method: 'PATCH',
      body: { productId: context.productId },
    });
    const product = await ProductModel.findById(context.productId).lean();

    kit.evidence('PRO-05', {
      removeStatus: remove.status,
      privatiseStatus: privatise.status,
      deleted: product?.deleted.deleted,
      appearance: product?.appearance,
    });

    expectRejected(remove, 'Foreign vendor product delete');
    expectRejected(privatise, 'Foreign vendor product privatisation');
    expect(product?.deleted.deleted).toBe(false);
  }, 30_000);

  it('refuses a product created against an invented category', async () => {
    await harness.seedCatalog({ available: 5 });

    const created: AttackResult = await kit.send('vendor', '/product/vendor', {
      method: 'POST',
      body: {
        title: `Invented category ${Date.now()}`,
        categoryId: Id.create().value,
        appearance: 'public',
        description: 'Product pointing at a category that does not exist.',
        ingredient: { isIngredients: false, ingredients: [] },
        disclaimer: { isDisclaimer: false, disclaimers: [] },
        image: { images: [{ url: 'https://example.com/x.png', alt: 'x', default: true }] },
      },
    });

    kit.evidence('PRO-06', { inventedCategoryStatus: created.status });
    expect(created.status).toBeGreaterThanOrEqual(400);
    expect(created.status).toBeLessThan(500);
  }, 30_000);
});
