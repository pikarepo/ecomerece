import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { vendorMiddleware } from '../../../middleware/vendor';
import type { createOrderItemsApplication } from '../order-items.module';

type OrderItemsController = ReturnType<typeof createOrderItemsApplication>['orderItemsController'];

/**
 * Path convention: scope (`my` | `vendor` | `admin`), then `all` or `:id`,
 * then the command.
 */
export function createOrderItemsRoutes(orderItemsController: OrderItemsController) {
  const OrderItemsRoutes = new Hono();

  // Buyer
  OrderItemsRoutes.get(
    '/my/order/:orderId',
    authMiddleware,
    orderItemsController.getMyOrderItemsByOrderId,
  );
  OrderItemsRoutes.post('/my/cancel', authMiddleware, orderItemsController.cancelMyOrderItems);

  // Vendor
  OrderItemsRoutes.get(
    '/vendor/all',
    authMiddleware,
    vendorMiddleware,
    orderItemsController.getVendorPaginatedOrderItems,
  );
  OrderItemsRoutes.get(
    '/vendor/:id',
    authMiddleware,
    vendorMiddleware,
    orderItemsController.getVendorOrderItemById,
  );
  OrderItemsRoutes.patch(
    '/vendor/:id',
    authMiddleware,
    vendorMiddleware,
    orderItemsController.updateVendorOrderItem,
  );
  OrderItemsRoutes.post(
    '/vendor/:id/confirm',
    authMiddleware,
    vendorMiddleware,
    orderItemsController.vendorConfirmOrderItem,
  );
  OrderItemsRoutes.post(
    '/vendor/:id/complete',
    authMiddleware,
    vendorMiddleware,
    orderItemsController.vendorCompleteOrderItem,
  );
  OrderItemsRoutes.post(
    '/vendor/:id/return',
    authMiddleware,
    vendorMiddleware,
    orderItemsController.vendorReturnOrderItem,
  );
  OrderItemsRoutes.post(
    '/vendor/:id/refund',
    authMiddleware,
    vendorMiddleware,
    orderItemsController.vendorRefundOrderItem,
  );

  // Admin
  OrderItemsRoutes.get(
    '/admin/all',
    authMiddleware,
    adminMiddleware,
    orderItemsController.getAdminPaginatedOrderItems,
  );
  OrderItemsRoutes.get(
    '/admin/:id',
    authMiddleware,
    adminMiddleware,
    orderItemsController.getOrderItemById,
  );
  OrderItemsRoutes.patch(
    '/admin/:id',
    authMiddleware,
    adminMiddleware,
    orderItemsController.updateOrderItem,
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

  return OrderItemsRoutes;
}
