import { z } from 'zod';

export const getAdminCouponsQuerySchema = z.object({
  code: z.string({ message: 'Code must be a string' }).optional(),
  active: z.coerce.boolean({ message: 'active must be a boolean' }).optional(),
  deleted: z.coerce.boolean({ message: 'deleted must be a boolean' }).optional(),
  cursor: z.string({ message: 'Cursor must be a string' }).optional(),
  limit: z.coerce
    .number({ message: 'Limit must be a number' })
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must not exceed 100')
    .optional()
    .default(20),
  direction: z
    .enum(['next', 'prev'], { message: 'Direction must be either next or prev' })
    .optional()
    .default('next'),
});

export type GetAdminCouponsQueryDto = z.infer<typeof getAdminCouponsQuerySchema>;
