import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import type { createCategoryModule } from '../category.module';

type CategoryController = ReturnType<typeof createCategoryModule>['categoryController'];

export function createCategoryRoutes(categoryController: CategoryController) {
  const CategoryRoutes = new Hono();

CategoryRoutes.post('/create', authMiddleware, adminMiddleware, categoryController.createCategory);
CategoryRoutes.patch('/update', authMiddleware, adminMiddleware, categoryController.updateCategory);
CategoryRoutes.delete('/', authMiddleware, adminMiddleware, categoryController.deleteCategory);
CategoryRoutes.get('/', categoryController.getPaginated);
CategoryRoutes.get(
  '/admin/all',
  authMiddleware,
  adminMiddleware,
  categoryController.getAdminPaginated,
);
CategoryRoutes.patch(
  '/:id/block',
  authMiddleware,
  adminMiddleware,
  categoryController.blockCategory,
);
CategoryRoutes.patch(
  '/:id/unblock',
  authMiddleware,
  adminMiddleware,
  categoryController.unblockCategory,
);
CategoryRoutes.get('/:id', categoryController.getCategory);

  return CategoryRoutes;
}
