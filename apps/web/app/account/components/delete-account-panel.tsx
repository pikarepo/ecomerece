'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useSoftDeleteMe } from '@ecomerece/frontend/user';
import { DeleteMeDTOSchema } from '@ecomerece/shared';
import { useState } from 'react';
import { useAuth } from '../../../components/auth-provider';

export function DeleteAccountPanel() {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const deleteMe = useSoftDeleteMe();
  const { signOut } = useAuth();

  const handleDelete = async () => {
    setError(null);
    const parsed = DeleteMeDTOSchema.safeParse({ reason: reason.trim() });
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join(', '));
      return;
    }
    if (!window.confirm('Soft delete your account? You will be signed out immediately.')) return;

    try {
      await deleteMe.mutateAsync(parsed.data);
      await signOut();
    } catch (mutationError) {
      setError(
        mutationError instanceof Error ? mutationError.message : 'Unable to delete your account.',
      );
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{ p: { xs: 2, md: 3 }, borderRadius: 2.5, border: '1px solid', borderColor: 'error.main' }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Delete account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your account will be soft deleted and you will be signed out. An admin can recover it
            later.
          </Typography>
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <TextField
          label="Reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          helperText="At least 10 characters."
          multiline
          minRows={2}
          fullWidth
          color="error"
        />

        <Box>
          <Button
            variant="outlined"
            color="error"
            onClick={() => void handleDelete()}
            disabled={deleteMe.isPending}
          >
            {deleteMe.isPending ? 'Deleting…' : 'Delete my account'}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
