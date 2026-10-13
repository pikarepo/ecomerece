import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createProductVaraintModule } from '../product-variant.module';

const { controller } = createProductVaraintModule();

export const productVariantRoutes = new Hono();

productVariantRoutes.get('/:id', controller.getVarientsByProductId);
productVariantRoutes.post('/my', authMiddleware, controller.createMyProductVariant);
productVariantRoutes.patch('/my/price', authMiddleware, controller.updateMyVariantPrice);
productVariantRoutes.patch('/my/meta', authMiddleware, controller.updateMyVariantMeta);
productVariantRoutes.patch(
  '/my/appereance/toggle',
  authMiddleware,
  controller.toggleMyVaraintAppereance,
);
productVariantRoutes.delete('/my/delete/soft', authMiddleware, controller.softDeleteMyVariant);
productVariantRoutes.patch(
  '/recover/:id',
  authMiddleware,
  adminMiddleware,
  controller.recoverVariant,
);
productVariantRoutes.get(
  '/admin/all',
  authMiddleware,
  adminMiddleware,
  controller.getAdminPaginatedVariants,
);
