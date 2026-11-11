import type { OrderInternalService } from '../order.internal.service';
import type { GetOrderByIdQuery, GetOrderByIdResult } from '../queries/get-order-by-id.query';

export class GetOrderByIdHandler {
  readonly type = 'GetOrderByIdQuery';
  constructor(private readonly internalService: OrderInternalService) {}

  async handle(query: GetOrderByIdQuery): Promise<GetOrderByIdResult> {
    return await this.internalService.getOrderById(query.payload.orderId);
  }
}
