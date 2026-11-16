import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import type { PromotionsController } from './promotions.controller';

export function createPromotionsRoutes(promotionsController: PromotionsController) {
  const PromotionRoutes = new Hono();

  // Buyer — preview only, no redemption.
  PromotionRoutes.post('/validate', authMiddleware, promotionsController.validateCoupon);

  // Admin
  PromotionRoutes.get(
    '/admin/all',
    authMiddleware,
    adminMiddleware,
    promotionsController.getAdminCoupons,
  );
  PromotionRoutes.post(
    '/admin',
    authMiddleware,
    adminMiddleware,
    promotionsController.createCoupon,
  );
  PromotionRoutes.get(
    '/admin/:id',
    authMiddleware,
    adminMiddleware,
    promotionsController.getAdminCouponById,
  );
  PromotionRoutes.patch(
    '/admin/:id',
    authMiddleware,
    adminMiddleware,
    promotionsController.updateCoupon,
  );
  PromotionRoutes.post(
    '/admin/:id/activate',
    authMiddleware,
    adminMiddleware,
    promotionsController.activateCoupon,
  );
  PromotionRoutes.post(
    '/admin/:id/deactivate',
    authMiddleware,
    adminMiddleware,
    promotionsController.deactivateCoupon,
  );
  PromotionRoutes.delete(
    '/admin/:id',
    authMiddleware,
    adminMiddleware,
    promotionsController.deleteCoupon,
  );
  PromotionRoutes.patch(
    '/admin/:id/recover',
    authMiddleware,
    adminMiddleware,
    promotionsController.recoverCoupon,
  );

  return PromotionRoutes;
}
