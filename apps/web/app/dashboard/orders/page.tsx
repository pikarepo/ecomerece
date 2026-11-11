'use client';

import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import { useGetAdminPaginatedOrders } from '@ecomerece/frontend/order';
import { type FormEvent, useState } from 'react';
import { CursorPager } from '../../../components/cursor-pager';
import { DashboardNav } from '../../../components/dashboard-nav';
import { PageShell } from '../../../components/page-shell';
import { QueryState } from '../../../components/query-state';
import { useCursorPagination } from '../../../components/use-cursor-pagination';
import { AdminOrderTable } from './components/admin-order-table';

export default function DashboardOrdersPage() {
  const [buyerInput, setBuyerInput] = useState('');
  const [buyerId, setBuyerId] = useState('');
  const pager = useCursorPagination(20);
  const ordersQuery = useGetAdminPaginatedOrders({
    buyerId: buyerId || undefined,
    cursor: pager.cursor,
    limit: pager.limit,
    direction: 'next',
  });
  const orders = ordersQuery.data?.data ?? [];
  const meta = ordersQuery.data?.meta;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBuyerId(buyerInput.trim());
    pager.reset();
  };

  return (
    <PageShell
      requiresAuth
      eyebrow="Admin"
      title="Orders"
      description="Buyer-filtered order pagination from the order module."
      actions={<Chip label={`${orders.length} on this page`} color="primary" variant="outlined" />}
    >
      <DashboardNav />

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
          label="Buyer ID"
          value={buyerInput}
          onChange={(event) => setBuyerInput(event.target.value)}
          sx={{ flex: '1 1 280px' }}
        />
        <Button type="submit" variant="contained" startIcon={<SearchIcon />}>
          Filter
        </Button>
        <Button
          type="button"
          color="inherit"
          onClick={() => {
            setBuyerInput('');
            setBuyerId('');
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
          isLoading={ordersQuery.isPending}
          error={ordersQuery.error}
          isEmpty={orders.length === 0}
          emptyMessage="No orders match these filters."
          onRetry={() => void ordersQuery.refetch()}
          skeleton={<Skeleton variant="rounded" height={420} />}
        >
          <AdminOrderTable orders={orders} />
        </QueryState>
      </Paper>

      <CursorPager
        hasNext={Boolean(meta?.hasMore)}
        hasPrevious={pager.hasPrevious}
        isFetching={ordersQuery.isFetching}
        onNext={() => pager.next(meta?.nextCursor)}
        onPrevious={pager.previous}
        onReset={pager.reset}
      />
    </PageShell>
  );
}
