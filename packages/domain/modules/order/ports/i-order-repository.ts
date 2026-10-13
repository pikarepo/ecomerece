import type { Id } from '../../../value-objects';
import type { OrderAggregate } from '../order.aggregate';

export interface IOrderRepository {
  FindById(id: Id): Promise<OrderAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<OrderAggregate>;
  Save(user: OrderAggregate): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
  Create(user: OrderAggregate): Promise<void>;
}
