import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { StatsModel } from '../../infrastructure/StatsModel';
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

function metric(doc: unknown, key: string): number {
  return Number((doc as StatsSnapshot).metrics?.[key] ?? 0);
}

function bodyData(result: AttackResult): Record<string, unknown> {
  const body = result.body as Record<string, unknown> | null;
  if (!body || typeof body !== 'object') return {};
  const data = body.data;
  return data && typeof data === 'object' ? (data as Record<string, unknown>) : body;
}

async function seedOrder() {
  const context = await harness.seedOrder({ available: 10, quantity: 2 });
  await flushAndTrack(context.productId);
  return context;
}

describe.skipIf(!integrationEnabled)('stats API database integration', () => {
  beforeAll(async () => {
    kit = await createSecurityKit({ dispatchEvents: true });
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

  it('STS-01 keeps admin reporting routes behind admin auth', async () => {
    const context = await seedOrder();
    const attempts = [
      await kit.send('buyer', '/stats/admin/settings'),
      await kit.send('vendor', '/stats/admin/settings'),
      await kit.send('buyer', `/stats/admin/product/${context.productId}/overview`),
      await kit.send('vendor', `/stats/admin/product/${context.productId}/overview`),
      await kit.send('buyer', '/stats/admin/product/top?limit=5'),
      await kit.send('vendor', '/stats/admin/aggregate/product?limit=5'),
      await kit.sendAnonymously('/stats/admin/settings'),
    ];

    kit.evidence('STS-01', { statuses: kit.statuses(attempts).join(',') });
    for (const attempt of attempts) expectUnauthorized(attempt, 'admin stats access');
  }, 60_000);

  it('STS-02 masks financial metrics from a buyer reading a live product', async () => {
    const context = await seedOrder();
    const buyer = await kit.send('buyer', `/stats/entity/product/${context.productId}/lifetime`);
    const admin = await kit.send('admin', `/stats/entity/product/${context.productId}/lifetime`);

    kit.evidence('STS-02', {
      buyerStatus: buyer.status,
      adminStatus: admin.status,
      buyerMetrics: JSON.stringify(bodyData(buyer).metrics),
      adminMetrics: JSON.stringify(bodyData(admin).metrics),
    });
    expect(buyer.accepted).toBe(true);
    expect(admin.accepted).toBe(true);
    expect(metric(bodyData(admin), 'revenue')).toBeGreaterThan(0);
    expect('revenue' in (bodyData(buyer).metrics as Record<string, unknown>)).toBe(false);
    expect('refundAmount' in (bodyData(buyer).metrics as Record<string, unknown>)).toBe(false);
    expect(metric(bodyData(buyer), 'quantity')).toBe(2);
  }, 60_000);

  it('STS-03 does not leak one product stats into another id or entity type', async () => {
    const context = await seedOrder();
    const inventedId = `STS-INVENTED-${kit.runId}`;
    const foreign = await kit.send('buyer', `/stats/entity/product/${inventedId}/lifetime`);
    const wrongType = await kit.send('buyer', `/stats/entity/coupon/${context.productId}/lifetime`);

    kit.evidence('STS-03', {
      foreignStatus: foreign.status,
      wrongTypeStatus: wrongType.status,
      foreignMetrics: JSON.stringify(bodyData(foreign).metrics),
      wrongTypeMetrics: JSON.stringify(bodyData(wrongType).metrics),
    });
    expect(foreign.accepted).toBe(true);
    expect(wrongType.accepted).toBe(true);
    expect(metric(bodyData(foreign), 'revenue')).toBe(0);
    expect(metric(bodyData(wrongType), 'revenue')).toBe(0);
  }, 60_000);

  it.failing('STS-04 refuses click beacons for a product that does not exist', async () => {
    const inventedId = `STS-CLICK-${kit.runId}`;
    const click = await kit.sendAnonymously(`/stats/public/products/${inventedId}/click`, {
      method: 'POST',
    });
    const docs = await flushAndTrack(inventedId);

    kit.evidence('STS-04', {
      status: click.status,
      rows: docs.length,
      clicks: docs.reduce((total, doc) => total + metric(doc, 'clicks'), 0),
    });
    expect(click.status).toBe(202);
    expect(docs.length).toBe(0);
  }, 30_000);

  it('STS-05 answers view beacons uniformly without exposing the guard decision', async () => {
    const context = await harness.seedCatalog();
    const headers = {
      'x-visitor-id': `visitor-${runId}`,
      'user-agent': 'IntegrationTest/1.0',
      'cf-connecting-ip': '127.0.0.1',
    };
    const bot = await kit.sendAnonymously(`/stats/public/products/${context.productId}/view`, {
      method: 'POST',
      headers: { ...headers, 'user-agent': 'curl/8.0' },
    });
    const first = await kit.sendAnonymously(`/stats/public/products/${context.productId}/view`, {
      method: 'POST',
      headers,
    });
    const duplicate = await kit.sendAnonymously(
      `/stats/public/products/${context.productId}/view`,
      {
        method: 'POST',
        headers,
      },
    );
    const docs = await flushAndTrack(context.productId);

    kit.evidence('STS-05', {
      statuses: kit.statuses([bot, first, duplicate]).join(','),
      views: docs.reduce((total, doc) => total + metric(doc, 'views'), 0),
    });
    expect(kit.statuses([bot, first, duplicate])).toEqual([202, 202, 202]);
    expect(docs.reduce((total, doc) => total + metric(doc, 'views'), 0)).toBeGreaterThan(0);
  }, 60_000);

  it.failing('STS-06 applies a rate limit to click beacons', async () => {
    const context = await harness.seedCatalog();
    const attempts = await kit.race(10, async () =>
      kit.sendAnonymously(`/stats/public/products/${context.productId}/click`, { method: 'POST' }),
    );
    const docs = await flushAndTrack(context.productId);

    kit.evidence('STS-06', {
      statuses: kit.statuses(attempts).join(','),
      accepted: kit.accepted(attempts).length,
      clicks: docs.reduce((total, doc) => total + metric(doc, 'clicks'), 0),
    });
    expect(kit.accepted(attempts).length).toBe(0);
  }, 60_000);

  it.failing('STS-07 validates the top-entity query surface', async () => {
    const context = await seedOrder();
    const attempts = [
      await kit.send('admin', '/stats/admin/product/top?limit=-1'),
      await kit.send('admin', '/stats/admin/product/top?limit=0'),
      await kit.send('admin', '/stats/admin/product/top?limit=1000000'),
      await kit.send('admin', '/stats/admin/product/top?metric=$where'),
      await kit.send('admin', '/stats/admin/product/top?aggregation=bogus'),
      await kit.send('admin', '/stats/admin/bogus/top?limit=5'),
    ];

    kit.evidence('STS-07', {
      statuses: kit.statuses(attempts).join(','),
      bodies: attempts.map((result) => result.text.slice(0, 80)).join(' | '),
      product: context.productId,
    });
    for (const attempt of attempts) expectRejected(attempt, 'abusive top query');
  }, 60_000);

  it.failing('STS-08 rejects operator-shaped and oversized paginated queries', async () => {
    const attempts = [
      await kit.send('admin', '/stats/admin/product/paginated?limit=0'),
      await kit.send('admin', '/stats/admin/product/paginated?limit=101'),
      await kit.send('admin', '/stats/admin/product/paginated?metric=$where'),
      await kit.send('admin', '/stats/admin/product/paginated?sort=sideways'),
      await kit.send('admin', '/stats/admin/bogus/paginated?limit=5'),
      await kit.send('admin', '/stats/admin/product/paginated?cursor=not-an-id&limit=5'),
    ];

    kit.evidence('STS-08', {
      statuses: kit.statuses(attempts).join(','),
      bodies: attempts.map((result) => result.text.slice(0, 90)).join(' | '),
    });
    for (const attempt of attempts) expectRejected(attempt, 'abusive paginated query');
  }, 30_000);

  it('STS-09 scopes aggregate ids and operator-shaped filters', async () => {
    const context = await seedOrder();
    const clean = await kit.send(
      'admin',
      `/stats/admin/aggregate/product?ids=${context.productId}`,
    );
    const injected = await kit.send(
      'admin',
      `/stats/admin/aggregate/product?ids=${encodeURIComponent('$ne')}`,
    );
    const invented = await kit.send(
      'admin',
      `/stats/admin/aggregate/product?ids=${kit.runId}-missing`,
    );

    kit.evidence('STS-09', {
      statuses: kit.statuses([clean, injected, invented]).join(','),
      bodies: [clean, injected, invented].map((result) => result.text.slice(0, 140)).join(' | '),
      cleanRevenue: metric(bodyData(clean), 'revenue'),
      injectedRevenue: metric(bodyData(injected), 'revenue'),
      inventedRevenue: metric(bodyData(invented), 'revenue'),
    });
    expect(clean.accepted).toBe(true);
    expect(metric(bodyData(clean), 'revenue')).toBeGreaterThan(0);
    expect(metric(bodyData(injected), 'revenue')).toBe(0);
    expect(metric(bodyData(invented), 'revenue')).toBe(0);
  }, 60_000);

  it.failing('STS-10 rejects abusive sync settings and boolean coercion', async () => {
    const before = await kit.send('admin', '/stats/admin/settings');
    const attempts = [
      await kit.send('admin', '/stats/admin/settings', {
        method: 'PATCH',
        body: { intervalHours: 0 },
      }),
      await kit.send('admin', '/stats/admin/settings', {
        method: 'PATCH',
        body: { maxStalenessHours: -1 },
      }),
      await kit.send('admin', '/stats/admin/settings', {
        method: 'PATCH',
        body: { vendorForceRefreshQuota: -5 },
      }),
      await kit.send('admin', '/stats/admin/settings', {
        method: 'PATCH',
        body: { autoDenormalizeEnabled: 'false' },
      }),
      await kit.send('admin', '/stats/admin/settings', {
        method: 'PATCH',
        body: { intervalHours: 'not-a-number' },
      }),
    ];
    const after = await kit.send('admin', '/stats/admin/settings');

    kit.evidence('STS-10', {
      statuses: kit.statuses(attempts).join(','),
      bodies: attempts.map((result) => result.text.slice(0, 90)).join(' | '),
      before: JSON.stringify(bodyData(before)),
      after: JSON.stringify(bodyData(after)),
    });
    for (const attempt of attempts) expectRejected(attempt, 'abusive settings patch');
    expect(bodyData(after)).toEqual(bodyData(before));
  }, 30_000);

  it('STS-11 keeps concurrent force refreshes from producing server errors', async () => {
    await kit.vendorProfileFor('vendor');
    const usage = await kit.send('vendor', '/stats/vendor/me/force-update/usage');
    const attempts = await kit.race(6, async () =>
      kit.send('vendor', '/stats/vendor/me/force-update', { method: 'POST' }),
    );
    const after = await kit.send('vendor', '/stats/vendor/me/force-update/usage');

    kit.evidence('STS-11', {
      usageStatus: usage.status,
      statuses: kit.statuses(attempts).join(','),
      accepted: kit.accepted(attempts).length,
      afterUsage: JSON.stringify(bodyData(after)),
    });
    expect(usage.accepted).toBe(true);
    expect(attempts.every((result) => result.status < 500)).toBe(true);
    expect(after.accepted).toBe(true);
  }, 60_000);

  it.failing('STS-12 rejects malformed timeseries ranges', async () => {
    const context = await seedOrder();
    const attempts = [
      await kit.send('admin', '/stats/admin/aggregate/product/timeseries?from=nope&to=also-nope'),
      await kit.send('admin', '/stats/admin/aggregate/product/timeseries?aggregation=hourly'),
      await kit.send(
        'admin',
        '/stats/admin/aggregate/product/timeseries?from=1900-01-01&to=2100-12-31',
      ),
      await kit.send('buyer', `/stats/entity/product/${context.productId}/timeseries`),
      await kit.send(
        'buyer',
        `/stats/entity/product/${context.productId}/timeseries?from=bad&to=bad`,
      ),
    ];

    kit.evidence('STS-12', {
      statuses: kit.statuses(attempts).join(','),
      lengths: attempts.map((result) => result.text.length).join(','),
    });
    expectRejected(attempts[0], 'malformed aggregate range');
    expectRejected(attempts[4], 'malformed entity range');
  }, 60_000);
});
