import type { OrderItemReadModel } from '@ecomerece/domain';
import type { GetOrderItemsByOrderIdQuery } from '@ecomerece/contracts/modules/order-items';
import type { OrderItemsInternalService } from '../order-item.internal';

export class GetOrderItemsByOrderIdHandler {
  readonly type = 'GetOrderItemsByOrderIdQuery';
  constructor(private readonly internalService: OrderItemsInternalService) {}

  async handle(query: GetOrderItemsByOrderIdQuery): Promise<OrderItemReadModel[]> {
    return await this.internalService.getOrderItemsByOrderId(query.payload.orderId);
  }
}
