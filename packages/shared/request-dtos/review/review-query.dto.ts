import { z } from 'zod';

// Public: list reviews (non-deleted, non-blocked) — optionally filter by product / rating
export const getPaginatedReviewsQuerySchema = z.object({
  productId: z.string().optional(),
  rating: z.coerce
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must not exceed 5')
    .optional(),
  cursor: z.string().optional(),
  limit: z.coerce
    .number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must not exceed 100')
    .optional()
    .default(20),
  direction: z.enum(['next', 'prev']).optional().default('next'),
});

export type GetPaginatedReviewsQueryDto = z.infer<typeof getPaginatedReviewsQuerySchema>;

// Admin: all reviews — optionally filter by productId / authorId / rating / deleted state
export const getAdminPaginatedReviewsQuerySchema = z.object({
  productId: z.string().optional(),
  authorId: z.string().optional(),
  rating: z.coerce
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must not exceed 5')
    .optional(),
  deleted: z.coerce.boolean().optional(),
  cursor: z.string().optional(),
  limit: z.coerce
    .number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must not exceed 100')
    .optional()
    .default(20),
  direction: z.enum(['next', 'prev']).optional().default('next'),
});

export type GetAdminPaginatedReviewsQueryDto = z.infer<typeof getAdminPaginatedReviewsQuerySchema>;
