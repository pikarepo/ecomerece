'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  useGetCategoryStatsOverview,
  useGetProductLifetimeStats,
  useGetProductStatsOverview,
  useGetVendorLifetimeStats,
  useGetVendorStatsOverview,
} from '@ecomerece/frontend/stats';
import { useState } from 'react';
import { QueryState } from '../../../../components/query-state';
import { formatMoney, formatNumber } from '../../../../components/format';
import { MetricGrid } from './metric-grid';
import { SeriesTable } from './series-table';

type LookupEntity = 'product' | 'category' | 'vendor';

const ENTITIES: { value: LookupEntity; label: string }[] = [
  { value: 'product', label: 'Product' },
  { value: 'category', label: 'Category' },
  { value: 'vendor', label: 'Vendor' },
];

const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: 'thisWeek', label: 'This week' },
  { key: 'thisMonth', label: 'This month' },
  { key: 'thisYear', label: 'This year' },
] as const;

export function StatsExplorer() {
  const [entity, setEntity] = useState<LookupEntity>('product');
  const [idInput, setIdInput] = useState('');
  const [entityId, setEntityId] = useState('');

  const productId = entity === 'product' ? entityId : '';
  const categoryId = entity === 'category' ? entityId : '';
  const vendorId = entity === 'vendor' ? entityId : '';

  const productLifetime = useGetProductLifetimeStats(productId);
  const productOverview = useGetProductStatsOverview(productId, {
    enabled: Boolean(productId),
  });
  const categoryOverview = useGetCategoryStatsOverview(categoryId, {
    enabled: Boolean(categoryId),
  });
  const vendorLifetime = useGetVendorLifetimeStats(vendorId);
  const vendorOverview = useGetVendorStatsOverview(vendorId, {
    enabled: Boolean(vendorId),
  });

  const lifetime = entity === 'product' ? productLifetime : vendorLifetime;
  const overview =
    entity === 'product' ? productOverview : entity === 'category' ? categoryOverview : vendorOverview;

  return (
    <Paper
      elevation={0}
      sx={{ p: { xs: 2, md: 3 }, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Entity stats lookup
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Inspect lifetime, period, and monthly metrics for a single product, category, or vendor.
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          select
          size="small"
          label="Entity"
          value={entity}
          onChange={(event) => {
            setEntity(event.target.value as LookupEntity);
            setEntityId('');
          }}
          sx={{ minWidth: 140 }}
        >
          {ENTITIES.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          label="Entity ID"
          value={idInput}
          onChange={(event) => setIdInput(event.target.value)}
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          onClick={() => setEntityId(idInput.trim())}
          disabled={!idInput.trim()}
        >
          Load stats
        </Button>
      </Stack>

      {!entityId ? (
        <Alert severity="info">Enter an entity ID to load its stats.</Alert>
      ) : (
        <Stack spacing={3}>
          <QueryState
            isLoading={lifetime.isPending}
            error={lifetime.error}
            onRetry={() => void lifetime.refetch()}
            skeleton={<Skeleton variant="rounded" height={230} />}
          >
            {lifetime.data ? <MetricGrid metrics={lifetime.data.metrics} /> : null}
          </QueryState>

          <QueryState
            isLoading={overview.isPending}
            error={overview.error}
            onRetry={() => void overview.refetch()}
            skeleton={<Skeleton variant="rounded" height={320} />}
          >
            {overview.data ? (
              <>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                    gap: 2,
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
                        {formatMoney(overview.data.overview[period.key].revenue ?? 0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatNumber(overview.data.overview[period.key].purchases ?? 0)} purchases
                      </Typography>
                    </Paper>
                  ))}
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
                  Monthly series
                </Typography>
                <SeriesTable series={overview.data.overview.monthlySeries} />
              </>
            ) : null}
          </QueryState>
        </Stack>
      )}
    </Paper>
  );
}
