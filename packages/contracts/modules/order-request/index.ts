import type { OrderRequestReadModel } from '@ecomerece/domain';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export interface IOrderRequestQueries {
  getById(id: Id): Promise<OrderRequestReadModel | null>;
  getByOrderId(orderId: Id): Promise<OrderRequestReadModel[]>;
}
