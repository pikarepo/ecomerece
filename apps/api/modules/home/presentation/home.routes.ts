import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createHomeModule } from '../home.module';

export const homeRoutes = new Hono();
const { homeController } = createHomeModule();

// Public Read
homeRoutes.get('/', homeController.getHome);

// Admin Writes (Protected)
// Categories
homeRoutes.post('/categories', authMiddleware, adminMiddleware, homeController.addCategory);
homeRoutes.patch('/categories', authMiddleware, adminMiddleware, homeController.updateCategory);
homeRoutes.delete('/categories', authMiddleware, adminMiddleware, homeController.removeCategory);
homeRoutes.patch(
  '/categories/reorder',
  authMiddleware,
  adminMiddleware,
  homeController.reorderCategories,
);

// Slides
homeRoutes.post('/slides', authMiddleware, adminMiddleware, homeController.addSlide);
homeRoutes.patch('/slides', authMiddleware, adminMiddleware, homeController.updateSlide);
homeRoutes.delete('/slides', authMiddleware, adminMiddleware, homeController.removeSlide);
homeRoutes.patch('/slides/reorder', authMiddleware, adminMiddleware, homeController.reorderSlides);

// Promos
homeRoutes.post('/promos', authMiddleware, adminMiddleware, homeController.addPromo);
homeRoutes.patch('/promos', authMiddleware, adminMiddleware, homeController.updatePromo);
homeRoutes.delete('/promos', authMiddleware, adminMiddleware, homeController.removePromo);

// Features
homeRoutes.post('/features', authMiddleware, adminMiddleware, homeController.addFeature);
homeRoutes.put('/features', authMiddleware, adminMiddleware, homeController.setFeatures);
homeRoutes.patch('/features', authMiddleware, adminMiddleware, homeController.updateFeature);
homeRoutes.delete('/features', authMiddleware, adminMiddleware, homeController.removeFeature);

// Product Containers
homeRoutes.post('/containers', authMiddleware, adminMiddleware, homeController.addContainer);
homeRoutes.patch('/containers', authMiddleware, adminMiddleware, homeController.updateContainer);
homeRoutes.delete('/containers', authMiddleware, adminMiddleware, homeController.removeContainer);
homeRoutes.patch(
  '/containers/reorder',
  authMiddleware,
  adminMiddleware,
  homeController.reorderContainers,
);

export default homeRoutes;
