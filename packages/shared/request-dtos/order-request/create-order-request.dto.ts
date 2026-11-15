import { z } from 'zod';
import { idSchema, imageInputSchema, optionalDescriptionSchema, reasonSchema } from '../../dtos';

export const createOrderRequestDto = z.object({
  orderId: idSchema,
  /** Omit to request the whole order; required when the order spans vendors. */
  orderItemId: idSchema.optional(),
  type: z.enum(['return', 'refund'], { message: 'Type must be return or refund' }),
  reason: reasonSchema,
  note: optionalDescriptionSchema,
  /** Base64 data URIs are uploaded; http(s) URLs are stored as-is. */
  images: z.array(imageInputSchema).max(5, 'At most five evidence images are allowed').optional(),
});

export type CreateOrderRequestDto = z.infer<typeof createOrderRequestDto>;

export const acceptOrderRequestDto = z.object({
  note: optionalDescriptionSchema,
});

export type AcceptOrderRequestDto = z.infer<typeof acceptOrderRequestDto>;

export const rejectOrderRequestDto = z.object({
  reason: reasonSchema,
});

export type RejectOrderRequestDto = z.infer<typeof rejectOrderRequestDto>;
