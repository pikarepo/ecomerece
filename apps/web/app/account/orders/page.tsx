'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { useGetMyOrders } from '@ecomerece/frontend/order';
import Link from 'next/link';
import { PageShell } from '../../../components/page-shell';
import { QueryState } from '../../../components/query-state';
import { useCursorPagination } from '../../../components/use-cursor-pagination';
import { CursorPager } from '../../../components/cursor-pager';
import { OrderCard } from './components/order-card';

export default function OrdersPage() {
  const pager = useCursorPagination(10);
  const ordersQuery = useGetMyOrders({
    cursor: pager.cursor,
    limit: pager.limit,
    direction: 'next',
  });
  const orders = ordersQuery.data?.data ?? [];
  const meta = ordersQuery.data?.meta;

  return (
    <PageShell
      requiresAuth
      eyebrow="Account"
      title="My orders"
      description="Orders fetched with the current session."
      actions={
        <>
          <Button component={Link} href="/account" startIcon={<ArrowBackIcon />} variant="outlined">
            Back to account
          </Button>
          <Button component={Link} href="/account/orders/new" variant="contained">
            New order
          </Button>
          <Chip label={`${orders.length} on this page`} color="primary" variant="outlined" />
        </>
      }
    >
      <QueryState
        isLoading={ordersQuery.isPending}
        error={ordersQuery.error}
        isEmpty={orders.length === 0}
        emptyMessage="You have not placed any orders yet."
        onRetry={() => void ordersQuery.refetch()}
        skeleton={
          <Stack spacing={2}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" height={104} />
            ))}
          </Stack>
        }
      >
        <Stack spacing={2}>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </Stack>
      </QueryState>

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
