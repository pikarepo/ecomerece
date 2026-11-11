'use client';

import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import { useGetAdminPaginatedInventory } from '@ecomerece/frontend/inventory';
import type { InventoryResponseReadModel } from '@ecomerece/shared';
import { useState } from 'react';
import { CursorPager } from '../../../components/cursor-pager';
import { DashboardNav } from '../../../components/dashboard-nav';
import { PageShell } from '../../../components/page-shell';
import { QueryState } from '../../../components/query-state';
import { useCursorPagination } from '../../../components/use-cursor-pagination';
import { InventoryActionDialog } from './components/inventory-action-dialog';
import { InventoryCreateDialog } from './components/inventory-create-dialog';
import { InventoryFilters } from './components/inventory-filters';
import { InventoryTable } from './components/inventory-table';

export default function DashboardInventoryPage() {
  const [variantInput, setVariantInput] = useState('');
  const [variantId, setVariantId] = useState('');
  const [inStock, setInStock] = useState<'' | 'true' | 'false'>('');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] =
    useState<InventoryResponseReadModel | null>(null);
  const pager = useCursorPagination(20);
  const inventoryQuery = useGetAdminPaginatedInventory({
    variantId: variantId || undefined,
    inStock: inStock === '' ? undefined : inStock === 'true',
    cursor: pager.cursor,
    limit: pager.limit,
    direction: 'next',
  });
  const inventory = inventoryQuery.data?.data ?? [];
  const meta = inventoryQuery.data?.meta;

  return (
    <PageShell
      requiresAuth
      eyebrow="Admin"
      title="Inventory"
      description="Stock levels, reservations, and low-stock thresholds."
      actions={
        <>
          <Chip label={`${inventory.length} on this page`} color="primary" variant="outlined" />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            New inventory
          </Button>
        </>
      }
    >
      <DashboardNav />

      <InventoryFilters
        variantInput={variantInput}
        onVariantInputChange={setVariantInput}
        inStock={inStock}
        onInStockChange={(value) => {
          setInStock(value);
          pager.reset();
        }}
        onSubmit={() => {
          setVariantId(variantInput.trim());
          pager.reset();
        }}
        onReset={() => {
          setVariantInput('');
          setVariantId('');
          setInStock('');
          pager.reset();
        }}
      />

      <Paper
        elevation={0}
        sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}
      >
        <QueryState
          isLoading={inventoryQuery.isPending}
          error={inventoryQuery.error}
          isEmpty={inventory.length === 0}
          emptyMessage="No inventory matches these filters."
          onRetry={() => void inventoryQuery.refetch()}
          skeleton={<Skeleton variant="rounded" height={420} />}
        >
          <InventoryTable inventory={inventory} onManage={setSelectedInventory} />
        </QueryState>
      </Paper>

      <CursorPager
        hasNext={Boolean(meta?.hasMore)}
        hasPrevious={pager.hasPrevious}
        isFetching={inventoryQuery.isFetching}
        onNext={() => pager.next(meta?.nextCursor)}
        onPrevious={pager.previous}
        onReset={pager.reset}
      />

      <InventoryCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => void inventoryQuery.refetch()}
      />
      <InventoryActionDialog
        inventory={selectedInventory}
        onClose={() => setSelectedInventory(null)}
        onSuccess={() => void inventoryQuery.refetch()}
      />
    </PageShell>
  );
}
