import { z } from 'zod';
import { moneySchema } from '../../dtos';

export const updateOrderDto = z.object({
  totalPrice: moneySchema,
  address: z
    .string({ message: 'Address must be a string' })
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address must not exceed 500 characters'),
});

export type updateOrderDtoType = z.infer<typeof updateOrderDto>;
