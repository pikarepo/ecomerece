'use client';

import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useGetMyAddresses } from '@ecomerece/frontend/address';
import { useCreateMyOrder } from '@ecomerece/frontend/order';
import { createMyOrderDto } from '@ecomerece/shared';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { PageShell } from '../../../../components/page-shell';

type ItemDraft = { variantId: string; quantity: string };

export default function NewOrderPage() {
  const idempotentKey = useRef<string | null>(null);
  const addressesQuery = useGetMyAddresses();
  const createOrder = useCreateMyOrder();
  const [addressId, setAddressId] = useState('');
  const [waitingTime, setWaitingTime] = useState('');
  const [items, setItems] = useState<ItemDraft[]>([{ variantId: '', quantity: '1' }]);
  const [error, setError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<{ id: string; message: string } | null>(null);

  const addresses = addressesQuery.data ?? [];

  const updateItem = (index: number, patch: Partial<ItemDraft>) =>
    setItems((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const handleSubmit = async () => {
    setError(null);
    setCreatedOrder(null);
    idempotentKey.current ??= crypto.randomUUID();
    const parsed = createMyOrderDto.safeParse({
      idempotentKey: idempotentKey.current,
      addressId,
      waitingTime: waitingTime || new Date(),
      items: items.map((item) => ({
        variantId: item.variantId.trim(),
        quantity: Number(item.quantity),
      })),
    });
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join(', '));
      return;
    }

    try {
      const result = await createOrder.mutateAsync(parsed.data);
      setCreatedOrder({
        id: result.updatedData?.id ?? '',
        message: result.message,
      });
      idempotentKey.current = crypto.randomUUID();
      setItems([{ variantId: '', quantity: '1' }]);
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : 'Unable to create order.');
    }
  };

  return (
    <PageShell
      requiresAuth
      eyebrow="Account"
      title="Create order"
      description="Place an order using one of your saved addresses and variant IDs."
      actions={
        <>
          <Button
            component={Link}
            href="/account/orders"
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            My orders
          </Button>
          <Button component={Link} href="/account" variant="outlined">
            Account
          </Button>
        </>
      }
    >
      <Paper
        elevation={0}
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
        sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
      >
        <Stack spacing={2.5}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {createdOrder ? (
            <Alert severity="success">
              {createdOrder.message}
              {createdOrder.id ? ` Order ID: ${createdOrder.id}` : ''}
            </Alert>
          ) : null}

          {addressesQuery.error ? (
            <Alert severity="warning">
              {addressesQuery.error instanceof Error
                ? addressesQuery.error.message
                : 'Unable to load saved addresses.'}
            </Alert>
          ) : null}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
            }}
          >
            {addresses.length > 0 ? (
              <TextField
                select
                label="Delivery address"
                value={addressId}
                onChange={(event) => setAddressId(event.target.value)}
                fullWidth
              >
                {addresses.map((address) => (
                  <MenuItem key={address.id} value={address.id}>
                    {address.fullAddress || address.streetAddress}, {address.city}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                label="Address ID"
                value={addressId}
                onChange={(event) => setAddressId(event.target.value)}
                helperText="No saved addresses found. Paste an address ID or add one on your account page."
                fullWidth
              />
            )}
            <TextField
              label="Waiting time"
              type="datetime-local"
              value={waitingTime}
              onChange={(event) => setWaitingTime(event.target.value)}
              helperText="Leave blank to deliver as soon as possible."
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Items
            </Typography>
            <Stack spacing={1.5}>
              {items.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 140px auto' },
                    gap: 1.5,
                    alignItems: 'center',
                  }}
                >
                  <TextField
                    size="small"
                    label="Variant ID"
                    value={item.variantId}
                    onChange={(event) => updateItem(index, { variantId: event.target.value })}
                  />
                  <TextField
                    size="small"
                    label="Quantity"
                    type="number"
                    value={item.quantity}
                    onChange={(event) => updateItem(index, { quantity: event.target.value })}
                    slotProps={{ htmlInput: { min: 1 } }}
                  />
                  <IconButton
                    onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
                    disabled={items.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Stack>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() =>
                setItems((current) => [...current, { variantId: '', quantity: '1' }])
              }
              sx={{ mt: 1.5 }}
            >
              Add item
            </Button>
          </Box>

          <Box>
            <Button type="submit" variant="contained" disabled={createOrder.isPending}>
              {createOrder.isPending ? 'Placing order…' : 'Place order'}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </PageShell>
  );
}
