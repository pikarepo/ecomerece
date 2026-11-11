import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { InventoryInternalServcie } from '../inventory.internal.service';

export type GetInventoryByIdResult = Awaited<
  ReturnType<InventoryInternalServcie['getInventoryById']>
>;

export class GetInventoryByIdQuery implements IQuery<GetInventoryByIdResult> {
  readonly __result?: GetInventoryByIdResult;
  readonly type = 'GetInventoryByIdQuery';
  public readonly payload: { inventoryId: Id };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ inventoryId: Id }];
    this.payload = payload;
  }
}
