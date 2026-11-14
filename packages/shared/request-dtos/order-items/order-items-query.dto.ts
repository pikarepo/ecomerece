import { z } from 'zod';

const statusSchema = z.enum(
  [
    'pending',
    'confirmed',
    'completed',
    'returned',
    'refunded',
    'cancelled',
    // Rejected cart lines, stored with a failure reason.
    'failed',
  ],
  { message: 'Status must be a valid order item status' },
);

// Admin: all order items — optionally filter by order / status / deleted state
export const getAdminPaginatedOrderItemsQuerySchema = z.object({
  orderId: z.string({ message: 'Order id must be a string' }).optional(),
  status: statusSchema.optional(),
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

export type GetAdminPaginatedOrderItemsQueryDto = z.infer<
  typeof getAdminPaginatedOrderItemsQuerySchema
>;

// Vendor: only the authenticated vendor's non-deleted items
export const getVendorPaginatedOrderItemsQuerySchema = z.object({
  orderId: z.string({ message: 'Order id must be a string' }).optional(),
  status: statusSchema.optional(),
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

export type GetVendorPaginatedOrderItemsQueryDto = z.infer<
  typeof getVendorPaginatedOrderItemsQuerySchema
>;
