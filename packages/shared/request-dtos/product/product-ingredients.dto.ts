import { z } from 'zod';
import { booleanSchema, idSchema, nameSchema } from '../../dtos';

export const toggleIngredientsDto = z.object({
  productId: idSchema,
  enable: booleanSchema,
});

export const ingredientsDto = z.object({
  productId: idSchema,
  items: z.array(nameSchema),
});
export type ingredientsDtotype = z.infer<typeof ingredientsDto>;
export type toggleIngredientsDtoType = z.infer<typeof toggleIngredientsDto>;
