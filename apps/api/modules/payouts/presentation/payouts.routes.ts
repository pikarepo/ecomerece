import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import type { PayoutsController } from './payouts.controller';

export function createPayoutsRoutes(controller: PayoutsController) {
  const routes = new Hono();
  // Vendor (self)
  routes.get('/vendor/me/balance', authMiddleware, controller.getMyBalance);
  routes.get('/vendor/me/ledger', authMiddleware, controller.getMyLedger);
  routes.get('/vendor/me/all', authMiddleware, controller.getMyPayouts);
  routes.post('/vendor/me', authMiddleware, controller.requestPayout);

  // Admin
  routes.get('/admin/all', authMiddleware, adminMiddleware, controller.getAdminPayouts);
  routes.get(
    '/admin/vendor/:vendorId/balance',
    authMiddleware,
    adminMiddleware,
    controller.getAdminBalance,
  );
  routes.post('/admin/:id/approve', authMiddleware, adminMiddleware, controller.approvePayout);
  routes.post('/admin/:id/mark-paid', authMiddleware, adminMiddleware, controller.markPaid);
  routes.post('/admin/:id/fail', authMiddleware, adminMiddleware, controller.failPayout);
  routes.post('/admin/:id/cancel', authMiddleware, adminMiddleware, controller.cancelAdminPayout);
  return routes;
}
