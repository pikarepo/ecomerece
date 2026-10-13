import type { InventoryReadModel } from '@ecomerece/domain';
import type { OrderItem } from '@ecomerece/domain/modules/order/value-objects/order-item.vo';
import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';

export class VerifyInventoriesItemsGetQuery
  implements
    IQuery<{
      validIds: Id[];
      notFoundIds: Id[];
      deletedIds: Id[];
      availableStockIds: Id[];
      buyableIds: Id[];
      inventoriesReadModel: InventoryReadModel[];
    }>
{
  readonly __result?: {
    validIds: Id[];
    notFoundIds: Id[];
    deletedIds: Id[];
    availableStockIds: Id[];
    buyableIds: Id[];
    inventoriesReadModel: InventoryReadModel[];
  };
  readonly type = 'VerifyInventoriesItemsGetQuery';
  public readonly payload: { inventoryItems: OrderItem[] };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ inventoryItems: OrderItem[] }];
    this.payload = payload;
  }
}
