import { z } from 'zod';

// Admin: all product variants — optionally filter by productId / active / deleted state
export const getAdminPaginatedVariantsQuerySchema = z.object({
  productId: z.string().optional(),
  active: z.coerce.boolean().optional(),
  deleted: z.coerce.boolean().optional(),
  search: z.string().trim().optional(),
  cursor: z.string().optional(),
  limit: z.coerce
    .number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must not exceed 100')
    .optional()
    .default(20),
  direction: z.enum(['next', 'prev']).optional().default('next'),
});

export type GetAdminPaginatedVariantsQueryDto = z.infer<
  typeof getAdminPaginatedVariantsQuerySchema
>;
