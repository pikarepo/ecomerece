import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createCategoryModule } from '../category.module';

export const CategoryRoutes = new Hono();
const { categoryController } = createCategoryModule();

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
CategoryRoutes.get('/:id', categoryController.getCategory);
