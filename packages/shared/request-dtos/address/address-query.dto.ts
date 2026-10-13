import { z } from 'zod';

// Admin: all addresses — optionally filter by ownerId / deleted state
export const getAdminPaginatedAddressesQuerySchema = z.object({
  ownerId: z.string().optional(),
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

export type GetAdminPaginatedAddressesQueryDto = z.infer<
  typeof getAdminPaginatedAddressesQuerySchema
>;
