import type {
  IProductPricingUpdater,
  IProductQueries,
  IUserQueries,
  IVendorQueries,
} from '@ecomerece/contracts';
import type { Buses } from '../../core/infrastructure/buses/buses';
import { productVariantInternalService } from './application/product-varaint.internal.service';
import { productVariantApplicationService } from './application/product-variant.app.service';
import { ProductVariantQueryAdapter } from './infrastructure/product-variant-query.adapter';
import { ProductVariantRepository } from './infrastructure/product-variant.repository';
import { ProductVariantController } from './presentation/product-variant.controller';

interface ProductVariantModuleDeps extends Buses {
  pricingUpdater: IProductPricingUpdater;
  userQueries: IUserQueries;
  productQueries: IProductQueries;
  vendorQueries: IVendorQueries;
}

export function createProductVaraintModule({
  eventBus,
  pricingUpdater,
  userQueries,
  productQueries,
  vendorQueries,
}: ProductVariantModuleDeps) {
  const repo = new ProductVariantRepository();
  const internalService = new productVariantInternalService(repo);
  const applicationService = new productVariantApplicationService(
    repo,
    userQueries,
    productQueries,
    vendorQueries,
    pricingUpdater,
    eventBus,
  );
  const controller = new ProductVariantController(applicationService);
  const queries = new ProductVariantQueryAdapter(internalService);
  return { repo, internalService, applicationService, controller, queries };
}
