'use client';

import TextField from '@mui/material/TextField';
import { useUpdateMyVendorImage } from '@ecomerece/frontend/vendor';
import { UpdateMyVendorImageDtoSchema, type VendorResponseReadModel } from '@ecomerece/shared';
import { useState } from 'react';
import { FormDialog } from '../../../../components/form-dialog';

type VendorImageDialogProps = {
  vendor: VendorResponseReadModel;
  open: boolean;
  onClose: () => void;
};

export function VendorImageDialog(props: VendorImageDialogProps) {
  return <VendorImageDialogContent key={`${props.open}-${props.vendor.id}`} {...props} />;
}

function VendorImageDialogContent({ vendor, open, onClose }: VendorImageDialogProps) {
  const [logo, setLogo] = useState(vendor.images.logo);
  const [banner, setBanner] = useState(vendor.images.banner);
  const [error, setError] = useState<string | null>(null);
  const updateImages = useUpdateMyVendorImage();

  const handleSubmit = async () => {
    setError(null);
    const parsed = UpdateMyVendorImageDtoSchema.safeParse({
      logo: logo.trim(),
      banner: banner.trim(),
    });
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join(', '));
      return;
    }
    try {
      await updateImages.mutateAsync(parsed.data);
      onClose();
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : 'Unable to update images.');
    }
  };

  return (
    <FormDialog
      title="Update vendor images"
      open={open}
      onClose={onClose}
      onSubmit={() => void handleSubmit()}
      isSubmitting={updateImages.isPending}
      error={error}
    >
      <TextField
        label="Logo URL or data URI"
        value={logo}
        onChange={(e) => setLogo(e.target.value)}
        multiline
        minRows={2}
        fullWidth
      />
      <TextField
        label="Banner URL or data URI"
        value={banner}
        onChange={(e) => setBanner(e.target.value)}
        multiline
        minRows={2}
        fullWidth
      />
    </FormDialog>
  );
}
