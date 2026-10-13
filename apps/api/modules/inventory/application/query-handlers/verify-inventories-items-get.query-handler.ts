import type { InventoryReadModel } from '@ecomerece/domain';
import type { Id } from '@ecomerece/domain/value-objects/id.vo';
import type { InventoryInternalServcie } from '../inventory.internal.service';
import type { VerifyInventoriesItemsGetQuery } from '../queries/verify-inventories-items-get.query';

export class VerifyInventoriesItemsGetQueryHander {
  readonly type = 'EnsureActiveAddressGetByIdQuery';
  constructor(private readonly internalService: InventoryInternalServcie) {}
  async handle(query: VerifyInventoriesItemsGetQuery): Promise<{
    validIds: Id[];
    notFoundIds: Id[];
    deletedIds: Id[];
    availableStockIds: Id[];
    buyableIds: Id[];
    inventoriesReadModel: InventoryReadModel[];
  }> {
    return await this.internalService.verifyInventoriesItemsGet(query.payload.inventoryItems);
  }
}
