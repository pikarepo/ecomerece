import { z } from 'zod';
import { optionalIdSchema } from '../../dtos';

export const getPaginatedDto = z.object({
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

export type getPaginatedDtoType = z.infer<typeof getPaginatedDto>;

// Admin: all categories — optionally filter by deleted / blocked state
export const getAdminPaginatedCategoriesSchema = z.object({
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
  blocked: z.coerce.boolean({ message: 'blocked must be a boolean' }).optional(),
});

export type GetAdminPaginatedCategoriesDto = z.infer<typeof getAdminPaginatedCategoriesSchema>;
