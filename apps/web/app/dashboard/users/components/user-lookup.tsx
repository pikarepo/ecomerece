'use client';

import SearchIcon from '@mui/icons-material/Search';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useGetPaginatedUsers, useGetUserById } from '@ecomerece/frontend/user';
import type { UserResponseReadModel } from '@ecomerece/shared';
import { useState } from 'react';

function UserSummary({
  user,
  onManage,
}: {
  user: UserResponseReadModel;
  onManage: (user: UserResponseReadModel) => void;
}) {
  return (
    <Paper
      elevation={0}
      sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Avatar src={user.image ?? undefined} alt={user.fullName}>
          {user.fullName.slice(0, 1)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
            {user.fullName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {user.email ?? 'No email'}
          </Typography>
        </Box>
        <Chip size="small" label={user.role} variant="outlined" />
        <Button size="small" onClick={() => onManage(user)}>
          Manage
        </Button>
      </Stack>
    </Paper>
  );
}

export function UserLookup({
  onManage,
}: {
  onManage: (user: UserResponseReadModel) => void;
}) {
  const [lookupId, setLookupId] = useState('');
  const [requestedId, setRequestedId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const userQuery = useGetUserById(requestedId);
  const directoryQuery = useGetPaginatedUsers({
    search: search || undefined,
    limit: 5,
    direction: 'next',
  });
  const directory = directoryQuery.data?.data ?? [];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
      <Paper
        elevation={0}
        sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
      >
        <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Load user by ID</Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            label="User ID"
            value={lookupId}
            onChange={(event) => setLookupId(event.target.value)}
            sx={{ flex: 1 }}
          />
          <Button
            variant="outlined"
            onClick={() => setRequestedId(lookupId.trim())}
            disabled={!lookupId.trim() || userQuery.isFetching}
          >
            Load
          </Button>
        </Stack>
        {userQuery.error ? (
          <Typography variant="body2" color="error" sx={{ mt: 1.5 }}>
            {userQuery.error instanceof Error ? userQuery.error.message : 'User not found.'}
          </Typography>
        ) : null}
        {userQuery.data ? (
          <Box sx={{ mt: 1.5 }}>
            <UserSummary user={userQuery.data} onManage={onManage} />
          </Box>
        ) : null}
      </Paper>

      <Paper
        elevation={0}
        sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
      >
        <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Public directory search</Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            label="Search users"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            sx={{ flex: 1 }}
          />
          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            onClick={() => setSearch(searchInput.trim())}
            disabled={directoryQuery.isFetching}
          >
            Search
          </Button>
        </Stack>
        <Stack spacing={1} sx={{ mt: 1.5 }}>
          {directoryQuery.error ? (
            <Typography variant="body2" color="error">
              {directoryQuery.error instanceof Error
                ? directoryQuery.error.message
                : 'Unable to search users.'}
            </Typography>
          ) : null}
          {directory.map((user) => (
            <UserSummary key={user.id} user={user} onManage={onManage} />
          ))}
          {!directoryQuery.isPending && !directoryQuery.error && directory.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No matching users.
            </Typography>
          ) : null}
        </Stack>
      </Paper>
    </Box>
  );
}
