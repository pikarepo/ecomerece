import { z } from 'zod';

export const paymentStatusValues = [
  'pending',
  'authorized',
  'captured',
  'failed',
  'cancelled',
  'refunded',
  'partially_refunded',
] as const;

const base = {
  orderId: z.string().trim().min(5).max(40).optional(),
  status: z.enum(paymentStatusValues).optional(),
  provider: z.string().trim().min(2).max(40).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  direction: z.enum(['next', 'prev']).optional().default('next'),
};

export const getMyPaymentsQuerySchema = z.object(base);
export const getAdminPaymentsQuerySchema = z.object({
  ...base,
  buyerId: z.string().trim().min(5).max(40).optional(),
  deleted: z.coerce.boolean().optional(),
});

export type GetMyPaymentsQueryDto = z.infer<typeof getMyPaymentsQuerySchema>;
export type GetAdminPaymentsQueryDto = z.infer<typeof getAdminPaymentsQuerySchema>;
