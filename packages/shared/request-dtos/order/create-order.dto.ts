import { z } from 'zod';
import { idSchema, positiveNumberSchema } from '../../dtos';

export const createMyOrderDto = z.object({
  idempotentKey: idSchema,
  addressId: idSchema,
  /**
   * All-or-nothing: when true, any rejected line aborts the whole order.
   * When false, rejected lines are stored with a failure reason and no cost.
   */
  safeOrder: z.boolean({ message: 'safeOrder must be a boolean' }).default(false),
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
