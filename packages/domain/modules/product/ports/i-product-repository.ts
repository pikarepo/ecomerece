import type { Id, Quantity } from '../../../value-objects';
import type { ProductAggregate } from '../product.aggregate';

export interface IProductRepository {
  FindById(id: Id): Promise<ProductAggregate | null>;
  FindByVendorId(id: Id): Promise<ProductAggregate | null>;
  FindByIds(id: Id[]): Promise<ProductAggregate[]>;
  FindByIdOrThrow(id: Id): Promise<ProductAggregate>;
  FindByVendorIdOrThrow(id: Id): Promise<ProductAggregate>;
  Save(user: ProductAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
  Create(user: ProductAggregate): Promise<void>;
  FindPaginated(params: { cursor?: Id; limit?: Quantity; direction?: 'next' | 'prev' }): Promise<{
    data: any;
    meta: {
      nextCursor: string | null;
      prevCursor: string | null;
      hasMore: boolean;
    };
  }>;
}
