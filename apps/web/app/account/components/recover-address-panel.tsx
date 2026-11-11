'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRecoverAddress } from '@ecomerece/frontend/address';
import { useState } from 'react';

export function RecoverAddressPanel() {
  const [addressId, setAddressId] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recoverAddress = useRecoverAddress();

  const handleRecover = async () => {
    setMessage(null);
    setError(null);
    try {
      const result = await recoverAddress.mutateAsync(addressId.trim());
      setMessage(result.message);
      setAddressId('');
    } catch (mutationError) {
      setError(
        mutationError instanceof Error ? mutationError.message : 'Unable to recover this address.',
      );
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Recover a deleted address
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Enter the ID of an address you previously deleted to restore it.
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <TextField
          size="small"
          label="Address ID"
          value={addressId}
          onChange={(event) => setAddressId(event.target.value)}
          sx={{ flex: 1 }}
        />
        <Button
          variant="outlined"
          onClick={() => void handleRecover()}
          disabled={!addressId.trim() || recoverAddress.isPending}
        >
          Recover
        </Button>
      </Stack>
      {message ? (
        <Alert severity="success" sx={{ mt: 1.5 }}>
          {message}
        </Alert>
      ) : null}
      {error ? (
        <Alert severity="error" sx={{ mt: 1.5 }}>
          {error}
        </Alert>
      ) : null}
    </Paper>
  );
}
