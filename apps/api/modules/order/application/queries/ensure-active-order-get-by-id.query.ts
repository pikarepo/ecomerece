import type { Id, IQuery, OrderReadModel } from '@ecomerece/domain';

export class EnsureActiveOrderGetByIdQuery
  implements IQuery<{ order: OrderReadModel | null; active: boolean }>
{
  readonly __result?: { order: OrderReadModel | null; active: boolean };
  readonly type = 'EnsureActiveProductGetByIdQuery';
  public readonly payload: { orderId: Id };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ orderId: Id }];
    this.payload = payload;
  }
}
