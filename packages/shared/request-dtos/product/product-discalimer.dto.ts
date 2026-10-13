import { z } from 'zod';
import { booleanSchema, idSchema, nameSchema, titleSchema } from '../../dtos';

export const toggleDiscalimerDto = z.object({
  productId: idSchema,
  enable: booleanSchema,
});
export type toggleDiscalimerDtoType = z.infer<typeof toggleDiscalimerDto>;

export const disclaimerItemDto = z.object({
  name: nameSchema,
  title: titleSchema,
});

export const disclaimerItemsDto = z.object({
  items: z.array(disclaimerItemDto),
  productId: idSchema,
});

export type disclaimerItemsDtoType = z.infer<typeof disclaimerItemsDto>;
