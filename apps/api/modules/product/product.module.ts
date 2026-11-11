import type { IImageStoragePort } from '@ecomerece/domain';
import type { Buses } from '../../core/infrastructure/buses/buses';
import { ProductApplicationService } from './application/product.app.service';
import { ProductInternelService } from './application/product.internel.service';
import { EnsureActiveProductGetByIdQuery } from './application/queries/ensure-active-product-get-by-id.query';
import { GetAdminPaginatedProductsQuery } from './application/queries/get-admin-paginated-products.query';
import { GetMyPaginatedProductsQuery } from './application/queries/get-my-paginated-products.query';
import { GetProductByIdQuery } from './application/queries/get-product-by-id.query';
import { GetPublicPaginatedProductsQuery } from './application/queries/get-public-paginated-products.query';
import { VerifyProductAndGetQuery } from './application/queries/verify-product-and-get.query';
import { EnsureActiveProductGetByIdHandler } from './application/query-handlers/ensure-active-product-get-by-id.query-handler';
import { GetAdminPaginatedProductsHandler } from './application/query-handlers/get-admin-paginated-products.query-handler';
import { GetMyPaginatedProductsHandler } from './application/query-handlers/get-my-paginated-products.query-handler';
import { GetProductByIdHandler } from './application/query-handlers/get-product-by-id.query-handler';
import { GetPublicPaginatedProductsHandler } from './application/query-handlers/get-public-paginated-products.query-handler';
import { VerifyProductAndGetHandler } from './application/query-handlers/verify-product-and-get.query-handler';
import { ProductPricingAdapter } from './infrastructure/product-pricing.adapter';
import { ProductStatsAccessAdapter } from './infrastructure/product-stats-access.adapter';
import { ProductStatsProjector } from './infrastructure/product-stats-projector.adapter';
import { ProductRepository } from './infrastructure/product.repository';
import { ProductController } from './presentation/product.controller';

interface ProductModuleDeps extends Buses {
  imageStorage: IImageStoragePort;
}

export function createProductModule({ queryBus, eventBus, imageStorage }: ProductModuleDeps) {
  const repo = new ProductRepository();
  const productInternalService = new ProductInternelService(repo);
  const productPricing = new ProductPricingAdapter(productInternalService);
  const productStats = new ProductStatsProjector();
  const statsAccess = new ProductStatsAccessAdapter(repo);
  const productApplicationService = new ProductApplicationService(
    queryBus,
    repo,
    eventBus,
    imageStorage,
  );

  queryBus.register(
    EnsureActiveProductGetByIdQuery,
    new EnsureActiveProductGetByIdHandler(productInternalService),
  );
  queryBus.register(
    VerifyProductAndGetQuery,
    new VerifyProductAndGetHandler(productInternalService),
  );
  queryBus.register(GetProductByIdQuery, new GetProductByIdHandler(productApplicationService));
  queryBus.register(
    GetPublicPaginatedProductsQuery,
    new GetPublicPaginatedProductsHandler(productApplicationService),
  );
  queryBus.register(
    GetAdminPaginatedProductsQuery,
    new GetAdminPaginatedProductsHandler(productApplicationService),
  );
  queryBus.register(
    GetMyPaginatedProductsQuery,
    new GetMyPaginatedProductsHandler(productApplicationService),
  );
  const productController = new ProductController(productApplicationService);

  return { productController, productInternalService, productPricing, productStats, statsAccess };
}
