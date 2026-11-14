import { buildMongoFilter } from '@ecomerece/domain';
import {
  type AggregationLevel,
  type EntityType,
  emptyMetrics,
  type StatEvent,
} from '@ecomerece/shared';
import type { AnyBulkWriteOperation } from 'mongoose';
import { type StatsDocument, StatsModel } from './StatsModel';

export class StatsRepository {
  /** Atomically increments every event's metrics into its matching document, creating it if needed. */
  async bulkUpsert(events: StatEvent[]): Promise<void> {
    if (events.length === 0) return;

    const operations: AnyBulkWriteOperation[] = [];

    for (const event of events) {
      const $inc: Record<string, number> = {};
      for (const [metric, value] of Object.entries(event.metrics)) {
        if (value) $inc[`metrics.${metric}`] = value;
      }
      if (Object.keys($inc).length === 0) continue; // nothing to increment, skip the write entirely

      operations.push({
        updateOne: {
          filter: buildMongoFilter(event),
          update: {
            $setOnInsert: {
              entity: event.entity,
              aggregation: event.aggregation,
              dimensions: event.dimensions,
            },
            $inc,
          },
          upsert: true,
        },
      });
    }

    if (operations.length === 0) return;

    // ordered: false so one bad op (e.g. a validation edge case) doesn't block the rest of the batch.
    await StatsModel.bulkWrite(operations, { ordered: false });
  }

  /**
   * Absolute overwrite (roll-up) of a set of stat slots. Unlike `bulkUpsert`
   * (which `$inc`s), this `$set`s the full metric set, so re-running a
   * denormalization/backfill never double counts. Values are idempotent.
   */
  async bulkSet(events: StatEvent[]): Promise<void> {
    if (events.length === 0) return;

    const operations: AnyBulkWriteOperation[] = [];

    for (const event of events) {
      const $set: Record<string, number> = {};
      for (const [metric, value] of Object.entries({ ...emptyMetrics(), ...event.metrics })) {
        $set[`metrics.${metric}`] = value;
      }

      operations.push({
        updateOne: {
          filter: buildMongoFilter(event),
          update: {
            $setOnInsert: {
              entity: event.entity,
              aggregation: event.aggregation,
              dimensions: event.dimensions,
            },
            $set,
          },
          upsert: true,
        },
      });
    }

    if (operations.length === 0) return;
    await StatsModel.bulkWrite(operations, { ordered: false });
  }

  async getEntityStats(
    entityType: EntityType,
    entityId: string,
    aggregation: AggregationLevel,
    filter: Record<string, unknown> = {},
  ): Promise<StatsDocument | null> {
    return StatsModel.findOne({
      'entity.type': entityType,
      'entity.id': entityId,
      aggregation,
      ...filter,
    }).lean();
  }

  async getTimeSeries(
    entityType: EntityType,
    entityId: string,
    aggregation: Extract<AggregationLevel, 'hourly' | 'daily' | 'weekly' | 'monthly'>,
    from: string,
    to: string,
  ): Promise<StatsDocument[]> {
    const dateField =
      aggregation === 'hourly' || aggregation === 'daily'
        ? 'dimensions.date'
        : aggregation === 'weekly'
          ? 'dimensions.week'
          : 'dimensions.month';

    return StatsModel.find({
      'entity.type': entityType,
      'entity.id': entityId,
      aggregation,
      [dateField]: { $gte: from, $lte: to },
    })
      .sort({ [dateField]: 1 })
      .lean();
  }

  async getTopEntities(
    entityType: EntityType,
    aggregation: AggregationLevel,
    metric: string,
    limit = 10,
    filter: Record<string, unknown> = {},
  ): Promise<StatsDocument[]> {
    return StatsModel.find({ 'entity.type': entityType, aggregation, ...filter })
      .sort({ [`metrics.${metric}`]: -1 })
      .limit(limit)
      .lean();
  }

  async getPaginatedByMetric(
    entityType: EntityType,
    aggregation: AggregationLevel,
    metric: string,
    sort: 'desc' | 'asc' = 'desc',
    limit = 20,
    cursor?: string,
  ): Promise<{ items: StatsDocument[]; nextCursor: string | null }> {
    const filter: Record<string, unknown> = { 'entity.type': entityType, aggregation };

    if (cursor) {
      const { v, id } = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf-8')) as {
        v: number;
        id: string;
      };
      if (sort === 'desc') {
        filter.$or = [
          { [`metrics.${metric}`]: { $lt: v } },
          { [`metrics.${metric}`]: v, 'entity.id': { $gt: id } },
        ];
      } else {
        filter.$or = [
          { [`metrics.${metric}`]: { $gt: v } },
          { [`metrics.${metric}`]: v, 'entity.id': { $gt: id } },
        ];
      }
    }

