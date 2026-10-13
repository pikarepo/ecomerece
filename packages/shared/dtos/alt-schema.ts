import { z } from 'zod';

export const altSchema = z
  .string()
  .min(3, 'Alt text must be at least 3 characters')
  .max(150, 'Alt text must not exceed 150 characters');
export const optionalAltSchema = altSchema.optional();

export type altType = z.infer<typeof altSchema>;
export type optionalAltType = z.infer<typeof optionalAltSchema>;
