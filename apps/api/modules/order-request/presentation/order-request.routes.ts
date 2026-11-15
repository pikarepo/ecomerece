import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { vendorMiddleware } from '../../../middleware/vendor';
import type { OrderRequestController } from './order-request.controller';

export function createOrderRequestRoutes(controller: OrderRequestController) {
  const routes = new Hono();

  routes.post('/my', authMiddleware, controller.createMyOrderRequest);
  routes.get('/my/all', authMiddleware, controller.getMyOrderRequests);
  routes.get('/my/:id', authMiddleware, controller.getMyOrderRequestById);
  routes.patch('/my/:id/cancel', authMiddleware, controller.cancelMyOrderRequest);

  routes.get('/vendor/all', authMiddleware, vendorMiddleware, controller.getVendorOrderRequests);
  routes.get('/vendor/:id', authMiddleware, vendorMiddleware, controller.getVendorOrderRequestById);
  routes.post(
    '/vendor/:id/accept',
    authMiddleware,
    vendorMiddleware,
    controller.acceptVendorOrderRequest,
  );
  routes.post(
    '/vendor/:id/reject',
    authMiddleware,
    vendorMiddleware,
    controller.rejectVendorOrderRequest,
  );

  routes.get('/admin/all', authMiddleware, adminMiddleware, controller.getAdminOrderRequests);
  routes.get('/admin/:id', authMiddleware, adminMiddleware, controller.getAdminOrderRequestById);
  routes.post(
    '/admin/:id/accept',
    authMiddleware,
    adminMiddleware,
    controller.acceptAdminOrderRequest,
  );
  routes.post(
    '/admin/:id/reject',
    authMiddleware,
    adminMiddleware,
    controller.rejectAdminOrderRequest,
  );
  routes.post(
    '/admin/:id/cancel',
    authMiddleware,
    adminMiddleware,
    controller.cancelAdminOrderRequest,
  );

  return routes;
}
