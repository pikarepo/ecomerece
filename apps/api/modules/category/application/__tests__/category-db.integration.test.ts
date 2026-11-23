import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { CategoryModel } from '../../infrastructure/category.models';
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
  type Tenant,
} from '../../../../testing/security-kit';

let kit: SecurityKit;
let harness: ApiIntegrationHarness;

const categoryBody = () => ({
  title: `Integration Category ${runId}`,
  image: 'https://example.com/category.png',
});

async function createCategory(payload: unknown = categoryBody()) {
  const result = await kit.send('admin', '/category/admin', { method: 'POST', body: payload });
  if (result.accepted) {
    const docs = await CategoryModel.find({ title: (payload as { title?: string }).title }).lean();
    for (const doc of docs) harness.track(doc._id);
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
      description: 'Product created by the category exploitation suite.',
      ingredient: { isIngredients: false, ingredients: [] },
      disclaimer: { isDisclaimer: false, disclaimers: [] },
      image: {
        images: [
          { url: 'https://example.com/product.png', alt: 'Category attack product', default: true },
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

function errorCode(result: AttackResult): string {
  const body = result.body as { error?: { code?: string } } | null;
  return body?.error?.code ?? 'unknown';
}

async function asTenant(
  tenant: Tenant,
  path: string,
  options: { method?: 'POST' | 'PATCH' | 'DELETE'; body?: unknown } = {},
) {
  return await kit.send(tenant, path, options);
}

describe.skipIf(!integrationEnabled)('category API database integration', () => {
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

  it('creates a category through the admin route', async () => {
    harness.expectSuccess(
      await harness.requestAs('admin', '/category/admin', {
        method: 'POST',
        body: categoryBody(),
      }),
    );
    const createdDoc = await CategoryModel.findOne({
      title: `Integration Category ${runId}`,
    }).lean();
    if (!createdDoc) throw new Error('Category was not persisted.');
    const categoryId = harness.track(createdDoc._id);

    const category = await CategoryModel.findById(categoryId).lean();
    expect(category?.title).toBe(`Integration Category ${runId}`);
    expect(category?.image).toBe('https://example.com/category.png');
    expect(category?.block.blocked).toBe(false);
    expect(category?.deleted.deleted).toBe(false);
    expect(harness.events).toContain('category.created');
  }, 30_000);

  it('updates, blocks, and unblocks a category', async () => {
    harness.expectSuccess(
      await harness.requestAs('admin', '/category/admin', {
        method: 'POST',
        body: categoryBody(),
      }),
    );
    const createdDoc = await CategoryModel.findOne({
      title: `Integration Category ${runId}`,
    }).lean();
    if (!createdDoc) throw new Error('Category was not persisted.');
    const categoryId = harness.track(createdDoc._id);
    harness.events.length = 0;

    harness.expectSuccess(
      await harness.requestAs('admin', '/category/admin', {
        method: 'PATCH',
        body: { id: categoryId, title: `Updated Category ${runId}` },
      }),
    );
    harness.expectSuccess(
      await harness.requestAs('admin', `/category/admin/${categoryId}/block`, {
        method: 'PATCH',
        body: { reason: 'Integration block.' },
      }),
    );
    expect((await CategoryModel.findById(categoryId).lean())?.block.blocked).toBe(true);

    harness.expectSuccess(
      await harness.requestAs('admin', `/category/admin/${categoryId}/unblock`, {
        method: 'PATCH',
      }),
    );

    const category = await CategoryModel.findById(categoryId).lean();
    expect(category?.title).toBe(`Updated Category ${runId}`);
    expect(category?.block.blocked).toBe(false);
    expect(harness.events).toContain('category.meta-updated');
    expect(harness.events).toContain('category.blocked');
    expect(harness.events).toContain('category.unblocked');
  }, 30_000);

  it('CAT-01 refuses non-admin tenants on every category write', async () => {
    const created = await createCategory();
    const doc = await CategoryModel.findOne({ title: categoryBody().title }).lean();
    if (!doc) throw new Error('Category fixture missing.');
    const id = doc._id;

    const attempts = await Promise.all([
      asTenant('buyerAlt', '/category/admin', { method: 'POST', body: categoryBody() }),
      asTenant('vendorAlt', '/category/admin', {
        method: 'PATCH',
        body: { id, title: 'Foreign title update' },
      }),
      asTenant('buyerAlt', '/category/admin', {
        method: 'DELETE',
        body: { id, reason: 'Foreign deletion attempt.' },
      }),
      asTenant('vendor', `/category/admin/${id}/block`, {
        method: 'PATCH',
        body: { reason: 'Foreign block attempt.' },
      }),
      asTenant('buyer', `/category/admin/${id}/unblock`, { method: 'PATCH' }),
    ]);
    const after = await CategoryModel.findById(id).lean();

    kit.evidence('CAT-01', {
      statuses: kit.statuses(attempts).join(','),
      titleAfter: after?.title,
      blockedAfter: after?.block.blocked,
      deletedAfter: after?.deleted.deleted,
    });
    for (const result of attempts) expectUnauthorized(result, 'non-admin category write');
    expect(after?.title).toBe(categoryBody().title);
    expect(after?.block.blocked).toBe(false);
    expect(after?.deleted.deleted).toBe(false);
    expect(created.accepted).toBe(true);
  }, 30_000);

  /**
   * EXPLOIT CAT-02 — the public list filters deleted and blocked rows, but the
   * public detail reads by id through an unfiltered repository lookup.
   */
  it.failing('hides deleted and blocked categories from the public detail route', async () => {
    await createCategory({ title: `Deleted detail ${runId}`, image: 'https://example.com/a.png' });
    await createCategory({ title: `Blocked detail ${runId}`, image: 'https://example.com/b.png' });
    const deleted = await CategoryModel.findOne({ title: `Deleted detail ${runId}` }).lean();
    const blocked = await CategoryModel.findOne({ title: `Blocked detail ${runId}` }).lean();
    if (!deleted || !blocked) throw new Error('Category fixtures missing.');

    await asTenant('admin', '/category/admin', {
      method: 'DELETE',
      body: { id: deleted._id, reason: 'Public detail leak probe.' },
    });
    await asTenant('admin', `/category/admin/${blocked._id}/block`, {
      method: 'PATCH',
      body: { reason: 'Public block leak probe.' },
    });
    const deletedRead = await kit.sendAnonymously(`/category/${deleted._id}`);
    const blockedRead = await kit.sendAnonymously(`/category/${blocked._id}`);

    kit.evidence('CAT-02', {
      deletedReadStatus: deletedRead.status,
      blockedReadStatus: blockedRead.status,
      leakedTitle: (deletedRead.body as { data?: { title?: string } })?.data?.title,
      dbDeleted: (await CategoryModel.findById(deleted._id).lean())?.deleted.deleted,
      dbBlocked: (await CategoryModel.findById(blocked._id).lean())?.block.blocked,
    });
    expectRejected(deletedRead, 'public read of deleted category');
    expectRejected(blockedRead, 'public read of blocked category');
  }, 30_000);

  /** CONTROL CAT-03 — the product service re-checks category state. */
  it('refuses to create products in a deleted category', async () => {
    await createCategory();
    const category = await CategoryModel.findOne({ title: categoryBody().title }).lean();
    if (!category) throw new Error('Category fixture missing.');
    await kit.vendorProfileFor('vendor');

    await asTenant('admin', '/category/admin', {
      method: 'DELETE',
      body: { id: category._id, reason: 'Deleted-category product probe.' },
    });
    const product = await createProduct(category._id, `Deleted category product ${runId}`);

    kit.evidence('CAT-03', {
      categoryDeleted: (await CategoryModel.findById(category._id).lean())?.deleted.deleted,
      productStatus: product.status,
      productTitle: (product.body as { data?: ApiData })?.data?.message,
    });
    expectRejected(product, 'product creation in a deleted category');
  }, 30_000);

  it('CAT-04 refuses to create products in a blocked category', async () => {
    await createCategory();
    const category = await CategoryModel.findOne({ title: categoryBody().title }).lean();
    if (!category) throw new Error('Category fixture missing.');
    await kit.vendorProfileFor('vendor');
    await asTenant('admin', `/category/admin/${category._id}/block`, {
      method: 'PATCH',
      body: { reason: 'Blocked-category product probe.' },
    });

    const product = await createProduct(category._id, `Blocked category product ${runId}`);
    kit.evidence('CAT-04', {
      blocked: (await CategoryModel.findById(category._id).lean())?.block.blocked,
      productStatus: product.status,
    });
    expectRejected(product, 'product creation in a blocked category');
  }, 30_000);

  it('CAT-05 allows duplicate category titles sequentially', async () => {
    await createCategory();
    const duplicate = await createCategory();
    const rows = await CategoryModel.countDocuments({ title: categoryBody().title });

    kit.evidence('CAT-05', { firstStatus: 200, duplicateStatus: duplicate.status, rows });
    expect(duplicate.accepted).toBe(true);
    expect(rows).toBe(2);
  }, 30_000);

  /** EXPLOIT CAT-06 — a non-unique index does not stop concurrent duplicates. */
  it.failing('keeps category titles unique under concurrent creation', async () => {
    const title = `Race category ${runId}`;
    const before = await CategoryModel.countDocuments({ title });
    expect(before, 'fixture must start without the racing title').toBe(0);

    const results = await kit.race(
      6,
      async (index) =>
        await createCategory({ title, image: `https://example.com/race-${index}.png` }),
    );
    const after = await CategoryModel.countDocuments({ title });

    kit.evidence('CAT-06', {
      attempts: 6,
      statuses: kit.statuses(results).join(','),
      accepted: kit.accepted(results).length,
      rows: after,
    });
    expect(kit.accepted(results).length).toBeLessThanOrEqual(1);
    expect(after).toBeLessThanOrEqual(1);
  }, 60_000);

  it('CAT-07 rejects boundary titles, bad images and out-of-range pagination', async () => {
    const before = await CategoryModel.countDocuments({});
    const shortTitle = await createCategory({ title: '', image: 'https://example.com/x.png' });
    const longTitle = await createCategory({
      title: 'x'.repeat(10_000),
      image: 'https://example.com/x.png',
    });
    const badImage = await createCategory({ title: `Bad image ${runId}`, image: 'not a url' });
    const lowLimit = await kit.sendAnonymously('/category?limit=1');
    const highLimit = await kit.sendAnonymously('/category?limit=100');
    const badCursor = await kit.sendAnonymously('/category?cursor=nope');

    kit.evidence('CAT-07', {
      shortStatus: shortTitle.status,
      longStatus: longTitle.status,
      badImageStatus: badImage.status,
      lowLimitStatus: lowLimit.status,
      highLimitStatus: highLimit.status,
      badCursorStatus: badCursor.status,
      rowsBefore: before,
      rowsAfter: await CategoryModel.countDocuments({}),
    });
    for (const result of [shortTitle, longTitle, badImage])
      expectRejected(result, 'invalid category');
    for (const result of [lowLimit, highLimit, badCursor])
      expectRejected(result, 'invalid pagination');
    expect(await CategoryModel.countDocuments({})).toBe(before);
  }, 30_000);

  it('CAT-08 fails closed on malformed ids, short reasons and double deletion', async () => {
    await createCategory();
    const doc = await CategoryModel.findOne({ title: categoryBody().title }).lean();
    if (!doc) throw new Error('Category fixture missing.');
    const id = doc._id;

    const malformed = await asTenant('admin', '/category/admin', {
      method: 'DELETE',
      body: { id: 'not-a-uuid', reason: 'Malformed deletion attempt.' },
    });
    const shortReason = await asTenant('admin', '/category/admin', {
      method: 'DELETE',
      body: { id, reason: 'short' },
    });
    const deleted = await asTenant('admin', '/category/admin', {
      method: 'DELETE',
      body: { id, reason: 'First legitimate deletion.' },
    });
    const again = await asTenant('admin', '/category/admin', {
      method: 'DELETE',
      body: { id, reason: 'Second legitimate deletion.' },
    });
    const after = await CategoryModel.findById(id).lean();

    kit.evidence('CAT-08', {
      malformedStatus: malformed.status,
      malformedCode: errorCode(malformed),
      shortReasonStatus: shortReason.status,
      firstDeleteStatus: deleted.status,
      secondDeleteStatus: again.status,
      deletedAfter: after?.deleted.deleted,
    });
    expectRejected(malformed, 'malformed category id');
    expectRejected(shortReason, 'short deletion reason');
    expectRejected(again, 'double category deletion');
    expect(malformed.status).toBeLessThan(500);
    expect(after?.deleted.deleted).toBe(true);
  }, 30_000);

  it('CAT-09 public list reflects a delete immediately while admin list still shows it', async () => {
    await createCategory();
    const doc = await CategoryModel.findOne({ title: categoryBody().title }).lean();
    if (!doc) throw new Error('Category fixture missing.');

    const search = `Integration%20Category%20${runId}`;
    const publicBefore = await kit.sendAnonymously(`/category?search=${search}`);
    await asTenant('admin', '/category/admin', {
      method: 'DELETE',
      body: { id: doc._id, reason: 'Public list invalidation probe.' },
    });
    const publicAfter = await kit.sendAnonymously(`/category?search=${search}`);
    const adminAfter = await kit.send('admin', `/category/admin/all?search=${search}&deleted=true`);
    const ids = (result: AttackResult) => {
      const data = result.body as { data?: { data?: Array<{ id?: string; _id?: string }> } };
      return (data.data?.data ?? []).map((item) => item.id ?? item._id);
    };

    kit.evidence('CAT-09', {
      publicBeforeIncludes: ids(publicBefore).includes(doc._id),
      publicAfterIncludes: ids(publicAfter).includes(doc._id),
      adminAfterIncludes: ids(adminAfter).includes(doc._id),
      publicBody: publicBefore.text.slice(0, 240),
      adminBody: adminAfter.text.slice(0, 240),
    });
    expect(ids(publicBefore)).toContain(doc._id);
    expect(ids(publicAfter)).not.toContain(doc._id);
    expect(ids(adminAfter)).toContain(doc._id);
  }, 30_000);

  it('CAT-10 ignores invented createdBy and other unknown fields', async () => {
    const result = await createCategory({
      ...categoryBody(),
      title: `Mass assignment ${runId}`,
      createdBy: harness.userIds.vendor,
      version: 99,
      deleted: { deleted: true },
      block: { blocked: true },
    });
    const doc = await CategoryModel.findOne({ title: `Mass assignment ${runId}` }).lean();

    kit.evidence('CAT-10', {
      status: result.status,
      storedCreatedBy: doc?.createdBy,
      expectedCreatedBy: harness.userIds.admin,
      deleted: doc?.deleted.deleted,
      blocked: doc?.block.blocked,
      version: doc?.version,
    });
    expect(result.accepted).toBe(true);
    expect(doc?.createdBy).toBe(harness.userIds.admin);
    expect(doc?.deleted.deleted).toBe(false);
    expect(doc?.block.blocked).toBe(false);
    expect(doc?.version).toBe(0);
  }, 30_000);

  it('CAT-11 refuses a deep update with an invented category id', async () => {
    await createCategory();
    const before = await CategoryModel.findOne({ title: categoryBody().title }).lean();
    const invented = await asTenant('admin', '/category/admin', {
      method: 'PATCH',
      body: { id: '00000000-0000-4000-8000-000000000000', title: 'Invented target category' },
    });
    const after = await CategoryModel.findOne({ title: categoryBody().title }).lean();

    kit.evidence('CAT-11', {
      status: invented.status,
      code: errorCode(invented),
      titleUnchanged: before?.title === after?.title,
      inventedRows: await CategoryModel.countDocuments({ title: 'Invented target category' }),
    });
    expectRejected(invented, 'invented update target');
    expect(after?.title).toBe(categoryBody().title);
    expect(await CategoryModel.countDocuments({ title: 'Invented target category' })).toBe(0);
  }, 30_000);
});
