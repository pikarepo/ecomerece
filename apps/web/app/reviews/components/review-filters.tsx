'use client';

import FilterListIcon from '@mui/icons-material/FilterList';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';

export function ReviewFilters({
  rating,
  onRatingChange,
  productId,
  onProductIdChange,
  onReset,
}: {
  rating: number | undefined;
  onRatingChange: (value: number | undefined) => void;
  productId: string;
  onProductIdChange: (value: string) => void;
  onReset: () => void;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        gap: 1.5,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      <FilterListIcon color="action" />
      <TextField
        select
        size="small"
        label="Rating"
        value={rating ?? ''}
        onChange={(event) => {
          const value = event.target.value;
          onRatingChange(value === '' ? undefined : Number(value));
        }}
        sx={{ minWidth: 180 }}
      >
        <MenuItem value="">All ratings</MenuItem>
        {[5, 4, 3, 2, 1].map((value) => (
          <MenuItem key={value} value={value}>
            {value} star{value === 1 ? '' : 's'}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        size="small"
        label="Product ID"
        value={productId}
        onChange={(event) => onProductIdChange(event.target.value)}
        sx={{ minWidth: 240 }}
      />
      <Button color="inherit" onClick={onReset}>
        Reset
      </Button>
    </Paper>
  );
}
