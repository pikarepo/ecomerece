import type { Id, Quantity } from '../../../value-objects';
import type { ReviewAggregate } from '../reviews.aggregate';

export interface IReviewRepository {
  FindById(id: Id): Promise<ReviewAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<ReviewAggregate>;
  FindByIds(ids: Id[]): Promise<ReviewAggregate[]>;
  FindByProductId(productId: Id): Promise<ReviewAggregate[]>;
  FindByAuthorId(authorId: Id): Promise<ReviewAggregate[]>;
  EnsureAuthorOwnershipGetByIdOrThrow(authorId: Id, reviewId: Id): Promise<ReviewAggregate>;
  Create(review: ReviewAggregate): Promise<void>;
  Save(review: ReviewAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
  ExistsByAuthorAndProduct(authorId: Id, productId: Id): Promise<boolean>;
  FindPaginated(params: {
    filter?: {};
    cursor?: Id;
    limit?: Quantity;
    direction?: 'next' | 'prev';
  }): Promise<{
    data: any;
    meta: {
      nextCursor: string | null;
      prevCursor: string | null;
      hasMore: boolean;
    };
  }>;
}
