import { z } from 'zod';
import { idSchema, reasonSchema } from '../../dtos';

export const softDeleteMyVariantDto = z.object({
  productId: idSchema,
  variantId: idSchema,
  reason: reasonSchema,
});

export type softDeleteMyVariantDtoType = z.infer<typeof softDeleteMyVariantDto>;
