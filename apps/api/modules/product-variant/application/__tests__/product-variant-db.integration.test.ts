import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { ProductModel } from '../../../product/infrastructure/product.model';
import { ProductVariantModel } from '../../infrastructure/product-variant.model';
import {
  integrationEnabled,
  runId,
  type ApiData,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';
import {
  createSecurityKit,
  expectRejected,
  expectUnauthorized,
  type AttackResult,
  type SecurityKit,
} from '../../../../testing/security-kit';

let kit: SecurityKit;
let harness: ApiIntegrationHarness;

function errorCode(result: AttackResult): string {
  const body = result.body as { error?: { code?: string } } | null;
  return body?.error?.code ?? 'unknown';
}

function rows(result: AttackResult): { id: string; title: string; active: boolean }[] {
  const body = result.body as {
    data?: { data?: { id: string; title: string; active: boolean }[] };
  } | null;
  return body?.data?.data ?? [];
}

async function createVariant(productId: string, overrides: Record<string, unknown> = {}) {
  const result = await kit.send('vendor', '/product-variant/vendor', {
    method: 'POST',
    body: {
      productId,
      price: 100,
      discountedPrice: 80,
      title: `Attack variant ${runId}`,
      active: true,
      ...overrides,
    },
  });
  if (result.accepted) {
    const message = (result.body as { data?: ApiData }).data?.message;
    if (message) harness.track(harness.idFromMessage(message, 'Variant'));
  }
  return result;
}

async function createProduct(categoryId: string, title: string) {
  const result = await kit.send('vendor', '/product/vendor', {
    method: 'POST',
    body: {
      title,
      categoryId,
      appearance: 'public',
      description: 'Second product for the variant exploitation suite.',
      ingredient: { isIngredients: false, ingredients: [] },
      disclaimer: { isDisclaimer: false, disclaimers: [] },
      image: {
        images: [
          { url: 'https://example.com/product.png', alt: 'Variant attack product', default: true },
        ],
      },
    },
  });
  if (result.accepted) {
    const message = (result.body as { data?: ApiData }).data?.message;
    if (message) harness.track(harness.idFromMessage(message, 'Product'));
  }
  return result;
}

async function priceUpdate(
  productId: string,
  variantId: string,
  overrides: Record<string, unknown> = {},
) {
  return await kit.send('vendor', '/product-variant/vendor/price', {
    method: 'PATCH',
    body: { productId, variantId, price: 120, discountedPrice: 90, ...overrides },
  });
}

describe.skipIf(!integrationEnabled)('product-variant API database integration', () => {
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

  it.failing('PVA-01 hides a soft-deleted variant from the public id lookup', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    await kit.send('vendor', '/product-variant/vendor/soft', {
      method: 'DELETE',
      body: {
        productId: context.productId,
        variantId: context.variantId,
        reason: 'Public detail leak probe.',
      },
    });
    const read = await kit.sendAnonymously(`/product-variant/${context.variantId}`);

    kit.evidence('PVA-01', {
      status: read.status,
      dbDeleted: (await ProductVariantModel.findById(context.variantId).lean())?.deleted.deleted,
      servedTitle: (read.body as { data?: { title?: string } }).data?.title,
    });
    expectRejected(read, 'public read of a deleted variant');
  }, 30_000);

  it.failing('PVA-02 hides a deactivated variant from the public id lookup', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    await kit.send('vendor', '/product-variant/vendor/appearance/toggle', {
      method: 'PATCH',
      body: { productId: context.productId, variantId: context.variantId, appearance: false },
    });
    const read = await kit.sendAnonymously(`/product-variant/${context.variantId}`);

    kit.evidence('PVA-02', {
      status: read.status,
      dbActive: (await ProductVariantModel.findById(context.variantId).lean())?.active,
    });
    expectRejected(read, 'public read of a deactivated variant');
  }, 30_000);

  it.failing('PVA-03 keeps deleted and deactivated variants out of the public product list', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    const hidden = await createVariant(context.productId, {
      title: `Hidden variant ${runId}`,
      active: false,
    });
    expect(hidden.accepted, 'the hidden variant must exist for this attack').toBe(true);
    const hiddenId = harness.idFromMessage(
      (hidden.body as { data: ApiData }).data.message,
      'Variant',
    );
    await kit.send('vendor', '/product-variant/vendor/soft', {
      method: 'DELETE',
      body: {
        productId: context.productId,
        variantId: context.variantId,
        reason: 'Public list leak probe.',
      },
    });

    const list = await kit.sendAnonymously(`/product-variant/product/${context.productId}`);
    const served = JSON.stringify(list.body);

    kit.evidence('PVA-03', {
      status: list.status,
      containsDeleted: served.includes(context.variantId),
      containsInactive: served.includes(hiddenId),
    });
    expect(list.accepted).toBe(true);
    expect(served).not.toContain(context.variantId);
    expect(served).not.toContain(hiddenId);
  }, 30_000);

  it('PVA-04 refuses every write from a vendor that does not own the product', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    await kit.vendorProfileFor('vendorAlt');
    const before = await ProductVariantModel.findById(context.variantId).lean();

    const attempts = [
      await kit.send('vendorAlt', '/product-variant/vendor/price', {
        method: 'PATCH',
        body: {
          productId: context.productId,
          variantId: context.variantId,
          price: 1,
          discountedPrice: 1,
        },
      }),
      await kit.send('vendorAlt', '/product-variant/vendor/meta', {
        method: 'PATCH',
        body: {
          productId: context.productId,
          variantId: context.variantId,
          title: 'Stolen variant',
        },
      }),
      await kit.send('vendorAlt', '/product-variant/vendor/appearance/toggle', {
        method: 'PATCH',
        body: { productId: context.productId, variantId: context.variantId, appearance: false },
      }),
      await kit.send('vendorAlt', '/product-variant/vendor/soft', {
        method: 'DELETE',
        body: {
          productId: context.productId,
          variantId: context.variantId,
          reason: 'Deleting a foreign variant.',
        },
      }),
      await kit.send('vendorAlt', '/product-variant/vendor', {
        method: 'POST',
        body: {
          productId: context.productId,
          price: 100,
          discountedPrice: 80,
          title: `Foreign variant ${runId}`,
          active: true,
        },
      }),
    ];
    const after = await ProductVariantModel.findById(context.variantId).lean();

    kit.evidence('PVA-04', {
      statuses: kit.statuses(attempts).join(','),
      priceBefore: before?.price,
      priceAfter: after?.price,
      titleAfter: after?.title,
      activeAfter: after?.active,
      deletedAfter: after?.deleted.deleted,
    });
    for (const attempt of attempts) expectRejected(attempt, 'foreign vendor variant write');
    expect(after?.price).toBe(before?.price);
    expect(after?.title).toBe(before?.title);
    expect(after?.active).toBe(before?.active);
    expect(after?.deleted.deleted).toBe(false);
  }, 30_000);

  it('PVA-05 refuses a variant addressed through the wrong product', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    const second = await createProduct(context.categoryId, `Second product ${runId}`);
    expect(second.accepted, 'the second product must exist for this attack').toBe(true);
    const secondId = harness.idFromMessage(
      (second.body as { data: ApiData }).data.message,
      'Product',
    );

    const mismatched = await priceUpdate(secondId, context.variantId);
    const invented = await priceUpdate(context.productId, Id.create().value);
    const variant = await ProductVariantModel.findById(context.variantId).lean();

    kit.evidence('PVA-05', {
      mismatchedStatus: mismatched.status,
      mismatchedCode: errorCode(mismatched),
      inventedStatus: invented.status,
      price: variant?.price,
      productId: variant?.productId,
    });
    expectRejected(mismatched, 'variant addressed through another product');
    expectRejected(invented, 'invented variant id');
    expect(variant?.price).toBe(100);
    expect(variant?.productId).toBe(context.productId);
  }, 30_000);

  it('PVA-06 rejects abusive pricing', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    const attempts = [
      await priceUpdate(context.productId, context.variantId, { price: 0 }),
      await priceUpdate(context.productId, context.variantId, { price: -5 }),
      await priceUpdate(context.productId, context.variantId, { discountedPrice: -1 }),
      await priceUpdate(context.productId, context.variantId, { price: 50, discountedPrice: 90 }),
      await priceUpdate(context.productId, context.variantId, { price: 'free' }),
      await createVariant(context.productId, { price: 50, discountedPrice: 90 }),
    ];
    const variant = await ProductVariantModel.findById(context.variantId).lean();

    kit.evidence('PVA-06', {
      statuses: kit.statuses(attempts).join(','),
      codes: attempts.map(errorCode).join(','),
      price: variant?.price,
      discountedPrice: variant?.discountedPrice,
    });
    for (const attempt of attempts) expectRejected(attempt, 'abusive pricing');
    expect(variant?.price).toBe(100);
    expect(variant?.discountedPrice).toBe(80);
  }, 30_000);

  it.failing('PVA-07 answers an invalid search expression with a client error', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    const broken = await kit.send('vendor', '/product-variant/vendor/all?search=(');
    const wildcard = await kit.send('vendor', '/product-variant/vendor/all?search=.*');
    const nested = await kit.send(
      'vendor',
      '/product-variant/vendor/all?search=(a%2B)%2B%24&limit=100',
    );

    kit.evidence('PVA-07', {
      brokenStatus: broken.status,
      brokenCode: errorCode(broken),
      wildcardStatus: wildcard.status,
      wildcardRows: rows(wildcard).length,
      nestedStatus: nested.status,
      productId: context.productId,
    });
    expect(nested.status).toBeLessThan(500);
    expectRejected(broken, 'invalid regex search');
  }, 60_000);

  it.failing('PVA-08 honours deleted=false as a live-rows-only filter', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    await kit.send('vendor', '/product-variant/vendor/soft', {
      method: 'DELETE',
      body: {
        productId: context.productId,
        variantId: context.variantId,
        reason: 'Filter inversion probe.',
      },
    });
    const live = await createVariant(context.productId, { title: `Live variant ${runId}` });
    expect(live.accepted, 'the live variant must exist for this attack').toBe(true);
    const liveId = harness.idFromMessage((live.body as { data: ApiData }).data.message, 'Variant');

    const filtered = await kit.send('vendor', '/product-variant/vendor/all?deleted=false');
    const served = rows(filtered).map((row) => row.id);

    kit.evidence('PVA-08', {
      status: filtered.status,
      returned: served.length,
      containsDeleted: served.includes(context.variantId),
      containsLive: served.includes(liveId),
    });
    expect(filtered.accepted).toBe(true);
    expect(served).not.toContain(context.variantId);
    expect(served).toContain(liveId);
  }, 30_000);

  it('PVA-09 keeps the product price summary consistent when price updates race', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    const attempts = await kit.race(5, async (index) =>
      priceUpdate(context.productId, context.variantId, {
        price: 100 + index * 10,
        discountedPrice: 80 + index * 10,
      }),
    );
    const variant = await ProductVariantModel.findById(context.variantId).lean();
    const product = await ProductModel.findById(context.productId).lean();

    kit.evidence('PVA-09', {
      statuses: kit.statuses(attempts).join(','),
      accepted: kit.accepted(attempts).length,
      variantPrice: variant?.price,
      summaryMax: product?.price?.maxPrice,
      summaryMin: product?.price?.minPrice,
      version: variant?.version,
    });
    expect(kit.accepted(attempts).length).toBeGreaterThan(0);
    expect(product?.price?.maxPrice).toBe(variant?.price);
    expect(product?.price?.minPrice).toBe(variant?.price);
    expect(variant?.version).toBe(kit.accepted(attempts).length);
  }, 60_000);

  it('PVA-10 ignores mass-assigned identity and deletion on create', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    const attackerId = Id.create().value;
    const created = await createVariant(context.productId, {
      id: attackerId,
      _id: attackerId,
      vendorId: attackerId,
      deleted: { deleted: true },
      version: 99,
      title: `Mass assignment ${runId}`,
    });
    expect(created.accepted, 'the probe variant must be created').toBe(true);
    const variantId = harness.idFromMessage(
      (created.body as { data: ApiData }).data.message,
      'Variant',
    );
    const doc = await ProductVariantModel.findById(variantId).lean();

    kit.evidence('PVA-10', {
      attackerId,
      storedId: doc?._id,
      storedProductId: doc?.productId,
      deleted: doc?.deleted.deleted,
      version: doc?.version,
    });
    expect(doc?._id).not.toBe(attackerId);
    expect(doc?.productId).toBe(context.productId);
    expect(doc?.deleted.deleted).toBe(false);
    expect(doc?.version).toBe(0);
  }, 30_000);

  it('PVA-11 keeps buyers, vendors and anonymous callers out of the admin surface', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    const attempts = [
      await kit.send('buyer', '/product-variant/admin/all'),
      await kit.send('vendor', '/product-variant/admin/all'),
      await kit.send('buyer', `/product-variant/admin/${context.variantId}/recover`, {
        method: 'PATCH',
      }),
      await kit.send('vendor', `/product-variant/admin/${context.variantId}/recover`, {
        method: 'PATCH',
      }),
      await kit.sendAnonymously('/product-variant/vendor/all'),
      await kit.sendAnonymously('/product-variant/vendor', {
        method: 'POST',
        body: {
          productId: context.productId,
          price: 100,
          discountedPrice: 80,
          title: 'Anonymous variant',
          active: true,
        },
      }),
    ];

    kit.evidence('PVA-11', {
      statuses: kit.statuses(attempts).join(','),
      variants: await ProductVariantModel.countDocuments({ productId: context.productId }),
    });
    for (const attempt of attempts) expectUnauthorized(attempt, 'admin or vendor surface access');
    expect(await ProductVariantModel.countDocuments({ productId: context.productId })).toBe(1);
  }, 30_000);

  it('PVA-12 recovers only deleted variants and refuses invented targets', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    const notDeleted = await kit.send(
      'admin',
      `/product-variant/admin/${context.variantId}/recover`,
      { method: 'PATCH' },
    );
    const invented = await kit.send(
      'admin',
      `/product-variant/admin/${Id.create().value}/recover`,
      {
        method: 'PATCH',
      },
    );
    await kit.send('vendor', '/product-variant/vendor/soft', {
      method: 'DELETE',
      body: {
        productId: context.productId,
        variantId: context.variantId,
        reason: 'Recovery probe deletion.',
      },
    });
    const recovered = await kit.send(
      'admin',
      `/product-variant/admin/${context.variantId}/recover`,
      {
        method: 'PATCH',
      },
    );
    const doc = await ProductVariantModel.findById(context.variantId).lean();

    kit.evidence('PVA-12', {
      notDeletedStatus: notDeleted.status,
      inventedStatus: invented.status,
      recoveredStatus: recovered.status,
      deletedAfter: doc?.deleted.deleted,
    });
    expectRejected(notDeleted, 'recovering a live variant');
    expectRejected(invented, 'recovering an invented variant');
    expect(recovered.accepted).toBe(true);
    expect(doc?.deleted.deleted).toBe(false);
  }, 30_000);

  it('PVA-13 rejects boundary titles, reasons and pagination', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    const attempts = [
      await createVariant(context.productId, { title: '' }),
      await createVariant(context.productId, { title: 'x'.repeat(10_000) }),
      await createVariant(context.productId, { active: 'yes' }),
      await kit.send('vendor', '/product-variant/vendor/soft', {
        method: 'DELETE',
        body: { productId: context.productId, variantId: context.variantId, reason: 'short' },
      }),
      await kit.send('vendor', '/product-variant/vendor/all?limit=0'),
      await kit.send('vendor', '/product-variant/vendor/all?limit=101'),
      await kit.send('vendor', '/product-variant/vendor/all?direction=sideways'),
      await kit.send('vendor', '/product-variant/vendor/all?cursor=nope!'),
    ];

    kit.evidence('PVA-13', {
      statuses: kit.statuses(attempts).join(','),
      codes: attempts.map(errorCode).join(','),
      variants: await ProductVariantModel.countDocuments({ productId: context.productId }),
      deleted: (await ProductVariantModel.findById(context.variantId).lean())?.deleted.deleted,
    });
    for (const attempt of attempts) expectRejected(attempt, 'boundary variant payload');
    expect(await ProductVariantModel.countDocuments({ productId: context.productId })).toBe(1);
    expect((await ProductVariantModel.findById(context.variantId).lean())?.deleted.deleted).toBe(
      false,
    );
  }, 60_000);
});
