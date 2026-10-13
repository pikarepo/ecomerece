import { z } from 'zod';
import { optionalIdSchema } from '../../dtos';

export const getPaginatedDto = z.object({
  cursor: optionalIdSchema,
  limit: z.coerce
    .number()
    .min(10, 'Limit must be at least 10')
    .max(50, 'Limit must not exceed 50')
    .optional(),
  direction: z.enum(['next', 'prev']).optional(),
  search: z.string().trim().optional(),
});

export type getPaginatedDtoType = z.infer<typeof getPaginatedDto>;

// Admin: all categories — optionally filter by deleted / blocked state
export const getAdminPaginatedCategoriesSchema = z.object({
  cursor: optionalIdSchema,
  limit: z.coerce
    .number()
    .min(10, 'Limit must be at least 10')
    .max(50, 'Limit must not exceed 50')
    .optional(),
  direction: z.enum(['next', 'prev']).optional(),
  search: z.string().trim().optional(),
  deleted: z.coerce.boolean().optional(),
  blocked: z.coerce.boolean().optional(),
});

export type GetAdminPaginatedCategoriesDto = z.infer<typeof getAdminPaginatedCategoriesSchema>;
