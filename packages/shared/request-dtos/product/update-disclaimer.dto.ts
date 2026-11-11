import { z } from 'zod';
import { idSchema, nameSchema, titleSchema } from '../../dtos';

export const updateDisclaimerDto = z.object({
  productId: idSchema,
  name: nameSchema,
  title: titleSchema,
});

export type updateDisclaimerDtoType = z.infer<typeof updateDisclaimerDto>;
