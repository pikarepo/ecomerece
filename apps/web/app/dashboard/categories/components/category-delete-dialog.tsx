'use client';

import TextField from '@mui/material/TextField';
import { useDeleteCategoryById } from '@ecomerece/frontend/category';
import type { categoryResponseReadModels } from '@ecomerece/shared';
import { useState } from 'react';
import { FormDialog } from '../../../../components/form-dialog';

export function CategoryDeleteDialog(props: {
  category: categoryResponseReadModels | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  return <CategoryDeleteDialogContent key={props.category?.id ?? 'closed'} {...props} />;
}

function CategoryDeleteDialogContent({
  category,
  onClose,
  onSuccess,
}: {
  category: categoryResponseReadModels | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const deleteCategory = useDeleteCategoryById();

  const handleSubmit = async () => {
    if (!category) return;
    setError(null);
    if (reason.trim().length < 10) {
      setError('Reason must be at least 10 characters.');
      return;
    }
    try {
      await deleteCategory.mutateAsync({ id: category.id, reason: reason.trim() });
      onSuccess?.();
      onClose();
    } catch (mutationError) {
      setError(
        mutationError instanceof Error ? mutationError.message : 'Unable to delete this category.',
      );
    }
  };

  return (
    <FormDialog
      title={category ? `Delete ${category.title}` : 'Delete category'}
      open={Boolean(category)}
      onClose={onClose}
      onSubmit={() => void handleSubmit()}
      isSubmitting={deleteCategory.isPending}
      error={error}
      submitLabel="Delete category"
    >
      <TextField
        label="Reason"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        helperText="At least 10 characters."
        multiline
        minRows={2}
        fullWidth
      />
    </FormDialog>
  );
}
