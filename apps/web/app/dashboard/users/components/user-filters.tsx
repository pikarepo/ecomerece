'use client';

import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import type { UserRolesType } from '@ecomerece/shared';
import type { FormEvent } from 'react';

const ROLES: UserRolesType[] = ['admin', 'vendor', 'customer'];

export function UserFilters({
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  role,
  onRoleChange,
  onReset,
}: {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: () => void;
  role: UserRolesType | '';
  onRoleChange: (value: UserRolesType | '') => void;
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
        display: 'flex',
        gap: 1.5,
        flexWrap: 'wrap',
      }}
    >
      <TextField
        size="small"
        label="Search users"
        value={searchInput}
        onChange={(event) => onSearchInputChange(event.target.value)}
        sx={{ flex: '1 1 240px' }}
        slotProps={{
          input: {
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
          },
        }}
      />
      <TextField
        select
        size="small"
        label="Role"
        value={role}
        onChange={(event) => onRoleChange(event.target.value as UserRolesType | '')}
        sx={{ minWidth: 170 }}
      >
        <MenuItem value="">All roles</MenuItem>
        {ROLES.map((item) => (
          <MenuItem key={item} value={item}>
            {item}
          </MenuItem>
        ))}
      </TextField>
      <Button type="submit" variant="contained" startIcon={<SearchIcon />}>
        Search
      </Button>
      <Button type="button" color="inherit" onClick={onReset}>
        Reset
      </Button>
    </Paper>
  );
}
