import type { InventoryReadModel } from '@ecomerece/domain';
import type { OrderItem } from '@ecomerece/domain/modules/order/value-objects/order-item.vo';
import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';

export interface VerifyInventoriesItemsResult {
  validIds: Id[];
  notFoundIds: Id[];
  deletedIds: Id[];
  availableStockIds: Id[];
  buyableIds: Id[];
  inventoriesReadModel: InventoryReadModel[];
}

export class VerifyInventoriesItemsGetQuery implements IQuery<VerifyInventoriesItemsResult> {
  readonly __result?: VerifyInventoriesItemsResult;
  readonly type = 'VerifyInventoriesItemsGetQuery';
  public readonly payload: { inventoryItems: OrderItem[] };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ inventoryItems: OrderItem[] }];
    this.payload = payload;
  }
}

export interface InventoryReservationResult {
  validIds: Id[];
  notFoundIds: Id[];
  deletedIds: Id[];
  availableStockIds: Id[];
  buyableIds: Id[];
  inventoriesReadModel: InventoryReadModel[];
}

export interface IInventoryReservation {
  reserve(
    items: { variantId: Id; quantity: Quantity }[],
    actorId: Id,
  ): Promise<InventoryReservationResult>;
}
