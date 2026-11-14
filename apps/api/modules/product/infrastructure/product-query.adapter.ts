import type {
  EnsureActiveProductResult,
  IProductQueries,
  VerifyProductsResult,
} from '@ecomerece/contracts';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { ProductInternelService } from '../application/product.internel.service';

/** Contract-facing adapter for product reads. */
export class ProductQueryAdapter implements IProductQueries {
  constructor(private readonly internalService: ProductInternelService) {}

  ensureActiveById(productId: Id): Promise<EnsureActiveProductResult> {
    return this.internalService.ensureActiveProductGetById(productId);
  }

  verifyAndGet(ids: Id[]): Promise<VerifyProductsResult> {
    return this.internalService.verifyProductAndGet(ids);
  }

  listVendorProductIds(vendorId: Id): Promise<Id[]> {
    return this.internalService.listVendorProductIds(vendorId);
  }
}
