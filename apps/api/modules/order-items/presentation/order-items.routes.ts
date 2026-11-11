import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import type { createOrderItemsModule } from '../order-items.module';

type OrderItemsController = ReturnType<typeof createOrderItemsModule>['orderItemsController'];

export function createOrderItemsRoutes(orderItemsController: OrderItemsController) {
  const OrderItemsRoutes = new Hono();

  OrderItemsRoutes.get(
    '/admin/all',
    authMiddleware,
    adminMiddleware,
    orderItemsController.getAdminPaginatedOrderItems,
  );
  OrderItemsRoutes.get(
    '/order/:orderId',
    authMiddleware,
    orderItemsController.getMyOrderItemsByOrderId,
  );
  OrderItemsRoutes.post('/cancel/my', authMiddleware, orderItemsController.cancelMyOrderItems);

  OrderItemsRoutes.patch(
    '/admin/:id',
    authMiddleware,
    adminMiddleware,
    orderItemsController.updateOrderItem,
  );
  OrderItemsRoutes.post(
    '/admin/:id/confirm',
    authMiddleware,
    adminMiddleware,
    orderItemsController.confirmOrderItem,
  );
  OrderItemsRoutes.post(
    '/admin/:id/complete',
    authMiddleware,
    adminMiddleware,
    orderItemsController.completeOrderItem,
  );
  OrderItemsRoutes.post(
    '/admin/:id/return',
    authMiddleware,
    adminMiddleware,
    orderItemsController.returnOrderItem,
  );
  OrderItemsRoutes.post(
    '/admin/:id/refund',
    authMiddleware,
    adminMiddleware,
    orderItemsController.refundOrderItem,
  );

  OrderItemsRoutes.get('/:id', authMiddleware, orderItemsController.getOrderItemById);

  return OrderItemsRoutes;
}
