import type {
  IEvent,
  IEventHandler,
  ProductStatsDenormalizationRequestedEvent,
} from '@ecomerece/domain';
import { emptyMetrics, type Metrics } from '@ecomerece/shared';
import { connectDB } from '../../../../lib/mongo';
import { statsRepository } from '../../infrastructure/StatsRepository';

export interface ProductStatsDenormalizationDeps {
  listVendorIds: () => Promise<string[]>;
  listVendorProductIds: (vendorId: string) => Promise<string[]>;
  applyProductStats: (
    updates: { productId: string; metrics: Record<string, number> }[],
  ) => Promise<void>;
}

/**
 * Event-driven denormalization of lifetime metrics onto product documents so the
 * product read path (listings, top-products) never joins against the raw stats
 * collection. Vendors are processed one-by-one to spread load. Every non-deleted
 * vendor is refreshed on every run regardless of the legacy `statsRefreshEnabled`
 * flag, so dashboards never go stale over long idle windows (the admin "force"
 * correction and the vendor force-refresh button re-use this same pipeline).
 */
export class ProductStatsDenormalizationHandler
  implements IEventHandler<ProductStatsDenormalizationRequestedEvent['payload']> {
  constructor(private readonly deps: ProductStatsDenormalizationDeps) {}

  async handle(event: IEvent<ProductStatsDenormalizationRequestedEvent['payload']>): Promise<void> {
    void event.payload.force;

    // This pipeline runs from a background scheduler tick, outside any HTTP
    // request, so the lazy per-request `dbMiddleware` connection may never have
    // been established. Ensure it here or Mongoose buffers the first query for
    // `bufferTimeoutMS` (10s) and then throws a buffering timeout.
    await connectDB();

    const vendors = await this.deps.listVendorIds();

    for (const vendorId of vendors) {
      const productIds = await this.deps.listVendorProductIds(vendorId);
      if (productIds.length === 0) continue;

      const lifetimeDocs = await statsRepository.getLifetimeDocs('product', productIds);
      const statsByProduct = new Map<string, Metrics>(
        lifetimeDocs.map((doc) => [
          doc.entity?.id ?? '',
          { ...emptyMetrics(), ...((doc.metrics ?? {}) as Partial<Metrics>) },
        ]),
      );

      await this.deps.applyProductStats(
        productIds.map((productId) => ({
          productId,
          metrics: statsByProduct.get(productId) ?? emptyMetrics(),
        })),
      );
    }
  }
}
