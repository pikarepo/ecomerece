'use client';

import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useGetMyPaginatedProducts, useRecoverMyProduct } from '@ecomerece/frontend/product';
import type { ProductAdminResponseReadModel, ProductAdminSort } from '@ecomerece/shared';
import Link from 'next/link';
import { useState } from 'react';
import { CursorPager } from '../../../components/cursor-pager';
import { PageShell } from '../../../components/page-shell';
import { QueryState } from '../../../components/query-state';
import { useCursorPagination } from '../../../components/use-cursor-pagination';
import { MyProductTable } from './components/my-product-table';
import { ProductActionDialog } from './components/product-action-dialog';
import { ProductCreateDialog } from './components/product-create-dialog';

const SORTS: ProductAdminSort[] = [
  'newest',
  'oldest',
  'most_sold',
  'most_views',
  'most_purchases',
  'most_revenue',
];

export default function AccountProductsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [appearance, setAppearance] = useState<'' | 'public' | 'private'>('');
  const [sort, setSort] = useState<ProductAdminSort>('newest');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductAdminResponseReadModel | null>(null);
  const [recoverId, setRecoverId] = useState('');
  const [recoverMessage, setRecoverMessage] = useState<string | null>(null);
  const [recoverError, setRecoverError] = useState<string | null>(null);
  const pager = useCursorPagination(20);
  const recoverProduct = useRecoverMyProduct();

  const productsQuery = useGetMyPaginatedProducts({
    search: search || undefined,
    appearance: appearance || undefined,
    sort,
    cursor: pager.cursor,
    limit: pager.limit,
    direction: 'next',
  });
  const products = productsQuery.data?.data ?? [];
  const meta = productsQuery.data?.meta;

  const handleRecover = async () => {
    setRecoverMessage(null);
    setRecoverError(null);
    try {
      const result = await recoverProduct.mutateAsync({ productId: recoverId.trim() });
      setRecoverMessage(result.message);
      setRecoverId('');
      void productsQuery.refetch();
    } catch (mutationError) {
      setRecoverError(
        mutationError instanceof Error ? mutationError.message : 'Unable to recover product.',
      );
    }
  };

  return (
    <PageShell
      requiresAuth
      eyebrow="Vendor"
      title="My products"
      description="Create products and manage their content, images, ingredients, and disclaimers."
      actions={
        <>
          <Button component={Link} href="/account" startIcon={<ArrowBackIcon />} variant="outlined">
            Back to account
          </Button>
          <Chip label={`${products.length} on this page`} color="primary" variant="outlined" />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            New product
          </Button>
        </>
      }
    >
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
          mb: 2,
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
          label="Search my products"
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
          label="Visibility"
          value={appearance}
          onChange={(event) => {
            setAppearance(event.target.value as '' | 'public' | 'private');
            pager.reset();
          }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="public">Public</MenuItem>
          <MenuItem value="private">Private</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Sort"
          value={sort}
          onChange={(event) => {
            setSort(event.target.value as ProductAdminSort);
            pager.reset();
          }}
          sx={{ minWidth: 170 }}
        >
          {SORTS.map((item) => (
            <MenuItem key={item} value={item}>
              {item.replaceAll('_', ' ')}
            </MenuItem>
          ))}
        </TextField>
        <Button type="submit" variant="contained" startIcon={<SearchIcon />}>
          Search
        </Button>
        <Button
          type="button"
          color="inherit"
          onClick={() => {
            setSearchInput('');
            setSearch('');
            setAppearance('');
            setSort('newest');
            pager.reset();
          }}
        >
          Reset
        </Button>
      </Paper>

      <Paper
        elevation={0}
        sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField
            size="small"
            label="Recover a deleted product by ID"
            value={recoverId}
            onChange={(event) => setRecoverId(event.target.value)}
            sx={{ flex: 1 }}
          />
          <Button
            variant="outlined"
            onClick={() => void handleRecover()}
            disabled={!recoverId.trim() || recoverProduct.isPending}
          >
            Recover
          </Button>
        </Stack>
        {recoverMessage ? (
          <Alert severity="success" sx={{ mt: 1.5 }}>
            {recoverMessage}
          </Alert>
        ) : null}
        {recoverError ? (
          <Alert severity="error" sx={{ mt: 1.5 }}>
            {recoverError}
          </Alert>
        ) : null}
      </Paper>

      <Paper
        elevation={0}
        sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}
      >
        <QueryState
          isLoading={productsQuery.isPending}
          error={productsQuery.error}
          isEmpty={products.length === 0}
          emptyMessage="You have not created any products yet."
          onRetry={() => void productsQuery.refetch()}
          skeleton={<Skeleton variant="rounded" height={420} />}
        >
          <MyProductTable products={products} onManage={setSelectedProduct} />
        </QueryState>
      </Paper>

      <CursorPager
        hasNext={Boolean(meta?.hasMore)}
        hasPrevious={pager.hasPrevious}
        isFetching={productsQuery.isFetching}
        onNext={() => pager.next(meta?.nextCursor)}
        onPrevious={pager.previous}
        onReset={pager.reset}
      />

      <ProductCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => void productsQuery.refetch()}
      />
      <ProductActionDialog
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSuccess={() => void productsQuery.refetch()}
      />
    </PageShell>
  );
}
