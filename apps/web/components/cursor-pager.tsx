'use client';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

export function CursorPager({
  hasNext,
  hasPrevious,
  isFetching,
  onNext,
  onPrevious,
  onReset,
}: {
  hasNext: boolean;
  hasPrevious: boolean;
  isFetching?: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onReset: () => void;
}) {
  if (!hasNext && !hasPrevious) return null;

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ mt: 3, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}
    >
      <Button
        variant="outlined"
        startIcon={<ChevronLeftIcon />}
        onClick={onPrevious}
        disabled={!hasPrevious || isFetching}
      >
        Previous
      </Button>
      <Button size="small" color="inherit" onClick={onReset} disabled={isFetching}>
        Back to first page
      </Button>
      <Button
        variant="contained"
        endIcon={<ChevronRightIcon />}
        onClick={onNext}
        disabled={!hasNext || isFetching}
      >
        Next
      </Button>
    </Stack>
  );
}
