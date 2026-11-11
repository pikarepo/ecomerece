import { z } from 'zod';
import { idSchema } from '../../dtos';

export const cancelMyOrderItemsDto = z.object({
  orderId: idSchema,
  itemIds: z
    .array(idSchema, { message: 'At least one order item is required' })
    .min(1, 'At least one order item is required'),
});

export type CancelMyOrderItemsDto = z.infer<typeof cancelMyOrderItemsDto>;
