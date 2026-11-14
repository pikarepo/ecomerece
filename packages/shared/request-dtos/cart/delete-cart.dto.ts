import { z } from 'zod';
import { reasonSchema } from '../../dtos';

export const deleteCartDto = z.object({
  reason: reasonSchema,
});

export type deleteCartDtoType = z.infer<typeof deleteCartDto>;
