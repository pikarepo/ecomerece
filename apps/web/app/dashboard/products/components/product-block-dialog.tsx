'use client';

import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useBlockProduct, useUnBlockProduct } from '@ecomerece/frontend/product';
import type { ProductAdminResponseReadModel } from '@ecomerece/shared';
import { useState } from 'react';
import { FormDialog } from '../../../../components/form-dialog';

export function ProductBlockDialog(props: {
  product: ProductAdminResponseReadModel | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  return <ProductBlockDialogContent key={props.product?.id ?? 'closed'} {...props} />;
}

function ProductBlockDialogContent({
  product,
  onClose,
  onSuccess,
}: {
  product: ProductAdminResponseReadModel | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [action, setAction] = useState<'block' | 'unblock'>(
    product?.isBlocked ? 'unblock' : 'block',
  );
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const blockProduct = useBlockProduct();
  const unblockProduct = useUnBlockProduct();

  const handleSubmit = async () => {
    if (!product) return;
    setError(null);
    setSuccess(null);
    if (action === 'block' && reason.trim().length < 10) {
      setError('Reason must be at least 10 characters.');
      return;
    }
    try {
      const result =
        action === 'block'
          ? await blockProduct.mutateAsync({ productId: product.id, reason: reason.trim() })
          : await unblockProduct.mutateAsync({ productId: product.id });
      setSuccess(result.message);
      onSuccess?.();
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : 'Unable to update product.');
    }
  };

  return (
    <FormDialog
      title={product ? `Manage ${product.title}` : 'Manage product'}
      open={Boolean(product)}
      onClose={onClose}
      onSubmit={() => void handleSubmit()}
      isSubmitting={blockProduct.isPending || unblockProduct.isPending}
      error={error}
      success={success}
      submitLabel="Apply"
    >
      <TextField
        select
        label="Action"
        value={action}
        onChange={(event) => setAction(event.target.value as 'block' | 'unblock')}
        fullWidth
      >
        <MenuItem value="block">Block product</MenuItem>
        <MenuItem value="unblock">Unblock product</MenuItem>
      </TextField>
      {action === 'block' ? (
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
