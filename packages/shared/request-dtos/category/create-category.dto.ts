import { z } from 'zod';
import { imageInputSchema, titleSchema } from '../../dtos';

export const createCategoryDto = z.object({
  title: titleSchema,
  image: imageInputSchema,
});

export type createCategoryDtoType = z.infer<typeof createCategoryDto>;
