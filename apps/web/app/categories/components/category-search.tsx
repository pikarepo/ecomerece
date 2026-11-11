'use client';

import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import type { FormEvent } from 'react';

export function CategorySearch({
  value,
  onChange,
  onSubmit,
  onReset,
}: {
  value: string;
  onChange: (value: string) => void;
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
        label="Search categories"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        sx={{ flex: '1 1 240px' }}
        slotProps={{
          input: {
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
          },
        }}
      />
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
