import StarIcon from '@mui/icons-material/Star';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ProductResponseReadModel } from '@ecomerece/shared';
import { formatMoney, formatNumber } from '../../../../components/format';

export function ProductSummary({ product }: { product: ProductResponseReadModel }) {
  const hasDiscount = product.minDiscountedPrice < product.minPrice;
  const hasRange = product.maxDiscountedPrice > product.minDiscountedPrice;

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h3" component="h2" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
          {product.title}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1 }}>
          <StarIcon sx={{ fontSize: 18, color: 'warning.main' }} />
          <Typography variant="body2" color="text.secondary">
            {product.averageRating.toFixed(1)} average from {formatNumber(product.totalReviews)}{' '}
            reviews
          </Typography>
        </Stack>
      </Box>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'baseline' }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {formatMoney(product.minDiscountedPrice)}
          {hasRange ? ` – ${formatMoney(product.maxDiscountedPrice)}` : ''}
        </Typography>
        {hasDiscount ? (
          <Typography color="text.secondary" sx={{ textDecoration: 'line-through' }}>
            {formatMoney(product.minPrice)}
          </Typography>
        ) : null}
      </Stack>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        <Chip
          label={product.inStock ? 'In stock' : 'Out of stock'}
          color={product.inStock ? 'success' : 'default'}
        />
        <Chip label={product.vendorTitle} variant="outlined" />
        <Chip label={product.appearance} variant="outlined" />
        {product.stats ? (
          <Chip
            icon={<VisibilityIcon />}
            label={`${formatNumber(product.stats.views ?? 0)} views`}
            variant="outlined"
          />
        ) : null}
      </Stack>

      <Typography color="text.secondary">{product.description}</Typography>

      {product.ingredient.isIngredients && product.ingredient.ingredients.length > 0 ? (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Ingredients
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {product.ingredient.ingredients.map((ingredient) => (
              <Chip key={ingredient} label={ingredient} size="small" variant="outlined" />
            ))}
          </Stack>
        </Box>
      ) : null}

      {product.disclaimer.isDisclaimer && product.disclaimer.disclaimers.length > 0 ? (
        <Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Disclaimers
          </Typography>
          <Stack spacing={1}>
            {product.disclaimer.disclaimers.map((disclaimer) => (
              <Box key={disclaimer.name}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {disclaimer.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {disclaimer.name}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Stack>
  );
}
