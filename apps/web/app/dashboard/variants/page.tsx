'use client';

import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import { useGetAdminPaginatedVariants } from '@ecomerece/frontend/product-variant';
import type { ProductVariantResponseReadModel } from '@ecomerece/shared';
import { useState } from 'react';
import { CursorPager } from '../../../components/cursor-pager';
import { DashboardNav } from '../../../components/dashboard-nav';
import { PageShell } from '../../../components/page-shell';
import { QueryState } from '../../../components/query-state';
import { useCursorPagination } from '../../../components/use-cursor-pagination';
import { VariantActionDialog } from './components/variant-action-dialog';
import { VariantCreateDialog } from './components/variant-create-dialog';
import { VariantFilters } from './components/variant-filters';
import { VariantTable } from './components/variant-table';

export default function DashboardVariantsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [productInput, setProductInput] = useState('');
  const [productId, setProductId] = useState('');
  const [active, setActive] = useState<'' | 'true' | 'false'>('');
  const [deleted, setDeleted] = useState<'' | 'true' | 'false'>('');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariantResponseReadModel | null>(null);
  const pager = useCursorPagination(20);
  const variantsQuery = useGetAdminPaginatedVariants({
    search: search || undefined,
    productId: productId || undefined,
    active: active === '' ? undefined : active === 'true',
    deleted: deleted === '' ? undefined : deleted === 'true',
    cursor: pager.cursor,
    limit: pager.limit,
    direction: 'next',
  });
  const variants = variantsQuery.data?.data ?? [];
  const meta = variantsQuery.data?.meta;

  return (
    <PageShell
      requiresAuth
      eyebrow="Admin"
      title="Product variants"
      description="Variant pricing and state across the catalog."
      actions={
        <>
          <Chip label={`${variants.length} on this page`} color="primary" variant="outlined" />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            New variant
          </Button>
        </>
      }
    >
      <DashboardNav />

      <VariantFilters
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        productInput={productInput}
        onProductInputChange={setProductInput}
        active={active}
        onActiveChange={(value) => {
          setActive(value);
          pager.reset();
        }}
        deleted={deleted}
        onDeletedChange={(value) => {
          setDeleted(value);
          pager.reset();
        }}
        onSubmit={() => {
          setSearch(searchInput.trim());
          setProductId(productInput.trim());
          pager.reset();
        }}
        onReset={() => {
          setSearchInput('');
          setSearch('');
          setProductInput('');
          setProductId('');
          setActive('');
          setDeleted('');
          pager.reset();
        }}
      />

      <Paper
        elevation={0}
        sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}
      >
        <QueryState
          isLoading={variantsQuery.isPending}
          error={variantsQuery.error}
          isEmpty={variants.length === 0}
          emptyMessage="No variants match these filters."
          onRetry={() => void variantsQuery.refetch()}
          skeleton={<Skeleton variant="rounded" height={420} />}
        >
          <VariantTable variants={variants} onManage={setSelectedVariant} />
        </QueryState>
      </Paper>

      <CursorPager
        hasNext={Boolean(meta?.hasMore)}
        hasPrevious={pager.hasPrevious}
        isFetching={variantsQuery.isFetching}
        onNext={() => pager.next(meta?.nextCursor)}
        onPrevious={pager.previous}
        onReset={pager.reset}
      />

      <VariantCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => void variantsQuery.refetch()}
      />
      <VariantActionDialog
        variant={selectedVariant}
        onClose={() => setSelectedVariant(null)}
        onSuccess={() => void variantsQuery.refetch()}
      />
    </PageShell>
  );
}
