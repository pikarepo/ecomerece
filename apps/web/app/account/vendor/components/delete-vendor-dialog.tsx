'use client';

import TextField from '@mui/material/TextField';
import { useDeleteMyVendor } from '@ecomerece/frontend/vendor';
import { DeleteMyVendorDtoSchema } from '@ecomerece/shared';
import { useState } from 'react';
import { FormDialog } from '../../../../components/form-dialog';

export function DeleteVendorDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const deleteVendor = useDeleteMyVendor();

  const handleClose = () => {
    setReason('');
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);
    const parsed = DeleteMyVendorDtoSchema.safeParse({ reason: reason.trim() });
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join(', '));
      return;
    }
    try {
      await deleteVendor.mutateAsync(parsed.data);
      onSuccess?.();
      handleClose();
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : 'Unable to delete vendor.');
    }
  };

  return (
    <FormDialog
      title="Close your vendor storefront"
      open={open}
      onClose={handleClose}
      onSubmit={() => void handleSubmit()}
      isSubmitting={deleteVendor.isPending}
      error={error}
      submitLabel="Delete vendor"
    >
      <TextField
        label="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        helperText="At least 10 characters."
        multiline
        minRows={2}
        fullWidth
      />
    </FormDialog>
  );
}
