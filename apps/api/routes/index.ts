import { Hono } from 'hono';
import { AddressRoutes } from '../modules/address/presentation/address.route';
import { CategoryRoutes } from '../modules/category/presentation/category.routes';
import homeRoutes from '../modules/home/presentation/home.routes';
import { inventoryRoutes } from '../modules/inventory/presentation/inventory.routes';
import { OrderRoutes } from '../modules/order/presentation/order.routes';
import { orderItemsRoutes } from '../modules/order-items/presentation/order-items.routes';
import { productRoutes } from '../modules/product/presentation/product.routes';
import { productVariantRoutes } from '../modules/product-variant/presentation/product-varaint.routes';
import { reviewRoutes } from '../modules/reviews/presentation/review.routes';
import { statsRouter } from '../modules/stats/presentation/StatsRoutes';
import usersRoutes from '../modules/user/presentation/user.routes';
import vendorRoutes from '../modules/vendor/presentation/vendor.routes';

const routes = new Hono();

routes.route('/product', productRoutes);
routes.route('/product-variant', productVariantRoutes);
routes.route('/review', reviewRoutes);
routes.route('/product-inventory', inventoryRoutes);
routes.route('/order', OrderRoutes);
routes.route('/order-items', orderItemsRoutes);
routes.route('/category', CategoryRoutes);
routes.route('/address', AddressRoutes);
routes.route('/users', usersRoutes);
routes.route('/vendor', vendorRoutes);
routes.route('/home', homeRoutes);
routes.route('/stats', statsRouter);

export default routes;
