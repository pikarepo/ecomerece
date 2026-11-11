'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useGetReviewById } from '@ecomerece/frontend/review';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import { formatDate } from '../../../components/format';
import { PageShell } from '../../../components/page-shell';
import { QueryState } from '../../../components/query-state';

function ReviewDetailLoading() {
  return (
    <Box sx={{ p: { xs: 3, md: 6 } }}>
      <Skeleton variant="rounded" height={320} />
    </Box>
  );
}

export default function ReviewDetailPage() {
  return (
    <Suspense fallback={<ReviewDetailLoading />}>
      <ReviewDetailContent />
    </Suspense>
  );
}

function ReviewDetailContent() {
  const params = useParams<{ id: string }>();
  const reviewId = params?.id ?? '';
  const reviewQuery = useGetReviewById(reviewId);
  const review = reviewQuery.data;

  return (
    <PageShell
      eyebrow="Review"
      title={review?.title ?? 'Review details'}
      description={review?.authorName}
      actions={
        <>
          <Button component={Link} href="/reviews" startIcon={<ArrowBackIcon />} variant="outlined">
            All reviews
          </Button>
          {review ? (
            <Button component={Link} href={`/products/${review.productId}`} variant="contained">
              View product
            </Button>
          ) : null}
        </>
      }
    >
      <QueryState
        isLoading={reviewQuery.isPending}
        error={reviewQuery.error}
        onRetry={() => void reviewQuery.refetch()}
        skeleton={<Skeleton variant="rounded" height={360} />}
      >
        {review ? (
          <Paper
            elevation={0}
            sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box
                component="img"
                src={review.authorAvatar}
                alt={review.authorName}
                sx={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {review.authorName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(review.createdAt)}
                </Typography>
              </Box>
              <Rating value={review.rating} readOnly />
            </Stack>

            <Typography variant="h5" sx={{ fontWeight: 800, mt: 3 }}>
              {review.title}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {review.comment}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
              {review.isVerifiedPurchase ? (
                <Chip label="Verified purchase" color="success" variant="outlined" />
              ) : null}
              <Chip label={`${review.likes} likes`} variant="outlined" />
              <Chip label={`${review.dislikes} dislikes`} variant="outlined" />
            </Stack>

            {review.images.length > 0 ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                  gap: 1.5,
                  mt: 3,
                }}
              >
                {review.images.map((image) => (
                  <Box
                    key={image}
                    component="img"
                    src={image}
                    alt={review.title}
                    sx={{ width: '100%', borderRadius: 2, aspectRatio: '1', objectFit: 'cover' }}
                  />
                ))}
              </Box>
            ) : null}

            {review.vendorReply ? (
              <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Vendor reply
                </Typography>
                <Typography>{review.vendorReply}</Typography>
              </Box>
            ) : null}
          </Paper>
        ) : null}
      </QueryState>
    </PageShell>
  );
}
