'use client';

import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useGetAdminPaginatedVendors } from '@ecomerece/frontend/vendor';
import type { VendorListItemReadModel } from '@ecomerece/shared';
import { useState } from 'react';
import { CursorPager } from '../../../components/cursor-pager';
import { DashboardNav } from '../../../components/dashboard-nav';
import { PageShell } from '../../../components/page-shell';
import { QueryState } from '../../../components/query-state';
import { useCursorPagination } from '../../../components/use-cursor-pagination';
import { VendorActionDialog } from './components/vendor-action-dialog';

type BooleanFilter = '' | 'true' | 'false';

export default function DashboardVendorsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [verified, setVerified] = useState<BooleanFilter>('');
  const [deleted, setDeleted] = useState<BooleanFilter>('');
  const [pending, setPending] = useState<BooleanFilter>('');
  const [selectedVendor, setSelectedVendor] = useState<VendorListItemReadModel | null>(null);
  const pager = useCursorPagination(20);

  const vendorsQuery = useGetAdminPaginatedVendors({
    search: search || undefined,
    verified: verified === '' ? undefined : verified === 'true',
    deleted: deleted === '' ? undefined : deleted === 'true',
    pending: pending === '' ? undefined : pending === 'true',
    cursor: pager.cursor,
    limit: pager.limit,
    direction: 'next',
  });
  const vendors = vendorsQuery.data?.data ?? [];
  const meta = vendorsQuery.data?.meta;

  return (
    <PageShell
      requiresAuth
      eyebrow="Admin"
      title="Vendors"
      description="Verify, reject, soft-delete, and recover vendor storefronts."
      actions={
        <Chip label={`${vendors.length} on this page`} color="primary" variant="outlined" />
      }
    >
      <DashboardNav />

      <Paper
        elevation={0}
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          setSearch(searchInput.trim());
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
          label="Search vendors"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          sx={{ flex: '1 1 220px' }}
          slotProps={{
            input: {
              startAdornment: (
                <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              ),
            },
          }}
        />
        <TextField
          select
          size="small"
          label="Verified"
          value={verified}
          onChange={(event) => {
            setVerified(event.target.value as BooleanFilter);
            pager.reset();
          }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="true">Verified</MenuItem>
          <MenuItem value="false">Not verified</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Pending"
          value={pending}
          onChange={(event) => {
            setPending(event.target.value as BooleanFilter);
            pager.reset();
          }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="true">Pending only</MenuItem>
          <MenuItem value="false">Not pending</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Deleted"
          value={deleted}
          onChange={(event) => {
            setDeleted(event.target.value as BooleanFilter);
            pager.reset();
          }}
          sx={{ minWidth: 150 }}
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
            setSearchInput('');
            setSearch('');
            setVerified('');
            setDeleted('');
            setPending('');
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
          isLoading={vendorsQuery.isPending}
          error={vendorsQuery.error}
          isEmpty={vendors.length === 0}
          emptyMessage="No vendors match these filters."
          onRetry={() => void vendorsQuery.refetch()}
          skeleton={<Skeleton variant="rounded" height={420} />}
        >
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Verification</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vendors.map((vendor) => (
                  <TableRow key={vendor.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Box
                          component="img"
                          src={vendor.images?.logo}
                          alt={vendor.title}
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            objectFit: 'cover',
                            bgcolor: 'grey.100',
                          }}
                        />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {vendor.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {vendor.slug}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={vendor.verification?.isVerified ? 'Verified' : 'Pending'}
                        color={vendor.verification?.isVerified ? 'success' : 'warning'}
                        variant="outlined"
                      />
                      {vendor.verification?.rejectedReason ? (
                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                          {vendor.verification.rejectedReason}
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {vendor.isDeleted ? (
                        <Chip size="small" label="Deleted" color="error" />
                      ) : (
                        <Chip size="small" label="Active" color="success" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => setSelectedVendor(vendor)}>
                        Manage
                      </Button>
                    </TableCell>
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
        isFetching={vendorsQuery.isFetching}
        onNext={() => pager.next(meta?.nextCursor)}
        onPrevious={pager.previous}
        onReset={pager.reset}
      />

      <VendorActionDialog
        vendor={selectedVendor}
        onClose={() => setSelectedVendor(null)}
        onSuccess={() => void vendorsQuery.refetch()}
      />
    </PageShell>
  );
}
