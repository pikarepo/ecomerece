'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useGetInventoryByVariantId } from '@ecomerece/frontend/inventory';
import type { ProductVariantResponseReadModel } from '@ecomerece/shared';
import { formatMoney, formatNumber } from '../../../../components/format';

export function VariantRow({ variant }: { variant: ProductVariantResponseReadModel }) {
  const inventoryQuery = useGetInventoryByVariantId(variant.id);
  const inventory = inventoryQuery.data;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1.2fr 1fr 1fr' },
        gap: 1.5,
        alignItems: 'center',
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-of-type': { borderBottom: 0 },
      }}
    >
      <Box>
        <Typography sx={{ fontWeight: 700 }}>{variant.title}</Typography>
        <Typography variant="caption" color="text.secondary">
          Created {new Date(variant.createdAt).toLocaleDateString()}
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
        <Typography sx={{ fontWeight: 700 }}>{formatMoney(variant.discountedPrice)}</Typography>
        {variant.discountedPrice < variant.price ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textDecoration: 'line-through' }}
          >
            {formatMoney(variant.price)}
          </Typography>
        ) : null}
      </Stack>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <Chip
          size="small"
          label={variant.active ? 'Active' : 'Inactive'}
          color={variant.active ? 'success' : 'default'}
        />
        {inventoryQuery.isPending ? (
          <CircularProgress size={16} />
        ) : inventoryQuery.error ? (
          <Chip size="small" label="Stock unavailable" variant="outlined" />
        ) : inventory ? (
          <>
            <Chip
              size="small"
              variant="outlined"
              label={`${formatNumber(inventory.available)} available`}
              color={inventory.available <= inventory.lowStockThreshold ? 'warning' : 'default'}
            />
            <Chip
              size="small"
              variant="outlined"
              label={`${formatNumber(inventory.reserved)} reserved`}
            />
          </>
        ) : null}
      </Stack>
    </Box>
  );
}
