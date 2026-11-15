import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { vendorMiddleware } from '../../../middleware/vendor';
import type { createProductModule } from '../product.module';

type ProductController = ReturnType<typeof createProductModule>['productController'];

/**
 * Path convention: scope (`vendor` | `admin`), then `all` or `:id`, then the
 * command. Product mutations are body-addressed (`productId` in the body), so
 * the scope is followed by the noun and verb instead of a path id.
 */
export function createProductRoutes(productController: ProductController) {
  const productRoutes = new Hono();

  // Public
  productRoutes.get('/', productController.getPaginatedProducts);

  // Vendor — the caller's own vendor, enforced by middleware.
  productRoutes.get(
    '/vendor/all',
    authMiddleware,
    vendorMiddleware,
    productController.getMyPaginatedProducts,
  );
  productRoutes.post(
    '/vendor',
    authMiddleware,
    vendorMiddleware,
    productController.createMyProudct,
  );
  productRoutes.delete(
    '/vendor',
    authMiddleware,
    vendorMiddleware,
    productController.softDeleteMyProduct,
  );
  productRoutes.patch(
    '/vendor/recover',
    authMiddleware,
    vendorMiddleware,
    productController.recoverMyProduct,
  );
  productRoutes.patch(
    '/vendor/state/public',
    authMiddleware,
    vendorMiddleware,
    productController.makeMyProductPublic,
  );
  productRoutes.patch(
    '/vendor/state/private',
    authMiddleware,
    vendorMiddleware,
    productController.makeMyProductPrivate,
  );
  productRoutes.patch(
    '/vendor/meta',
    authMiddleware,
    vendorMiddleware,
    productController.updateMyProductMeta,
  );
  productRoutes.patch(
    '/vendor/stock',
    authMiddleware,
    vendorMiddleware,
    productController.setMyProductInStock,
  );
  productRoutes.patch(
    '/vendor/disclaimer/toggle',
    authMiddleware,
    vendorMiddleware,
    productController.toggleMyProductDisclaimer,
  );
  productRoutes.patch(
    '/vendor/disclaimer/add',
    authMiddleware,
    vendorMiddleware,
    productController.addMyProductDisclaimers,
  );
  productRoutes.patch(
    '/vendor/disclaimer/remove',
    authMiddleware,
    vendorMiddleware,
    productController.removeMyProductDisclaimers,
  );
  productRoutes.patch(
    '/vendor/disclaimer/update',
    authMiddleware,
    vendorMiddleware,
    productController.updateMyProductDisclaimer,
  );
  productRoutes.patch(
    '/vendor/images/add',
    authMiddleware,
    vendorMiddleware,
    productController.addMyProductImages,
  );
  productRoutes.patch(
    '/vendor/images/remove',
    authMiddleware,
    vendorMiddleware,
    productController.removeMyProductImages,
  );
  productRoutes.patch(
    '/vendor/images/default',
    authMiddleware,
    vendorMiddleware,
    productController.setMyProductDefaultImage,
  );
  productRoutes.patch(
    '/vendor/ingredients/toggle',
    authMiddleware,
    vendorMiddleware,
    productController.toggleMyProductIngredients,
  );
  productRoutes.patch(
    '/vendor/ingredients/add',
    authMiddleware,
    vendorMiddleware,
    productController.addMyProductIngredients,
  );
  productRoutes.patch(
    '/vendor/ingredients/remove',
    authMiddleware,
    vendorMiddleware,
    productController.removeMyProductIngredients,
  );
  productRoutes.patch(
    '/vendor/ingredients/clear',
    authMiddleware,
    vendorMiddleware,
    productController.clearMyProductIngredients,
  );

  // Admin
  productRoutes.get(
    '/admin/all',
    authMiddleware,
    adminMiddleware,
    productController.getAdminPaginatedProducts,
  );
  productRoutes.patch(
    '/admin/block',
    authMiddleware,
    adminMiddleware,
    productController.blockProduct,
  );
  productRoutes.patch(
    '/admin/block/lift',
    authMiddleware,
    adminMiddleware,
    productController.unBlockProduct,
  );

  // Public detail last so the scoped routes match first.
  productRoutes.get('/:id', productController.getProductById);

  return productRoutes;
}
