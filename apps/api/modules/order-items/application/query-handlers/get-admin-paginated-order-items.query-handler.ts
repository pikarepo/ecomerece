import type { OrderItemsApplicationService } from '../order-item.app.service';
import type {
  GetAdminPaginatedOrderItemsQuery,
  GetAdminPaginatedOrderItemsResult,
} from '../queries/get-admin-paginated-order-items.query';

export class GetAdminPaginatedOrderItemsHandler {
  readonly type = 'GetAdminPaginatedOrderItemsQuery';
  constructor(private readonly appService: OrderItemsApplicationService) {}

  async handle(
    query: GetAdminPaginatedOrderItemsQuery,
  ): Promise<GetAdminPaginatedOrderItemsResult> {
    return await this.appService.findAdminPaginatedOrderItems(query.payload.query);
  }
}
