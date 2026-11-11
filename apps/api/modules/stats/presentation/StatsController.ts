import { getISOWeek, getTimeWindows, Id } from '@ecomerece/domain';
import {
  type AggregationLevel,
  type EntityType,
  getPaginatedStatsQuerySchema,
  getProductStatsOverviewQuerySchema,
  getStatsAggregateQuerySchema,
  getStatsAggregateTimeSeriesQuerySchema,
  type Metrics,
  updateProductStatsSettingsSchema,
} from '@ecomerece/shared';
import type { IEventBus } from '@ecomerece/domain/events/event-bus.interface';
import type { IQueryBus } from '@ecomerece/domain/query/query-bus.interface';
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ViewEntityType } from '../../../middleware/statsViewGuard';
import { GetVendorByUserIdQuery } from '@ecomerece/contracts';
import { requestVendorStatsForceRefresh } from '../application/event-handlers/vendor-stats-force-refresh.handler';
import { triggerProductStatsDenormalization } from '../application/ProductStatsSyncScheduler';
import { statsBufferService } from '../application/StatsBufferService';
import { statsQueryService } from '../application/StatsQueryService';
import { statsSyncSettingsService } from '../application/StatsSyncSettingsService';
import { vendorForceRefreshQuotaService } from '../application/VendorForceRefreshQuotaService';

