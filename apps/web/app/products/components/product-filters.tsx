'use client';

import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import type { ProductPublicSort } from '@ecomerece/shared';
import type { FormEvent } from 'react';

const SORT_OPTIONS: { value: ProductPublicSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'most_sold', label: 'Most sold' },
  { value: 'most_views', label: 'Most viewed' },
  { value: 'most_purchases', label: 'Most purchased' },
];

export function ProductFilters({
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  categoryId,
  categories,
  onCategoryChange,
  sort,
  onSortChange,
  onReset,
}: {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: () => void;
  categoryId: string;
  categories: { id: string; title: string }[];
  onCategoryChange: (value: string) => void;
  sort: ProductPublicSort;
  onSortChange: (value: ProductPublicSort) => void;
  onReset: () => void;
}) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearchSubmit();
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
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(220px, 1fr) 220px 190px auto' },
        gap: 1.5,
        alignItems: 'center',
      }}
    >
      <TextField
        size="small"
        label="Search products"
        value={searchInput}
        onChange={(event) => onSearchInputChange(event.target.value)}
        slotProps={{
          input: {
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
          },
        }}
      />
      <TextField
        select
        size="small"
        label="Category"
        value={categoryId}
        onChange={(event) => onCategoryChange(event.target.value)}
      >
        <MenuItem value="">All categories</MenuItem>
        {categories.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            {category.title}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label="Sort by"
        value={sort}
        onChange={(event) => onSortChange(event.target.value as ProductPublicSort)}
      >
        {SORT_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button type="submit" variant="contained" startIcon={<SearchIcon />}>
          Search
        </Button>
        <Button type="button" color="inherit" onClick={onReset}>
          Reset
        </Button>
      </Box>
    </Paper>
  );
}
