import type { Id, Quantity } from '../../../value-objects';
import type { ReturnRequestAggregate } from '../returns.aggregate';

export interface ReturnPaginationFilter {
  orderId?: string;
  orderItemId?: string;
  vendorId?: string;
  buyerId?: string;
  status?: string;
  deleted?: boolean;
}

export interface ReturnPage {
  data: ReturnRequestAggregate[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
}

export interface IReturnRepository {
  FindById(id: Id): Promise<ReturnRequestAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<ReturnRequestAggregate>;
  FindByOrderId(orderId: Id): Promise<ReturnRequestAggregate[]>;
  FindByOrderItemId(orderItemId: Id): Promise<ReturnRequestAggregate[]>;
  FindPaginated(params: {
    filter?: ReturnPaginationFilter;
    cursor?: Id;
    limit?: Quantity;
    direction?: 'next' | 'prev';
  }): Promise<ReturnPage>;
  Create(request: ReturnRequestAggregate): Promise<void>;
  Save(request: ReturnRequestAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
}
