import { z } from 'zod';

export const createPaymentDto = z.object({
  orderId: z.string({ message: 'Order ID is required' }).min(5).max(40),
  provider: z.string().trim().min(2).max(40).optional(),
  currency: z.string().trim().length(3).optional().default('USD'),
});

export type createPaymentDtoType = z.infer<typeof createPaymentDto>;
