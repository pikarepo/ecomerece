import type { Id } from '../../../value-objects';
import type { ProductVariantAggregate } from '../product-variant.aggregate';

export interface IProductVariantRepository {
  FindById(id: Id): Promise<ProductVariantAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<ProductVariantAggregate>;
  Save(user: ProductVariantAggregate): Promise<void>;
  EnsureOwnerShipGetByIdOrThrow(productId: Id, variantId: Id): Promise<ProductVariantAggregate>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
  Create(user: ProductVariantAggregate): Promise<void>;
  FindActiveByProductId(id: Id): Promise<ProductVariantAggregate[] | null>;
}
