import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import type { createHomeModule } from '../home.module';

type HomeController = ReturnType<typeof createHomeModule>['homeController'];

/** The home page is public; every edit is admin-only under `/admin`. */
export function createHomeRoutes(homeController: HomeController) {
  const homeRoutes = new Hono();

  // Public
  homeRoutes.get('/', homeController.getHome);

  // Admin
  homeRoutes.post('/admin/categories', authMiddleware, adminMiddleware, homeController.addCategory);
  homeRoutes.patch(
    '/admin/categories',
    authMiddleware,
    adminMiddleware,
    homeController.updateCategory,
  );
  homeRoutes.delete(
    '/admin/categories',
    authMiddleware,
    adminMiddleware,
    homeController.removeCategory,
  );
  homeRoutes.patch(
    '/admin/categories/reorder',
    authMiddleware,
    adminMiddleware,
    homeController.reorderCategories,
  );

  homeRoutes.post('/admin/slides', authMiddleware, adminMiddleware, homeController.addSlide);
  homeRoutes.patch('/admin/slides', authMiddleware, adminMiddleware, homeController.updateSlide);
  homeRoutes.delete('/admin/slides', authMiddleware, adminMiddleware, homeController.removeSlide);
  homeRoutes.patch(
    '/admin/slides/reorder',
    authMiddleware,
    adminMiddleware,
    homeController.reorderSlides,
  );

  homeRoutes.post('/admin/promos', authMiddleware, adminMiddleware, homeController.addPromo);
  homeRoutes.patch('/admin/promos', authMiddleware, adminMiddleware, homeController.updatePromo);
  homeRoutes.delete('/admin/promos', authMiddleware, adminMiddleware, homeController.removePromo);

  homeRoutes.post('/admin/features', authMiddleware, adminMiddleware, homeController.addFeature);
  homeRoutes.put('/admin/features', authMiddleware, adminMiddleware, homeController.setFeatures);
  homeRoutes.patch(
    '/admin/features',
    authMiddleware,
    adminMiddleware,
    homeController.updateFeature,
  );
  homeRoutes.delete(
    '/admin/features',
    authMiddleware,
    adminMiddleware,
    homeController.removeFeature,
  );

  homeRoutes.post(
    '/admin/containers',
    authMiddleware,
    adminMiddleware,
    homeController.addContainer,
  );
  homeRoutes.patch(
    '/admin/containers',
    authMiddleware,
    adminMiddleware,
    homeController.updateContainer,
  );
  homeRoutes.delete(
    '/admin/containers',
    authMiddleware,
    adminMiddleware,
    homeController.removeContainer,
  );
  homeRoutes.patch(
    '/admin/containers/reorder',
    authMiddleware,
    adminMiddleware,
    homeController.reorderContainers,
  );

  return homeRoutes;
}
