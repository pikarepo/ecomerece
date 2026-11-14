import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import type { createOrderItemsApplication } from '../order-items.module';

type OrderItemsController = ReturnType<typeof createOrderItemsApplication>['orderItemsController'];

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

  OrderItemsRoutes.get(
    '/vendor/all',
    authMiddleware,
    orderItemsController.getVendorPaginatedOrderItems,
  );
  OrderItemsRoutes.get('/vendor/:id', authMiddleware, orderItemsController.getVendorOrderItemById);
  OrderItemsRoutes.patch('/vendor/:id', authMiddleware, orderItemsController.updateVendorOrderItem);
  OrderItemsRoutes.post(
    '/vendor/:id/confirm',
    authMiddleware,
    orderItemsController.vendorConfirmOrderItem,
  );
  OrderItemsRoutes.post(
    '/vendor/:id/complete',
    authMiddleware,
    orderItemsController.vendorCompleteOrderItem,
  );
  OrderItemsRoutes.post(
    '/vendor/:id/return',
    authMiddleware,
    orderItemsController.vendorReturnOrderItem,
  );
  OrderItemsRoutes.post(
    '/vendor/:id/refund',
    authMiddleware,
    orderItemsController.vendorRefundOrderItem,
  );

  OrderItemsRoutes.delete(
    '/admin/:id',
    authMiddleware,
    adminMiddleware,
    orderItemsController.deleteOrderItem,
  );
  OrderItemsRoutes.post(
    '/admin/:id/recover',
    authMiddleware,
    adminMiddleware,
    orderItemsController.recoverOrderItem,
  );

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

  OrderItemsRoutes.get(
    '/:id',
    authMiddleware,
    adminMiddleware,
    orderItemsController.getOrderItemById,
  );

  return OrderItemsRoutes;
}
