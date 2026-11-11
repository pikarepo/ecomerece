import StorefrontIcon from '@mui/icons-material/Storefront';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { VendorListItemReadModel } from '@ecomerece/shared';
import Link from 'next/link';
import { formatMoney, formatNumber } from '../../../components/format';

export function VendorCard({ vendor }: { vendor: VendorListItemReadModel }) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <Box
        component={Link}
        href={`/vendors/${vendor.id}`}
        sx={{ color: 'inherit', textDecoration: 'none', display: 'block', height: '100%' }}
      >
        <Box
          sx={{
            height: 96,
            background: vendor.images?.banner
              ? `url(${vendor.images.banner}) center / cover`
              : 'linear-gradient(135deg, #7c3aed22, #db277722)',
          }}
        />
        <Box sx={{ p: 2 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mt: -4, mb: 1.5 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                display: 'grid',
                placeItems: 'center',
                overflow: 'hidden',
              }}
            >
              {vendor.images?.logo ? (
                <Box
                  component="img"
                  src={vendor.images.logo}
                  alt={vendor.title}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <StorefrontIcon color="primary" />
              )}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                {vendor.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {vendor.slug}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 1.5 }}>
            {vendor.verification ? (
              <Chip
                size="small"
                label={vendor.verification.isVerified ? 'Verified' : 'Pending'}
                color={vendor.verification.isVerified ? 'success' : 'warning'}
                variant="outlined"
              />
            ) : null}
            {vendor.isDeleted ? (
              <Chip size="small" label="Deleted" color="error" variant="outlined" />
            ) : null}
            {vendor.createdAt ? (
              <Chip
                size="small"
                label={`Joined ${new Date(vendor.createdAt).toLocaleDateString()}`}
                variant="outlined"
              />
            ) : null}
          </Stack>

          {vendor.stats ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 1,
                pt: 1.5,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Views
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {formatNumber(vendor.stats.views)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Purchases
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {formatNumber(vendor.stats.purchases)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Revenue
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {formatMoney(vendor.stats.revenue)}
                </Typography>
              </Box>
            </Box>
          ) : null}
        </Box>
      </Box>
    </Paper>
  );
}
