import type { OrderItemReadModel } from '@ecomerece/domain';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { OrderItemsInternalService } from '../application/order-item.internal';

/** Contract-facing adapter for order-item reads. */
export class OrderItemsQueryAdapter {
  constructor(private readonly internalService: OrderItemsInternalService) {}

  getByOrderId(orderId: Id): Promise<OrderItemReadModel[]> {
    return this.internalService.getOrderItemsByOrderId(orderId);
  }
}
