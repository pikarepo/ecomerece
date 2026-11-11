import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { OrderInternalService } from '../order.internal.service';

export type GetOrderByIdResult = Awaited<ReturnType<OrderInternalService['getOrderById']>>;

export class GetOrderByIdQuery implements IQuery<GetOrderByIdResult> {
  readonly __result?: GetOrderByIdResult;
  readonly type = 'GetOrderByIdQuery';
  public readonly payload: { orderId: Id };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ orderId: Id }];
    this.payload = payload;
  }
}
