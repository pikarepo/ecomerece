'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useGetMyOrders } from '@ecomerece/frontend/order';
import { useCreateMyReview } from '@ecomerece/frontend/review';
import { createMyReviewDtoSchema } from '@ecomerece/shared';
import { useState } from 'react';
import { useAuth } from '../../../../components/auth-provider';

export function ReviewForm({
  productId,
  onCreated,
}: {
  productId: string;
  onCreated?: () => void;
}) {
  const { isAuthenticated, signIn } = useAuth();
  const ordersQuery = useGetMyOrders({ limit: 20, direction: 'next' });
  const createReview = useCreateMyReview();
  const [orderId, setOrderId] = useState('');
  const [rating, setRating] = useState<number | null>(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <Alert
        severity="info"
        action={
          <Button color="inherit" size="small" onClick={() => void signIn()}>
            Sign in
          </Button>
        }
      >
        Sign in to write a review.
      </Alert>
    );
  }

  const orders = ordersQuery.data?.data ?? [];

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    const parsed = createMyReviewDtoSchema.safeParse({
      productId,
      orderId,
      rating: rating ?? 0,
      title: title.trim(),
      comment: comment.trim(),
      images: images
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    });
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join(', '));
      return;
    }
    try {
      const result = await createReview.mutateAsync(parsed.data);
      setSuccess(result.message);
      setTitle('');
      setComment('');
      setImages('');
      onCreated?.();
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : 'Unable to add review.');
    }
  };

  return (
    <Paper
      elevation={0}
      component="form"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
      sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Write a review
      </Typography>
      <Stack spacing={1.5}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {success ? <Alert severity="success">{success}</Alert> : null}
        <Box
          sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}
        >
          {orders.length > 0 ? (
            <TextField
              select
              label="Order"
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
            >
              {orders.map((order) => (
                <MenuItem key={order.id} value={order.id}>
                  Order #{order.id.slice(0, 8)}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              label="Order ID"
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              helperText="No orders found. Paste an order ID."
            />
          )}
          <Box>
            <Typography variant="caption" color="text.secondary">
              Rating
            </Typography>
            <Rating
              value={rating}
              onChange={(_, value) => setRating(value)}
              precision={1}
              size="large"
            />
          </Box>
        </Box>
        <TextField
          label="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <TextField
          label="Comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          multiline
          minRows={3}
        />
        <TextField
          label="Image URLs (comma separated)"
          value={images}
          onChange={(event) => setImages(event.target.value)}
          helperText="Optional. Each value must be a valid URL."
        />
        <Box>
          <Button type="submit" variant="contained" disabled={createReview.isPending}>
            {createReview.isPending ? 'Submitting…' : 'Submit review'}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
