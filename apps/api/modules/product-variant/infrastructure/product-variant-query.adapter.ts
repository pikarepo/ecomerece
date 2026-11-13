import type {
  EnsureActiveVariantResult,
  IProductVariantQueries,
  VerifyVariantsResult,
} from '@ecomerece/contracts';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { productVariantInternalService } from '../application/product-varaint.internal.service';

/** Contract-facing adapter for product-variant reads. */
export class ProductVariantQueryAdapter implements IProductVariantQueries {
  constructor(private readonly internalService: productVariantInternalService) {}

  ensureActiveById(variantId: Id): Promise<EnsureActiveVariantResult> {
    return this.internalService.ensureActiveVariantGetById(variantId);
  }

  verifyAndGet(ids: Id[]): Promise<VerifyVariantsResult> {
    return this.internalService.verifyVariantsAndGet(ids);
  }
}
