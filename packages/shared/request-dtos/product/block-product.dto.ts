import { z } from 'zod';
import { idSchema, reasonSchema } from '../../dtos';

export const blockProductDto = z.object({ reason: reasonSchema, productId: idSchema });
export const blockLiftProductDto = z.object({ productId: idSchema });

export type blockProductDtoType = z.infer<typeof blockProductDto>;
export type blockLiftProductDtoType = z.infer<typeof blockLiftProductDto>;
