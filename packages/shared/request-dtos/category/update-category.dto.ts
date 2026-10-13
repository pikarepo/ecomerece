import { z } from 'zod';
import { idSchema, imageInputSchema, titleSchema } from '../../dtos';

export const updateCategoryDto = z.object({
  id: idSchema,
  title: titleSchema.optional(),
  image: imageInputSchema.optional(),
});

export type updateCategoryType = z.infer<typeof updateCategoryDto>;
