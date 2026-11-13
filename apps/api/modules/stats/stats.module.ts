import type {
  IProductStatsProjector,
  IVendorQueries,
  IVendorStatsProjector,
} from '@ecomerece/contracts';
import type { Buses } from '../../core/infrastructure/buses/buses';
import { connectDB } from '../../lib/mongo';
import { CategoryStatsDenormalizationHandler } from './application/event-handlers/category-stats-denormalization.handler';
import { OrderItemCreatedStatsHandler } from './application/event-handlers/order-item-created.stats-handler';
import { ProductStatsDenormalizationHandler } from './application/event-handlers/product-stats-denormalization.handler';
import { VendorStatsDenormalizationHandler } from './application/event-handlers/vendor-stats-denormalization.handler';
import { VendorStatsForceRefreshHandler } from './application/event-handlers/vendor-stats-force-refresh.handler';
import { ProductStatsSyncScheduler } from './application/ProductStatsSyncScheduler';
import { statsQueryService } from './application/StatsQueryService';
import { VendorStatsRefreshService } from './application/vendor-stats-refresh.service';
import { StatsController } from './presentation/StatsController';

interface StatsModuleDeps extends Buses {
  productStats: IProductStatsProjector;
  vendorStats: IVendorStatsProjector;
  vendorQueries: IVendorQueries;
}

export function CreateStatsModule({
  eventBus,
  productStats,
  vendorStats,
  vendorQueries,
}: StatsModuleDeps) {
  const vendorStatsRefresh = new VendorStatsRefreshService({
    loadVendorProducts: (vendorId) => productStats.listVendorProducts(vendorId),
    loadProductsByCategory: (categoryIds) => productStats.listProductsByCategory(categoryIds),
    setVendorStats: (vendorId, metrics) => vendorStats.setVendorStats(vendorId, metrics),
  });

  eventBus.register('order-item.created', new OrderItemCreatedStatsHandler());
  eventBus.register(
    'stats.product-denormalization-requested',
    new ProductStatsDenormalizationHandler({
      listVendorIds: () => vendorStats.listVendorIds(),
      listVendorProductIds: (vendorId) => productStats.listVendorProductIds(vendorId),
      applyProductStats: (updates) => productStats.applyStats(updates),
    }),
  );
  eventBus.register(
    'stats.product-denormalization-requested',
    new CategoryStatsDenormalizationHandler({
      connectDB,
      loadProducts: () => productStats.listProductCategoryPairs(),
    }),
  );
  eventBus.register(
    'stats.product-denormalization-requested',
    new VendorStatsDenormalizationHandler({
      connectDB,
      loadVendors: async () =>
        (await vendorStats.listVendorIds()).map((id) => ({ id })),
      refreshVendorCore: (vendorId) => vendorStatsRefresh.refreshVendorCore(vendorId),
    }),
  );
  eventBus.register(
    'stats.vendor-force-refresh-requested',
    new VendorStatsForceRefreshHandler({
      connectDB,
      refreshVendorData: (vendorId) => vendorStatsRefresh.refreshVendorData(vendorId),
    }),
  );

  const statsController = new StatsController(vendorQueries, eventBus);
  const productStatsSyncScheduler = new ProductStatsSyncScheduler(eventBus);

  return { statsController, productStatsSyncScheduler };
}
