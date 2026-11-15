import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { vendorMiddleware } from '../../../middleware/vendor';
import { createStatsAccessGuardMiddleware } from '../../../middleware/statsAccessGuard.middleware';
import { createStatsViewGuardMiddleware } from '../../../middleware/statsViewGuard.middleware';
import type { CreateStatsModule } from '../stats.module';

type StatsController = ReturnType<typeof CreateStatsModule>['statsController'];

/**
 * Tracking beacons are public, admin reporting lives under `/admin`, and the
 * vendor's own reporting lives under `/vendor`. The per-entity lifetime and
 * time-series reads stay audience-aware: the access guard masks or rejects
 * based on the caller, so one route can safely serve admins and owners.
 */
export function createStatsRoutes(statsController: StatsController) {
  const statsRouter = new Hono();

  // Public beacons
  statsRouter.post(
    '/public/products/:productId/view',
    createStatsViewGuardMiddleware('product', 'productId'),
    statsController.recordProductView,
  );
  statsRouter.post('/public/products/:productId/click', statsController.recordProductClick);
  statsRouter.post(
    '/public/categories/:categoryId/view',
    createStatsViewGuardMiddleware('category', 'categoryId'),
    statsController.recordCategoryView,
  );
  statsRouter.post(
    '/public/pages/:pageKey/view',
    createStatsViewGuardMiddleware('page', 'pageKey'),
    statsController.recordPageView,
  );

  // Admin
  statsRouter.get('/admin/settings', authMiddleware, adminMiddleware, statsController.getSettings);
  statsRouter.patch(
    '/admin/settings',
    authMiddleware,
    adminMiddleware,
    statsController.updateSettings,
  );
  statsRouter.post(
    '/admin/denormalize',
    authMiddleware,
    adminMiddleware,
    statsController.triggerDenormalization,
  );
  statsRouter.get(
    '/admin/aggregate/:entityType',
    authMiddleware,
    adminMiddleware,
    statsController.getAggregate,
  );
  statsRouter.get(
    '/admin/aggregate/:entityType/timeseries',
    authMiddleware,
    adminMiddleware,
    statsController.getAggregateTimeSeries,
  );
  statsRouter.get(
    '/admin/:entityType/paginated',
    authMiddleware,
    adminMiddleware,
    statsController.getPaginatedEntityStats,
  );
  statsRouter.get(
    '/admin/:entityType/top',
    authMiddleware,
    adminMiddleware,
    statsController.getTopEntities,
  );
  statsRouter.get(
    '/admin/product/:entityId/overview',
    authMiddleware,
    adminMiddleware,
    statsController.getProductStatsOverview,
  );
  statsRouter.get(
    '/admin/category/:entityId/overview',
    authMiddleware,
    adminMiddleware,
    statsController.getCategoryStatsOverview,
  );

  // Vendor
  statsRouter.get(
    '/admin/vendor/:entityId/overview',
    authMiddleware,
    adminMiddleware,
    createStatsAccessGuardMiddleware({ mode: 'mask', vendorOnly: true, entityIdParam: 'entityId' }),
    statsController.getVendorStatsOverview,
  );
  statsRouter.get(
    '/vendor/me/overview',
    authMiddleware,
    vendorMiddleware,
    statsController.getMyVendorStatsOverview,
  );
  statsRouter.get(
    '/vendor/me/force-update/usage',
    authMiddleware,
    vendorMiddleware,
    statsController.getVendorForceRefreshUsage,
  );
  statsRouter.post(
    '/vendor/me/force-update',
    authMiddleware,
    vendorMiddleware,
    statsController.forceRefreshMyVendorStats,
  );

  // Owner-or-admin reads, masked per caller by the access guard.
  statsRouter.get(
    '/entity/:entityType/:entityId/lifetime',
    authMiddleware,
    createStatsAccessGuardMiddleware({
      mode: 'mask',
      entityTypeParam: 'entityType',
      entityIdParam: 'entityId',
    }),
    statsController.getLifetimeStats,
  );
  statsRouter.get(
    '/entity/:entityType/:entityId/timeseries',
    authMiddleware,
    createStatsAccessGuardMiddleware({
      mode: 'mask',
      entityTypeParam: 'entityType',
      entityIdParam: 'entityId',
    }),
    statsController.getTimeSeries,
  );

  statsRouter.get('/_health', statsController.getHealth);

  return statsRouter;
}
