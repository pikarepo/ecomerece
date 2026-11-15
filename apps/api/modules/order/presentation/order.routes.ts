import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { vendorMiddleware } from '../../../middleware/vendor';
import type { createOrder } from '../order.module';

type OrderController = ReturnType<typeof createOrder>['orderController'];

/**
 * Path convention: scope (`my` | `vendor` | `admin`), then `all` or `:id`,
 * then the command. No route is shared between audiences.
 */
export function createOrderRoutes(orderController: OrderController) {
  const OrderRoutes = new Hono();

  // Buyer
  OrderRoutes.get('/my', authMiddleware, orderController.getMyOrders);
  OrderRoutes.post('/my', authMiddleware, orderController.createMyOrder);
  OrderRoutes.post('/my/buy-now', authMiddleware, orderController.buyNow);
  OrderRoutes.get('/my/:id', authMiddleware, orderController.getMyOrderById);
  OrderRoutes.post('/my/:id/cancel', authMiddleware, orderController.cancelMyOrder);
  OrderRoutes.post('/my/:id/retry-items', authMiddleware, orderController.retryMyOrderItems);
  OrderRoutes.post('/my/:id/retry-item', authMiddleware, orderController.retryMyOrderItem);

  // Vendor
  OrderRoutes.get(
    '/vendor/all',
    authMiddleware,
    vendorMiddleware,
    orderController.getVendorPaginatedOrders,
  );
  OrderRoutes.get(
    '/vendor/:id',
    authMiddleware,
    vendorMiddleware,
    orderController.getVendorOrderById,
  );
  OrderRoutes.post(
    '/vendor/:id/confirm',
    authMiddleware,
    vendorMiddleware,
    orderController.confirmOrder,
  );
  OrderRoutes.post(
    '/vendor/:id/complete',
    authMiddleware,
    vendorMiddleware,
    orderController.completeOrder,
  );
  OrderRoutes.post(
    '/vendor/:id/return',
    authMiddleware,
    vendorMiddleware,
    orderController.returnOrder,
  );
  OrderRoutes.post(
    '/vendor/:id/refund',
    authMiddleware,
    vendorMiddleware,
    orderController.refundOrder,
  );

  // Admin
  OrderRoutes.get(
    '/admin/all',
    authMiddleware,
    adminMiddleware,
    orderController.getAdminPaginatedOrders,
  );
  OrderRoutes.get('/admin/:id', authMiddleware, adminMiddleware, orderController.getAdminOrderById);
  OrderRoutes.patch('/admin/:id', authMiddleware, adminMiddleware, orderController.updateOrder);
  OrderRoutes.delete('/admin/:id', authMiddleware, adminMiddleware, orderController.deleteOrder);
  OrderRoutes.patch(
    '/admin/:id/recover',
    authMiddleware,
    adminMiddleware,
    orderController.recoverOrder,
  );
  OrderRoutes.post(
    '/admin/:id/cancel',
    authMiddleware,
    adminMiddleware,
    orderController.cancelAdminOrder,
  );
  OrderRoutes.post(
    '/admin/:id/confirm',
    authMiddleware,
    adminMiddleware,
    orderController.confirmAdminOrder,
  );
  OrderRoutes.post(
    '/admin/:id/complete',
    authMiddleware,
    adminMiddleware,
    orderController.completeAdminOrder,
  );
  OrderRoutes.post(
    '/admin/:id/return',
    authMiddleware,
    adminMiddleware,
    orderController.returnAdminOrder,
  );
  OrderRoutes.post(
    '/admin/:id/refund',
    authMiddleware,
    adminMiddleware,
    orderController.refundAdminOrder,
  );

  return OrderRoutes;
}
