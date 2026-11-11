import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { GetPaginatedVendorsQueryDto } from '@ecomerece/shared';
import type { VendorAppService } from '../vendor.app.service';

export type GetPaginatedVendorsResult = Awaited<
  ReturnType<VendorAppService['findPaginatedVendors']>
>;

export class GetPaginatedVendorsQuery implements IQuery<GetPaginatedVendorsResult> {
  readonly __result?: GetPaginatedVendorsResult;
  readonly type = 'GetPaginatedVendorsQuery';
  public readonly payload: { query: GetPaginatedVendorsQueryDto };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ query: GetPaginatedVendorsQueryDto }];
    this.payload = payload;
  }
}
