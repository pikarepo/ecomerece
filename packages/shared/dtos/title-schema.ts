import { z } from 'zod';

export const titleSchema = z
  .string()
  .min(3, 'Title must be at least 3 characters')
  .max(150, 'Title must not exceed 150 characters');
export const optionalTitleSchema = titleSchema.optional();

export type titleType = z.infer<typeof titleSchema>;
export type optionalTitleType = z.infer<typeof optionalTitleSchema>;
