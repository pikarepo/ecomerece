'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { useGetProductById } from '@ecomerece/frontend/product';
import { useGetVariantsByProductId } from '@ecomerece/frontend/product-variant';
import { useGetReviewsByProductId } from '@ecomerece/frontend/review';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import { PageShell } from '../../../components/page-shell';
import { QueryState } from '../../../components/query-state';
import { ProductGallery } from './components/product-gallery';
import { ProductSummary } from './components/product-summary';
import { ReviewForm } from './components/review-form';
import { ReviewList } from './components/review-list';
import { SectionPanel } from './components/section-panel';
import { VariantList } from './components/variant-list';

function ProductDetailLoading() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 4,
        minHeight: '100dvh',
        bgcolor: 'background.default',
        p: { xs: 3, md: 8 },
      }}
    >
      <Skeleton variant="rounded" height={420} />
      <Box>
        <Skeleton variant="text" height={56} />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="rounded" height={140} sx={{ mt: 2 }} />
      </Box>
    </Box>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<ProductDetailLoading />}>
      <ProductDetailContent />
    </Suspense>
  );
}

function ProductDetailContent() {
  const params = useParams<{ id: string }>();
  const productId = params?.id ?? '';
  const productQuery = useGetProductById(productId);
  const variantsQuery = useGetVariantsByProductId(productId);
  const reviewsQuery = useGetReviewsByProductId(productId);
  const product = productQuery.data;

  return (
    <PageShell
      eyebrow="Product"
      title={product?.title ?? 'Product details'}
      description={product?.vendorTitle}
      actions={
        <Button component={Link} href="/products" startIcon={<ArrowBackIcon />} variant="outlined">
          Back to catalog
        </Button>
      }
    >
      <QueryState
        isLoading={!product && productQuery.isPending}
        error={productQuery.error}
        onRetry={() => void productQuery.refetch()}
        skeleton={
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 4,
            }}
          >
            <Skeleton variant="rounded" height={420} />
            <Box>
              <Skeleton variant="text" height={56} />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="rounded" height={140} sx={{ mt: 2 }} />
            </Box>
          </Box>
        }
      >
        {product ? (
          <Stack spacing={3}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '0.9fr 1.1fr' },
                gap: { xs: 3, md: 5 },
                alignItems: 'start',
              }}
            >
              <ProductGallery product={product} />
              <ProductSummary product={product} />
            </Box>

            <SectionPanel
              title="Variants"
              subtitle="Pricing and live inventory from the product variant and inventory modules."
            >
              <QueryState
                isLoading={variantsQuery.isPending}
                error={variantsQuery.error}
                isEmpty={Boolean(variantsQuery.data && variantsQuery.data.length === 0)}
                emptyMessage="No variants have been published yet."
                onRetry={() => void variantsQuery.refetch()}
              >
                <VariantList variants={variantsQuery.data ?? []} />
              </QueryState>
            </SectionPanel>

            <SectionPanel
              title="Reviews"
              subtitle="Customer feedback fetched with the review module hook."
            >
              <QueryState
                isLoading={reviewsQuery.isPending}
                error={reviewsQuery.error}
                isEmpty={Boolean(reviewsQuery.data && reviewsQuery.data.length === 0)}
                emptyMessage="No reviews for this product yet."
                onRetry={() => void reviewsQuery.refetch()}
              >
                <ReviewList reviews={reviewsQuery.data ?? []} />
              </QueryState>
              <Box sx={{ mt: 2 }}>
                <ReviewForm
                  productId={productId}
                  onCreated={() => void reviewsQuery.refetch()}
                />
              </Box>
            </SectionPanel>
          </Stack>
        ) : null}
      </QueryState>
    </PageShell>
  );
}
