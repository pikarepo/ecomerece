import { z } from 'zod';

/** Preview only: the subtotal is supplied by the cart UI and nothing is redeemed. */
export const validateCouponDto = z.object({
  code: z
    .string({ message: 'Code must be a string' })
    .trim()
    .min(3, 'Code must be at least 3 characters')
    .max(32, 'Code must not exceed 32 characters'),
  subtotal: z
    .number({ message: 'Subtotal must be a number' })
    .min(0, 'Subtotal cannot be negative'),
});

export type validateCouponDtoType = z.infer<typeof validateCouponDto>;
