import { z } from 'zod';

export const descriptionSchema = z
  .string()
  .min(10, 'Description must be at least 10 characters')
  .max(5000, 'Description must not exceed 5000 characters');
export const optionalDescriptionSchema = descriptionSchema.optional();

export type descriptionType = z.infer<typeof descriptionSchema>;
export type optionalDescriptionType = z.infer<typeof optionalDescriptionSchema>;
