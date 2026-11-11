import type { OrderApplicationService } from '../order.app.service';
import type {
  GetAdminPaginatedOrdersQuery,
  GetAdminPaginatedOrdersResult,
} from '../queries/get-admin-paginated-orders.query';

export class GetAdminPaginatedOrdersHandler {
  readonly type = 'GetAdminPaginatedOrdersQuery';
  constructor(private readonly appService: OrderApplicationService) {}

  async handle(query: GetAdminPaginatedOrdersQuery): Promise<GetAdminPaginatedOrdersResult> {
    return await this.appService.findAdminPaginatedOrders(query.payload.query);
  }
}
