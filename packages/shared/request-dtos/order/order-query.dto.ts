import { z } from 'zod';

// Public: paginate the authenticated user's own orders
export const getMyOrdersQuerySchema = z.object({
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

export type GetMyOrdersQueryDto = z.infer<typeof getMyOrdersQuerySchema>;

// Admin: all orders — optionally filter by buyerId / deleted state
export const getAdminPaginatedOrdersQuerySchema = z.object({
  buyerId: z.string({ message: 'Buyer id must be a string' }).optional(),
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

export type GetAdminPaginatedOrdersQueryDto = z.infer<typeof getAdminPaginatedOrdersQuerySchema>;

// Vendor: orders that contain at least one of the authenticated vendor's items
export const getVendorPaginatedOrdersQuerySchema = z.object({
  status: z
    .enum(['pending', 'confirmed', 'completed', 'returned', 'refunded', 'cancelled'], {
      message: 'Status must be a valid order status',
    })
    .optional(),
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

export type GetVendorPaginatedOrdersQueryDto = z.infer<typeof getVendorPaginatedOrdersQuerySchema>;
