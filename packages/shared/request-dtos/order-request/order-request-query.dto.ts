import { z } from 'zod';
import { idSchema } from '../../dtos';

const statusSchema = z.enum(['pending', 'accepted', 'rejected', 'cancelled']);
const typeSchema = z.enum(['return', 'refund']);

const paginationFields = {
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

export const getMyOrderRequestsQuerySchema = z.object({
  orderId: idSchema.optional(),
  status: statusSchema.optional(),
  type: typeSchema.optional(),
  ...paginationFields,
});

export type GetMyOrderRequestsQueryDto = z.infer<typeof getMyOrderRequestsQuerySchema>;

export const getVendorOrderRequestsQuerySchema = z.object({
  orderId: idSchema.optional(),
  status: statusSchema.optional(),
  type: typeSchema.optional(),
  ...paginationFields,
});

export type GetVendorOrderRequestsQueryDto = z.infer<typeof getVendorOrderRequestsQuerySchema>;

export const getAdminOrderRequestsQuerySchema = z.object({
  orderId: idSchema.optional(),
  orderItemId: idSchema.optional(),
  buyerId: idSchema.optional(),
  vendorId: idSchema.optional(),
  status: statusSchema.optional(),
  type: typeSchema.optional(),
  ...paginationFields,
});

export type GetAdminOrderRequestsQueryDto = z.infer<typeof getAdminOrderRequestsQuerySchema>;
