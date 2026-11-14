import { z } from 'zod';

// Admin: all addresses — optionally filter by ownerId / deleted state
export const getAdminPaginatedAddressesQuerySchema = z.object({
  ownerId: z.string({ message: 'Owner id must be a string' }).optional(),
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

export type GetAdminPaginatedAddressesQueryDto = z.infer<
  typeof getAdminPaginatedAddressesQuerySchema
>;
