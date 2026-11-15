import type { AggregationLevel, EntityType } from '@ecomerece/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type StatsAggregationLevel, statsService } from './stats.service';

export const STATS_QUERY_KEY = ['stats'];

export function useGetVendorLifetimeStats(vendorId: string) {
  return useQuery({
    queryKey: [...STATS_QUERY_KEY, 'vendor', vendorId, 'lifetime'],
    queryFn: () => statsService.getLifetime('vendor', vendorId),
    enabled: Boolean(vendorId),
  });
}

export function useGetVendorTimeSeries(
  vendorId: string,
  aggregation: StatsAggregationLevel,
  from: string,
  to: string,
) {
  return useQuery({
    queryKey: [...STATS_QUERY_KEY, 'vendor', vendorId, 'timeseries', aggregation, from, to],
    queryFn: () => statsService.getTimeSeries('vendor', vendorId, aggregation, from, to),
    enabled: Boolean(vendorId && from && to),
  });
}

export function useGetProductLifetimeStats(productId: string) {
  return useQuery({
    queryKey: [...STATS_QUERY_KEY, 'product', productId, 'lifetime'],
    queryFn: () => statsService.getLifetime('product', productId),
    enabled: Boolean(productId),
  });
}

export function useGetPaginatedProductStats(params: {
  entityType: EntityType;
  aggregation?: AggregationLevel;
  metric?: string;
  sort?: 'desc' | 'asc';
  cursor?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: [...STATS_QUERY_KEY, 'paginated', params],
    queryFn: () =>
      statsService.getPaginatedStats(params.entityType, {
        aggregation: params.aggregation,
        metric: params.metric,
        sort: params.sort,
        cursor: params.cursor,
        limit: params.limit,
      }),
    enabled: Boolean(params.entityType),
  });
}

export function useGetProductStatsOverview(
  productId: string,
  options: { months?: number; days?: number; enabled?: boolean } = {},
) {
  const { months = 12, days = 30, enabled = true } = options;
  return useQuery({
    queryKey: [...STATS_QUERY_KEY, 'product', productId, 'overview', months, days],
    queryFn: () => statsService.getProductStatsOverview(productId, months, days),
    enabled: Boolean(productId) && enabled,
  });
}

export function useGetCategoryStatsOverview(
  categoryId: string,
  options: { months?: number; days?: number; enabled?: boolean } = {},
) {
  const { months = 12, days = 30, enabled = true } = options;
  return useQuery({
    queryKey: [...STATS_QUERY_KEY, 'category', categoryId, 'overview', months, days],
    queryFn: () => statsService.getCategoryStatsOverview(categoryId, months, days),
    enabled: Boolean(categoryId) && enabled,
  });
}

export function useGetVendorStatsOverview(
  vendorId: string,
  options: { months?: number; days?: number; enabled?: boolean } = {},
) {
  const { months = 12, days = 30, enabled = true } = options;
  return useQuery({
    queryKey: [...STATS_QUERY_KEY, 'vendor', vendorId, 'overview', months, days],
    queryFn: () => statsService.getVendorStatsOverview(vendorId, months, days),
    enabled: Boolean(vendorId) && enabled,
  });
}

export function useGetMyVendorStatsOverview(
  options: { months?: number; days?: number; enabled?: boolean } = {},
) {
  const { months = 12, days = 30, enabled = true } = options;
  return useQuery({
    queryKey: [...STATS_QUERY_KEY, 'vendor', 'me', 'overview', months, days],
    queryFn: () => statsService.getMyVendorStatsOverview(months, days),
    enabled,
  });
}

export function useGetVendorForceRefreshUsage() {
  return useQuery({
    queryKey: [...STATS_QUERY_KEY, 'vendor', 'force-update', 'usage'],
    queryFn: () => statsService.getVendorForceRefreshUsage(),
  });
}

export function useVendorForceRefresh() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => statsService.forceRefreshVendorStats(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...STATS_QUERY_KEY, 'vendor'] });
      queryClient.invalidateQueries({ queryKey: [...STATS_QUERY_KEY, 'sync-settings'] });
    },
  });
}

export function useGetPaginatedCategoryStats(
  params: { metric?: string; sort?: 'desc' | 'asc'; cursor?: string; limit?: number } = {},
) {
  return useQuery({
    queryKey: [...STATS_QUERY_KEY, 'category', 'paginated', params],
    queryFn: () =>
      statsService.getPaginatedStats('category', { aggregation: 'lifetime', ...params }),
  });
}

export function useGetStatsAggregate(
  entityType: EntityType,
  params: { aggregation?: AggregationLevel; ids?: string[] } = {},
) {
  return useQuery({
    queryKey: [...STATS_QUERY_KEY, entityType, 'aggregate', params],
    queryFn: () => statsService.getAggregate(entityType, params),
    enabled: Boolean(entityType),
  });
}

export function useGetStatsAggregateTimeSeries(
  entityType: EntityType,
  params: { aggregation?: 'daily' | 'weekly' | 'monthly'; from?: string; to?: string } = {},
) {
  return useQuery({
    queryKey: [...STATS_QUERY_KEY, entityType, 'aggregate-timeseries', params],
    queryFn: () => statsService.getAggregateTimeSeries(entityType, params),
    enabled: Boolean(entityType),
  });
}

export function useGetStatsSyncSettings() {
  return useQuery({
    queryKey: [...STATS_QUERY_KEY, 'sync-settings'],
    queryFn: () => statsService.getSyncSettings(),
  });
}

export function useUpdateStatsSyncSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      intervalHours?: number;
      autoDenormalizeEnabled?: boolean;
      maxStalenessHours?: number;
      vendorForceRefreshQuota?: number;
    }) => statsService.updateSyncSettings(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...STATS_QUERY_KEY, 'sync-settings'] });
    },
  });
}

export function useTriggerProductStatsDenormalization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => statsService.triggerProductStatsDenormalization(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...STATS_QUERY_KEY, 'sync-settings'] });
    },
  });
}
