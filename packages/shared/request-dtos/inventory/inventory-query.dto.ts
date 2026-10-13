import { z } from 'zod';

// Admin: all inventory — optionally filter by variantId / inStock / deleted state
export const getAdminPaginatedInventoryQuerySchema = z.object({
  variantId: z.string().optional(),
  inStock: z.coerce.boolean().optional(),
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

export type GetAdminPaginatedInventoryQueryDto = z.infer<
  typeof getAdminPaginatedInventoryQuerySchema
>;
