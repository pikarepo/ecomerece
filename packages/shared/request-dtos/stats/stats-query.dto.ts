import { z } from 'zod';
import { METRIC_FIELDS } from '../../types/StatTypes';

export const statsEntityTypeSchema = z.enum(
  ['product', 'category', 'vendor', 'user', 'order', 'coupon', 'page'],
  {
    message: 'Entity type must be one of product, category, vendor, user, order, coupon, page',
  },
);

export const statsAggregationSchema = z
  .enum(['hourly', 'daily', 'weekly', 'monthly', 'lifetime'], {
    message: 'Aggregation must be one of hourly, daily, weekly, monthly, lifetime',
  })
  .default('lifetime');

export const statsMetricSchema = z
  .enum(METRIC_FIELDS as [string, ...string[]], {
    message: 'Metric must be a supported metric field',
  })
  .default('views');

export const getPaginatedStatsQuerySchema = z.object({
  entityType: statsEntityTypeSchema,
  aggregation: statsAggregationSchema,
  metric: statsMetricSchema,
  sort: z
    .enum(['desc', 'asc'], { message: 'Sort must be either desc or asc' })
    .optional()
    .default('desc'),
  cursor: z.string({ message: 'Cursor must be a string' }).optional(),
  limit: z.coerce
    .number({ message: 'Limit must be a number' })
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must not exceed 100')
    .optional()
    .default(20),
});

export type GetPaginatedStatsQueryDto = z.infer<typeof getPaginatedStatsQuerySchema>;

export const getStatsAggregateQuerySchema = z.object({
  entityType: statsEntityTypeSchema,
  aggregation: statsAggregationSchema,
  ids: z
    .array(z.string({ message: 'Each id must be a string' }), {
      message: 'Ids must be an array of strings',
    })
    .optional(),
});

export type GetStatsAggregateQueryDto = z.infer<typeof getStatsAggregateQuerySchema>;

export const getStatsAggregateTimeSeriesQuerySchema = z.object({
  entityType: statsEntityTypeSchema,
  aggregation: statsAggregationSchema,
  from: z.string({ message: 'From must be a string' }).optional(),
  to: z.string({ message: 'To must be a string' }).optional(),
});

export type GetStatsAggregateTimeSeriesQueryDto = z.infer<
  typeof getStatsAggregateTimeSeriesQuerySchema
>;

export const getProductStatsOverviewQuerySchema = z.object({
  months: z.coerce
    .number({ message: 'Months must be a number' })
    .min(1, 'Months must be at least 1')
    .max(24, 'Months must not exceed 24')
    .optional()
    .default(12),
  days: z.coerce
    .number({ message: 'Days must be a number' })
    .min(1, 'Days must be at least 1')
    .max(90, 'Days must not exceed 90')
    .optional()
    .default(30),
});

export type GetProductStatsOverviewQueryDto = z.infer<typeof getProductStatsOverviewQuerySchema>;

export const updateProductStatsSettingsSchema = z.object({
  intervalHours: z.coerce
    .number({ message: 'Interval hours must be a number' })
    .min(1, 'Interval hours must be at least 1')
    .max(24 * 28, 'Interval hours must not exceed 672')
    .optional(),
  autoDenormalizeEnabled: z.coerce
    .boolean({ message: 'autoDenormalizeEnabled must be a boolean' })
    .optional(),
  /**
   * Worst-case staleness ceiling. Even if `intervalHours` is set much larger,
   * a full denormalization runs at least every `maxStalenessHours` so the
   * dashboards never show old data (default 24h).
   */
  maxStalenessHours: z.coerce
    .number({ message: 'Max staleness hours must be a number' })
    .min(1, 'Max staleness hours must be at least 1')
    .max(24 * 28, 'Max staleness hours must not exceed 672')
    .optional(),
  /** Number of force-refreshes each vendor may trigger per month. */
  vendorForceRefreshQuota: z.coerce
    .number({ message: 'Vendor force refresh quota must be a number' })
    .min(0, 'Vendor force refresh quota cannot be negative')
    .max(1000, 'Vendor force refresh quota must not exceed 1000')
    .optional(),
});

export type UpdateProductStatsSettingsDto = z.infer<typeof updateProductStatsSettingsSchema>;
