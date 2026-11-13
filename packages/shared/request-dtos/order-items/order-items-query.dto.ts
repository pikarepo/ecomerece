import { z } from 'zod';

const statusSchema = z.enum([
  'pending',
  'confirmed',
  'completed',
  'returned',
  'refunded',
  'cancelled',
  // Rejected cart lines, stored with a failure reason.
  'failed',
]);

// Admin: all order items — optionally filter by order / status / deleted state
export const getAdminPaginatedOrderItemsQuerySchema = z.object({
  orderId: z.string().optional(),
  status: statusSchema.optional(),
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

export type GetAdminPaginatedOrderItemsQueryDto = z.infer<
  typeof getAdminPaginatedOrderItemsQuerySchema
>;
