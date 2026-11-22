import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { ProductModel } from '../../../product/infrastructure/product.model';
import { ProductVariantModel } from '../../infrastructure/product-variant.model';
import {
  createApiIntegrationHarness,
  integrationEnabled,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';

let harness: ApiIntegrationHarness;

describe.skipIf(!integrationEnabled)('product-variant API database integration', () => {
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

  it('updates variant pricing and syncs the product price summary', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    harness.events.length = 0;

    harness.expectSuccess(
      await harness.requestAs('vendor', '/product-variant/vendor/price', {
        method: 'PATCH',
        body: {
          productId: context.productId,
          variantId: context.variantId,
          price: 120,
          discountedPrice: 90,
        },
      }),
    );

    const variant = await ProductVariantModel.findById(context.variantId).lean();
    expect(variant?.price).toBe(120);
    expect(variant?.discountedPrice).toBe(90);

    const product = await ProductModel.findById(context.productId).lean();
    expect(product?.price?.maxPrice).toBe(120);
    expect(harness.events).toContain('product-variant.price-updated');
  }, 30_000);

  it('soft-deletes a variant and keeps it queryable as deleted', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    harness.events.length = 0;

    harness.expectSuccess(
      await harness.requestAs('vendor', '/product-variant/vendor/soft', {
        method: 'DELETE',
        body: {
          productId: context.productId,
          variantId: context.variantId,
          reason: 'Integration variant deletion.',
        },
      }),
    );

    const variant = await ProductVariantModel.findById(context.variantId).lean();
    expect(variant?.deleted.deleted).toBe(true);
    expect(variant?.deleted.reason).toBe('Integration variant deletion.');
    expect(harness.events).toContain('product-variant.deleted');
  }, 30_000);
});
