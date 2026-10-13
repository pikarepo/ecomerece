import { z } from 'zod';
import { idSchema, reasonSchema } from '../../dtos';

export const deleteCategoryDto = z.object({
  id: idSchema,
  reason: reasonSchema,
});

export type deleteCategoryType = z.infer<typeof deleteCategoryDto>;
