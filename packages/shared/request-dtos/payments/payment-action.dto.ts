import { z } from 'zod';

export const capturePaymentDto = z.object({
  amount: z.coerce.number().positive().optional(),
});

export const refundPaymentDto = z.object({
  amount: z.coerce.number().positive({ message: 'Refund amount must be greater than 0' }),
  reason: z.string().trim().min(3).max(200),
});

export const paymentReasonDto = z.object({
  reason: z.string().trim().min(3).max(200).optional(),
});

export type capturePaymentDtoType = z.infer<typeof capturePaymentDto>;
export type refundPaymentDtoType = z.infer<typeof refundPaymentDto>;
export type paymentReasonDtoType = z.infer<typeof paymentReasonDto>;
