import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { CategoryModel } from '../../infrastructure/category.models';
import {
  createApiIntegrationHarness,
  integrationEnabled,
  runId,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';

let harness: ApiIntegrationHarness;

const categoryBody = () => ({
  title: `Integration Category ${runId}`,
  image: 'https://example.com/category.png',
});

describe.skipIf(!integrationEnabled)('category API database integration', () => {
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
});
