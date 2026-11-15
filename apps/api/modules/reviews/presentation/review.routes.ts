import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { vendorMiddleware } from '../../../middleware/vendor';
import type { createReviewModule } from '../review.module';

type ReviewController = ReturnType<typeof createReviewModule>['controller'];

/**
 * Public reads expose published reviews. Writes and interactions live under the
 * audience that performs them; vendor replies are scoped to the vendor's own
 * products by the application service.
 */
export function createReviewRoutes(controller: ReviewController) {
  const reviewRoutes = new Hono();

  // Public
  reviewRoutes.get('/', controller.getPaginatedReviews);
  reviewRoutes.get('/product/:id', controller.getReviewsByProductId);

  // Buyer
  reviewRoutes.get('/my', authMiddleware, controller.getMyPaginatedReviews);
  reviewRoutes.post('/my', authMiddleware, controller.create);
  reviewRoutes.patch('/my/:id', authMiddleware, controller.updateMyReview);
  reviewRoutes.delete('/my/:id', authMiddleware, controller.deleteMyReview);
  reviewRoutes.post('/my/:id/like', authMiddleware, controller.likeReview);
  reviewRoutes.post('/my/:id/dislike', authMiddleware, controller.dislikeReview);
  reviewRoutes.post('/my/:id/report', authMiddleware, controller.reportReview);

  // Vendor
  reviewRoutes.get(
    '/vendor/all',
    authMiddleware,
    vendorMiddleware,
    controller.getVendorPaginatedReviews,
  );
  reviewRoutes.post(
    '/vendor/:id/reply',
    authMiddleware,
    vendorMiddleware,
    controller.addVendorReply,
  );

  // Admin
  reviewRoutes.get(
    '/admin/all',
    authMiddleware,
    adminMiddleware,
    controller.getAdminPaginatedReviews,
  );
  reviewRoutes.patch('/admin/:id/block', authMiddleware, adminMiddleware, controller.blockReview);
  reviewRoutes.patch(
    '/admin/:id/unblock',
    authMiddleware,
    adminMiddleware,
    controller.unblockReview,
  );

  // Public detail last so the scoped routes match first.
  reviewRoutes.get('/:id', controller.getReviewById);

  return reviewRoutes;
}
