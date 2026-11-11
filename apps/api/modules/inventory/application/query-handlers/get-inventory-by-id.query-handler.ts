import type { InventoryInternalServcie } from '../inventory.internal.service';
import type {
  GetInventoryByIdQuery,
  GetInventoryByIdResult,
} from '../queries/get-inventory-by-id.query';

export class GetInventoryByIdHandler {
  readonly type = 'GetInventoryByIdQuery';
  constructor(private readonly internalService: InventoryInternalServcie) {}

  async handle(query: GetInventoryByIdQuery): Promise<GetInventoryByIdResult> {
    return await this.internalService.getInventoryById(query.payload.inventoryId);
  }
}
