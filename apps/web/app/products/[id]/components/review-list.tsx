import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReviewResponseReadModel } from '@ecomerece/shared';
import { formatDate } from '../../../../components/format';

export function ReviewList({ reviews }: { reviews: ReviewResponseReadModel[] }) {
  if (reviews.length === 0) {
    return <Alert severity="info">No reviews for this product yet.</Alert>;
  }

  return (
    <Stack spacing={2}>
      {reviews.map((review) => (
        <Box
          key={review._id}
          sx={{
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <Avatar src={review.authorAvatar} alt={review.authorName}>
              {review.authorName.slice(0, 1)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
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
                    <Chip
                      size="small"
                      label="Verified purchase"
                      color="success"
                      variant="outlined"
                    />
                  ) : null}
                </Stack>
              </Stack>

              <Typography sx={{ fontWeight: 700, mt: 1 }}>{review.title}</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                {review.comment}
              </Typography>

              <Stack direction="row" spacing={2} sx={{ mt: 1.5, alignItems: 'center' }}>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <ThumbUpIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {review.likes} likes
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {review.dislikes} dislikes
                </Typography>
              </Stack>

              {review.vendorReply ? (
                <Box
                  sx={{
                    mt: 1.5,
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: 'action.hover',
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    Vendor reply
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {review.vendorReply}
                  </Typography>
                </Box>
              ) : null}
            </Box>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
