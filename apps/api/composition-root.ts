import { UnitOfWork } from './core/database/unit-of-work';
import { InMemoryEventBus } from './core/infrastructure/buses/in-memory-event-bus';
import { InMemoryQueryBus } from './core/infrastructure/buses/in-memory-query-bus';
import { configureAuthUserLookup } from './middleware/auth';
import { configureStatsAccess } from './middleware/statsAccessGuard';
import { configureStatsViewGuard } from './middleware/statsViewGuard.middleware';
import { createAddressModule } from './modules/address/address.module';
import { createCategoryModule } from './modules/category/category.module';
import { createHomeModule } from './modules/home/home.module';
import { createImageStorageModule } from './modules/image-storage/image-storage.module';
import { createInventoryModule } from './modules/inventory/inventory.module';
import { createOrder } from './modules/order/order.module';
import { createOrderItemsModule } from './modules/order-items/order-items.module';
import { createProductModule } from './modules/product/product.module';
import { createProductVaraintModule } from './modules/product-variant/product-variant.module';
import { createReviewModule } from './modules/reviews/review.module';
import { CreateStatsModule } from './modules/stats/stats.module';
import { UserAuthLookupAdapter } from './modules/user/infrastructure/user-auth-lookup.adapter';
import { createUserModule } from './modules/user/user.module';
import { CreateVendorModule } from './modules/vendor/vendor.module';

export function createApplication() {
  const queryBus = new InMemoryQueryBus();
  const eventBus = new InMemoryEventBus();
  const unitOfWork = new UnitOfWork();
  const imageStorage = createImageStorageModule();
  const buses = { queryBus, eventBus };

  const address = createAddressModule(buses);
  const category = createCategoryModule({ ...buses, imageStorage });
  const home = createHomeModule({ ...buses, imageStorage });
  const inventory = createInventoryModule(buses);
  const orderItems = createOrderItemsModule({ ...buses, unitOfWork });
  const product = createProductModule({ ...buses, imageStorage });
  const order = createOrder({
    ...buses,
    inventoryReservation: inventory.inventoryReservation,
    orderItemsWriter: orderItems.orderItemsWriter,
    unitOfWork,
  });
  const productVariant = createProductVaraintModule({
    ...buses,
    pricingUpdater: product.productPricing,
  });
  const reviews = createReviewModule(buses);
  const user = createUserModule(buses);
  const vendor = CreateVendorModule({ ...buses, imageStorage });
  const stats = CreateStatsModule({
    ...buses,
    productStats: product.productStats,
    vendorStats: vendor.vendorStats,
  });

  configureAuthUserLookup(new UserAuthLookupAdapter());
  configureStatsAccess({
    getProductVendorId: (productId) => product.statsAccess.getProductVendorId(productId),
    getVendorIdByOwnerId: (ownerId) => vendor.statsAccess.getVendorIdByOwnerId(ownerId),
  });
  configureStatsViewGuard({ productRepo: product.statsAccess, categoryRepo: category.statsAccess, });

  return {
    buses,
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
