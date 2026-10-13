import { z } from 'zod';
import { idSchema, positiveNumberSchema } from '../../dtos';

export const createMyOrderDto = z.object({
  idempotentKey: idSchema,
  addressId: idSchema,
  waitingTime: z.coerce.date({ message: 'Must be a valid date' }),
  items: z
    .array(
      z.object({
        variantId: idSchema,
        quantity: positiveNumberSchema,
      }),
      { message: 'At least one item is required' },
    )
    .min(1, 'At least one item is required'),
});

export type createMyOrderDtoType = z.infer<typeof createMyOrderDto>;
