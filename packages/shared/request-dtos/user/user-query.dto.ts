import { z } from 'zod';

// Public: list users (non-deleted) — available to authenticated users
export const getPaginatedUsersQuerySchema = z.object({
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

export type GetPaginatedUsersQueryDto = z.infer<typeof getPaginatedUsersQuerySchema>;

// Admin: all users — optionally filter by deleted / blocked / banned / role
export const getAdminPaginatedUsersQuerySchema = z.object({
  search: z.string().trim().optional(),
  role: z.enum(['customer', 'vendor', 'admin']).optional(),
  deleted: z.coerce.boolean().optional(),
  blocked: z.coerce.boolean().optional(),
  banned: z.coerce.boolean().optional(),
  cursor: z.string().optional(),
  limit: z.coerce
    .number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must not exceed 100')
    .optional()
    .default(20),
  direction: z.enum(['next', 'prev']).optional().default('next'),
});

export type GetAdminPaginatedUsersQueryDto = z.infer<typeof getAdminPaginatedUsersQuerySchema>;
