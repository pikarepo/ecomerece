import { z } from 'zod';
import { idSchema, imageSchema } from '../../dtos';

export const imagesDto = z.object({
  images: z.array(imageSchema),
  productId: idSchema,
});

export const deafultImageDto = z.object({
  index: z.number().min(0, 'Index must be at least 0').max(3, 'Index must not exceed 3'),
  productId: idSchema,
});
export type deafultImageDtoType = z.infer<typeof deafultImageDto>;

export type imagesDtoType = z.infer<typeof imagesDto>;
