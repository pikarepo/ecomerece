import { z } from 'zod';
import { returnStatusValues } from './create-return.dto';

const paginationShape = {
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
};

const statusShape = {
  status: z
    .enum(returnStatusValues, { message: 'Status must be a valid return status' })
    .optional(),
};

export const getMyReturnsQuerySchema = z.object({
  orderId: z.string({ message: 'Order id must be a string' }).optional(),
  ...statusShape,
  ...paginationShape,
});

export type GetMyReturnsQueryDto = z.infer<typeof getMyReturnsQuerySchema>;

export const getVendorReturnsQuerySchema = z.object({
  orderId: z.string({ message: 'Order id must be a string' }).optional(),
  ...statusShape,
  ...paginationShape,
});

export type GetVendorReturnsQueryDto = z.infer<typeof getVendorReturnsQuerySchema>;

export const getAdminReturnsQuerySchema = z.object({
  orderId: z.string({ message: 'Order id must be a string' }).optional(),
  orderItemId: z.string({ message: 'Order item id must be a string' }).optional(),
  vendorId: z.string({ message: 'Vendor id must be a string' }).optional(),
  buyerId: z.string({ message: 'Buyer id must be a string' }).optional(),
  deleted: z.coerce.boolean({ message: 'deleted must be a boolean' }).optional(),
  ...statusShape,
  ...paginationShape,
});

export type GetAdminReturnsQueryDto = z.infer<typeof getAdminReturnsQuerySchema>;
