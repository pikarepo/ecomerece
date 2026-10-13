import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createReviewModule } from '../review.module';

const { controller } = createReviewModule();

export const reviewRoutes = new Hono();

reviewRoutes.get('/', controller.getPaginatedReviews);
reviewRoutes.get('/product/:id', controller.getReviewsByProductId);
reviewRoutes.get('/:id', controller.getReviewById);
reviewRoutes.post('/my', authMiddleware, controller.create);
reviewRoutes.get(
  '/admin/all',
  authMiddleware,
  adminMiddleware,
  controller.getAdminPaginatedReviews,
);
