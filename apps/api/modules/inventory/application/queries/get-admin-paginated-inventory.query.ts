import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { GetAdminPaginatedInventoryQueryDto } from '@ecomerece/shared';
import type { InventoryApplicationService } from '../inventory.app.service';

export type GetAdminPaginatedInventoryResult = Awaited<
  ReturnType<InventoryApplicationService['findAdminPaginatedInventory']>
>;

export class GetAdminPaginatedInventoryQuery
  implements IQuery<GetAdminPaginatedInventoryResult>
{
  readonly __result?: GetAdminPaginatedInventoryResult;
  readonly type = 'GetAdminPaginatedInventoryQuery';
  public readonly payload: { query: GetAdminPaginatedInventoryQueryDto };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ query: GetAdminPaginatedInventoryQueryDto }];
    this.payload = payload;
  }
}
