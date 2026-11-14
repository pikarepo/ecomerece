import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import type { createReviewModule } from '../review.module';

type ReviewController = ReturnType<typeof createReviewModule>['controller'];

export function createReviewRoutes(controller: ReviewController) {
  const reviewRoutes = new Hono();

  reviewRoutes.get('/', controller.getPaginatedReviews);
  reviewRoutes.get('/product/:id', controller.getReviewsByProductId);
  reviewRoutes.get(
    '/admin/all',
    authMiddleware,
    adminMiddleware,
    controller.getAdminPaginatedReviews,
  );
  reviewRoutes.patch('/my/:id', authMiddleware, controller.updateMyReview);
  reviewRoutes.delete('/my/:id', authMiddleware, controller.deleteMyReview);
  reviewRoutes.post('/:id/like', authMiddleware, controller.likeReview);
  reviewRoutes.post('/:id/dislike', authMiddleware, controller.dislikeReview);
  reviewRoutes.post('/:id/report', authMiddleware, controller.reportReview);
  reviewRoutes.post('/:id/vendor-reply', authMiddleware, controller.addVendorReply);
  reviewRoutes.patch('/admin/:id/block', authMiddleware, adminMiddleware, controller.blockReview);
  reviewRoutes.patch(
    '/admin/:id/unblock',
    authMiddleware,
    adminMiddleware,
    controller.unblockReview,
  );
  reviewRoutes.get('/:id', controller.getReviewById);
  reviewRoutes.post('/my', authMiddleware, controller.create);

  return reviewRoutes;
}
