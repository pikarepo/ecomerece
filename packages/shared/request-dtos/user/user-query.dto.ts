import { z } from 'zod';

// Public: list users (non-deleted) — available to authenticated users
export const getPaginatedUsersQuerySchema = z.object({
  search: z.string({ message: 'Search must be a string' }).trim().optional(),
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

export type GetPaginatedUsersQueryDto = z.infer<typeof getPaginatedUsersQuerySchema>;

// Admin: all users — optionally filter by deleted / blocked / banned / role
export const getAdminPaginatedUsersQuerySchema = z.object({
  search: z.string({ message: 'Search must be a string' }).trim().optional(),
  role: z
    .enum(['customer', 'vendor', 'admin'], {
      message: 'Role must be customer, vendor, or admin',
    })
    .optional(),
  deleted: z.coerce.boolean({ message: 'deleted must be a boolean' }).optional(),
  blocked: z.coerce.boolean({ message: 'blocked must be a boolean' }).optional(),
  banned: z.coerce.boolean({ message: 'banned must be a boolean' }).optional(),
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

export type GetAdminPaginatedUsersQueryDto = z.infer<typeof getAdminPaginatedUsersQuerySchema>;
