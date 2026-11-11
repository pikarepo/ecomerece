'use client';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useCreateMyVendor } from '@ecomerece/frontend/vendor';
import { CreateVendorDtoSchema } from '@ecomerece/shared';
import { useState } from 'react';
import { FormDialog } from '../../../../components/form-dialog';

const EMPTY = {
  title: '',
  slug: '',
  description: '',
  phone: '',
  email: '',
  streetAddress: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  logo: '',
  banner: '',
};

export function CreateVendorDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const createVendor = useCreateMyVendor();

  const update = (field: keyof typeof EMPTY, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleClose = () => {
    setForm(EMPTY);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);
    const parsed = CreateVendorDtoSchema.safeParse({
      title: form.title.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      contacts: {
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: {
          streetAddress: form.streetAddress.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          postalCode: form.postalCode.trim(),
          country: form.country.trim(),
        },
      },
      image: { logo: form.logo.trim(), banner: form.banner.trim() },
    });
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join(', '));
      return;
    }

    try {
      await createVendor.mutateAsync(parsed.data);
      onSuccess?.();
      handleClose();
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : 'Unable to create vendor.');
    }
  };

  return (
    <FormDialog
      title="Open your vendor storefront"
      open={open}
      onClose={handleClose}
      onSubmit={() => void handleSubmit()}
      isSubmitting={createVendor.isPending}
      error={error}
      submitLabel="Create vendor"
      maxWidth="md"
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <TextField label="Title" value={form.title} onChange={(e) => update('title', e.target.value)} />
        <TextField label="Slug" value={form.slug} onChange={(e) => update('slug', e.target.value)} />
        <TextField
          label="Description"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          multiline
          minRows={2}
          sx={{ gridColumn: { sm: '1 / -1' } }}
        />
        <TextField label="Phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        <TextField label="Email" value={form.email} onChange={(e) => update('email', e.target.value)} />
        <TextField
          label="Street address"
          value={form.streetAddress}
          onChange={(e) => update('streetAddress', e.target.value)}
          sx={{ gridColumn: { sm: '1 / -1' } }}
        />
        <TextField label="City" value={form.city} onChange={(e) => update('city', e.target.value)} />
        <TextField label="State" value={form.state} onChange={(e) => update('state', e.target.value)} />
        <TextField
          label="Postal code"
          value={form.postalCode}
          onChange={(e) => update('postalCode', e.target.value)}
        />
        <TextField
          label="Country"
          value={form.country}
          onChange={(e) => update('country', e.target.value)}
        />
        <TextField
          label="Logo URL or data URI"
          value={form.logo}
          onChange={(e) => update('logo', e.target.value)}
          sx={{ gridColumn: { sm: '1 / -1' } }}
        />
        <TextField
          label="Banner URL or data URI"
          value={form.banner}
          onChange={(e) => update('banner', e.target.value)}
          sx={{ gridColumn: { sm: '1 / -1' } }}
        />
      </Box>
      <Typography variant="caption" color="text.secondary">
        Images accept an http(s) URL or a base64 data URI.
      </Typography>
    </FormDialog>
  );
}
