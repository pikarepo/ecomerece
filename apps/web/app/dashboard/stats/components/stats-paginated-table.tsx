'use client';

import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { StatsSeriesPoint } from '@ecomerece/frontend/stats';
import type { MetricName } from '@ecomerece/shared';
import { formatMoney, formatNumber } from '../../../../components/format';

const SORTABLE_METRICS: { value: MetricName; label: string }[] = [
  { value: 'views', label: 'Views' },
  { value: 'clicks', label: 'Clicks' },
  { value: 'purchases', label: 'Purchases' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'quantity', label: 'Quantity' },
];

function periodOf(point: StatsSeriesPoint) {
  return (
    point.dimensions.date ??
    point.dimensions.month ??
    point.dimensions.week ??
    point.dimensions.hour ??
    '—'
  );
}

export function StatsPaginatedTable({
  title,
  description,
  items,
  metric,
  onMetricChange,
  sort,
  onSortChange,
  sortable = true,
}: {
  title: string;
  description?: string;
  items: StatsSeriesPoint[];
  metric: MetricName;
  onMetricChange: (metric: MetricName) => void;
  sort: 'desc' | 'asc';
  onSortChange: (sort: 'desc' | 'asc') => void;
  sortable?: boolean;
}) {
  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2 }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {description ? (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          ) : null}
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <TextField
            select
            size="small"
            label="Metric"
            value={metric}
            onChange={(event) => onMetricChange(event.target.value as MetricName)}
            sx={{ minWidth: 140 }}
          >
            {SORTABLE_METRICS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Order"
            value={sort}
            onChange={(event) => onSortChange(event.target.value as 'desc' | 'asc')}
            sx={{ minWidth: 120 }}
            disabled={!sortable}
          >
            <MenuItem value="desc">High to low</MenuItem>
            <MenuItem value="asc">Low to high</MenuItem>
          </TextField>
        </Stack>
      </Stack>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Entity</TableCell>
              <TableCell>Period</TableCell>
              <TableCell align="right">Views</TableCell>
              <TableCell align="right">Clicks</TableCell>
              <TableCell align="right">Purchases</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Revenue</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((point) => (
              <TableRow key={`${point.entity.id}-${periodOf(point)}`} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {point.entity.id}
                  </Typography>
                </TableCell>
                <TableCell>{periodOf(point)}</TableCell>
                <TableCell align="right">{formatNumber(point.metrics.views ?? 0)}</TableCell>
                <TableCell align="right">{formatNumber(point.metrics.clicks ?? 0)}</TableCell>
                <TableCell align="right">{formatNumber(point.metrics.purchases ?? 0)}</TableCell>
                <TableCell align="right">{formatNumber(point.metrics.quantity ?? 0)}</TableCell>
                <TableCell align="right">{formatMoney(point.metrics.revenue ?? 0)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
