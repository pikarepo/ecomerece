'use client';

import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
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
import { useGetAdminPaginatedReviews } from '@ecomerece/frontend/review';
import Link from 'next/link';
import { useState } from 'react';
import { CursorPager } from '../../../components/cursor-pager';
import { DashboardNav } from '../../../components/dashboard-nav';
import { formatDate } from '../../../components/format';
import { PageShell } from '../../../components/page-shell';
import { QueryState } from '../../../components/query-state';
import { useCursorPagination } from '../../../components/use-cursor-pagination';

type BooleanFilter = '' | 'true' | 'false';

export default function DashboardReviewsPage() {
  const [productInput, setProductInput] = useState('');
  const [productId, setProductId] = useState('');
  const [authorInput, setAuthorInput] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [rating, setRating] = useState<'' | '1' | '2' | '3' | '4' | '5'>('');
  const [deleted, setDeleted] = useState<BooleanFilter>('');
  const pager = useCursorPagination(20);

  const reviewsQuery = useGetAdminPaginatedReviews({
    productId: productId || undefined,
    authorId: authorId || undefined,
    rating: rating === '' ? undefined : Number(rating),
    deleted: deleted === '' ? undefined : deleted === 'true',
    cursor: pager.cursor,
    limit: pager.limit,
    direction: 'next',
  });
  const reviews = reviewsQuery.data?.data ?? [];
  const meta = reviewsQuery.data?.meta;

  return (
    <PageShell
      requiresAuth
      eyebrow="Admin"
      title="Reviews"
      description="Product, author, rating, and deletion filters across all reviews."
      actions={<Chip label={`${reviews.length} on this page`} color="primary" variant="outlined" />}
    >
      <DashboardNav />

      <Paper
        elevation={0}
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          setProductId(productInput.trim());
          setAuthorId(authorInput.trim());
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
          label="Product ID"
          value={productInput}
          onChange={(event) => setProductInput(event.target.value)}
          sx={{ flex: '1 1 220px' }}
        />
        <TextField
          size="small"
          label="Author ID"
          value={authorInput}
          onChange={(event) => setAuthorInput(event.target.value)}
          sx={{ flex: '1 1 220px' }}
        />
        <TextField
          select
          size="small"
          label="Rating"
          value={rating}
          onChange={(event) => {
            setRating(event.target.value as '' | '1' | '2' | '3' | '4' | '5');
            pager.reset();
          }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          {[5, 4, 3, 2, 1].map((value) => (
            <MenuItem key={value} value={String(value)}>
              {value} stars
            </MenuItem>
          ))}
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
        <Button type="submit" variant="contained" startIcon={<SearchIcon />}>
          Filter
        </Button>
        <Button
          type="button"
          color="inherit"
          onClick={() => {
            setProductInput('');
            setProductId('');
            setAuthorInput('');
            setAuthorId('');
            setRating('');
            setDeleted('');
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
          isLoading={reviewsQuery.isPending}
          error={reviewsQuery.error}
          isEmpty={reviews.length === 0}
          emptyMessage="No reviews match these filters."
          onRetry={() => void reviewsQuery.refetch()}
          skeleton={<Skeleton variant="rounded" height={420} />}
        >
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Review</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review._id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {review.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {review.comment.slice(0, 120)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{review.productId}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Box
                          component="img"
                          src={review.authorAvatar}
                          alt={review.authorName}
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            bgcolor: 'grey.100',
                          }}
                        />
                        <Typography variant="body2">{review.authorName}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Rating value={review.rating} readOnly size="small" />
                    </TableCell>
                    <TableCell>{formatDate(review.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Button component={Link} href={`/reviews/${review._id}`} size="small">
                        View
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
        isFetching={reviewsQuery.isFetching}
        onNext={() => pager.next(meta?.nextCursor)}
        onPrevious={pager.previous}
        onReset={pager.reset}
      />
    </PageShell>
  );
}
