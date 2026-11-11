'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import { useGetPaginatedReviews } from '@ecomerece/frontend/review';
import { useState } from 'react';
import { CursorPager } from '../../components/cursor-pager';
import { PageShell } from '../../components/page-shell';
import { QueryState } from '../../components/query-state';
import { useCursorPagination } from '../../components/use-cursor-pagination';
import { ReviewCard } from './components/review-card';
import { ReviewFilters } from './components/review-filters';

export default function ReviewsPage() {
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [productIdInput, setProductIdInput] = useState('');
  const [productId, setProductId] = useState('');
  const pager = useCursorPagination(10);
  const reviewsQuery = useGetPaginatedReviews({
    rating,
    productId: productId || undefined,
    cursor: pager.cursor,
    limit: pager.limit,
    direction: 'next',
  });
  const reviews = reviewsQuery.data?.data ?? [];
  const meta = reviewsQuery.data?.meta;

  return (
    <PageShell
      eyebrow="Community"
      title="Reviews"
      description="Browse the latest product reviews from the review module."
      actions={<Chip label={`${reviews.length} on this page`} color="primary" variant="outlined" />}
    >
      <ReviewFilters
        rating={rating}
        productId={productIdInput}
        onProductIdChange={(value) => {
          setProductIdInput(value);
          setProductId(value.trim());
          pager.reset();
        }}
        onRatingChange={(value) => {
          setRating(value);
          pager.reset();
        }}
        onReset={() => {
          setRating(undefined);
          setProductIdInput('');
          setProductId('');
          pager.reset();
        }}
      />

      <QueryState
        isLoading={reviewsQuery.isPending}
        error={reviewsQuery.error}
        isEmpty={reviews.length === 0}
        emptyMessage={rating ? `No ${rating}-star reviews yet.` : 'No reviews yet.'}
        onRetry={() => void reviewsQuery.refetch()}
        skeleton={
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" height={220} />
            ))}
          </Box>
        }
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 2,
          }}
        >
          {reviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </Box>
      </QueryState>

      <CursorPager
        hasNext={Boolean(meta?.hasMore)}
        hasPrevious={pager.hasPrevious}
        isFetching={reviewsQuery.isFetching}
        onNext={() => pager.next(meta?.nextCursor)}
        onPrevious={pager.previous}
        onReset={pager.reset}
      />
    </PageShell>
  );
}
