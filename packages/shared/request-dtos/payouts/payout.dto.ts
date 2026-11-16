import { z } from 'zod';

export const requestPayoutDto = z.object({
  amount: z.coerce.number().positive(),
  currency: z.string().trim().length(3).optional().default('USD'),
  method: z.string().trim().min(2).max(40).optional().default('manual'),
  destinationRef: z.string().trim().max(120).nullable().optional(),
});
export type requestPayoutDtoType = z.infer<typeof requestPayoutDto>;

export const payoutActionDto = z.object({
  reason: z.string().trim().min(3).max(200).optional(),
  providerRef: z.string().trim().max(120).optional(),
});
export type payoutActionDtoType = z.infer<typeof payoutActionDto>;

export const getPayoutsQuerySchema = z.object({
  status: z.string().trim().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  direction: z.enum(['next', 'prev']).optional().default('next'),
});
export const getAdminPayoutsQuerySchema = getPayoutsQuerySchema.extend({
  vendorId: z.string().trim().min(5).max(40).optional(),
});
export const getLedgerQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  direction: z.enum(['next', 'prev']).optional().default('next'),
});
export type GetPayoutsQueryDto = z.infer<typeof getPayoutsQuerySchema>;
export type GetAdminPayoutsQueryDto = z.infer<typeof getAdminPayoutsQuerySchema>;
export type GetLedgerQueryDto = z.infer<typeof getLedgerQuerySchema>;
