import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import type { PaymentsController } from './payments.controller';

export function createPaymentsRoutes(controller: PaymentsController) {
  const routes = new Hono();

  // Webhook (provider callback) - no auth, verified by adapter if supported
  routes.post('/webhook/:provider', controller.webhook);

  // Buyer
  routes.post('/my', authMiddleware, controller.createMyPayment);
  routes.get('/my/all', authMiddleware, controller.getMyPayments);
  routes.get('/my/:id', authMiddleware, controller.getMyPaymentById);
  routes.post('/my/:id/authorize', authMiddleware, controller.authorizePayment);
  routes.post('/my/:id/capture', authMiddleware, controller.capturePayment);
  routes.post('/my/:id/cancel', authMiddleware, controller.cancelPayment);

  // Admin
  routes.get('/admin/all', authMiddleware, adminMiddleware, controller.getAdminPayments);
  routes.get('/admin/:id', authMiddleware, adminMiddleware, controller.getAdminPaymentById);
  routes.post('/admin/:id/refund', authMiddleware, adminMiddleware, controller.refundAdminPayment);

  return routes;
}
