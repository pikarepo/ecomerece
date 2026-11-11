'use client';

import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useGetAdminPaginatedAddresses } from '@ecomerece/frontend/address';
import { useState } from 'react';
import { CursorPager } from '../../../components/cursor-pager';
import { DashboardNav } from '../../../components/dashboard-nav';
import { formatDateTime } from '../../../components/format';
import { PageShell } from '../../../components/page-shell';
import { QueryState } from '../../../components/query-state';
import { useCursorPagination } from '../../../components/use-cursor-pagination';

type BooleanFilter = '' | 'true' | 'false';

export default function DashboardAddressesPage() {
  const [ownerInput, setOwnerInput] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [deleted, setDeleted] = useState<BooleanFilter>('');
  const pager = useCursorPagination(20);

  const addressesQuery = useGetAdminPaginatedAddresses({
    ownerId: ownerId || undefined,
    deleted: deleted === '' ? undefined : deleted === 'true',
    cursor: pager.cursor,
    limit: pager.limit,
    direction: 'next',
  });
  const addresses = addressesQuery.data?.data ?? [];
  const meta = addressesQuery.data?.meta;

  return (
    <PageShell
      requiresAuth
      eyebrow="Admin"
      title="Addresses"
      description="Every saved address, filterable by owner and deletion state."
      actions={
        <Chip label={`${addresses.length} on this page`} color="primary" variant="outlined" />
      }
    >
      <DashboardNav />

      <Paper
        elevation={0}
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          setOwnerId(ownerInput.trim());
          pager.reset();
        }}
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
          label="Owner user ID"
          value={ownerInput}
          onChange={(event) => setOwnerInput(event.target.value)}
          sx={{ flex: '1 1 260px' }}
        />
        <TextField
          select
          size="small"
          label="Deleted"
          value={deleted}
          onChange={(event) => {
            setDeleted(event.target.value as BooleanFilter);
            pager.reset();
          }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="false">Active only</MenuItem>
          <MenuItem value="true">Deleted only</MenuItem>
        </TextField>
        <Button type="submit" variant="contained" startIcon={<SearchIcon />}>
          Filter
        </Button>
        <Button
          type="button"
          color="inherit"
          onClick={() => {
            setOwnerInput('');
            setOwnerId('');
            setDeleted('');
            pager.reset();
          }}
        >
          Reset
        </Button>
      </Paper>

      <Paper
        elevation={0}
        sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}
      >
        <QueryState
          isLoading={addressesQuery.isPending}
          error={addressesQuery.error}
          isEmpty={addresses.length === 0}
          emptyMessage="No addresses match these filters."
          onRetry={() => void addressesQuery.refetch()}
          skeleton={<Skeleton variant="rounded" height={420} />}
        >
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Address</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>Default</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {addresses.map((address) => (
                  <TableRow key={address.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {address.streetAddress}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {address.city}, {address.state} {address.postalCode}, {address.country}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                        {address.ownerId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {address.defaultDate ? (
                        <Chip size="small" label="Default" color="primary" />
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>{formatDateTime(address.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </QueryState>
      </Paper>

      <CursorPager
        hasNext={Boolean(meta?.hasMore)}
        hasPrevious={pager.hasPrevious}
        isFetching={addressesQuery.isFetching}
        onNext={() => pager.next(meta?.nextCursor)}
        onPrevious={pager.previous}
        onReset={pager.reset}
      />
    </PageShell>
  );
}
