import { z } from 'zod';
import { reasonSchema } from '../../dtos';

export const blockCategoryDto = z.object({
  reason: reasonSchema,
});

export type blockCategoryDtoType = z.infer<typeof blockCategoryDto>;
