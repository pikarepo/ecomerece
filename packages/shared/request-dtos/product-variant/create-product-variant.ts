import { z } from 'zod';
import { booleanSchema, idSchema, moneySchema, titleSchema } from '../../dtos';

export const createMyProductVariantDto = z.object({
  productId: idSchema,
  discountedPrice: moneySchema,
  price: moneySchema,
  title: titleSchema,
  active: booleanSchema,
});

export type createMyProductVariantDtoType = z.infer<typeof createMyProductVariantDto>;
