import { z } from 'zod';
import { idSchema } from '../../dtos';

export const clearIngredientsDto = z.object({
  productId: idSchema,
});

export type clearIngredientsDtoType = z.infer<typeof clearIngredientsDto>;
