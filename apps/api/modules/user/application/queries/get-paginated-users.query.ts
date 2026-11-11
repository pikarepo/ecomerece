import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { GetPaginatedUsersQueryDto } from '@ecomerece/shared';
import type { UserAppService } from '../user.app.service';

export type GetPaginatedUsersResult = Awaited<
  ReturnType<UserAppService['findPublicPaginatedUsers']>
>;

export class GetPaginatedUsersQuery implements IQuery<GetPaginatedUsersResult> {
  readonly __result?: GetPaginatedUsersResult;
  readonly type = 'GetPaginatedUsersQuery';
  public readonly payload: { query: GetPaginatedUsersQueryDto };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ query: GetPaginatedUsersQueryDto }];
    this.payload = payload;
  }
}
