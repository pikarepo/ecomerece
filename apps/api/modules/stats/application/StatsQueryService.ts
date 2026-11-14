import { getTimeWindows } from '@ecomerece/domain';
import {
  type AggregationLevel,
  type EntityType,
  emptyMetrics,
  type Metrics,
} from '@ecomerece/shared';
import { statsRepository } from '../infrastructure/StatsRepository';

function sumMetrics(docs: { metrics?: Metrics }[]): Metrics {
  const total = { ...emptyMetrics() };
  for (const doc of docs) {
    for (const [metric, value] of Object.entries(doc.metrics ?? {})) {
      total[metric as keyof Metrics] = (total[metric as keyof Metrics] ?? 0) + (value ?? 0);
    }
  }
  return total;
}

function backMonths(months: number, fromMonth: string): string[] {
  const [yearStr, monthStr] = fromMonth.split('-');
  let year = Number(yearStr);
  let month = Number(monthStr);
  const keys: string[] = [];
  for (let i = 0; i < months; i++) {
    keys.unshift(`${year}-${String(month).padStart(2, '0')}`);
    month -= 1;
    if (month === 0) {
      month = 12;
      year -= 1;
    }
  }
  return keys;
}

function backDays(days: number, fromDate: string): string[] {
  const [yearStr, monthStr, dayStr] = fromDate.split('-').map(Number);
  const base = Date.UTC(yearStr, monthStr - 1, dayStr) - (days - 1) * 86_400_000;
  const keys: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(base + i * 86_400_000);
    keys.push(d.toISOString().split('T')[0]);
  }
  return keys;
}

export interface ProductStatsOverview {
  lifetime: Metrics;
  today: Metrics;
  thisWeek: Metrics;
  thisMonth: Metrics;
  thisYear: Metrics;
  monthlySeries: { key: string; metrics: Metrics }[];
  dailySeries: { key: string; metrics: Metrics }[];
}

export class StatsQueryService {
  async getLifetimeStats(entityType: EntityType, entityId: string): Promise<Metrics> {
    const doc = await statsRepository.getEntityStats(entityType, entityId, 'lifetime');
    return doc?.metrics ?? emptyMetrics();
  }

  async getStatsForDate(entityType: EntityType, entityId: string, date: string): Promise<Metrics> {
    const doc = await statsRepository.getEntityStats(entityType, entityId, 'daily', {
      'dimensions.date': date,
    });
    return doc?.metrics ?? emptyMetrics();
  }

  async getToday(entityType: EntityType, entityId: string): Promise<Metrics> {
    const { date } = getTimeWindows(new Date());
    return this.getStatsForDate(entityType, entityId, date);
  }

  async getDailyTimeSeries(entityType: EntityType, entityId: string, from: string, to: string) {
    return statsRepository.getTimeSeries(entityType, entityId, 'daily', from, to);
  }

  async getWeeklyTimeSeries(entityType: EntityType, entityId: string, from: string, to: string) {
    return statsRepository.getTimeSeries(entityType, entityId, 'weekly', from, to);
  }

  async getMonthlyTimeSeries(entityType: EntityType, entityId: string, from: string, to: string) {
    return statsRepository.getTimeSeries(entityType, entityId, 'monthly', from, to);
  }

  async getTopByMetric(
    entityType: EntityType,
    aggregation: 'daily' | 'weekly' | 'monthly' | 'lifetime',
    metric: string,
    limit = 10,
  ) {
    return statsRepository.getTopEntities(entityType, aggregation, metric, limit);
  }

  async getPaginatedByMetric(
    entityType: EntityType,
    aggregation: AggregationLevel,
    metric: string,
    sort: 'desc' | 'asc' = 'desc',
    limit = 20,
    cursor?: string,
  ) {
    return statsRepository.getPaginatedByMetric(
      entityType,
      aggregation,
      metric,
      sort,
      limit,
      cursor,
    );
  }

  async getAggregateMetrics(entityType: EntityType, aggregation: AggregationLevel, ids?: string[]) {
    return statsRepository.getAggregateMetrics(entityType, aggregation, ids);
  }

  async getAggregateTimeSeries(
    entityType: EntityType,
    aggregation: 'daily' | 'weekly' | 'monthly',
    from: string,
    to: string,
  ) {
    return statsRepository.getAggregateTimeSeries(entityType, aggregation, from, to);
  }

  async getEntityOverview(
    entityType: EntityType,
    entityId: string,
    months = 12,
    days = 30,
  ): Promise<ProductStatsOverview> {
    const now = new Date();
    const { date, week, month } = getTimeWindows(now);
    const year = date.slice(0, 4);

    const [lifetime, today, thisWeek, thisMonth, yearDocs, monthlyDocs, dailyDocs] =
      await Promise.all([
        statsRepository.getEntityStats(entityType, entityId, 'lifetime'),
        statsRepository.getEntityStats(entityType, entityId, 'daily', { 'dimensions.date': date }),
        statsRepository.getEntityStats(entityType, entityId, 'weekly', {
          'dimensions.week': week,
        }),
        statsRepository.getEntityStats(entityType, entityId, 'monthly', {
          'dimensions.month': month,
        }),
        statsRepository.getDocsBetween(
          entityType,
          entityId,
          'monthly',
          'month',
          `${year}-01`,
          `${year}-12`,
        ),
        statsRepository.getDocsBetween(
          entityType,
          entityId,
          'monthly',
          'month',
          backMonths(months, month)[0],
          month,
        ),
        statsRepository.getDocsBetween(
          entityType,
          entityId,
          'daily',
          'date',
          backDays(days, date)[0],
          date,
        ),
      ]);

    const monthMap = new Map<string, Metrics>(
      monthlyDocs.map((d) => [d.dimensions?.month ?? '', (d.metrics as Metrics) ?? emptyMetrics()]),
    );
    const dayMap = new Map<string, Metrics>(
      dailyDocs.map((d) => [d.dimensions?.date ?? '', (d.metrics as Metrics) ?? emptyMetrics()]),
    );

    return {
      lifetime: (lifetime?.metrics as Metrics | undefined) ?? emptyMetrics(),
      today: (today?.metrics as Metrics | undefined) ?? emptyMetrics(),
      thisWeek: (thisWeek?.metrics as Metrics | undefined) ?? emptyMetrics(),
      thisMonth: (thisMonth?.metrics as Metrics | undefined) ?? emptyMetrics(),
      thisYear: sumMetrics(
        yearDocs.map((d) => ({ metrics: (d.metrics as Metrics) ?? emptyMetrics() })),
      ),
      monthlySeries: backMonths(months, month).map((key) => ({
        key,
        metrics: { ...emptyMetrics(), ...(monthMap.get(key) ?? {}) },
      })),
      dailySeries: backDays(days, date).map((key) => ({
        key,
        metrics: { ...emptyMetrics(), ...(dayMap.get(key) ?? {}) },
      })),
    };
  }
}

export const statsQueryService = new StatsQueryService();
