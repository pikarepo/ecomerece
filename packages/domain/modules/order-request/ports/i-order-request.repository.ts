import type { Id } from '../../../value-objects';
import type { OrderRequestAggregate } from '../order-request.aggregate';

export interface IOrderRequestRepository {
  FindById(id: Id): Promise<OrderRequestAggregate | null>;
  FindByIdOrThrow(id: Id): Promise<OrderRequestAggregate>;
  FindByBuyerId(buyerId: Id): Promise<OrderRequestAggregate[]>;
  FindByVendorId(vendorId: Id): Promise<OrderRequestAggregate[]>;
  FindByOrderId(orderId: Id): Promise<OrderRequestAggregate[]>;
  Create(request: OrderRequestAggregate): Promise<void>;
  Save(request: OrderRequestAggregate): Promise<void>;
}
