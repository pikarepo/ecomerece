import { z } from 'zod';
import { optionalIdSchema } from '../../dtos';

export const getPaginatedVendorsQuerySchema = z.object({
  cursor: optionalIdSchema,
  limit: z.coerce
    .number({ message: 'Limit must be a number' })
    .min(10, 'Limit must be at least 10')
    .max(50, 'Limit must not exceed 50')
    .optional(),
  direction: z
    .enum(['next', 'prev'], { message: 'Direction must be either next or prev' })
    .optional(),
  search: z.string({ message: 'Search must be a string' }).trim().optional(),
});

export type GetPaginatedVendorsQueryDto = z.infer<typeof getPaginatedVendorsQuerySchema>;

// Admin: all vendors — optionally filter by deleted / verified state
export const getAdminPaginatedVendorsQuerySchema = z.object({
  cursor: optionalIdSchema,
  limit: z.coerce
    .number({ message: 'Limit must be a number' })
    .min(10, 'Limit must be at least 10')
    .max(50, 'Limit must not exceed 50')
    .optional(),
  direction: z
    .enum(['next', 'prev'], { message: 'Direction must be either next or prev' })
    .optional(),
  search: z.string({ message: 'Search must be a string' }).trim().optional(),
  deleted: z.coerce.boolean({ message: 'deleted must be a boolean' }).optional(),
  verified: z.coerce.boolean({ message: 'verified must be a boolean' }).optional(),
  pending: z.coerce.boolean({ message: 'pending must be a boolean' }).optional(),
});

export type GetAdminPaginatedVendorsQueryDto = z.infer<typeof getAdminPaginatedVendorsQuerySchema>;
