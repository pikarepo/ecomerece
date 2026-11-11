import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReviewResponseReadModel } from '@ecomerece/shared';
import Link from 'next/link';
import { formatDate } from '../../../components/format';

export function ReviewCard({ review }: { review: ReviewResponseReadModel }) {
  return (
    <Paper
      elevation={0}
      sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', height: '100%' }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <Avatar src={review.authorAvatar} alt={review.authorName}>
          {review.authorName.slice(0, 1)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
          >
            <Box>
              <Typography sx={{ fontWeight: 700 }}>{review.authorName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(review.createdAt)}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Rating value={review.rating} readOnly size="small" />
              {review.isVerifiedPurchase ? (
                <Chip size="small" label="Verified" color="success" variant="outlined" />
              ) : null}
            </Stack>
          </Stack>

          <Typography sx={{ fontWeight: 700, mt: 1.5 }}>{review.title}</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {review.comment}
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ mt: 2, justifyContent: 'space-between', alignItems: { sm: 'center' } }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <ThumbUpIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {review.likes}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {review.dislikes} dislikes
              </Typography>
            </Stack>
            <Button component={Link} href={`/products/${review.productId}`} size="small">
              View product
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}
