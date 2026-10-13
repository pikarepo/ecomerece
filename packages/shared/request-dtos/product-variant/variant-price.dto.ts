import { z } from 'zod';
import { idSchema, moneySchema } from '../../dtos';

export const updateMyVariatPriceDto = z.object({
  productId: idSchema,
  variantId: idSchema,
  price: moneySchema,
  discountedPrice: moneySchema,
});

export type updateMyVariatPriceDtoType = z.infer<typeof updateMyVariatPriceDto>;