    const items = (await StatsModel.find(filter)
      .sort({ [`metrics.${metric}`]: sort, 'entity.id': 1 })
      .limit(limit)
      .lean()) as StatsDocument[];

    if (items.length === 0) return { items: [], nextCursor: null };

    const last = items[items.length - 1];
    const nextCursor = Buffer.from(
      JSON.stringify({
        v: (last.metrics as Record<string, number> | undefined)?.[metric] ?? 0,
        id: last.entity?.id ?? '',
      }),
    ).toString('base64url');

    return { items, nextCursor };
  }

  async getAggregateMetrics(
    entityType: EntityType,
    aggregation: AggregationLevel,
    ids?: string[],
  ): Promise<Record<string, number>> {
    const match: Record<string, unknown> = { 'entity.type': entityType, aggregation };
    if (ids && ids.length > 0) match['entity.id'] = { $in: ids };

    const sums = [
      ['views', 0],
      ['clicks', 0],
      ['purchases', 0],
      ['revenue', 0],
      ['quantity', 0],
      ['addToCart', 0],
      ['wishlist', 0],
      ['refunds', 0],
      ['refundAmount', 0],
    ] as const;

    const results = await StatsModel.aggregate<Record<string, number> & { _id: null }>([
      { $match: match },
      {
        $group: {
          _id: null,
          ...Object.fromEntries(sums.map(([field]) => [field, { $sum: `$metrics.${field}` }])),
        },
      },
    ]);

    if (results.length === 0) return Object.fromEntries(sums.map(([field]) => [field, 0]));
    const { _id, ...metrics } = results[0];
    void _id;
    return metrics;
  }

  async getAggregateTimeSeries(
    entityType: EntityType,
    aggregation: Extract<AggregationLevel, 'daily' | 'weekly' | 'monthly'>,
    from: string,
    to: string,
  ): Promise<{ key: string; metrics: Record<string, number> }[]> {
    const dimensionField =
      aggregation === 'daily' ? 'date' : aggregation === 'weekly' ? 'week' : 'month';

    const sums = [
      'views',
      'clicks',
      'purchases',
      'revenue',
      'quantity',
      'addToCart',
      'wishlist',
      'refunds',
      'refundAmount',
    ] as const;

    const rows = await StatsModel.aggregate<Record<string, number> & { _id: string }>([
      {
        $match: {
          'entity.type': entityType,
          aggregation,
          [`dimensions.${dimensionField}`]: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: `$dimensions.${dimensionField}`,
          ...Object.fromEntries(sums.map((field) => [field, { $sum: `$metrics.${field}` }])),
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return rows.map(({ _id, ...metrics }) => ({ key: _id, metrics }));
  }

  async getLifetimeDocs(entityType: EntityType, entityIds: string[]): Promise<StatsDocument[]> {
    return StatsModel.find({
      'entity.type': entityType,
      'entity.id': { $in: entityIds },
      aggregation: 'lifetime',
    }).lean();
  }

  /**
   * Bucket-sum of stats for a subset of entities, grouped by a time dimension.
   * Used to roll product-level series up into category-level series.
   */
  async getAggregateTimeSeriesForIds(
    entityType: EntityType,
    entityIds: string[],
    aggregation: Extract<AggregationLevel, 'daily' | 'weekly' | 'monthly'>,
    dimensionField: 'date' | 'week' | 'month',
    from: string,
    to: string,
  ): Promise<{ key: string; metrics: Record<string, number> }[]> {
    const sums = [
      'views',
      'clicks',
      'purchases',
      'revenue',
      'quantity',
      'addToCart',
      'wishlist',
      'refunds',
      'refundAmount',
    ] as const;

    const rows = await StatsModel.aggregate<Record<string, number> & { _id: string }>([
      {
        $match: {
          'entity.type': entityType,
          'entity.id': { $in: entityIds },
          aggregation,
          [`dimensions.${dimensionField}`]: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: `$dimensions.${dimensionField}`,
          ...Object.fromEntries(sums.map((field) => [field, { $sum: `$metrics.${field}` }])),
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return rows.map(({ _id, ...metrics }) => ({ key: _id, metrics }));
  }

  async getDocsBetween(
    entityType: EntityType,
    entityId: string,
    aggregation: Extract<AggregationLevel, 'hourly' | 'daily' | 'weekly' | 'monthly'>,
    field: 'date' | 'week' | 'month',
    from: string,
    to: string,
  ): Promise<StatsDocument[]> {
    return StatsModel.find({
      'entity.type': entityType,
      'entity.id': entityId,
      aggregation,
      [`dimensions.${field}`]: { $gte: from, $lte: to },
    }).lean();
  }
}

export const statsRepository = new StatsRepository();
