import { z } from 'zod';
import { reasonSchema } from '../../dtos';

export const deleteInventoryDto = z.object({
  reason: reasonSchema,
});

export type DeleteInventoryDto = z.infer<typeof deleteInventoryDto>;
