import {
  getTimeWindows,
  type IEvent,
  type IEventHandler,
  type ProductStatsDenormalizationRequestedEvent,
} from '@ecomerece/domain';
import type { Metrics, StatEvent } from '@ecomerece/shared';
import { connectDB } from '../../../../lib/mongo';
import { statsRepository } from '../../infrastructure/StatsRepository';

const SERIES_AGGREGATIONS = ['daily', 'weekly', 'monthly'] as const;
type SeriesAggregation = (typeof SERIES_AGGREGATIONS)[number];

interface CategoryRollupDeps {
  connectDB: () => Promise<unknown>;
  loadProducts: () => Promise<{ id: string; categoryId: string }[]>;
  getLifetimeMetricsForProducts: (productIds: string[]) => Promise<Metrics>;
  getSeriesForProducts: (
    productIds: string[],
    aggregation: SeriesAggregation,
    to: string,
  ) => Promise<{ key: string; metrics: Metrics }[]>;
  setStats: (events: StatEvent[]) => Promise<void>;
}

/**
 * Denormalized category stats: roll every product's raw stat documents up to its
 * category, so the category read path (rankings, overview, time series) never
 * joins against per-product docs. Runs on the same `stats.product-
 * denormalization-requested` event as the product roll-up, so the existing
 * scheduler tick and the admin "Run data correction" action both refresh
 * category stats. Uses idempotent `$set` writes — re-runs never double count.
 */
export class CategoryStatsDenormalizationHandler
  implements IEventHandler<ProductStatsDenormalizationRequestedEvent['payload']>
{
  private readonly deps: CategoryRollupDeps;

  constructor(deps: Partial<CategoryRollupDeps> = {}) {
    this.deps = { ...CategoryStatsDenormalizationHandler.defaultDeps(), ...deps };
  }

  private static defaultDeps(): CategoryRollupDeps {
    return {
      connectDB,
      loadProducts: async () => {
        throw new Error('loadProducts dependency is required');
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
      setStats: (events) => statsRepository.bulkSet(events),
    };
  }

  async handle(event: IEvent<{ force: boolean }>): Promise<void> {
    // Categories are global (not vendor-scoped), so the vendor opt-out /
    // `force` flag does not apply here — include every non-deleted product.
    void event.payload.force;

    // Background scheduler tick, outside any HTTP request — ensure the lazy
    // per-request connection exists or Mongoose buffers past `bufferTimeoutMS`.
    await this.deps.connectDB();

    const products = await this.deps.loadProducts();
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
}
