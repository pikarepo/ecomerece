import { Hono } from 'hono';
import type { Application } from '../composition-root';
import { createAddressRoutes } from '../modules/address/presentation/address.route';
import { createCategoryRoutes } from '../modules/category/presentation/category.routes';
import { createHomeRoutes } from '../modules/home/presentation/home.routes';
import { createInventoryRoutes } from '../modules/inventory/presentation/inventory.routes';
import { createOrderRoutes } from '../modules/order/presentation/order.routes';
import { createOrderItemsRoutes } from '../modules/order-items/presentation/order-items.routes';
import { createProductRoutes } from '../modules/product/presentation/product.routes';
import { createProductVariantRoutes } from '../modules/product-variant/presentation/product-varaint.routes';
import { createReviewRoutes } from '../modules/reviews/presentation/review.routes';
import { createStatsRoutes } from '../modules/stats/presentation/StatsRoutes';
import { createUserRoutes } from '../modules/user/presentation/user.routes';
import { createVendorRoutes } from '../modules/vendor/presentation/vendor.routes';

export function createRoutes({ modules }: Application) {
  const routes = new Hono();

  routes.route('/product', createProductRoutes(modules.product.productController));
  routes.route('/product-variant', createProductVariantRoutes(modules.productVariant.controller));
  routes.route('/review', createReviewRoutes(modules.reviews.controller));
  routes.route('/product-inventory', createInventoryRoutes(modules.inventory.inventoryController));
  routes.route('/order', createOrderRoutes(modules.order.orderController));
  routes.route('/order-items', createOrderItemsRoutes(modules.orderItems.orderItemsController));
  routes.route('/category', createCategoryRoutes(modules.category.categoryController));
  routes.route('/address', createAddressRoutes(modules.address.addressController));
  routes.route('/users', createUserRoutes(modules.user.userController));
  routes.route('/vendor', createVendorRoutes(modules.vendor.vendorController));
  routes.route('/home', createHomeRoutes(modules.home.homeController));
  routes.route('/stats', createStatsRoutes(modules.stats.statsController));

  return routes;
}
