import { UnitOfWork } from './core/database/unit-of-work';
import { InMemoryEventBus } from './core/infrastructure/buses/in-memory-event-bus';
import { configureAuthUserLookup } from './middleware/auth';
import { configureStatsAccess } from './middleware/statsAccessGuard';
import { configureStatsViewGuard } from './middleware/statsViewGuard.middleware';
import { createAddressModule } from './modules/address/address.module';
import { createCategoryModule } from './modules/category/category.module';
import { createHomeModule } from './modules/home/home.module';
import { createImageStorageModule } from './modules/image-storage/image-storage.module';
import { createInventoryModule } from './modules/inventory/inventory.module';
import { createOrder } from './modules/order/order.module';
import {
  createOrderItemsApplication,
  createOrderItemsCore,
} from './modules/order-items/order-items.module';
import { createProductModule } from './modules/product/product.module';
import { createProductVaraintModule } from './modules/product-variant/product-variant.module';
import { createReviewModule } from './modules/reviews/review.module';
import { CreateStatsModule } from './modules/stats/stats.module';
import { UserAuthLookupAdapter } from './modules/user/infrastructure/user-auth-lookup.adapter';
import { createUserModule } from './modules/user/user.module';
import { CreateVendorModule } from './modules/vendor/vendor.module';

export function createApplication() {
  const eventBus = new InMemoryEventBus();
  const unitOfWork = new UnitOfWork();
  const imageStorage = createImageStorageModule();

  const user = createUserModule({ eventBus });
  const vendor = CreateVendorModule({
    eventBus,
    imageStorage,
    userQueries: user.queries,
  });
  const category = createCategoryModule({ eventBus, imageStorage });
  const product = createProductModule({
    eventBus,
    imageStorage,
    vendorQueries: vendor.queries,
    categoryQueries: category.queries,
  });
  const productVariant = createProductVaraintModule({
    eventBus,
    pricingUpdater: product.productPricing,
    userQueries: user.queries,
    productQueries: product.queries,
    vendorQueries: vendor.queries,
  });
  const inventory = createInventoryModule({
    eventBus,
    productStock: product.productStock,
    variantQueries: productVariant.queries,
    productQueries: product.queries,
    vendorQueries: vendor.queries,
    userQueries: user.queries,
  });
  const address = createAddressModule({ eventBus, userQueries: user.queries });

  // Order-items core has no order dependency, so it can be built before order.
  const orderItemsCore = createOrderItemsCore();
  const order = createOrder({
    eventBus,
    inventoryReservation: inventory.inventoryReservation,
    orderItemsWriter: orderItemsCore.orderItemsWriter,
    addressQueries: address.queries,
    variantQueries: productVariant.queries,
    productQueries: product.queries,
    unitOfWork,
  });
  const orderItems = createOrderItemsApplication({
    core: orderItemsCore,
    orderQueries: order.queries,
    eventBus,
    unitOfWork,
  });

  const reviews = createReviewModule({
    eventBus,
    orderQueries: order.queries,
    productQueries: product.queries,
    vendorQueries: vendor.queries,
  });
  const home = createHomeModule({ eventBus, imageStorage });
  const stats = CreateStatsModule({
    eventBus,
    productStats: product.productStats,
    vendorStats: vendor.vendorStats,
    vendorQueries: vendor.queries,
  });

  configureAuthUserLookup(new UserAuthLookupAdapter());
  configureStatsAccess({
    getProductVendorId: (productId) => product.statsAccess.getProductVendorId(productId),
    getVendorIdByOwnerId: (ownerId) => vendor.statsAccess.getVendorIdByOwnerId(ownerId),
  });
  configureStatsViewGuard({ productRepo: product.statsAccess, categoryRepo: category.statsAccess });

  return {
    buses: { eventBus },
    unitOfWork,
    modules: {
      address,
      category,
      home,
      inventory,
      order,
      orderItems,
      product,
      productVariant,
      reviews,
      stats,
      user,
      vendor,
    },
  };
}

export type Application = ReturnType<typeof createApplication>;
