import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { GetAdminPaginatedOrdersQueryDto } from '@ecomerece/shared';
import type { OrderApplicationService } from '../order.app.service';

export type GetAdminPaginatedOrdersResult = Awaited<
  ReturnType<OrderApplicationService['findAdminPaginatedOrders']>
>;

export class GetAdminPaginatedOrdersQuery implements IQuery<GetAdminPaginatedOrdersResult> {
  readonly __result?: GetAdminPaginatedOrdersResult;
  readonly type = 'GetAdminPaginatedOrdersQuery';
  public readonly payload: { query: GetAdminPaginatedOrdersQueryDto };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ query: GetAdminPaginatedOrdersQueryDto }];
    this.payload = payload;
  }
}
