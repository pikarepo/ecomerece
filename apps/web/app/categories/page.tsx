'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import { useGetPaginatedCategories } from '@ecomerece/frontend/category';
import { useState } from 'react';
import { CursorPager } from '../../components/cursor-pager';
import { PageShell } from '../../components/page-shell';
import { QueryState } from '../../components/query-state';
import { useCursorPagination } from '../../components/use-cursor-pagination';
import { CategoryCard } from './components/category-card';
import { CategorySearch } from './components/category-search';

export default function CategoriesPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const pager = useCursorPagination(18);
  const categoriesQuery = useGetPaginatedCategories({
    search: search || undefined,
    cursor: pager.cursor,
    limit: pager.limit,
  });
  const categories = categoriesQuery.data?.data ?? [];
  const meta = categoriesQuery.data?.meta;

  return (
    <PageShell
      eyebrow="Browse"
      title="Categories"
      description="Every category exposed by the category module, with cursor pagination."
      actions={
        <Chip label={`${categories.length} on this page`} color="primary" variant="outlined" />
      }
    >
      <CategorySearch
        value={searchInput}
        onChange={setSearchInput}
        onSubmit={() => {
          setSearch(searchInput.trim());
          pager.reset();
        }}
        onReset={() => {
          setSearchInput('');
          setSearch('');
          pager.reset();
        }}
      />

      <QueryState
        isLoading={categoriesQuery.isPending}
        error={categoriesQuery.error}
        isEmpty={categories.length === 0}
        emptyMessage={search ? 'No categories match this search.' : 'No categories yet.'}
        onRetry={() => void categoriesQuery.refetch()}
        skeleton={
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 2.5,
            }}
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" height={240} />
            ))}
          </Box>
        }
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2.5,
          }}
        >
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </Box>
      </QueryState>

      <CursorPager
        hasNext={Boolean(meta?.hasMore)}
        hasPrevious={pager.hasPrevious}
        isFetching={categoriesQuery.isFetching}
        onNext={() => pager.next(meta?.nextCursor)}
        onPrevious={pager.previous}
        onReset={pager.reset}
      />
    </PageShell>
  );
}
