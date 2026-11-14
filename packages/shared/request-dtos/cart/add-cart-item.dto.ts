import { z } from 'zod';
import { idSchema, positiveNumberSchema } from '../../dtos';

export const addCartItemDto = z.object({
  variantId: idSchema,
  quantity: positiveNumberSchema,
});

export type addCartItemDtoType = z.infer<typeof addCartItemDto>;
