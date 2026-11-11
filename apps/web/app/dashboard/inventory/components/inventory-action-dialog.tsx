'use client';

import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import {
  useBuyMyInventoryStock,
  useRemoveMyInventoryStock,
  useUpdateMyLowStockThreshold,
} from '@ecomerece/frontend/inventory';
import type { InventoryResponseReadModel } from '@ecomerece/shared';
import { useState } from 'react';
import { FormDialog } from '../../../../components/form-dialog';

const ACTIONS = [
  { value: 'purchase', label: 'Add stock' },
  { value: 'remove', label: 'Remove stock' },
  { value: 'threshold', label: 'Update low-stock threshold' },
] as const;

type Action = (typeof ACTIONS)[number]['value'];

export function InventoryActionDialog(props: {
  inventory: InventoryResponseReadModel | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  return <InventoryActionDialogContent key={props.inventory?.id ?? 'closed'} {...props} />;
}

function InventoryActionDialogContent({
  inventory,
  onClose,
  onSuccess,
}: {
  inventory: InventoryResponseReadModel | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [action, setAction] = useState<Action>('purchase');
  const [quantity, setQuantity] = useState('1');
  const [threshold, setThreshold] = useState(String(inventory?.lowStockThreshold ?? 1));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const purchase = useBuyMyInventoryStock();
  const remove = useRemoveMyInventoryStock();
  const updateThreshold = useUpdateMyLowStockThreshold();
  const isSubmitting = purchase.isPending || remove.isPending || updateThreshold.isPending;

  const handleSubmit = async () => {
    if (!inventory) return;
    setError(null);
    setSuccess(null);
    const value = Number(action === 'threshold' ? threshold : quantity);
    if (!Number.isInteger(value) || value < 1) {
      setError('Enter a whole number of at least 1.');
      return;
    }

    try {
      const result =
        action === 'purchase'
          ? await purchase.mutateAsync({ id: inventory.id, data: { quantity: value } })
          : action === 'remove'
            ? await remove.mutateAsync({ id: inventory.id, data: { quantity: value } })
            : await updateThreshold.mutateAsync({
                id: inventory.id,
                data: { lowStockThreshold: value },
              });
      setSuccess(result.message);
      onSuccess?.();
    } catch (mutationError) {
      setError(
        mutationError instanceof Error ? mutationError.message : 'Unable to update inventory.',
      );
    }
  };

  return (
    <FormDialog
      title={inventory ? `Manage ${inventory.variantId}` : 'Manage inventory'}
      open={Boolean(inventory)}
      onClose={onClose}
      onSubmit={() => void handleSubmit()}
      isSubmitting={isSubmitting}
      error={error}
      success={success}
      submitLabel="Apply"
    >
      <TextField
        select
        label="Action"
        value={action}
        onChange={(event) => {
          setAction(event.target.value as Action);
          setSuccess(null);
        }}
        fullWidth
      >
        {ACTIONS.map((item) => (
          <MenuItem key={item.value} value={item.value}>
            {item.label}
          </MenuItem>
        ))}
      </TextField>

      {action === 'threshold' ? (
        <TextField
          label="New low-stock threshold"
          type="number"
          value={threshold}
          onChange={(event) => setThreshold(event.target.value)}
          slotProps={{ htmlInput: { min: 1 } }}
          fullWidth
        />
      ) : (
        <TextField
          label="Quantity"
          type="number"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          slotProps={{ htmlInput: { min: 1 } }}
          fullWidth
        />
      )}
    </FormDialog>
  );
}
