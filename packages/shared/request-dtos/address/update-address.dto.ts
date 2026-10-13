import z from 'zod';
import { nameSchema, titleSchema } from '../../dtos';

export const updateMyAddressDto = z.object({
  streetAddress: titleSchema,
  city: nameSchema,
  state: nameSchema,
  postalCode: z
    .string()
    .min(1, 'Postal code is required')
    .max(10, 'Postal code must not exceed 10 characters'),
  country: nameSchema,
});

export type updateMyAddressDtoType = z.infer<typeof updateMyAddressDto>;
