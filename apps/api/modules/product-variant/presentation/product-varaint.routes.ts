import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { vendorMiddleware } from '../../../middleware/vendor';
import type { createProductVaraintModule } from '../product-variant.module';

type ProductVariantController = ReturnType<typeof createProductVaraintModule>['controller'];

/**
 * Public reads are catalog data only. Mutations belong to the vendor scope
 * (the caller's own products) or the admin scope; there is no shared write path.
 */
export function createProductVariantRoutes(controller: ProductVariantController) {
  const productVariantRoutes = new Hono();

  // Public
  productVariantRoutes.get('/product/:id', controller.getVarientsByProductId);
  productVariantRoutes.get('/:id', controller.getVariantById);

  // Vendor
  productVariantRoutes.get(
    '/vendor/all',
    authMiddleware,
    vendorMiddleware,
    controller.getMyPaginatedVariants,
  );
  productVariantRoutes.post(
    '/vendor',
    authMiddleware,
    vendorMiddleware,
    controller.createMyProductVariant,
  );
  productVariantRoutes.patch(
    '/vendor/price',
    authMiddleware,
    vendorMiddleware,
    controller.updateMyVariantPrice,
  );
  productVariantRoutes.patch(
    '/vendor/meta',
    authMiddleware,
    vendorMiddleware,
    controller.updateMyVariantMeta,
  );
  productVariantRoutes.patch(
    '/vendor/appearance/toggle',
    authMiddleware,
    vendorMiddleware,
    controller.toggleMyVaraintAppereance,
  );
  productVariantRoutes.delete(
    '/vendor/soft',
    authMiddleware,
    vendorMiddleware,
    controller.softDeleteMyVariant,
  );

  // Admin
  productVariantRoutes.get(
    '/admin/all',
    authMiddleware,
    adminMiddleware,
    controller.getAdminPaginatedVariants,
  );
  productVariantRoutes.patch(
    '/admin/:id/recover',
    authMiddleware,
    adminMiddleware,
    controller.recoverVariant,
  );

  return productVariantRoutes;
}
