import { z } from 'zod';
import { idSchema, reasonSchema } from '../../dtos';

export const softDeleteMyProductDto = z.object({
  reason: reasonSchema,
  productId: idSchema,
});

export type softDeleteMyProductDtoType = z.infer<typeof softDeleteMyProductDto>;

export const recoverProductDto = z.object({
  productId: idSchema,
});

export type recoverProductDtoType = z.infer<typeof recoverProductDto>;
