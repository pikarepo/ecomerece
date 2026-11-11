'use client';

import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  useCreateMyAddress,
  useDeleteMyAddress,
  useGetMyAddresses,
  useSetMyAddressAsDefault,
  useUpdateMyAddress,
} from '@ecomerece/frontend/address';
import { useGetMe } from '@ecomerece/frontend/user';
import { type createMyAddressDtoType, createMyAddressDto } from '@ecomerece/shared';
import Link from 'next/link';
import { useState } from 'react';
import { PageShell } from '../../components/page-shell';
import { QueryState } from '../../components/query-state';
import { AddressCard } from './components/address-card';
import { AddressForm } from './components/address-form';
import { DeleteAccountPanel } from './components/delete-account-panel';
import { ProfilePanel } from './components/profile-panel';
import { RecoverAddressPanel } from './components/recover-address-panel';

const EMPTY_ADDRESS: createMyAddressDtoType = {
  streetAddress: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
};

export default function AccountPage() {
  const meQuery = useGetMe();
  const addressesQuery = useGetMyAddresses();
  const createAddress = useCreateMyAddress();
  const updateAddress = useUpdateMyAddress();
  const deleteAddress = useDeleteMyAddress();
  const setDefaultAddress = useSetMyAddressAsDefault();

  const [form, setForm] = useState<createMyAddressDtoType>(EMPTY_ADDRESS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const addresses = addressesQuery.data ?? [];
  const isSaving = createAddress.isPending || updateAddress.isPending;
  const isMutating = isSaving || deleteAddress.isPending || setDefaultAddress.isPending;

  const resetForm = () => {
    setForm(EMPTY_ADDRESS);
    setEditingId(null);
    setFormError(null);
  };

  const handleSubmit = () => {
    const parsed = createMyAddressDto.safeParse(form);
    if (!parsed.success) {
      setFormError(parsed.error.issues.map((issue) => issue.message).join(', '));
      return;
    }

    setFormError(null);

    if (editingId) {
      updateAddress.mutate(
        { id: editingId, data: parsed.data },
        {
          onSuccess: resetForm,
          onError: (error) =>
            setFormError(error instanceof Error ? error.message : 'Unable to update address.'),
        },
      );
      return;
    }

    createAddress.mutate(parsed.data, {
      onSuccess: resetForm,
      onError: (error) =>
        setFormError(error instanceof Error ? error.message : 'Unable to create address.'),
    });
  };

  return (
    <PageShell
      requiresAuth
      eyebrow="Account"
      title="My account"
      description="Profile, saved addresses, and account state from the user and address modules."
      actions={
        <>
          <Button component={Link} href="/account/orders" variant="contained">
            My orders
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              void meQuery.refetch();
              void addressesQuery.refetch();
            }}
            disabled={meQuery.isFetching || addressesQuery.isFetching}
          >
            Refresh
          </Button>
        </>
      }
    >
      <Stack spacing={3}>
        <QueryState
          isLoading={meQuery.isPending}
          error={meQuery.error}
          onRetry={() => void meQuery.refetch()}
          skeleton={<Skeleton variant="rounded" height={240} />}
        >
          {meQuery.data ? <ProfilePanel user={meQuery.data} /> : null}
        </QueryState>

        <Box>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2 }}
          >
            <Box>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 800 }}>
                Saved addresses
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {addresses.length} address{addresses.length === 1 ? '' : 'es'} on file
              </Typography>
            </Box>
            {editingId ? (
              <Button startIcon={<AddIcon />} onClick={resetForm}>
                New address
              </Button>
            ) : null}
          </Stack>

          <AddressForm
            value={form}
            isEditing={Boolean(editingId)}
            isSaving={isSaving}
            error={formError}
            onChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />

          {deleteAddress.error || setDefaultAddress.error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {(deleteAddress.error ?? setDefaultAddress.error)?.message}
            </Alert>
          ) : null}

          <Box sx={{ mt: 2.5 }}>
            <QueryState
              isLoading={addressesQuery.isPending}
              error={addressesQuery.error}
              isEmpty={addresses.length === 0}
              emptyMessage="No addresses saved yet."
              onRetry={() => void addressesQuery.refetch()}
              skeleton={
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                    gap: 2,
                  }}
                >
                  {Array.from({ length: 2 }).map((_, index) => (
                    <Skeleton key={index} variant="rounded" height={180} />
                  ))}
                </Box>
              }
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: 2,
                }}
              >
                {addresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    isBusy={isMutating}
                    onEdit={() => {
                      setEditingId(address.id);
                      setForm({
                        streetAddress: address.streetAddress,
                        city: address.city,
                        state: address.state,
                        postalCode: address.postalCode,
                        country: address.country,
                      });
                      setFormError(null);
                    }}
                    onDelete={() => {
                      if (window.confirm('Delete this address?')) {
                        deleteAddress.mutate(address.id);
                      }
                    }}
                    onSetDefault={() => setDefaultAddress.mutate(address.id)}
                  />
                ))}
              </Box>
            </QueryState>
          </Box>
        </Box>

        <RecoverAddressPanel />

        <DeleteAccountPanel />
      </Stack>
    </PageShell>
  );
}
