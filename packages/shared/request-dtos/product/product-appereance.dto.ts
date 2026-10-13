import { z } from 'zod';
import { idSchema } from '../../dtos';

export const productAppereanceDto = z.object({
  productId: idSchema,
});

export type productAppereanceDtoType = z.infer<typeof productAppereanceDto>;
