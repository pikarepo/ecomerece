import { z } from 'zod';
import { idSchema, positiveNumberSchema } from '../../dtos';

/** Buys one order item immediately, so the order is type `single`. */
export const buyNowOrderDto = z.object({
  idempotentKey: idSchema,
  addressId: idSchema,
  variantId: idSchema,
  quantity: positiveNumberSchema,
  waitingTime: z.coerce.date({ message: 'Must be a valid date' }),
});

export type buyNowOrderDtoType = z.infer<typeof buyNowOrderDto>;
