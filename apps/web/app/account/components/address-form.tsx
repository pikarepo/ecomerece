'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { createMyAddressDtoType } from '@ecomerece/shared';
import type { FormEvent } from 'react';

const FIELDS: { key: keyof createMyAddressDtoType; label: string }[] = [
  { key: 'streetAddress', label: 'Street address' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'postalCode', label: 'Postal code' },
  { key: 'country', label: 'Country' },
];

export function AddressForm({
  value,
  isEditing,
  isSaving,
  error,
  onChange,
  onSubmit,
  onCancel,
}: {
  value: createMyAddressDtoType;
  isEditing: boolean;
  isSaving: boolean;
  error?: string | null;
  onChange: (field: keyof createMyAddressDtoType, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Paper
      elevation={0}
      component="form"
      onSubmit={handleSubmit}
      sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        {isEditing ? 'Edit address' : 'Add an address'}
      </Typography>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          gap: 1.5,
        }}
      >
        {FIELDS.map((field) => (
          <TextField
            key={field.key}
            size="small"
            label={field.label}
            value={value[field.key]}
            onChange={(event) => onChange(field.key, event.target.value)}
            sx={field.key === 'streetAddress' ? { gridColumn: { sm: '1 / -1' } } : undefined}
          />
        ))}
      </Box>

      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button type="submit" variant="contained" disabled={isSaving}>
          {isSaving ? 'Saving…' : isEditing ? 'Save address' : 'Add address'}
        </Button>
        <Button type="button" color="inherit" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
      </Stack>
    </Paper>
  );
}
