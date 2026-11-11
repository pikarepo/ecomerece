import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { InventoryInternalServcie } from '../inventory.internal.service';

export type GetInventoryByVariantIdResult = Awaited<
  ReturnType<InventoryInternalServcie['getInventoryByVariantId']>
>;

export class GetInventoryByVariantIdQuery implements IQuery<GetInventoryByVariantIdResult> {
  readonly __result?: GetInventoryByVariantIdResult;
  readonly type = 'GetInventoryByVariantIdQuery';
  public readonly payload: { variantId: Id };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ variantId: Id }];
    this.payload = payload;
  }
}
