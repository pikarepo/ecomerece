'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import type { FormEvent, ReactNode } from 'react';

export function FormDialog({
  title,
  open,
  onClose,
  onSubmit,
  submitLabel = 'Save',
  isSubmitting = false,
  error,
  success,
  maxWidth = 'sm',
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  error?: string | null;
  success?: string | null;
  maxWidth?: 'xs' | 'sm' | 'md';
  children: ReactNode;
}) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>{title}</DialogTitle>
      <DialogContent>
        <Stack component="form" spacing={2} onSubmit={handleSubmit} sx={{ pt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {success ? <Alert severity="success">{success}</Alert> : null}
          {children}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? <CircularProgress size={18} color="inherit" /> : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
