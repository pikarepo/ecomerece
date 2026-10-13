import { z } from 'zod';
import { booleanSchema, idSchema } from '../../dtos';

export const toggleVariantApperaaracneDto = z.object({
  productId: idSchema,
  variantId: idSchema,
  appearance: booleanSchema,
});

export type toggleVariantApperaaracneDtoType = z.infer<typeof toggleVariantApperaaracneDto>;
