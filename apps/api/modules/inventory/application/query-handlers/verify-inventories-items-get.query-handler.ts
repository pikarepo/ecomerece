import type { InventoryInternalServcie } from '../inventory.internal.service';
import type {
  VerifyInventoriesItemsGetQuery,
  VerifyInventoriesItemsResult,
} from '../queries/verify-inventories-items-get.query';

export class VerifyInventoriesItemsGetQueryHander {
  readonly type = 'VerifyInventoriesItemsGetQuery';
  constructor(private readonly internalService: InventoryInternalServcie) {}
  async handle(query: VerifyInventoriesItemsGetQuery): Promise<VerifyInventoriesItemsResult> {
    return await this.internalService.verifyInventoriesItemsGet(query.payload.inventoryItems);
  }
}