function shiftDateKeys(count: number, fromKey: string): string[] {
  const [y, m, d] = fromKey.split('-').map(Number);
  const base = Date.UTC(y, (m ?? 1) - 1, d ?? 1) - (count - 1) * 86_400_000;
  const keys: string[] = [];
  for (let i = 0; i < count; i++) {
    const date = new Date(base + i * 86_400_000);
    keys.push(
      d == null
        ? `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
        : date.toISOString().split('T')[0],
    );
  }
  return keys;
}

function backWeeks(count: number, fromWeek: string): string[] {
  const [year, week] = fromWeek.split('-W').map(Number);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const firstMonday = new Date(jan4.getTime() - ((jan4.getUTCDay() + 6) % 7) * 86_400_000);
  const base = firstMonday.getTime() + (week - 1) * 7 * 86_400_000;
  const keys: string[] = [];
  for (let i = 0; i < count; i++) {
    keys.push(getISOWeek(new Date(base - (count - 1 - i) * 7 * 86_400_000)));
  }
  return keys;
}

export class StatsController {
  constructor(
    private readonly queryBus: IQueryBus,
    private readonly eventBus: IEventBus,
  ) {}

  public recordProductView = (c: Context) => this.recordView(c, 'product');

  public recordCategoryView = (c: Context) => this.recordView(c, 'category');

  public recordPageView = (c: Context) => this.recordView(c, 'page');

  public recordProductClick = (c: Context) => {
    const productId = this.requireParam(c, 'productId');
    statsBufferService.track({
      entity: { type: 'product', id: productId },
      metrics: { clicks: 1 },
      dimensions: { source: c.req.query('source') },
    });
    return c.json({}, 202);
  };

  private recordView = (c: Context, type: ViewEntityType) => {
    // The view guard middleware has already validated the id, decided to
    // track, and flagged the request via `statsViewId`; `skip` never reaches
    // this handler (silent 202 from the middleware).
    const id = c.get('statsViewId');

    statsBufferService.track({
      entity: { type, id },
      metrics: { views: 1 },
      dimensions: {
        country: c.req.header('x-country-code'),
        platform: c.req.header('x-platform'),
        source: c.req.query('source') || c.req.header('referer'),
      },
    });
    return c.json({}, 202);
  };

  private maskFinancialMetrics(metrics: Metrics): Metrics {
    const { revenue, refunds, refundAmount, ...rest } = metrics;
    void revenue;
    void refunds;
    void refundAmount;
    return rest;
  }

  public getLifetimeStats = async (c: Context) => {
    const entityType = this.requireParam(c, 'entityType') as EntityType;
    const entityId = this.requireParam(c, 'entityId');
    const raw = await statsQueryService.getLifetimeStats(entityType, entityId);
    const metrics = c.get('statsFullAccess') ? raw : this.maskFinancialMetrics(raw);
    return c.json({ entityType, entityId, aggregation: 'lifetime', metrics });
  };

  public getTimeSeries = async (c: Context) => {
    const entityType = this.requireParam(c, 'entityType') as EntityType;
    const entityId = this.requireParam(c, 'entityId');
    const from = c.req.query('from');
    const to = c.req.query('to');
    const aggregation = c.req.query('aggregation') ?? 'daily';

    if (!from || !to) {
      return c.json({ message: '`from` and `to` query params are required (YYYY-MM-DD)' }, 400);
    }

    const exposeFull = c.get('statsFullAccess');

    const rawSeries =
      aggregation === 'weekly'
        ? await statsQueryService.getWeeklyTimeSeries(entityType, entityId, from, to)
        : aggregation === 'monthly'
          ? await statsQueryService.getMonthlyTimeSeries(entityType, entityId, from, to)
          : await statsQueryService.getDailyTimeSeries(entityType, entityId, from, to);

    const series = exposeFull
      ? rawSeries
      : rawSeries.map((point) => ({
        ...point,
        metrics: this.maskFinancialMetrics(point.metrics as Metrics),
      }));

    return c.json({ entityType, entityId, aggregation, from, to, series });
  };

  public getTopEntities = async (c: Context) => {
    const entityType = this.requireParam(c, 'entityType') as EntityType;
    const metric = c.req.query('metric') ?? 'revenue';
    const aggregation = (c.req.query('aggregation') ?? 'lifetime') as Exclude<
      AggregationLevel,
      'hourly'
    >;
    const limit = Number(c.req.query('limit') ?? '10');

    const results = await statsQueryService.getTopByMetric(entityType, aggregation, metric, limit);
    return c.json({ entityType, aggregation, metric, results });
  };

  public getProductStatsOverview = async (c: Context) => {
    const productId = this.requireParam(c, 'entityId');
    const overview = await this.getEntityOverview(c, 'product', productId);
    return c.json({ entityType: 'product', entityId: productId, overview });
  };

  public getCategoryStatsOverview = async (c: Context) => {
    const categoryId = this.requireParam(c, 'entityId');
    const overview = await this.getEntityOverview(c, 'category', categoryId);
    return c.json({ entityType: 'category', entityId: categoryId, overview });
  };

  public getVendorStatsOverview = async (c: Context) => {
    const vendorId = this.requireParam(c, 'entityId');
    const overview = await this.getEntityOverview(c, 'vendor', vendorId);

    // Non-owners (and anonymous) get revenue figures masked; owners/admins see full.
    if (!c.get('statsFullAccess')) {
      overview.lifetime = this.maskFinancialMetrics(overview.lifetime);
      overview.today = this.maskFinancialMetrics(overview.today);
      overview.thisWeek = this.maskFinancialMetrics(overview.thisWeek);
      overview.thisMonth = this.maskFinancialMetrics(overview.thisMonth);
      overview.thisYear = this.maskFinancialMetrics(overview.thisYear);
      overview.monthlySeries = overview.monthlySeries.map((point) => ({
        ...point,
        metrics: this.maskFinancialMetrics(point.metrics),
      }));
      overview.dailySeries = overview.dailySeries.map((point) => ({
        ...point,
        metrics: this.maskFinancialMetrics(point.metrics),
      }));
    }

    return c.json({ entityType: 'vendor', entityId: vendorId, overview });
  };

  public getVendorForceRefreshUsage = async (c: Context) => {
    const vendor = await this.resolveMyVendor(c);
    if (!vendor) throw new HTTPException(404, { message: 'Vendor not found' });

    const quota = await vendorForceRefreshQuotaService.getQuota();
    const used = await vendorForceRefreshQuotaService.getUsage(vendor.id);
    return c.json({ success: true, data: { quota, used, remaining: Math.max(quota - used, 0) } });
  };

  public forceRefreshMyVendorStats = async (c: Context) => {
    const vendor = await this.resolveMyVendor(c);
    if (!vendor) throw new HTTPException(404, { message: 'Vendor not found' });

    const result = await requestVendorStatsForceRefresh(vendor.id, this.eventBus);

    if (!result.accepted) {
      return c.json(
        {
          success: false,
          data: { accepted: false, used: result.used, remaining: 0 },
          message: 'Force-refresh quota exhausted for this month.',
        },
        429,
      );
    }

    return c.json({
      success: true,
      data: { accepted: true, used: result.used, remaining: result.remaining },
    });
  };

  private async resolveMyVendor(c: Context) {
    const userId = c.get('userId') as string | undefined;
    if (!userId) throw new HTTPException(401, { message: 'Authentication required' });
    return this.queryBus.execute(new GetVendorByUserIdQuery({ userId: Id.create(userId) }));
  }

  private async getEntityOverview(c: Context, entityType: EntityType, entityId: string) {
    const parsed = getProductStatsOverviewQuerySchema.safeParse(c.req.query());
    if (!parsed.success) throw new HTTPException(400, { message: 'Invalid overview query params' });

    return statsQueryService.getEntityOverview(
      entityType,
      entityId,
      parsed.data.months,
      parsed.data.days,
    );
  }

  public getPaginatedEntityStats = async (c: Context) => {
    const raw = { ...c.req.query(), entityType: c.req.param('entityType') };
    const parsed = getPaginatedStatsQuerySchema.safeParse(raw);
    if (!parsed.success) {
      throw new HTTPException(400, {
        message: 'Invalid stats query params',
        cause: parsed.error.flatten(),
      });
    }

    const { entityType, aggregation, metric, sort, limit, cursor } = parsed.data;
    const result = await statsQueryService.getPaginatedByMetric(
      entityType as EntityType,
      aggregation,
      metric,
      sort,
      limit,
      cursor,
    );

    return c.json({ entityType, aggregation, metric, ...result });
  };

  public getAggregate = async (c: Context) => {
    const raw = {
      ...c.req.query(),
      entityType: c.req.param('entityType'),
      ids: (c.req.query('ids') ?? '').split(',').filter(Boolean),
    };
    const parsed = getStatsAggregateQuerySchema.safeParse(raw);
    if (!parsed.success) {
      throw new HTTPException(400, { message: 'Invalid aggregate query params' });
    }

    const { entityType, aggregation, ids } = parsed.data;
    const metrics = await statsQueryService.getAggregateMetrics(entityType, aggregation, ids);
    return c.json({ entityType, aggregation, metrics });
  };

  public getAggregateTimeSeries = async (c: Context) => {
    const raw = { ...c.req.query(), entityType: c.req.param('entityType') };
    const parsed = getStatsAggregateTimeSeriesQuerySchema.safeParse(raw);
    if (!parsed.success) {
      throw new HTTPException(400, { message: 'Invalid aggregate timeseries query params' });
    }

    const now = new Date();
    const { date, week, month } = getTimeWindows(now);
    const aggregation = parsed.data.aggregation;
    let from = parsed.data.from;
    let to = parsed.data.to;

    if (!from || !to) {
      if (aggregation === 'weekly') {
        const keys = backWeeks(12, week);
        from = keys[0];
        to = week;
      } else if (aggregation === 'daily') {
        const keys = shiftDateKeys(30, date);
        from = keys[0];
        to = date;
      } else {
        const keys = shiftDateKeys(12, `${month}-01`);
        from = keys[0];
        to = month;
      }
    }

    const series = await statsQueryService.getAggregateTimeSeries(
      parsed.data.entityType as EntityType,
      aggregation as 'daily' | 'weekly' | 'monthly',
      from,
      to,
    );

    return c.json({ entityType: parsed.data.entityType, aggregation, from, to, series });
  };

  public getSettings = async (c: Context) => {
    return c.json({ success: true, data: await statsSyncSettingsService.getSettings() });
  };

  public updateSettings = async (c: Context) => {
    const parsed = updateProductStatsSettingsSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      throw new HTTPException(400, { message: 'Invalid settings body' });
    }
    const settings = await statsSyncSettingsService.update(parsed.data);
    return c.json({ success: true, data: settings });
  };

  public triggerDenormalization = async (c: Context) => {
    await triggerProductStatsDenormalization(true, this.eventBus);
    return c.json({ success: true, data: { accepted: true } }, 202);
  };

  public getHealth = (c: Context) => {
    return c.json({ pendingInBuffer: statsBufferService.pendingCount });
  };

  private requireParam(c: Context, key: string): string {
    const value = c.req.param(key);
    if (!value) {
      throw new HTTPException(400, { message: `Missing required path parameter: ${key}` });
    }
    return value;
  }
}
