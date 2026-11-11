import type { OrderApplicationService } from '../order.app.service';
import type { GetMyOrdersQuery, GetMyOrdersResult } from '../queries/get-my-orders.query';

export class GetMyOrdersHandler {
  readonly type = 'GetMyOrdersQuery';
  constructor(private readonly appService: OrderApplicationService) {}

  async handle(query: GetMyOrdersQuery): Promise<GetMyOrdersResult> {
    return await this.appService.getMyOrders(query.payload.query, query.payload.buyerId.value);
  }
}
