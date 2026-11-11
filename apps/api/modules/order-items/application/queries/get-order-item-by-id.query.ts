import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { OrderItemsInternalService } from '../order-item.internal';

export type GetOrderItemByIdResult = Awaited<
  ReturnType<OrderItemsInternalService['getOrderItemById']>
>;

export class GetOrderItemByIdQuery implements IQuery<GetOrderItemByIdResult> {
  readonly __result?: GetOrderItemByIdResult;
  readonly type = 'GetOrderItemByIdQuery';
  public readonly payload: { orderItemId: Id };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ orderItemId: Id }];
    this.payload = payload;
  }
}
