'use client';

import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import {
  useRecoverVariant,
  useSoftDeleteMyVariant,
  useToggleMyVariantAppearance,
  useUpdateMyVariantMeta,
  useUpdateMyVariantPrice,
} from '@ecomerece/frontend/product-variant';
import type { ProductVariantResponseReadModel } from '@ecomerece/shared';
import { useState } from 'react';
import { FormDialog } from '../../../../components/form-dialog';

const ACTIONS = [
  { value: 'price', label: 'Update price' },
  { value: 'meta', label: 'Update title' },
  { value: 'appearance', label: 'Toggle active state' },
  { value: 'delete', label: 'Soft delete' },
  { value: 'recover', label: 'Recover' },
] as const;

type Action = (typeof ACTIONS)[number]['value'];

export function VariantActionDialog(props: {
  variant: ProductVariantResponseReadModel | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  return <VariantActionDialogContent key={props.variant?.id ?? 'closed'} {...props} />;
}

function VariantActionDialogContent({
  variant,
  onClose,
  onSuccess,
}: {
  variant: ProductVariantResponseReadModel | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [action, setAction] = useState<Action>('price');
  const [price, setPrice] = useState(String(variant?.price ?? ''));
  const [discountedPrice, setDiscountedPrice] = useState(String(variant?.discountedPrice ?? ''));
  const [title, setTitle] = useState(variant?.title ?? '');
  const [active, setActive] = useState(!variant?.active);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updatePrice = useUpdateMyVariantPrice();
  const updateMeta = useUpdateMyVariantMeta();
  const toggleAppearance = useToggleMyVariantAppearance();
  const deleteVariant = useSoftDeleteMyVariant();
  const recoverVariant = useRecoverVariant();
  const isSubmitting =
    updatePrice.isPending ||
    updateMeta.isPending ||
    toggleAppearance.isPending ||
    deleteVariant.isPending ||
    recoverVariant.isPending;

  const handleSubmit = async () => {
    if (!variant) return;
    setError(null);
    setSuccess(null);

    if (action === 'delete' && reason.trim().length < 10) {
      setError('Reason must be at least 10 characters.');
      return;
    }
    if (action === 'meta' && title.trim().length === 0) {
      setError('Title is required.');
      return;
    }

    try {
      const base = { productId: variant.productId, variantId: variant.id };
      const result =
        action === 'price'
          ? await updatePrice.mutateAsync({
              ...base,
              price: Number(price),
              discountedPrice: Number(discountedPrice),
            })
          : action === 'meta'
            ? await updateMeta.mutateAsync({ ...base, title: title.trim() })
            : action === 'appearance'
              ? await toggleAppearance.mutateAsync({ ...base, appearance: active })
              : action === 'delete'
                ? await deleteVariant.mutateAsync({ ...base, reason: reason.trim() })
                : await recoverVariant.mutateAsync(variant.id);
      setSuccess(result.message);
      onSuccess?.();
    } catch (mutationError) {
      setError(
        mutationError instanceof Error ? mutationError.message : 'Unable to update this variant.',
      );
    }
  };

  return (
    <FormDialog
      title={variant ? `Manage ${variant.title}` : 'Manage variant'}
      open={Boolean(variant)}
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

      {action === 'price' ? (
        <>
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
        </>
      ) : null}

      {action === 'meta' ? (
        <TextField
          label="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          fullWidth
        />
      ) : null}

      {action === 'appearance' ? (
        <FormControlLabel
          control={<Switch checked={active} onChange={(event) => setActive(event.target.checked)} />}
          label={active ? 'Set active' : 'Set inactive'}
        />
      ) : null}

      {action === 'delete' ? (
        <TextField
          label="Reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          helperText="At least 10 characters."
          multiline
          minRows={2}
          fullWidth
        />
      ) : null}
    </FormDialog>
  );
}
