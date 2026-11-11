'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import type { ReactNode } from 'react';

export function QueryState({
  isLoading,
  error,
  isEmpty,
  emptyMessage = 'Nothing to show yet.',
  onRetry,
  skeleton,
  children,
}: {
  isLoading: boolean;
  error: unknown;
  isEmpty?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
  skeleton?: ReactNode;
  children: ReactNode;
}) {
  if (isLoading) {
    return (
      skeleton ?? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={220} />
          ))}
        </Box>
      )
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          onRetry ? (
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          ) : undefined
        }
      >
        {error instanceof Error ? error.message : 'Unable to load this data.'}
      </Alert>
    );
  }

  if (isEmpty) {
    return <Alert severity="info">{emptyMessage}</Alert>;
  }

  return <>{children}</>;
}
