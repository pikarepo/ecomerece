'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import { useGetPaginatedVendors } from '@ecomerece/frontend/vendor';
import { useState } from 'react';
import { CursorPager } from '../../components/cursor-pager';
import { PageShell } from '../../components/page-shell';
import { QueryState } from '../../components/query-state';
import { useCursorPagination } from '../../components/use-cursor-pagination';
import { VendorCard } from './components/vendor-card';
import { VendorSearch } from './components/vendor-search';

export default function VendorsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const pager = useCursorPagination(12);
  const vendorsQuery = useGetPaginatedVendors({
    search: search || undefined,
    cursor: pager.cursor,
    limit: pager.limit,
  });
  const vendors = vendorsQuery.data?.data ?? [];
  const meta = vendorsQuery.data?.meta;

  return (
    <PageShell
      eyebrow="Marketplace"
      title="Vendors"
      description="Discover the stores selling through the marketplace."
      actions={<Chip label={`${vendors.length} on this page`} color="primary" variant="outlined" />}
    >
      <VendorSearch
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
        isLoading={vendorsQuery.isPending}
        error={vendorsQuery.error}
        isEmpty={vendors.length === 0}
        emptyMessage={search ? 'No vendors match this search.' : 'No vendors yet.'}
        onRetry={() => void vendorsQuery.refetch()}
        skeleton={
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 2.5,
            }}
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" height={260} />
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
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </Box>
      </QueryState>

      <CursorPager
        hasNext={Boolean(meta?.hasMore)}
        hasPrevious={pager.hasPrevious}
        isFetching={vendorsQuery.isFetching}
        onNext={() => pager.next(meta?.nextCursor)}
        onPrevious={pager.previous}
        onReset={pager.reset}
      />
    </PageShell>
  );
}
