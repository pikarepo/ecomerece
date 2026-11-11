import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { GetAdminPaginatedAddressesQueryDto } from '@ecomerece/shared';
import type { AddressApplicationService } from '../address.app.service';

export type GetAdminPaginatedAddressesResult = Awaited<
  ReturnType<AddressApplicationService['findAdminPaginatedAddresses']>
>;

export class GetAdminPaginatedAddressesQuery implements IQuery<GetAdminPaginatedAddressesResult> {
  readonly __result?: GetAdminPaginatedAddressesResult;
  readonly type = 'GetAdminPaginatedAddressesQuery';
  public readonly payload: { query: GetAdminPaginatedAddressesQueryDto };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ query: GetAdminPaginatedAddressesQueryDto }];
    this.payload = payload;
  }
}
