import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { GetAdminPaginatedOrderItemsQueryDto } from '@ecomerece/shared';
import type { OrderItemsApplicationService } from '../order-item.app.service';

export type GetAdminPaginatedOrderItemsResult = Awaited<
  ReturnType<OrderItemsApplicationService['findAdminPaginatedOrderItems']>
>;

export class GetAdminPaginatedOrderItemsQuery
  implements IQuery<GetAdminPaginatedOrderItemsResult>
{
  readonly __result?: GetAdminPaginatedOrderItemsResult;
  readonly type = 'GetAdminPaginatedOrderItemsQuery';
  public readonly payload: { query: GetAdminPaginatedOrderItemsQueryDto };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ query: GetAdminPaginatedOrderItemsQueryDto }];
    this.payload = payload;
  }
}
