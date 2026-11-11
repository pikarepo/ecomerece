import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { GetAdminPaginatedUsersQueryDto } from '@ecomerece/shared';
import type { UserAppService } from '../user.app.service';

export type GetAdminPaginatedUsersResult = Awaited<
  ReturnType<UserAppService['findAdminPaginatedUsers']>
>;

export class GetAdminPaginatedUsersQuery implements IQuery<GetAdminPaginatedUsersResult> {
  readonly __result?: GetAdminPaginatedUsersResult;
  readonly type = 'GetAdminPaginatedUsersQuery';
  public readonly payload: { query: GetAdminPaginatedUsersQueryDto };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ query: GetAdminPaginatedUsersQueryDto }];
    this.payload = payload;
  }
}
