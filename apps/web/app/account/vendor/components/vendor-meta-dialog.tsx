'use client';

import TextField from '@mui/material/TextField';
import { useUpdateMyVendorMeta } from '@ecomerece/frontend/vendor';
import { UpdateMyVendorMetaDtoSchema, type VendorResponseReadModel } from '@ecomerece/shared';
import { useState } from 'react';
import { FormDialog } from '../../../../components/form-dialog';

type VendorMetaDialogProps = {
  vendor: VendorResponseReadModel;
  open: boolean;
  onClose: () => void;
};

export function VendorMetaDialog(props: VendorMetaDialogProps) {
  return <VendorMetaDialogContent key={`${props.open}-${props.vendor.id}`} {...props} />;
}

function VendorMetaDialogContent({ vendor, open, onClose }: VendorMetaDialogProps) {
  const [title, setTitle] = useState(vendor.title);
  const [slug, setSlug] = useState(vendor.slug);
  const [description, setDescription] = useState(vendor.description);
  const [error, setError] = useState<string | null>(null);
  const updateMeta = useUpdateMyVendorMeta();

  const handleSubmit = async () => {
    setError(null);
    const parsed = UpdateMyVendorMetaDtoSchema.safeParse({
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
    });
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join(', '));
      return;
    }
    try {
      await updateMeta.mutateAsync(parsed.data);
      onClose();
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : 'Unable to update vendor.');
    }
  };

  return (
    <FormDialog
      title="Edit vendor details"
      open={open}
      onClose={onClose}
      onSubmit={() => void handleSubmit()}
      isSubmitting={updateMeta.isPending}
      error={error}
    >
      <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
      <TextField label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} fullWidth />
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        multiline
        minRows={3}
        fullWidth
      />
    </FormDialog>
  );
}
