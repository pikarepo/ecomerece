import { z } from 'zod';
import { idSchema, titleSchema } from '../../dtos';

export const upadteMyVariantMetaDto = z.object({
  title: titleSchema,
  productId: idSchema,
  variantId: idSchema,
});

export type upadteMyVariantMetaDtoType = z.infer<typeof upadteMyVariantMetaDto>;
