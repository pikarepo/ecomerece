import { z } from 'zod';
import { descriptionSchema, idSchema, titleSchema } from '../../dtos';

export const updateProductMetaDto = z.object({
  title: titleSchema,
  productId: idSchema,
  description: descriptionSchema,
});

export type updateProductMetaDtoType = z.infer<typeof updateProductMetaDto>;
