import { z } from 'zod';
import { shipmentStatusValues } from './create-shipment.dto';

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

export const getMyShipmentsQuerySchema = z.object({
  orderId: z.string({ message: 'Order id must be a string' }).optional(),
  status: z
    .enum(shipmentStatusValues, { message: 'Status must be a valid shipment status' })
    .optional(),
  ...paginationShape,
});

export type GetMyShipmentsQueryDto = z.infer<typeof getMyShipmentsQuerySchema>;

export const getVendorShipmentsQuerySchema = z.object({
  orderId: z.string({ message: 'Order id must be a string' }).optional(),
  status: z
    .enum(shipmentStatusValues, { message: 'Status must be a valid shipment status' })
    .optional(),
  ...paginationShape,
});

export type GetVendorShipmentsQueryDto = z.infer<typeof getVendorShipmentsQuerySchema>;

export const getAdminShipmentsQuerySchema = z.object({
  orderId: z.string({ message: 'Order id must be a string' }).optional(),
  vendorId: z.string({ message: 'Vendor id must be a string' }).optional(),
  buyerId: z.string({ message: 'Buyer id must be a string' }).optional(),
  status: z
    .enum(shipmentStatusValues, { message: 'Status must be a valid shipment status' })
    .optional(),
  deleted: z.coerce.boolean({ message: 'deleted must be a boolean' }).optional(),
  ...paginationShape,
});

export type GetAdminShipmentsQueryDto = z.infer<typeof getAdminShipmentsQuerySchema>;
