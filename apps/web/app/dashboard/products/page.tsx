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
import { useGetAdminPaginatedProducts } from '@ecomerece/frontend/product';
import type { ProductAdminResponseReadModel, ProductAdminSort } from '@ecomerece/shared';
import { useState } from 'react';
import { CursorPager } from '../../../components/cursor-pager';
import { DashboardNav } from '../../../components/dashboard-nav';
import { PageShell } from '../../../components/page-shell';
import { QueryState } from '../../../components/query-state';
import { useCursorPagination } from '../../../components/use-cursor-pagination';
import { ProductBlockDialog } from './components/product-block-dialog';

type BooleanFilter = '' | 'true' | 'false';
const SORTS: ProductAdminSort[] = [
  'newest',
  'oldest',
  'most_sold',
  'most_views',
  'most_purchases',
  'most_revenue',
];

export default function DashboardProductsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [appearance, setAppearance] = useState<'' | 'public' | 'private'>('');
  const [deleted, setDeleted] = useState<BooleanFilter>('');
  const [blocked, setBlocked] = useState<BooleanFilter>('');
  const [sort, setSort] = useState<ProductAdminSort>('newest');
  const [selectedProduct, setSelectedProduct] =
    useState<ProductAdminResponseReadModel | null>(null);
  const pager = useCursorPagination(20);

  const productsQuery = useGetAdminPaginatedProducts({
    search: search || undefined,
    categoryId: categoryId || undefined,
    vendorId: vendorId || undefined,
    appearance: appearance || undefined,
    deleted: deleted === '' ? undefined : deleted === 'true',
    blocked: blocked === '' ? undefined : blocked === 'true',
    sort,
    cursor: pager.cursor,
    limit: pager.limit,
    direction: 'next',
  });
  const products = productsQuery.data?.data ?? [];
  const meta = productsQuery.data?.meta;

  return (
    <PageShell
      requiresAuth
      eyebrow="Admin"
      title="Products"
      description="Browse every product and block or unblock listings."
      actions={
        <Chip label={`${products.length} on this page`} color="primary" variant="outlined" />
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
          label="Search products"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          sx={{ flex: '1 1 200px' }}
          slotProps={{
            input: {
              startAdornment: (
                <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              ),
            },
          }}
        />
        <TextField
          size="small"
          label="Category ID"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          sx={{ flex: '1 1 180px' }}
        />
        <TextField
          size="small"
          label="Vendor ID"
          value={vendorId}
          onChange={(event) => setVendorId(event.target.value)}
          sx={{ flex: '1 1 180px' }}
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
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="public">Public</MenuItem>
          <MenuItem value="private">Private</MenuItem>
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
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="false">Active only</MenuItem>
          <MenuItem value="true">Deleted only</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Blocked"
          value={blocked}
          onChange={(event) => {
            setBlocked(event.target.value as BooleanFilter);
            pager.reset();
          }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="false">Not blocked</MenuItem>
          <MenuItem value="true">Blocked only</MenuItem>
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
          sx={{ minWidth: 160 }}
        >
          {SORTS.map((item) => (
            <MenuItem key={item} value={item}>
              {item.replaceAll('_', ' ')}
            </MenuItem>
          ))}
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
            setCategoryId('');
            setVendorId('');
            setAppearance('');
            setDeleted('');
            setBlocked('');
            setSort('newest');
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
          isLoading={productsQuery.isPending}
          error={productsQuery.error}
          isEmpty={products.length === 0}
          emptyMessage="No products match these filters."
          onRetry={() => void productsQuery.refetch()}
          skeleton={<Skeleton variant="rounded" height={420} />}
        >
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Visibility</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Box
                          component="img"
                          src={product.image.images[0]?.url}
                          alt={product.title}
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 1,
                            objectFit: 'cover',
                            bgcolor: 'grey.100',
                          }}
                        />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {product.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {product.categoryId}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{product.vendorTitle}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={product.appearance}
                        color={product.appearance === 'public' ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                        {product.isDeleted ? (
                          <Chip size="small" label="Deleted" color="error" />
                        ) : null}
                        {product.isBlocked ? (
                          <Chip size="small" label="Blocked" color="warning" />
                        ) : null}
                        {!product.isDeleted && !product.isBlocked ? (
                          <Chip size="small" label="Active" color="success" />
                        ) : null}
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => setSelectedProduct(product)}>
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
        isFetching={productsQuery.isFetching}
        onNext={() => pager.next(meta?.nextCursor)}
        onPrevious={pager.previous}
        onReset={pager.reset}
      />

      <ProductBlockDialog
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSuccess={() => void productsQuery.refetch()}
      />
    </PageShell>
  );
}
