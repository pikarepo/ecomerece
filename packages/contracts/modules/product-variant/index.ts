import type { ProductVariantReadModel } from '@ecomerece/domain';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';

/** Result of checking a variant exists and may be used. */
export interface EnsureActiveVariantResult {
  variant: ProductVariantReadModel | null;
  active: boolean;
}

/** Result of validating a batch of variants. */
export interface VerifyVariantsResult {
  validIds: Id[];
  notFoundIds: Id[];
  deletedIds: Id[];
  nonActiveIds: Id[];
  variantReadModel: ProductVariantReadModel[];
}

/** Cross-module read port implemented by the product-variant module. */
export interface IProductVariantQueries {
  ensureActiveById(variantId: Id): Promise<EnsureActiveVariantResult>;
  verifyAndGet(ids: Id[]): Promise<VerifyVariantsResult>;
  /** Non-deleted variant ids for the given products, for vendor-scoped listings. */
  listVariantIdsByProductIds(productIds: Id[]): Promise<Id[]>;
}
