'use client';

import BoltIcon from '@mui/icons-material/Bolt';
import RefreshIcon from '@mui/icons-material/Refresh';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  useGetPaginatedCategoryStats,
  useGetPaginatedProductStats,
  useGetStatsAggregate,
  useGetStatsAggregateTimeSeries,
  useGetStatsSyncSettings,
  useTriggerProductStatsDenormalization,
  useUpdateStatsSyncSettings,
} from '@ecomerece/frontend/stats';
import type { MetricName } from '@ecomerece/shared';
import { useState } from 'react';
import { CursorPager } from '../../../components/cursor-pager';
import { DashboardNav } from '../../../components/dashboard-nav';
import { PageShell } from '../../../components/page-shell';
import { QueryState } from '../../../components/query-state';
import { useCursorPagination } from '../../../components/use-cursor-pagination';
import { MetricGrid } from './components/metric-grid';
import { SeriesTable } from './components/series-table';
import { StatsExplorer } from './components/stats-explorer';
import { StatsPaginatedTable } from './components/stats-paginated-table';
import { SyncSettingsPanel } from './components/sync-settings-panel';

export default function DashboardStatsPage() {
  const aggregateQuery = useGetStatsAggregate('product');
  const seriesQuery = useGetStatsAggregateTimeSeries('product', { aggregation: 'monthly' });
  const settingsQuery = useGetStatsSyncSettings();
  const updateSettings = useUpdateStatsSyncSettings();
  const denormalize = useTriggerProductStatsDenormalization();
  const [productMetric, setProductMetric] = useState<MetricName>('revenue');
  const [productSort, setProductSort] = useState<'desc' | 'asc'>('desc');
  const [categoryMetric, setCategoryMetric] = useState<MetricName>('revenue');
  const [categorySort, setCategorySort] = useState<'desc' | 'asc'>('desc');
  const productPager = useCursorPagination(10);
  const categoryPager = useCursorPagination(10);
  const productStats = useGetPaginatedProductStats({
    entityType: 'product',
    aggregation: 'lifetime',
    metric: productMetric,
    sort: productSort,
    cursor: productPager.cursor,
    limit: productPager.limit,
  });
  const categoryStats = useGetPaginatedCategoryStats({
    metric: categoryMetric,
    sort: categorySort,
    cursor: categoryPager.cursor,
    limit: categoryPager.limit,
  });

  return (
    <PageShell
      requiresAuth
      eyebrow="Admin"
      title="Stats"
      description="Platform product metrics, monthly series, and stats pipeline settings."
      actions={
        <>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              void aggregateQuery.refetch();
              void seriesQuery.refetch();
              void settingsQuery.refetch();
            }}
            disabled={
              aggregateQuery.isFetching || seriesQuery.isFetching || settingsQuery.isFetching
            }
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<BoltIcon />}
            onClick={() => denormalize.mutate()}
            disabled={denormalize.isPending}
          >
            {denormalize.isPending ? 'Queuing…' : 'Run denormalization'}
          </Button>
        </>
      }
    >
      <DashboardNav />

      {denormalize.error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {denormalize.error.message}
        </Alert>
      ) : null}
      {denormalize.isSuccess ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          Denormalization job queued.
        </Alert>
      ) : null}

      <Stack spacing={3}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>
              Lifetime product metrics
            </Typography>
            <Chip
              size="small"
              label={aggregateQuery.data?.aggregation ?? 'lifetime'}
              variant="outlined"
            />
          </Stack>
          <QueryState
            isLoading={aggregateQuery.isPending}
            error={aggregateQuery.error}
            onRetry={() => void aggregateQuery.refetch()}
            skeleton={<Skeleton variant="rounded" height={230} />}
          >
            {aggregateQuery.data ? <MetricGrid metrics={aggregateQuery.data.metrics} /> : null}
          </QueryState>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Monthly product series
          </Typography>
          <QueryState
            isLoading={seriesQuery.isPending}
            error={seriesQuery.error}
            isEmpty={Boolean(seriesQuery.data && seriesQuery.data.series.length === 0)}
            emptyMessage="No time series data yet."
            onRetry={() => void seriesQuery.refetch()}
            skeleton={<Skeleton variant="rounded" height={320} />}
          >
            <SeriesTable series={seriesQuery.data?.series ?? []} />
          </QueryState>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <QueryState
            isLoading={productStats.isPending}
            error={productStats.error}
            isEmpty={Boolean(productStats.data && productStats.data.items.length === 0)}
            emptyMessage="No product stats yet."
            onRetry={() => void productStats.refetch()}
            skeleton={<Skeleton variant="rounded" height={320} />}
          >
            <StatsPaginatedTable
              title="Product leaderboard"
              description="Lifetime product stats ranked by the selected metric."
              items={productStats.data?.items ?? []}
              metric={productMetric}
              onMetricChange={(metric) => {
                setProductMetric(metric);
                productPager.reset();
              }}
              sort={productSort}
              onSortChange={(sort) => {
                setProductSort(sort);
                productPager.reset();
              }}
            />
            <CursorPager
              hasNext={Boolean(productStats.data?.nextCursor)}
              hasPrevious={productPager.hasPrevious}
              isFetching={productStats.isFetching}
              onNext={() => productPager.next(productStats.data?.nextCursor)}
              onPrevious={productPager.previous}
              onReset={productPager.reset}
            />
          </QueryState>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <QueryState
            isLoading={categoryStats.isPending}
            error={categoryStats.error}
            isEmpty={Boolean(categoryStats.data && categoryStats.data.items.length === 0)}
            emptyMessage="No category stats yet."
            onRetry={() => void categoryStats.refetch()}
            skeleton={<Skeleton variant="rounded" height={320} />}
          >
            <StatsPaginatedTable
              title="Category leaderboard"
              description="Lifetime category stats ranked by the selected metric."
              items={categoryStats.data?.items ?? []}
              metric={categoryMetric}
              onMetricChange={(metric) => {
                setCategoryMetric(metric);
                categoryPager.reset();
              }}
              sort={categorySort}
              onSortChange={(sort) => {
                setCategorySort(sort);
                categoryPager.reset();
              }}
            />
            <CursorPager
              hasNext={Boolean(categoryStats.data?.nextCursor)}
              hasPrevious={categoryPager.hasPrevious}
              isFetching={categoryStats.isFetching}
              onNext={() => categoryPager.next(categoryStats.data?.nextCursor)}
              onPrevious={categoryPager.previous}
              onReset={categoryPager.reset}
            />
          </QueryState>
        </Paper>

        <StatsExplorer />

        <QueryState
          isLoading={settingsQuery.isPending}
          error={settingsQuery.error}
          onRetry={() => void settingsQuery.refetch()}
          skeleton={<Skeleton variant="rounded" height={230} />}
        >
          {settingsQuery.data ? (
            <SyncSettingsPanel
              key={JSON.stringify(settingsQuery.data)}
              settings={settingsQuery.data}
              isSaving={updateSettings.isPending}
              error={updateSettings.error}
              onSave={(input) => updateSettings.mutate(input)}
            />
          ) : null}
        </QueryState>
      </Stack>
    </PageShell>
  );
}
