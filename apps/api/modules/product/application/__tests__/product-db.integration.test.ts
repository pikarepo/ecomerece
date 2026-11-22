import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { ProductModel } from '../../infrastructure/product.model';
import {
  createApiIntegrationHarness,
  integrationEnabled,
  type ApiData,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';

let harness: ApiIntegrationHarness;

describe.skipIf(!integrationEnabled)('product API database integration', () => {
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
});
