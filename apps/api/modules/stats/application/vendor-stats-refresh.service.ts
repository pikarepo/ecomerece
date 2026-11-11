import { getTimeWindows } from '@ecomerece/domain';
import type { Metrics, StatEvent } from '@ecomerece/shared';
import { connectDB } from '../../../lib/mongo';
import { statsRepository } from '../infrastructure/StatsRepository';

const SERIES_AGGREGATIONS = ['daily', 'weekly', 'monthly'] as const;
export type SeriesAggregation = (typeof SERIES_AGGREGATIONS)[number];

export interface VendorStatsRefreshDeps {
  connectDB: () => Promise<unknown>;
  loadVendorProducts: (vendorId: string) => Promise<{ id: string; categoryId: string }[]>;
  loadProductsByCategory: (categoryIds: string[]) => Promise<{ id: string; categoryId: string }[]>;
  getLifetimeMetricsForProducts: (productIds: string[]) => Promise<Metrics>;
  getSeriesForProducts: (
    productIds: string[],
    aggregation: SeriesAggregation,
    to: string,
  ) => Promise<{ key: string; metrics: Metrics }[]>;
  setVendorStats: (vendorId: string, metrics: Metrics) => Promise<void>;
  setStats: (events: StatEvent[]) => Promise<void>;
}

/**
 * Denormalizes a single vendor's stats. Mirrors the category rollup (lifetime +
 * daily/weekly/monthly series written into the raw Stats collection with
 * idempotent `$set` writes) plus the product pattern (lifetime metrics embedded
 * onto the Vendor document so vendor listings / dashboards never join against
 * per-product docs). Re-runs never double count.
 *
 * `refreshVendorCore` only touches the vendor's own data (used by the global
 * auto-sync pipeline, where the category handler already rolls categories up).
 * `refreshVendorData` additionally re-rolls the categories this vendor sells in
 * (used by the vendor force-refresh button, which only refreshes this vendor).
 */
export class VendorStatsRefreshService {
  private readonly deps: VendorStatsRefreshDeps;

  constructor(deps: Partial<VendorStatsRefreshDeps> = {}) {
    this.deps = { ...VendorStatsRefreshService.defaultDeps(), ...deps };
  }

  private static defaultDeps(): VendorStatsRefreshDeps {
    return {
      connectDB,
      loadVendorProducts: async () => {
        throw new Error('loadVendorProducts dependency is required');
      },
      loadProductsByCategory: async () => {
        throw new Error('loadProductsByCategory dependency is required');
      },
      getLifetimeMetricsForProducts: (productIds) =>
        statsRepository.getAggregateMetrics('product', 'lifetime', productIds),
      getSeriesForProducts: async (productIds, aggregation, to) => {
        const dimensionField =
          aggregation === 'weekly' ? 'week' : aggregation === 'monthly' ? 'month' : 'date';
        const from =
          aggregation === 'weekly'
            ? '0000-W01'
            : aggregation === 'monthly'
              ? '0000-01'
              : '0000-01-01';
        return statsRepository.getAggregateTimeSeriesForIds(
          'product',
          productIds,
          aggregation,
          dimensionField,
          from,
          to,
        );
      },
      setVendorStats: async () => {
        throw new Error('setVendorStats dependency is required');
      },
      setStats: (events) => statsRepository.bulkSet(events),
    };
  }

  /** Refreshes a single vendor: embedded stats + vendor rollup slots. No categories. */
  async refreshVendorCore(vendorId: string): Promise<void> {
    const products = await this.deps.loadVendorProducts(vendorId);
    if (products.length === 0) return;

    const productIds = products.map((p) => p.id);
    const lifetime = await this.deps.getLifetimeMetricsForProducts(productIds);

    await this.deps.setVendorStats(vendorId, lifetime);

    const now = new Date();
    const { date, week, month } = getTimeWindows(now);

    const writes: StatEvent[] = [
      {
        entity: { type: 'vendor', id: vendorId },
        aggregation: 'lifetime',
        dimensions: {},
        metrics: lifetime,
      },
    ];

    for (const aggregation of SERIES_AGGREGATIONS) {
      const to = aggregation === 'weekly' ? week : aggregation === 'monthly' ? month : date;
      const points = await this.deps.getSeriesForProducts(productIds, aggregation, to);
      for (const point of points) {
        writes.push({
          entity: { type: 'vendor', id: vendorId },
          aggregation,
          dimensions:
            aggregation === 'weekly'
              ? { week: point.key }
              : aggregation === 'monthly'
                ? { month: point.key }
                : { date: point.key },
          metrics: point.metrics,
        });
      }
    }

    await this.deps.setStats(writes);
  }

  /** Re-rolls a fixed set of categories (all their products, not just one vendor's). */
  async refreshCategories(categoryIds: string[]): Promise<void> {
    if (categoryIds.length === 0) return;

    const products = await this.deps.loadProductsByCategory(categoryIds);
    if (products.length === 0) return;

    const productIdsByCategory = new Map<string, string[]>();
    for (const product of products) {
      const bucket = productIdsByCategory.get(product.categoryId) ?? [];
      bucket.push(product.id);
      productIdsByCategory.set(product.categoryId, bucket);
    }

    const now = new Date();
    const { date, week, month } = getTimeWindows(now);

    const writes: StatEvent[] = [];

    for (const [categoryId, productIds] of productIdsByCategory) {
      writes.push({
        entity: { type: 'category', id: categoryId },
        aggregation: 'lifetime',
        dimensions: {},
        metrics: await this.deps.getLifetimeMetricsForProducts(productIds),
      });

      for (const aggregation of SERIES_AGGREGATIONS) {
        const to = aggregation === 'weekly' ? week : aggregation === 'monthly' ? month : date;
        const points = await this.deps.getSeriesForProducts(productIds, aggregation, to);
        for (const point of points) {
          writes.push({
            entity: { type: 'category', id: categoryId },
            aggregation,
            dimensions:
              aggregation === 'weekly'
                ? { week: point.key }
                : aggregation === 'monthly'
                  ? { month: point.key }
                  : { date: point.key },
            metrics: point.metrics,
          });
        }
      }
    }

    await this.deps.setStats(writes);
  }

  /** Full vendor scoped refresh: vendor data + the categories it sells in. */
  async refreshVendorData(vendorId: string): Promise<void> {
    await this.deps.connectDB();
    const products = await this.deps.loadVendorProducts(vendorId);
    if (products.length === 0) return;

    await this.refreshVendorCore(vendorId);

    const categoryIds = [...new Set(products.map((p) => p.categoryId))];
    await this.refreshCategories(categoryIds);
  }
}


