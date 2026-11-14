import { z } from 'zod';

// Public: list reviews (non-deleted, non-blocked) — optionally filter by product / rating
export const getPaginatedReviewsQuerySchema = z.object({
  productId: z.string({ message: 'Product id must be a string' }).optional(),
  rating: z.coerce
    .number({ message: 'Rating must be a number' })
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must not exceed 5')
    .optional(),
  cursor: z.string({ message: 'Cursor must be a string' }).optional(),
  limit: z.coerce
    .number({ message: 'Limit must be a number' })
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must not exceed 100')
    .optional()
    .default(20),
  direction: z
    .enum(['next', 'prev'], { message: 'Direction must be either next or prev' })
    .optional()
    .default('next'),
});

export type GetPaginatedReviewsQueryDto = z.infer<typeof getPaginatedReviewsQuerySchema>;

// Admin: all reviews — optionally filter by productId / authorId / rating / deleted state
export const getAdminPaginatedReviewsQuerySchema = z.object({
  productId: z.string({ message: 'Product id must be a string' }).optional(),
  authorId: z.string({ message: 'Author id must be a string' }).optional(),
  rating: z.coerce
    .number({ message: 'Rating must be a number' })
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must not exceed 5')
    .optional(),
  deleted: z.coerce.boolean({ message: 'deleted must be a boolean' }).optional(),
  cursor: z.string({ message: 'Cursor must be a string' }).optional(),
  limit: z.coerce
    .number({ message: 'Limit must be a number' })
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must not exceed 100')
    .optional()
    .default(20),
  direction: z
    .enum(['next', 'prev'], { message: 'Direction must be either next or prev' })
    .optional()
    .default('next'),
});

export type GetAdminPaginatedReviewsQueryDto = z.infer<typeof getAdminPaginatedReviewsQuerySchema>;
