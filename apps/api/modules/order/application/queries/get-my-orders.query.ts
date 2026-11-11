import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { GetMyOrdersQueryDto } from '@ecomerece/shared';
import type { OrderApplicationService } from '../order.app.service';

export type GetMyOrdersResult = Awaited<ReturnType<OrderApplicationService['getMyOrders']>>;

export class GetMyOrdersQuery implements IQuery<GetMyOrdersResult> {
  readonly __result?: GetMyOrdersResult;
  readonly type = 'GetMyOrdersQuery';
  public readonly payload: { query: GetMyOrdersQueryDto; buyerId: Id };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ query: GetMyOrdersQueryDto; buyerId: Id }];
    this.payload = payload;
  }
}
