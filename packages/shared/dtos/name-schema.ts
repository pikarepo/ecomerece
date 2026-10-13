import { z } from 'zod';

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(50, 'Name must not exceed 50 characters');
export const optionalNameSchema = nameSchema.optional();

export type nameType = z.infer<typeof nameSchema>;
export type optionalNameType = z.infer<typeof optionalNameSchema>;
