import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createStatsAccessGuardMiddleware } from '../../../middleware/statsAccessGuard.middleware';
import { createStatsViewGuardMiddleware } from '../../../middleware/statsViewGuard.middleware';
import type { CreateStatsModule } from '../stats.module';

type StatsController = ReturnType<typeof CreateStatsModule>['statsController'];

export function createStatsRoutes(statsController: StatsController) {
  const statsRouter = new Hono();

statsRouter.post(
  '/products/:productId/view',
  createStatsViewGuardMiddleware('product', 'productId'),
  statsController.recordProductView,
);
statsRouter.post('/products/:productId/click', statsController.recordProductClick);
statsRouter.post(
  '/categories/:categoryId/view',
  createStatsViewGuardMiddleware('category', 'categoryId'),
  statsController.recordCategoryView,
);
statsRouter.post(
  '/pages/:pageKey/view',
  createStatsViewGuardMiddleware('page', 'pageKey'),
  statsController.recordPageView,
);

statsRouter.get('/settings', authMiddleware, adminMiddleware, statsController.getSettings);
statsRouter.patch('/settings', authMiddleware, adminMiddleware, statsController.updateSettings);
statsRouter.post(
  '/denormalize',
  authMiddleware,
  adminMiddleware,
  statsController.triggerDenormalization,
);

statsRouter.get(
  '/:entityType/aggregate/timeseries',
  authMiddleware,
  adminMiddleware,
  statsController.getAggregateTimeSeries,
);
statsRouter.get(
  '/:entityType/aggregate',
  authMiddleware,
  adminMiddleware,
  statsController.getAggregate,
);
statsRouter.get(
  '/:entityType/paginated',
  authMiddleware,
  adminMiddleware,
  statsController.getPaginatedEntityStats,
);
statsRouter.get(
  '/product/:entityId/overview',
  authMiddleware,
  createStatsAccessGuardMiddleware({
    mode: 'throw',
    productOnly: true,
    entityIdParam: 'entityId',
  }),
  statsController.getProductStatsOverview,
);

statsRouter.get(
  '/category/:entityId/overview',
  authMiddleware,
  adminMiddleware,
  statsController.getCategoryStatsOverview,
);

statsRouter.get(
  '/vendor/:entityId/overview',
  authMiddleware,
  createStatsAccessGuardMiddleware({
    mode: 'mask',
    vendorOnly: true,
    entityIdParam: 'entityId',
  }),
  statsController.getVendorStatsOverview,
);

// Vendor-triggered force refresh (quota-limited). Only refreshes this vendor's
// data — products, vendor roll-up, and the categories it sells in.
statsRouter.get(
  '/vendor/force-update/usage',
  authMiddleware,
  statsController.getVendorForceRefreshUsage,
);
statsRouter.post('/vendor/force-update', authMiddleware, statsController.forceRefreshMyVendorStats);

statsRouter.get(
  '/:entityType/:entityId/lifetime',
  authMiddleware,
  createStatsAccessGuardMiddleware({
    mode: 'mask',
    entityTypeParam: 'entityType',
    entityIdParam: 'entityId',
  }),
  statsController.getLifetimeStats,
);
statsRouter.get(
  '/:entityType/:entityId/timeseries',
  authMiddleware,
  createStatsAccessGuardMiddleware({
    mode: 'mask',
    entityTypeParam: 'entityType',
    entityIdParam: 'entityId',
  }),
  statsController.getTimeSeries,
);
statsRouter.get(
  '/:entityType/top',
  authMiddleware,
  adminMiddleware,
  statsController.getTopEntities,
);

statsRouter.get('/_health', statsController.getHealth);

  return statsRouter;
}
