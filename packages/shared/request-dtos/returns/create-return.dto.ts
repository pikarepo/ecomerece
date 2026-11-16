import { z } from 'zod';
import { idSchema, reasonSchema } from '../../dtos';

export const returnTypeValues = ['refund', 'replacement'] as const;
export const returnStatusValues = [
  'requested',
  'approved',
  'rejected',
  'shipped_back',
  'received',
  'cancelled',
] as const;

export const createReturnDto = z.object({
  orderId: idSchema,
  orderItemId: idSchema,
  quantity: z
    .number({ message: 'Quantity must be a number' })
    .int('Quantity must be whole units')
    .min(1, 'Quantity must be at least 1')
    .max(1000, 'Quantity must not exceed 1000'),
  returnType: z.enum(returnTypeValues, { message: 'Return type must be refund or replacement' }),
  reason: reasonSchema,
});

export type createReturnDtoType = z.infer<typeof createReturnDto>;
