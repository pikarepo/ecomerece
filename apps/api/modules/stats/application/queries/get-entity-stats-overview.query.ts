import type { IQuery } from '@ecomerece/domain/query/query-bus.interface';
import type { EntityType } from '@ecomerece/shared';
import type { StatsQueryService } from '../StatsQueryService';

export type GetEntityStatsOverviewResult = Awaited<
  ReturnType<StatsQueryService['getEntityOverview']>
>;

export class GetEntityStatsOverviewQuery implements IQuery<GetEntityStatsOverviewResult> {
  readonly __result?: GetEntityStatsOverviewResult;
  readonly type = 'GetEntityStatsOverviewQuery';
  public readonly payload: {
    entityType: EntityType;
    entityId: string;
    months?: number;
    days?: number;
  };

  constructor(...args: unknown[]) {
    const [payload] = args as [
      { entityType: EntityType; entityId: string; months?: number; days?: number },
    ];
    this.payload = payload;
  }
}
