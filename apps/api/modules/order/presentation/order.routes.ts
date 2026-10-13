import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createOrder } from '../order.module';

export const OrderRoutes = new Hono();

const { orderController } = createOrder();

OrderRoutes.post('/create/my', authMiddleware, orderController.createMyOrder);
OrderRoutes.get('/my', authMiddleware, orderController.getMyOrders);
OrderRoutes.get(
  '/admin/all',
  authMiddleware,
  adminMiddleware,
  orderController.getAdminPaginatedOrders,
);
