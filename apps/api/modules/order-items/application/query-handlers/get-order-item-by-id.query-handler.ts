import type { OrderItemsInternalService } from '../order-item.internal';
import type {
  GetOrderItemByIdQuery,
  GetOrderItemByIdResult,
} from '../queries/get-order-item-by-id.query';

export class GetOrderItemByIdHandler {
  readonly type = 'GetOrderItemByIdQuery';
  constructor(private readonly internalService: OrderItemsInternalService) {}

  async handle(query: GetOrderItemByIdQuery): Promise<GetOrderItemByIdResult> {
    return await this.internalService.getOrderItemById(query.payload.orderItemId);
  }
}
