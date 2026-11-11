import type { StatsQueryService } from '../StatsQueryService';
import type {
  GetEntityStatsOverviewQuery,
  GetEntityStatsOverviewResult,
} from '../queries/get-entity-stats-overview.query';

export class GetEntityStatsOverviewHandler {
  readonly type = 'GetEntityStatsOverviewQuery';
  constructor(private readonly queryService: StatsQueryService) {}

  async handle(query: GetEntityStatsOverviewQuery): Promise<GetEntityStatsOverviewResult> {
    return await this.queryService.getEntityOverview(
      query.payload.entityType,
      query.payload.entityId,
      query.payload.months,
      query.payload.days,
    );
  }
}
