import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import type { CartController } from './cart.controller';

export function createCartRoutes(cartController: CartController) {
  const CartRoutes = new Hono();

  CartRoutes.get('/', authMiddleware, cartController.getMyCart);
  CartRoutes.post('/init', authMiddleware, cartController.initMyCart);
  CartRoutes.post('/items', authMiddleware, cartController.addItem);
  CartRoutes.post('/checkout', authMiddleware, cartController.checkoutItems);
  // Buyers have no delete: only an admin may remove a cart.
  CartRoutes.delete('/admin/:id', authMiddleware, adminMiddleware, cartController.deleteCart);

  return CartRoutes;
}
