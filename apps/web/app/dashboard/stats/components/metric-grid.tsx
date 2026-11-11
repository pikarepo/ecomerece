import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { MetricName, Metrics } from '@ecomerece/shared';
import { formatMoney, formatNumber } from '../../../../components/format';

const METRICS: { key: MetricName; label: string; money?: boolean }[] = [
  { key: 'views', label: 'Views' },
  { key: 'clicks', label: 'Clicks' },
  { key: 'purchases', label: 'Purchases' },
  { key: 'revenue', label: 'Revenue', money: true },
  { key: 'quantity', label: 'Quantity' },
  { key: 'addToCart', label: 'Add to cart' },
  { key: 'wishlist', label: 'Wishlist' },
  { key: 'refunds', label: 'Refunds' },
  { key: 'refundAmount', label: 'Refund amount', money: true },
];

export function MetricGrid({ metrics }: { metrics: Metrics }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(3, 1fr)' },
        gap: 2,
      }}
    >
      {METRICS.map((metric) => (
        <Paper
          key={metric.key}
          elevation={0}
          sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
        >
          <Typography variant="caption" color="text.secondary">
            {metric.label}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {metric.money
              ? formatMoney(metrics[metric.key] ?? 0)
              : formatNumber(metrics[metric.key] ?? 0)}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}
