'use client';

import TextField from '@mui/material/TextField';
import { useCreateMyInventory } from '@ecomerece/frontend/inventory';
import { createMyInventoryDto } from '@ecomerece/shared';
import { useState } from 'react';
import { FormDialog } from '../../../../components/form-dialog';

export function InventoryCreateDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [variantId, setVariantId] = useState('');
  const [available, setAvailable] = useState('1');
  const [lowStockThreshold, setLowStockThreshold] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const createInventory = useCreateMyInventory();

  const handleClose = () => {
    setVariantId('');
    setAvailable('1');
    setLowStockThreshold('1');
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);
    const parsed = createMyInventoryDto.safeParse({
      variantId: variantId.trim(),
      available: Number(available),
      lowStockThreshold: Number(lowStockThreshold),
    });
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join(', '));
      return;
    }

    try {
      await createInventory.mutateAsync(parsed.data);
      onSuccess?.();
      handleClose();
    } catch (mutationError) {
      setError(
        mutationError instanceof Error ? mutationError.message : 'Unable to create inventory.',
      );
    }
  };

  return (
    <FormDialog
      title="Create inventory"
      open={open}
      onClose={handleClose}
      onSubmit={() => void handleSubmit()}
      isSubmitting={createInventory.isPending}
      error={error}
      submitLabel="Create inventory"
    >
      <TextField
        label="Variant ID"
        value={variantId}
        onChange={(event) => setVariantId(event.target.value)}
        fullWidth
      />
      <TextField
        label="Available stock"
        type="number"
        value={available}
        onChange={(event) => setAvailable(event.target.value)}
        slotProps={{ htmlInput: { min: 1 } }}
        fullWidth
      />
      <TextField
        label="Low stock threshold"
        type="number"
        value={lowStockThreshold}
        onChange={(event) => setLowStockThreshold(event.target.value)}
        slotProps={{ htmlInput: { min: 1 } }}
        fullWidth
      />
    </FormDialog>
  );
}
