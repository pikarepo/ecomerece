import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import type { createCategoryModule } from '../category.module';

type CategoryController = ReturnType<typeof createCategoryModule>['categoryController'];

/**
 * Catalog reads are public; every write is admin-only and lives under `/admin`.
 * Bulk writes are body-addressed, so the admin scope is followed by the verb.
 */
export function createCategoryRoutes(categoryController: CategoryController) {
  const CategoryRoutes = new Hono();

  // Public
  CategoryRoutes.get('/', categoryController.getPaginated);

  // Admin
  CategoryRoutes.get(
    '/admin/all',
    authMiddleware,
    adminMiddleware,
    categoryController.getAdminPaginated,
  );
  CategoryRoutes.post('/admin', authMiddleware, adminMiddleware, categoryController.createCategory);
  CategoryRoutes.patch(
    '/admin',
    authMiddleware,
    adminMiddleware,
    categoryController.updateCategory,
  );
  CategoryRoutes.delete(
    '/admin',
    authMiddleware,
    adminMiddleware,
    categoryController.deleteCategory,
  );
  CategoryRoutes.patch(
    '/admin/:id/block',
    authMiddleware,
    adminMiddleware,
    categoryController.blockCategory,
  );
  CategoryRoutes.patch(
    '/admin/:id/unblock',
    authMiddleware,
    adminMiddleware,
    categoryController.unblockCategory,
  );

  // Public detail last so the admin routes match first.
  CategoryRoutes.get('/:id', categoryController.getCategory);

  return CategoryRoutes;
}
