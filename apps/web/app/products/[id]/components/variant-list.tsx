import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import type { ProductVariantResponseReadModel } from '@ecomerece/shared';
import { VariantRow } from './variant-row';

export function VariantList({ variants }: { variants: ProductVariantResponseReadModel[] }) {
  if (variants.length === 0) {
    return <Alert severity="info">No variants have been published for this product.</Alert>;
  }

  return (
    <Box>
      {variants.map((variant) => (
        <VariantRow key={variant.id} variant={variant} />
      ))}
    </Box>
  );
}
