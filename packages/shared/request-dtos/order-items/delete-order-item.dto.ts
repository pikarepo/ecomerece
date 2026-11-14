import { z } from 'zod';
import { reasonSchema } from '../../dtos';

export const deleteOrderItemDto = z.object({
  reason: reasonSchema,
});

export type DeleteOrderItemDto = z.infer<typeof deleteOrderItemDto>;
