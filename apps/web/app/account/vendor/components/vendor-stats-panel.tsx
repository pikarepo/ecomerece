'use client';

import BoltIcon from '@mui/icons-material/Bolt';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  type StatsAggregationLevel,
  useGetVendorForceRefreshUsage,
  useGetVendorLifetimeStats,
  useGetVendorStatsOverview,
  useGetVendorTimeSeries,
  useVendorForceRefresh,
} from '@ecomerece/frontend/stats';
import { useMemo, useState } from 'react';
import { QueryState } from '../../../../components/query-state';
import { formatMoney, formatNumber } from '../../../../components/format';
import { MetricGrid } from '../../../dashboard/stats/components/metric-grid';

const AGGREGATIONS: StatsAggregationLevel[] = ['daily', 'weekly', 'monthly'];

const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: 'thisWeek', label: 'This week' },
  { key: 'thisMonth', label: 'This month' },
  { key: 'thisYear', label: 'This year' },
] as const;

export function VendorStatsPanel({ vendorId }: { vendorId: string }) {
  const [aggregation, setAggregation] = useState<StatsAggregationLevel>('monthly');
  const range = useMemo(() => {
    const to = new Date();
    const from = new Date();
    if (aggregation === 'daily') {
      from.setDate(from.getDate() - 30);
    } else if (aggregation === 'weekly') {
      from.setDate(from.getDate() - 12 * 7);
    } else {
      from.setMonth(from.getMonth() - 12);
    }
    return { from: from.toISOString(), to: to.toISOString() };
  }, [aggregation]);

  const lifetimeQuery = useGetVendorLifetimeStats(vendorId);
  const overviewQuery = useGetVendorStatsOverview(vendorId);
  const seriesQuery = useGetVendorTimeSeries(vendorId, aggregation, range.from, range.to);
  const usageQuery = useGetVendorForceRefreshUsage();
  const forceRefresh = useVendorForceRefresh();

  const usage = usageQuery.data;

  return (
    <Stack spacing={3} sx={{ mt: 3 }}>
      <Paper
        elevation={0}
        sx={{ p: { xs: 2, md: 3 }, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2 }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Lifetime metrics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aggregated across all of your products and storefront events.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            {usage ? (
              <Typography variant="body2" color="text.secondary">
                {usage.remaining} of {usage.quota} refreshes left
              </Typography>
            ) : null}
            <Button
              variant="outlined"
              startIcon={<BoltIcon />}
              onClick={() => forceRefresh.mutate()}
              disabled={forceRefresh.isPending || (usage ? usage.remaining <= 0 : false)}
            >
              {forceRefresh.isPending ? 'Refreshing…' : 'Force refresh'}
            </Button>
          </Stack>
        </Stack>

        {forceRefresh.error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {forceRefresh.error instanceof Error
              ? forceRefresh.error.message
              : 'Unable to refresh stats.'}
          </Alert>
        ) : null}
        {forceRefresh.data ? (
          <Alert severity={forceRefresh.data.accepted ? 'success' : 'info'} sx={{ mb: 2 }}>
            {forceRefresh.data.accepted
              ? `Refresh queued. ${forceRefresh.data.remaining} refreshes left.`
              : 'Stats were refreshed recently; no refresh was queued.'}
          </Alert>
        ) : null}

        <QueryState
          isLoading={lifetimeQuery.isPending}
          error={lifetimeQuery.error}
          onRetry={() => void lifetimeQuery.refetch()}
          skeleton={<Skeleton variant="rounded" height={230} />}
        >
          {lifetimeQuery.data ? <MetricGrid metrics={lifetimeQuery.data.metrics} /> : null}
        </QueryState>
      </Paper>

      <Paper
        elevation={0}
        sx={{ p: { xs: 2, md: 3 }, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Recent performance
        </Typography>
        <QueryState
          isLoading={overviewQuery.isPending}
          error={overviewQuery.error}
          onRetry={() => void overviewQuery.refetch()}
          skeleton={<Skeleton variant="rounded" height={160} />}
        >
          {overviewQuery.data ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 2,
                mt: 2,
              }}
            >
              {PERIODS.map((period) => (
                <Paper
                  key={period.key}
                  elevation={0}
                  sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {period.label} revenue
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {formatMoney(overviewQuery.data.overview[period.key].revenue ?? 0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatNumber(overviewQuery.data.overview[period.key].purchases ?? 0)} purchases
                  </Typography>
                </Paper>
              ))}
            </Box>
          ) : null}
        </QueryState>
      </Paper>

      <Paper
        elevation={0}
        sx={{ p: { xs: 2, md: 3 }, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Time series
          </Typography>
          <TextField
            select
            size="small"
            label="Aggregation"
            value={aggregation}
            onChange={(event) =>
              setAggregation(event.target.value as StatsAggregationLevel)
            }
            sx={{ minWidth: 150 }}
          >
            {AGGREGATIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <QueryState
          isLoading={seriesQuery.isPending}
          error={seriesQuery.error}
          isEmpty={Boolean(seriesQuery.data && seriesQuery.data.series.length === 0)}
          emptyMessage="No time series data yet."
          onRetry={() => void seriesQuery.refetch()}
          skeleton={<Skeleton variant="rounded" height={260} />}
        >
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Period</TableCell>
                  <TableCell align="right">Views</TableCell>
                  <TableCell align="right">Purchases</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(seriesQuery.data?.series ?? []).map((point) => {
                  const period =
                    point.dimensions.date ??
                    point.dimensions.week ??
                    point.dimensions.month ??
                    '—';
                  return (
                    <TableRow key={`${period}-${point.createdAt}`} hover>
                      <TableCell>{period}</TableCell>
                      <TableCell align="right">{formatNumber(point.metrics.views ?? 0)}</TableCell>
                      <TableCell align="right">
                        {formatNumber(point.metrics.purchases ?? 0)}
                      </TableCell>
                      <TableCell align="right">
                        {formatNumber(point.metrics.quantity ?? 0)}
                      </TableCell>
                      <TableCell align="right">
                        {formatMoney(point.metrics.revenue ?? 0)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </QueryState>
      </Paper>
    </Stack>
  );
}
