import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import type { createProductModule } from '../product.module';

type ProductController = ReturnType<typeof createProductModule>['productController'];

export function createProductRoutes(productController: ProductController) {
  const productRoutes = new Hono();

  productRoutes.get('/', productController.getPaginatedProducts);
  productRoutes.get(
    '/admin/all',
    authMiddleware,
    adminMiddleware,
    productController.getAdminPaginatedProducts,
  );
  productRoutes.get('/my', authMiddleware, productController.getMyPaginatedProducts);
  productRoutes.get('/:id', productController.getProductById);
  productRoutes.post(`/my`, authMiddleware, productController.createMyProudct);
  productRoutes.delete(`/my/soft`, authMiddleware, productController.softDeleteMyProduct);
  productRoutes.patch(`/my/recover`, authMiddleware, productController.recoverMyProduct);
  productRoutes.post(`/block`, authMiddleware, adminMiddleware, productController.blockProduct);
  productRoutes.post(
    `/block/lift`,
    authMiddleware,
    adminMiddleware,
    productController.unBlockProduct,
  );
  productRoutes.patch(`/state/my/public`, authMiddleware, productController.makeMyProductPublic);
  productRoutes.patch(`/state/my/private`, authMiddleware, productController.makeMyProductPrivate);
  productRoutes.patch(`/my/meta`, authMiddleware, productController.updateMyProductMeta);
  productRoutes.patch(
    `my/disclaimer/toggle`,
    authMiddleware,
    productController.toggleMyProductDisclaimer,
  );
  productRoutes.patch(
    `my/disclaimer/add`,
    authMiddleware,
    productController.addMyProductDisclaimers,
  );
  productRoutes.patch(
    `my/disclaimer/remove`,
    authMiddleware,
    productController.removeMyProductDisclaimers,
  );
  productRoutes.patch(`/my/images/add`, authMiddleware, productController.addMyProductImages);
  productRoutes.patch(`/my/images/remove`, authMiddleware, productController.removeMyProductImages);
  productRoutes.patch(
    `/my/images/default`,
    authMiddleware,
    productController.setMyProductDefaultImage,
  );
  productRoutes.patch(
    `/my/ingredients/toggle`,
    authMiddleware,
    productController.toggleMyProductIngredients,
  );
  productRoutes.patch(
    `/my/ingredients/add`,
    authMiddleware,
    productController.addMyProductIngredients,
  );
  productRoutes.patch(
    `/my/ingredients/remove`,
    authMiddleware,
    productController.removeMyProductIngredients,
  );
  productRoutes.patch(
    `/my/disclaimer/update`,
    authMiddleware,
    productController.updateMyProductDisclaimer,
  );
  productRoutes.patch(
    `/my/ingredients/clear`,
    authMiddleware,
    productController.clearMyProductIngredients,
  );
  productRoutes.patch(`/my/stock`, authMiddleware, productController.setMyProductInStock);

  return productRoutes;
}
