'use client';

import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import type { FormEvent } from 'react';

export function VariantFilters({
  searchInput,
  onSearchInputChange,
  productInput,
  onProductInputChange,
  active,
  onActiveChange,
  deleted,
  onDeletedChange,
  onSubmit,
  onReset,
}: {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  productInput: string;
  onProductInputChange: (value: string) => void;
  active: '' | 'true' | 'false';
  onActiveChange: (value: '' | 'true' | 'false') => void;
  deleted: '' | 'true' | 'false';
  onDeletedChange: (value: '' | 'true' | 'false') => void;
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
        label="Search variants"
        value={searchInput}
        onChange={(event) => onSearchInputChange(event.target.value)}
        sx={{ flex: '1 1 220px' }}
      />
      <TextField
        size="small"
        label="Product ID"
        value={productInput}
        onChange={(event) => onProductInputChange(event.target.value)}
        sx={{ flex: '1 1 240px' }}
      />
      <TextField
        select
        size="small"
        label="State"
        value={active}
        onChange={(event) => onActiveChange(event.target.value as '' | 'true' | 'false')}
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="">All states</MenuItem>
        <MenuItem value="true">Active</MenuItem>
        <MenuItem value="false">Inactive</MenuItem>
      </TextField>
      <TextField
        select
        size="small"
        label="Deleted"
        value={deleted}
        onChange={(event) => onDeletedChange(event.target.value as '' | 'true' | 'false')}
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="false">Active records</MenuItem>
        <MenuItem value="true">Deleted only</MenuItem>
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
