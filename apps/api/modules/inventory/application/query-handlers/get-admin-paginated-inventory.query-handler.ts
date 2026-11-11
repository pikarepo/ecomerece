import type { InventoryApplicationService } from '../inventory.app.service';
import type {
  GetAdminPaginatedInventoryQuery,
  GetAdminPaginatedInventoryResult,
} from '../queries/get-admin-paginated-inventory.query';

export class GetAdminPaginatedInventoryHandler {
  readonly type = 'GetAdminPaginatedInventoryQuery';
  constructor(private readonly appService: InventoryApplicationService) {}

  async handle(
    query: GetAdminPaginatedInventoryQuery,
  ): Promise<GetAdminPaginatedInventoryResult> {
    return await this.appService.findAdminPaginatedInventory(query.payload.query);
  }
}
