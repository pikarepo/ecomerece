'use client';

import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import type { FormEvent } from 'react';

export function InventoryFilters({
  variantInput,
  onVariantInputChange,
  inStock,
  onInStockChange,
  onSubmit,
  onReset,
}: {
  variantInput: string;
  onVariantInputChange: (value: string) => void;
  inStock: '' | 'true' | 'false';
  onInStockChange: (value: '' | 'true' | 'false') => void;
  onSubmit: () => void;
  onReset: () => void;
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
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        gap: 1.5,
        flexWrap: 'wrap',
      }}
    >
      <TextField
        size="small"
        label="Variant ID"
        value={variantInput}
        onChange={(event) => onVariantInputChange(event.target.value)}
        sx={{ flex: '1 1 260px' }}
      />
      <TextField
        select
        size="small"
        label="Stock"
        value={inStock}
        onChange={(event) => onInStockChange(event.target.value as '' | 'true' | 'false')}
        sx={{ minWidth: 170 }}
      >
        <MenuItem value="">All stock</MenuItem>
        <MenuItem value="true">In stock</MenuItem>
        <MenuItem value="false">Out of stock</MenuItem>
      </TextField>
      <Button type="submit" variant="contained" startIcon={<SearchIcon />}>
        Filter
      </Button>
      <Button type="button" color="inherit" onClick={onReset}>
        Reset
      </Button>
    </Paper>
  );
}
