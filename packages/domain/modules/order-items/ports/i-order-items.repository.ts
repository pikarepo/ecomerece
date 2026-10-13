import type { Id } from '../../../value-objects';
import type { OrderItemsAggregate } from '../order-items.aggregate';

export interface IOrderItemsRepository {
  FindById(id: Id): Promise<OrderItemsAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<OrderItemsAggregate>;
  Save(user: OrderItemsAggregate): Promise<void>;
  SaveMany(user: OrderItemsAggregate[]): Promise<void>;
  Delete(id: Id): Promise<void>;
  Exists(id: Id): Promise<boolean>;
  Create(user: OrderItemsAggregate): Promise<void>;
}
