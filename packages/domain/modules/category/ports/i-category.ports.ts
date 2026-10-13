import type { Id, Quantity, Title } from '../../../value-objects';
import type { CategoryAggregate } from '../category.aggregate';

export interface ICategoryRepository {
  FindById(id: Id): Promise<CategoryAggregate | null>;
  FindByTitle(title: Title): Promise<CategoryAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<CategoryAggregate>;
  FindByTitleOrThrow(title: Title): Promise<CategoryAggregate>;
  FindPaginated(params: { cursor?: Id; limit?: Quantity; direction?: 'next' | 'prev' }): Promise<{
    data: any;
    meta: {
      nextCursor: string | null;
      prevCursor: string | null;
      hasMore: boolean;
    };
  }>;
  Save(category: CategoryAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
  Create(category: CategoryAggregate): Promise<void>;
}
