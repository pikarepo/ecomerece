'use client';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useUpdateMyVendorContact } from '@ecomerece/frontend/vendor';
import { UpdateMyVendorContactDtoSchema, type VendorResponseReadModel } from '@ecomerece/shared';
import { useState } from 'react';
import { FormDialog } from '../../../../components/form-dialog';

type VendorContactDialogProps = {
  vendor: VendorResponseReadModel;
  open: boolean;
  onClose: () => void;
};

export function VendorContactDialog(props: VendorContactDialogProps) {
  return <VendorContactDialogContent key={`${props.open}-${props.vendor.id}`} {...props} />;
}

function VendorContactDialogContent({ vendor, open, onClose }: VendorContactDialogProps) {
  const [phone, setPhone] = useState(vendor.contact.phone);
  const [email, setEmail] = useState(vendor.contact.email);
  const [address, setAddress] = useState(vendor.contact.address);
  const [error, setError] = useState<string | null>(null);
  const updateContact = useUpdateMyVendorContact();

  const updateAddress = (field: keyof typeof address, value: string) =>
    setAddress((current) => ({ ...current, [field]: value }));

  const handleSubmit = async () => {
    setError(null);
    const parsed = UpdateMyVendorContactDtoSchema.safeParse({
      phone: phone.trim(),
      email: email.trim(),
      address: {
        streetAddress: address.streetAddress.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        postalCode: address.postalCode.trim(),
        country: address.country.trim(),
      },
    });
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join(', '));
      return;
    }
    try {
      await updateContact.mutateAsync(parsed.data);
      onClose();
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : 'Unable to update contact.');
    }
  };

  return (
    <FormDialog
      title="Edit vendor contact"
      open={open}
      onClose={onClose}
      onSubmit={() => void handleSubmit()}
      isSubmitting={updateContact.isPending}
      error={error}
      maxWidth="md"
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField
          label="Street address"
          value={address.streetAddress}
          onChange={(e) => updateAddress('streetAddress', e.target.value)}
          sx={{ gridColumn: { sm: '1 / -1' } }}
        />
        <TextField label="City" value={address.city} onChange={(e) => updateAddress('city', e.target.value)} />
        <TextField label="State" value={address.state} onChange={(e) => updateAddress('state', e.target.value)} />
        <TextField
          label="Postal code"
          value={address.postalCode}
          onChange={(e) => updateAddress('postalCode', e.target.value)}
        />
        <TextField
          label="Country"
          value={address.country}
          onChange={(e) => updateAddress('country', e.target.value)}
        />
      </Box>
    </FormDialog>
  );
}
