import StarIcon from '@mui/icons-material/Star';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ProductResponseReadModel } from '@ecomerece/shared';
import Link from 'next/link';
import { formatMoney } from '../../../components/format';

export function ProductCard({ product }: { product: ProductResponseReadModel }) {
  const defaultImage =
    product.image.images.find((image) => image.default) ?? product.image.images[0];
  const hasDiscount = product.minDiscountedPrice < product.minPrice;
  const hasRange = product.maxDiscountedPrice > product.minDiscountedPrice;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        transition: 'box-shadow 160ms ease, transform 160ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 18px 40px rgba(23, 19, 33, 0.12)',
        },
      }}
    >
      <Box
        component={Link}
        href={`/products/${product.id}`}
        sx={{
          color: 'inherit',
          textDecoration: 'none',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <Box sx={{ position: 'relative', aspectRatio: '1 / 1', bgcolor: 'grey.100' }}>
          {defaultImage ? (
            <Box
              component="img"
              src={defaultImage.url}
              alt={defaultImage.alt || product.title}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : null}
          <Chip
            size="small"
            label={product.inStock ? 'In stock' : 'Out of stock'}
            color={product.inStock ? 'success' : 'default'}
            sx={{ position: 'absolute', top: 10, left: 10 }}
          />
        </Box>

        <Stack spacing={1} sx={{ p: 2, flex: 1 }}>
          <Typography variant="caption" color="text.secondary" noWrap>
            {product.vendorTitle}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.title}
          </Typography>

          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
            <Typography variant="body2" color="text.secondary">
              {product.averageRating.toFixed(1)} ({product.totalReviews})
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: 'auto', pt: 1, alignItems: 'baseline' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {formatMoney(product.minDiscountedPrice)}
              {hasRange ? ` – ${formatMoney(product.maxDiscountedPrice)}` : ''}
            </Typography>
            {hasDiscount ? (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textDecoration: 'line-through' }}
              >
                {formatMoney(product.minPrice)}
              </Typography>
            ) : null}
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
}
