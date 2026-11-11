import type { IProductPricingUpdater } from '@ecomerece/contracts';
import type { Buses } from '../../core/infrastructure/buses/buses';
import { productVariantInternalService } from './application/product-varaint.internal.service';
import { productVariantApplicationService } from './application/product-variant.app.service';
import { EnsureActiveVariantGetByIdQuery } from './application/queries/ensure-active-variant-get-by-id.query';
import { GetAdminPaginatedVariantsQuery } from './application/queries/get-admin-paginated-variants.query';
import { GetVariantByIdQuery } from './application/queries/get-variant-by-id.query';
import { GetVariantsByProductIdQuery } from './application/queries/get-variants-by-product-id.query';
import { VerifyVariantsAndGetQuery } from './application/queries/verify-variants-and-get.query';
import { EnsureActiveVariantGetByIdHandler } from './application/query-handlers/ensure-active-variant-get-by-id.query-handler';
import { GetAdminPaginatedVariantsHandler } from './application/query-handlers/get-admin-paginated-variants.query-handler';
import { GetVariantByIdHandler } from './application/query-handlers/get-variant-by-id.query-handler';
import { GetVariantsByProductIdHandler } from './application/query-handlers/get-variants-by-product-id.query-handler';
import { VerifyVariantsAndGetHandler } from './application/query-handlers/verify-variant-and-get.query-handler';
import { ProductVariantRepository } from './infrastructure/product-variant.repository';
import { ProductVariantController } from './presentation/product-variant.controller';

interface ProductVariantModuleDeps extends Buses {
  pricingUpdater: IProductPricingUpdater;
}

export function createProductVaraintModule({
  queryBus,
  eventBus,
  pricingUpdater,
}: ProductVariantModuleDeps) {
  const repo = new ProductVariantRepository();
  const internalService = new productVariantInternalService(repo, queryBus);
  const applicationService = new productVariantApplicationService(
    repo,
    queryBus,
    pricingUpdater,
    eventBus,
  );
  queryBus.register(
    EnsureActiveVariantGetByIdQuery,
    new EnsureActiveVariantGetByIdHandler(internalService),
  );
  queryBus.register(VerifyVariantsAndGetQuery, new VerifyVariantsAndGetHandler(internalService));
  queryBus.register(GetVariantByIdQuery, new GetVariantByIdHandler(internalService));
  queryBus.register(
    GetVariantsByProductIdQuery,
    new GetVariantsByProductIdHandler(applicationService),
  );
  queryBus.register(
    GetAdminPaginatedVariantsQuery,
    new GetAdminPaginatedVariantsHandler(applicationService),
  );
  const controller = new ProductVariantController(applicationService);
  return { repo, internalService, applicationService, controller };
}
