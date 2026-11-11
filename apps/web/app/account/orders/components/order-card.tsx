import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { OrderListItem } from '@ecomerece/frontend/order';
import { formatDate, formatMoney } from '../../../../components/format';

export function OrderCard({ order }: { order: OrderListItem }) {
  return (
    <Paper
      elevation={0}
      sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1.5,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              flexShrink: 0,
            }}
          >
            <ReceiptLongIcon fontSize="small" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700 }}>Order #{order.id.slice(0, 8)}</Typography>
            <Typography variant="body2" color="text.secondary">
              {order.address}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Placed {formatDate(order.createdAt)}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {order.deleted.deleted ? (
            <Chip size="small" label="Deleted" color="error" variant="outlined" />
          ) : (
            <Chip size="small" label="Active" color="success" variant="outlined" />
          )}
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {formatMoney(order.totalPrice)}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
