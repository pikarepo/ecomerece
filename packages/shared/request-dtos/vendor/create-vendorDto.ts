import { z } from 'zod';
import { imageInputSchema } from '../../dtos';

export const CreateVendorDtoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters'),
  slug: z
    .string()
    .trim()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must not exceed 100 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  contacts: z.object({
    phone: z
      .string({ message: 'Phone number must be a string' })
      .min(1, 'Phone number is required'),
    email: z.email({ message: 'Must be a valid email address' }),
    address: z.object({
      streetAddress: z
        .string({ message: 'Street address must be a string' })
        .min(1, 'Street address is required'),
      city: z.string({ message: 'City must be a string' }).min(1, 'City is required'),
      state: z.string({ message: 'State must be a string' }).min(1, 'State is required'),
      postalCode: z
        .string({ message: 'Postal code must be a string' })
        .min(1, 'Postal code is required'),
      country: z.string({ message: 'Country must be a string' }).min(1, 'Country is required'),
    }),
  }),
  image: z.object({
    logo: imageInputSchema,
    banner: imageInputSchema,
  }),
});

export type CreateVendorDto = z.infer<typeof CreateVendorDtoSchema>;
