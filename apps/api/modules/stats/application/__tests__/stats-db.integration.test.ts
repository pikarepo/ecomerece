import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { StatsModel } from '../../infrastructure/StatsModel';
import {
  createApiIntegrationHarness,
  integrationEnabled,
  runId,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';

let harness: ApiIntegrationHarness;

type StatsSnapshot = {
  metrics?: Record<string, unknown> | null;
  dimensions?: Record<string, unknown> | null;
};

function hasMetric(doc: unknown, key: string, value: number): boolean {
  const metrics = (doc as StatsSnapshot).metrics;
  return metrics?.[key] === value;
}

function hasDimension(doc: unknown, key: string, value: string): boolean {
  const dimensions = (doc as StatsSnapshot).dimensions;
  return dimensions?.[key] === value;
}

async function flushAndTrack(entityId: string) {
  const { statsBufferService } = await import('../StatsBufferService');
  await statsBufferService.flush();
  const docs = await StatsModel.find({ 'entity.id': entityId }).lean();
  const ids = docs.map((doc) => doc._id);
  harness.trackCleanup(async () => {
    if (ids.length > 0) await StatsModel.deleteMany({ _id: { $in: ids } });
  });
  return docs;
}

describe.skipIf(!integrationEnabled)('stats API database integration', () => {
  beforeAll(async () => {
    harness = await createApiIntegrationHarness({ dispatchEvents: true });
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

  it('persists product view and click beacons through the stats buffer', async () => {
    const context = await harness.seedCatalog();
    const headers = {
      'x-visitor-id': `visitor-${runId}`,
      'user-agent': 'IntegrationTest/1.0',
      'cf-connecting-ip': '127.0.0.1',
      'x-platform': 'web',
      'x-country-code': 'PK',
    };

    const view = await harness.requestAs(
      'buyer',
      `/stats/public/products/${context.productId}/view`,
      { method: 'POST', headers },
    );
    expect(view.response.status).toBe(202);
    const click = await harness.requestAs(
      'buyer',
      `/stats/public/products/${context.productId}/click`,
      { method: 'POST' },
    );
    expect(click.response.status).toBe(202);

    const docs = await flushAndTrack(context.productId);
    expect(docs.some((doc) => hasMetric(doc, 'views', 1))).toBe(true);
    expect(docs.some((doc) => hasMetric(doc, 'clicks', 1))).toBe(true);
    expect(docs.some((doc) => hasDimension(doc, 'country', 'PK'))).toBe(true);
    expect(docs.some((doc) => hasDimension(doc, 'platform', 'web'))).toBe(true);
  }, 30_000);

  it('persists order-item stats when the order event is dispatched', async () => {
    const context = await harness.seedOrder({ available: 10, quantity: 2 });

    const docs = await flushAndTrack(context.productId);
    expect(docs.some((doc) => hasMetric(doc, 'purchases', 1))).toBe(true);
    expect(docs.some((doc) => hasMetric(doc, 'quantity', 2))).toBe(true);
    expect(docs.some((doc) => hasMetric(doc, 'revenue', 200))).toBe(true);
  }, 30_000);
});
