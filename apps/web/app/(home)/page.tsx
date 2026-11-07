'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { useGetHomeLayout } from '@ecomerece/frontend/home';
import { useMemo } from 'react';
import { SiteHeader } from '../../components/site-header';
import { CategoryGrid } from './components/category-grid';
import { FeatureStrip } from './components/feature-strip';
import { Hero } from './components/hero';
import { HomeFooter } from './components/home-footer';
import { ProductShelf } from './components/product-shelf';
import { PromoGrid } from './components/promo-grid';
import { SectionHeading } from './components/section-heading';

export default function HomePage() {
  const { data: layout, error, isFetching, refetch } = useGetHomeLayout();

  const slides = useMemo(
    () => [...(layout?.slides ?? [])].sort((a, b) => a.displayOrder - b.displayOrder),
    [layout?.slides],
  );
  const containers = useMemo(
    () => [...(layout?.productContainers ?? [])].sort((a, b) => a.displayOrder - b.displayOrder),
    [layout?.productContainers],
  );

  const errorMessage =
    error instanceof Error ? error.message : error ? 'Unable to load the home layout.' : null;

  if (!layout) {
    return (
      <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
        <SiteHeader />
        {errorMessage ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => void refetch()}>
                Retry
              </Button>
            }
          >
            {errorMessage}
          </Alert>
        ) : null}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Stack spacing={3}>
            <Skeleton variant="rounded" height={380} />
            <Skeleton variant="text" width="40%" height={52} />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2.5,
              }}
            >
              <Skeleton variant="rounded" height={210} />
              <Skeleton variant="rounded" height={210} />
            </Box>
          </Stack>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <SiteHeader />

      {errorMessage ? (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              Retry
            </Button>
          }
        >
          Showing the last loaded layout. {errorMessage}
        </Alert>
      ) : null}

      <Hero slides={slides} />
      <CategoryGrid categories={layout.categories} />
      <FeatureStrip features={layout.features} />
      <PromoGrid promos={layout.promos} />

      {containers.length > 0 ? (
        <Box sx={{ pt: { xs: 2, md: 4 } }}>
          <Container maxWidth="lg" sx={{ pb: 4 }}>
            <SectionHeading
              eyebrow="Shelves"
              title="Product collections"
              subtitle="Live products fetched with each shelf query from the home aggregate."
            />
          </Container>
          {containers.map((container) => (
            <ProductShelf key={container.id} container={container} />
          ))}
        </Box>
      ) : null}

      <HomeFooter version={layout.version} isFetching={isFetching} />
    </Box>
  );
}
