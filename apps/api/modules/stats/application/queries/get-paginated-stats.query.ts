import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { GetPaginatedStatsQueryDto } from '@ecomerece/shared';
import type { StatsQueryService } from '../StatsQueryService';

export type GetPaginatedStatsResult = Awaited<
  ReturnType<StatsQueryService['getPaginatedByMetric']>
>;

export class GetPaginatedStatsQuery implements IQuery<GetPaginatedStatsResult> {
  readonly __result?: GetPaginatedStatsResult;
  readonly type = 'GetPaginatedStatsQuery';
  public readonly payload: { query: GetPaginatedStatsQueryDto };

  constructor(...args: unknown[]) {
    const [payload] = args as [{ query: GetPaginatedStatsQueryDto }];
    this.payload = payload;
  }
}
