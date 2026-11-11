import { z } from 'zod';
import { idSchema, moneySchema, positiveNumberSchema } from '../../dtos';

export const updateOrderItemDto = z.object({
  quantity: positiveNumberSchema,
  waitingTime: z.coerce.date({ message: 'Must be a valid date' }),
  price: moneySchema,
});

export type UpdateOrderItemDto = z.infer<typeof updateOrderItemDto>;
