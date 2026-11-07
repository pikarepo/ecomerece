'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { HomeContainerResponse, ProductPublicSort } from '@ecomerece/shared';
import { useGetPaginatedProducts } from '@ecomerece/frontend/product';
import { useMemo } from 'react';
import { ProductCard } from './product-card';

function readString(filter: Record<string, unknown>, key: string): string | undefined {
  const value = filter[key];
  return typeof value === 'string' ? value : undefined;
}

function readSort(sort: Record<string, 1 | -1> | null | undefined): ProductPublicSort {
  if (!sort) return 'newest';

  for (const [key, direction] of Object.entries(sort)) {
    if (key === 'createdAt') return direction === 1 ? 'oldest' : 'newest';
    if (key.toLowerCase().includes('view')) return 'most_views';
    if (key.toLowerCase().includes('purchase')) return 'most_purchases';
    if (key.toLowerCase().includes('sold')) return 'most_sold';
  }

  return 'newest';
}

function toProductQuery(query: HomeContainerResponse['query']) {
  const filter = query.filter ?? {};

  return {
    categoryId: readString(filter, 'categoryId'),
    vendorId: readString(filter, 'vendorId'),
    appearance: filter.appearance === 'private' ? ('private' as const) : ('public' as const),
    search: readString(filter, 'search'),
    cursor: query.cursor ?? undefined,
    limit: query.limit ?? 20,
    direction: query.direction ?? ('next' as const),
    sort: readSort(query.sort),
  };
}

export function ProductShelf({ container }: { container: HomeContainerResponse }) {
  const params = useMemo(() => toProductQuery(container.query), [container.query]);
  const { data, error, isPending } = useGetPaginatedProducts(params);
  const products = data?.data ?? [];

  return (
    <Box component="section" sx={{ pb: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' }, mb: 3 }}
        >
          <Box>
            <Typography variant="h4" component="h3" sx={{ fontWeight: 800 }}>
              {container.heading}
            </Typography>
            <Typography color="text.secondary">{container.subTitle}</Typography>
          </Box>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <Chip size="small" color="primary" label={`${products.length} products`} />
            <Chip size="small" variant="outlined" label={`Limit ${params.limit}`} />
            <Chip size="small" variant="outlined" label={params.sort.replaceAll('_', ' ')} />
          </Stack>
        </Stack>

        {error ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error instanceof Error ? error.message : 'Unable to load the products for this shelf.'}
          </Alert>
        ) : null}

        {isPending ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 2.5,
            }}
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" height={340} />
            ))}
          </Box>
        ) : products.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 2.5,
            }}
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </Box>
        ) : (
          <Alert severity="info">No products match this shelf yet.</Alert>
        )}
      </Container>
    </Box>
  );
}
