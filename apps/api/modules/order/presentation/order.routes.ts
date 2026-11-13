import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import type { createOrder } from '../order.module';

type OrderController = ReturnType<typeof createOrder>['orderController'];

export function createOrderRoutes(orderController: OrderController) {
  const OrderRoutes = new Hono();

OrderRoutes.post('/create/my', authMiddleware, orderController.createMyOrder);
OrderRoutes.get('/my', authMiddleware, orderController.getMyOrders);
OrderRoutes.get(
  '/admin/all',
  authMiddleware,
  adminMiddleware,
  orderController.getAdminPaginatedOrders,
);
OrderRoutes.get(
  '/admin/:id',
  authMiddleware,
  adminMiddleware,
  orderController.getAdminOrderById,
);
OrderRoutes.patch('/admin/:id', authMiddleware, adminMiddleware, orderController.updateOrder);
OrderRoutes.delete('/admin/:id', authMiddleware, adminMiddleware, orderController.deleteOrder);
OrderRoutes.patch(
  '/admin/:id/recover',
  authMiddleware,
  adminMiddleware,
  orderController.recoverOrder,
);
OrderRoutes.post(
  '/admin/:id/confirm',
  authMiddleware,
  adminMiddleware,
  orderController.confirmOrder,
);
OrderRoutes.post(
  '/admin/:id/complete',
  authMiddleware,
  adminMiddleware,
  orderController.completeOrder,
);
OrderRoutes.post(
  '/admin/:id/return',
  authMiddleware,
  adminMiddleware,
  orderController.returnOrder,
);
OrderRoutes.post(
  '/admin/:id/refund',
  authMiddleware,
  adminMiddleware,
  orderController.refundOrder,
);
OrderRoutes.post('/cancel/my/:id', authMiddleware, orderController.cancelMyOrder);
OrderRoutes.post(
  '/retry-items/my/:id',
  authMiddleware,
  orderController.retryMyOrderItems,
);
OrderRoutes.post(
  '/retry-item/my/:id',
  authMiddleware,
  orderController.retryMyOrderItem,
);
OrderRoutes.get('/:id', authMiddleware, orderController.getMyOrderById);

  return OrderRoutes;
}
