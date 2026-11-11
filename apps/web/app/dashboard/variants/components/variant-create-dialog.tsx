'use client';

import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import { useCreateMyProductVariant } from '@ecomerece/frontend/product-variant';
import { createMyProductVariantDto } from '@ecomerece/shared';
import { useState } from 'react';
import { FormDialog } from '../../../../components/form-dialog';

export function VariantCreateDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [productId, setProductId] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [active, setActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const createVariant = useCreateMyProductVariant();

  const handleClose = () => {
    setProductId('');
    setTitle('');
    setPrice('');
    setDiscountedPrice('');
    setActive(true);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);
    const parsed = createMyProductVariantDto.safeParse({
      productId: productId.trim(),
      title: title.trim(),
      price: Number(price),
      discountedPrice: Number(discountedPrice),
      active,
    });
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join(', '));
      return;
    }

    try {
      await createVariant.mutateAsync(parsed.data);
      onSuccess?.();
      handleClose();
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : 'Unable to create variant.');
    }
  };

  return (
    <FormDialog
      title="Create product variant"
      open={open}
      onClose={handleClose}
      onSubmit={() => void handleSubmit()}
      isSubmitting={createVariant.isPending}
      error={error}
      submitLabel="Create variant"
    >
      <TextField
        label="Product ID"
        value={productId}
        onChange={(event) => setProductId(event.target.value)}
        fullWidth
      />
      <TextField
        label="Title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        fullWidth
      />
      <TextField
        label="Price"
        type="number"
        value={price}
        onChange={(event) => setPrice(event.target.value)}
        fullWidth
      />
      <TextField
        label="Discounted price"
        type="number"
        value={discountedPrice}
        onChange={(event) => setDiscountedPrice(event.target.value)}
        fullWidth
      />
      <FormControlLabel
        control={<Switch checked={active} onChange={(event) => setActive(event.target.checked)} />}
        label="Active"
      />
    </FormDialog>
  );
}
