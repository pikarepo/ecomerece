import { z } from 'zod';
import { idSchema } from '../../dtos';

/**
 * Orders the selected cart lines as one order. Checkout is all-or-nothing: if
 * any selected line cannot be bought, no order is created and the cart is left
 * untouched.
 */
export const checkoutCartDto = z.object({
  /** Same key for one checkout attempt, so a retry never creates a second order. */
  idempotentKey: idSchema,
  addressId: idSchema,
  waitingTime: z.coerce.date({ message: 'Must be a valid date' }),
  cartItemIds: z
    .array(idSchema, { message: 'At least one cart item is required' })
    .min(1, 'At least one cart item is required'),
});

export type checkoutCartDtoType = z.infer<typeof checkoutCartDto>;
