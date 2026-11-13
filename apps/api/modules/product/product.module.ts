import type { IImageStoragePort } from '@ecomerece/domain';
import type { ICategoryQueries, IVendorQueries } from '@ecomerece/contracts';
import type { Buses } from '../../core/infrastructure/buses/buses';
import { ProductApplicationService } from './application/product.app.service';
import { ProductInternelService } from './application/product.internel.service';
import { ProductPricingAdapter } from './infrastructure/product-pricing.adapter';
import { ProductQueryAdapter } from './infrastructure/product-query.adapter';
import { ProductStatsAccessAdapter } from './infrastructure/product-stats-access.adapter';
import { ProductStatsProjector } from './infrastructure/product-stats-projector.adapter';
import { ProductRepository } from './infrastructure/product.repository';
import { ProductStockAdapter } from './infrastructure/product-stock.adapter';
import { ProductController } from './presentation/product.controller';

interface ProductModuleDeps extends Buses {
  imageStorage: IImageStoragePort;
  vendorQueries: IVendorQueries;
  categoryQueries: ICategoryQueries;
}

export function createProductModule({
  eventBus,
  imageStorage,
  vendorQueries,
  categoryQueries,
}: ProductModuleDeps) {
  const repo = new ProductRepository();
  const productInternalService = new ProductInternelService(repo);
  const productPricing = new ProductPricingAdapter(productInternalService);
  const productStats = new ProductStatsProjector();
  const statsAccess = new ProductStatsAccessAdapter(repo);
  const productStock = new ProductStockAdapter(repo, eventBus);
  const productApplicationService = new ProductApplicationService(
    vendorQueries,
    categoryQueries,
    repo,
    eventBus,
    imageStorage,
  );
  const productController = new ProductController(productApplicationService);
  const queries = new ProductQueryAdapter(productInternalService);

  return {
    productController,
    productInternalService,
    productPricing,
    productStats,
    productStock,
    statsAccess,
    queries,
  };
}
