'use client';

import TextField from '@mui/material/TextField';
import { useCreateCategory, useUpdateCategoryImage } from '@ecomerece/frontend/category';
import { createCategoryDto, type categoryResponseReadModels } from '@ecomerece/shared';
import { useState } from 'react';
import { FormDialog } from '../../../../components/form-dialog';

type CategoryFormDialogProps = {
  category: categoryResponseReadModels | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function CategoryFormDialog(props: CategoryFormDialogProps) {
  return (
    <CategoryFormDialogContent
      key={`${props.open}-${props.category?.id ?? 'new'}`}
      {...props}
    />
  );
}

function CategoryFormDialogContent({
  category,
  open,
  onClose,
  onSuccess,
}: CategoryFormDialogProps) {
  const [title, setTitle] = useState(category?.title ?? '');
  const [image, setImage] = useState(category?.image ?? '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategoryImage();
  const isEditing = Boolean(category);
  const isSubmitting = createCategory.isPending || updateCategory.isPending;

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    const parsed = createCategoryDto.safeParse({ title: title.trim(), image: image.trim() });
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join(', '));
      return;
    }

    try {
      const result = category
        ? await updateCategory.mutateAsync({ id: category.id, ...parsed.data })
        : await createCategory.mutateAsync(parsed.data);
      setSuccess(result.message);
      onSuccess?.();
      onClose();
    } catch (mutationError) {
      setError(
        mutationError instanceof Error ? mutationError.message : 'Unable to save this category.',
      );
    }
  };

  return (
    <FormDialog
      title={isEditing ? 'Edit category' : 'Create category'}
      open={open}
      onClose={onClose}
      onSubmit={() => void handleSubmit()}
      isSubmitting={isSubmitting}
      error={error}
      success={success}
      submitLabel={isEditing ? 'Save category' : 'Create category'}
    >
      <TextField
        label="Title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        fullWidth
      />
      <TextField
        label="Image URL or data URI"
        value={image}
        onChange={(event) => setImage(event.target.value)}
        helperText="Accepts an http(s) URL or a base64 data URI."
        multiline
        minRows={2}
        fullWidth
      />
    </FormDialog>
  );
}
