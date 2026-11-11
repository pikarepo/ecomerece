import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { GetAdminPaginatedVendorsQueryDto } from '@ecomerece/shared';
import type { VendorAppService } from '../vendor.app.service';

export type GetAdminPaginatedVendorsResult = Awaited<
  ReturnType<VendorAppService['findAdminPaginatedVendors']>
>;

export class GetAdminPaginatedVendorsQuery
  implements IQuery<GetAdminPaginatedVendorsResult>
{
  readonly __result?: GetAdminPaginatedVendorsResult;
  readonly type = 'GetAdminPaginatedVendorsQuery';
  public readonly payload: { query: GetAdminPaginatedVendorsQueryDto };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ query: GetAdminPaginatedVendorsQueryDto }];
    this.payload = payload;
  }
}
