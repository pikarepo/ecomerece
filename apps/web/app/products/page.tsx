'use client';

import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useGetPaginatedCategories } from '@ecomerece/frontend/category';
import { useGetPaginatedProducts } from '@ecomerece/frontend/product';
import type { ProductPublicSort } from '@ecomerece/shared';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { CursorPager } from '../../components/cursor-pager';
import { PageShell } from '../../components/page-shell';
import { QueryState } from '../../components/query-state';
import { useCursorPagination } from '../../components/use-cursor-pagination';
import { ProductCard } from './components/product-card';
import { ProductFilters } from './components/product-filters';

function ProductsLoading() {
  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', pt: 8 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2.5,
          maxWidth: 1200,
          mx: 'auto',
          px: 3,
        }}
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} variant="rounded" height={340} />
        ))}
      </Box>
    </Box>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsRoute />
    </Suspense>
  );
}

function ProductsRoute() {
  const searchParams = useSearchParams();

  return (
    <ProductsContent
      key={searchParams.toString()}
      initialSearch={searchParams.get('search') ?? ''}
      initialCategoryId={searchParams.get('categoryId') ?? ''}
      initialVendorId={searchParams.get('vendorId') ?? ''}
    />
  );
}

function ProductsContent({
  initialSearch,
  initialCategoryId,
  initialVendorId,
}: {
  initialSearch: string;
  initialCategoryId: string;
  initialVendorId: string;
}) {
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [sort, setSort] = useState<ProductPublicSort>('newest');
  const pager = useCursorPagination(12);

  const categoriesQuery = useGetPaginatedCategories({ limit: 50 });
  const productsQuery = useGetPaginatedProducts({
    search: search || undefined,
    categoryId: categoryId || undefined,
    vendorId: initialVendorId || undefined,
    sort,
    cursor: pager.cursor,
    limit: pager.limit,
  });

  const products = productsQuery.data?.data ?? [];
  const categories = categoriesQuery.data?.data ?? [];
  const meta = productsQuery.data?.meta;
  const filtersActive = Boolean(search || categoryId || initialVendorId || sort !== 'newest');

  const resetFilters = () => {
    setSearchInput('');
    setSearch('');
    setCategoryId('');
    setSort('newest');
    pager.reset();
  };

  return (
    <PageShell
      eyebrow="Catalog"
      title="Products"
      description="Live catalog powered by the shared product and category query hooks."
      actions={
        <>
          <Chip label={`${products.length} on this page`} color="primary" variant="outlined" />
          {initialVendorId ? <Chip label={`Vendor ${initialVendorId}`} variant="outlined" /> : null}
        </>
      }
    >
      <ProductFilters
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onSearchSubmit={() => {
          setSearch(searchInput.trim());
          pager.reset();
        }}
        categoryId={categoryId}
        categories={categories}
        onCategoryChange={(value) => {
          setCategoryId(value);
          pager.reset();
        }}
        sort={sort}
        onSortChange={(value) => {
          setSort(value);
          pager.reset();
        }}
        onReset={resetFilters}
      />

      <QueryState
        isLoading={productsQuery.isPending}
        error={productsQuery.error}
        isEmpty={products.length === 0}
        emptyMessage={filtersActive ? 'No products match these filters.' : 'No products yet.'}
        onRetry={() => void productsQuery.refetch()}
        skeleton={
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 2.5,
            }}
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" height={340} />
            ))}
          </Box>
        }
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 2.5,
          }}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Box>
        {meta?.hasMore && products.length > 0 ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            More products are available with cursor pagination.
          </Typography>
        ) : null}
      </QueryState>

      <CursorPager
        hasNext={Boolean(meta?.hasMore)}
        hasPrevious={pager.hasPrevious}
        isFetching={productsQuery.isFetching}
        onNext={() => pager.next(meta?.nextCursor)}
        onPrevious={pager.previous}
        onReset={pager.reset}
      />
    </PageShell>
  );
}
