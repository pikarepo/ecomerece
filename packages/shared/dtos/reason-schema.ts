import { z } from 'zod';

export const reasonSchema = z
  .string()
  .min(10, 'Reason must be at least 10 characters')
  .max(100, 'Reason must not exceed 100 characters');
export const optionalReasonSchema = reasonSchema.optional();

export type reasonType = z.infer<typeof reasonSchema>;
export type optionalReasonType = z.infer<typeof optionalReasonSchema>;
