import { z } from 'zod';

// Public: paginate the authenticated user's own orders
export const getMyOrdersQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce
    .number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must not exceed 100')
    .optional()
    .default(20),
  direction: z.enum(['next', 'prev']).optional().default('next'),
});

export type GetMyOrdersQueryDto = z.infer<typeof getMyOrdersQuerySchema>;

// Admin: all orders — optionally filter by buyerId / deleted state
export const getAdminPaginatedOrdersQuerySchema = z.object({
  buyerId: z.string().optional(),
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

export type GetAdminPaginatedOrdersQueryDto = z.infer<typeof getAdminPaginatedOrdersQuerySchema>;
