import { z } from 'zod';

export const discountTypeValues = ['percentage', 'fixed'] as const;

const couponShape = {
  code: z
    .string({ message: 'Code must be a string' })
    .trim()
    .min(3, 'Code must be at least 3 characters')
    .max(32, 'Code must not exceed 32 characters')
    .regex(/^[A-Za-z0-9-]+$/, 'Code may only contain letters, digits and hyphens'),
  discountType: z.enum(discountTypeValues, {
    message: 'Discount type must be percentage or fixed',
  }),
  discountValue: z
    .number({ message: 'Discount value must be a number' })
    .positive('Discount value must be greater than zero'),
  minOrderAmount: z
    .number({ message: 'Minimum order amount must be a number' })
    .min(0, 'Minimum order amount cannot be negative')
    .optional()
    .default(0),
  maxDiscountAmount: z
    .number({ message: 'Maximum discount amount must be a number' })
    .positive('Maximum discount amount must be greater than zero')
    .optional(),
  maxRedemptions: z
    .number({ message: 'Max redemptions must be a number' })
    .int('Max redemptions must be a whole number')
    .min(1, 'Max redemptions must be at least 1')
    .optional(),
  perBuyerLimit: z
    .number({ message: 'Per-buyer limit must be a number' })
    .int('Per-buyer limit must be a whole number')
    .min(1, 'Per-buyer limit must be at least 1')
    .optional()
    .default(1),
  startsAt: z.coerce.date({ message: 'Start date must be a date' }),
  expiresAt: z.coerce.date({ message: 'Expiry date must be a date' }).optional(),
  active: z.boolean({ message: 'Active must be a boolean' }).optional().default(true),
};

export const createCouponDto = z.object(couponShape);
export type createCouponDtoType = z.infer<typeof createCouponDto>;

/**
 * Updates replace the campaign definition, so every field the create route
 * accepts is optional here and the service keeps the stored value when omitted.
 */
export const updateCouponDto = z.object(couponShape).partial();
export type updateCouponDtoType = z.infer<typeof updateCouponDto>;
