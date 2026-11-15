import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import type { CartController } from './cart.controller';

export function createCartRoutes(cartController: CartController) {
  const CartRoutes = new Hono();

  // Buyer
  CartRoutes.get('/my', authMiddleware, cartController.getMyCart);
  CartRoutes.post('/my', authMiddleware, cartController.initMyCart);
  CartRoutes.post('/my/items', authMiddleware, cartController.addItem);
  CartRoutes.post('/my/checkout', authMiddleware, cartController.checkoutItems);

  // Admin — buyers have no delete of their own.
  CartRoutes.delete('/admin/:id', authMiddleware, adminMiddleware, cartController.deleteCart);

  return CartRoutes;
}
