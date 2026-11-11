import { z } from 'zod';
import { booleanSchema, idSchema } from '../../dtos';

export const productStockDto = z.object({
  productId: idSchema,
  inStock: booleanSchema,
});

export type productStockDtoType = z.infer<typeof productStockDto>;
