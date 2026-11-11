import type { EntityType } from '@ecomerece/shared';
import type { StatsQueryService } from '../StatsQueryService';
import type {
  GetPaginatedStatsQuery,
  GetPaginatedStatsResult,
} from '../queries/get-paginated-stats.query';

export class GetPaginatedStatsHandler {
  readonly type = 'GetPaginatedStatsQuery';
  constructor(private readonly queryService: StatsQueryService) {}

  async handle(query: GetPaginatedStatsQuery): Promise<GetPaginatedStatsResult> {
    const { entityType, aggregation, metric, sort, limit, cursor } = query.payload.query;
    return await this.queryService.getPaginatedByMetric(
      entityType as EntityType,
      aggregation,
      metric,
      sort,
      limit,
      cursor,
    );
  }
}
