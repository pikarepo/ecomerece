import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import type { createOrder } from '../order.module';

type OrderController = ReturnType<typeof createOrder>['orderController'];

export function createOrderRoutes(orderController: OrderController) {
  const OrderRoutes = new Hono();

  OrderRoutes.post('/create/my', authMiddleware, orderController.createMyOrder);
  OrderRoutes.post('/create/buy-now', authMiddleware, orderController.buyNow);
  OrderRoutes.get('/my', authMiddleware, orderController.getMyOrders);
  OrderRoutes.get(
    '/admin/all',
    authMiddleware,
    adminMiddleware,
    orderController.getAdminPaginatedOrders,
  );
  OrderRoutes.get('/admin/:id', authMiddleware, adminMiddleware, orderController.getAdminOrderById);
  OrderRoutes.patch('/admin/:id', authMiddleware, adminMiddleware, orderController.updateOrder);
  OrderRoutes.delete('/admin/:id', authMiddleware, adminMiddleware, orderController.deleteOrder);
  OrderRoutes.patch('/admin/:id/recover', authMiddleware, adminMiddleware, orderController.recoverOrder);
  OrderRoutes.post('/vendor/:id/confirm', authMiddleware, orderController.confirmOrder);
  OrderRoutes.post(
    '/vendor/:id/complete',
    authMiddleware,
    orderController.completeOrder,
  );
  OrderRoutes.post(
    '/vendor/:id/return',
    authMiddleware,
    orderController.returnOrder,
  );
  OrderRoutes.post(
    '/vendor/:id/refund',
    authMiddleware,
    adminMiddleware,
    orderController.refundOrder,
  );
  OrderRoutes.get('/vendor/all', authMiddleware, orderController.getVendorPaginatedOrders);
  OrderRoutes.get('/vendor/:id', authMiddleware, orderController.getVendorOrderById);
  OrderRoutes.post(
    '/admin/:id/cancel',
    authMiddleware,
    adminMiddleware,
    orderController.cancelAdminOrder,
  );
  OrderRoutes.post('/cancel/my/:id', authMiddleware, orderController.cancelMyOrder);
  OrderRoutes.post('/retry-items/my/:id', authMiddleware, orderController.retryMyOrderItems);
  OrderRoutes.post('/retry-item/my/:id', authMiddleware, orderController.retryMyOrderItem);
  OrderRoutes.get('/my/:id', authMiddleware, orderController.getMyOrderById);

  return OrderRoutes;
}
