import { z } from 'zod';

// Admin: all inventory — optionally filter by variantId / inStock / deleted state
export const getAdminPaginatedInventoryQuerySchema = z.object({
  variantId: z.string({ message: 'Variant id must be a string' }).optional(),
  inStock: z.coerce.boolean({ message: 'inStock must be a boolean' }).optional(),
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

export type GetAdminPaginatedInventoryQueryDto = z.infer<
  typeof getAdminPaginatedInventoryQuerySchema
>;

// Vendor: inventory rows for the authenticated vendor's non-deleted variants
export const getVendorPaginatedInventoryQuerySchema = z.object({
  inStock: z.coerce.boolean({ message: 'inStock must be a boolean' }).optional(),
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

export type GetVendorPaginatedInventoryQueryDto = z.infer<
  typeof getVendorPaginatedInventoryQuerySchema
>;
