import { z } from 'zod';

// Mirrors EmailVO: trimmed and RFC-length capped before address validation.
export const emailSchema = z
  .string()
  .trim()
  .max(254, 'Email must not exceed 254 characters')
  .pipe(z.email({ message: 'Must be a valid email address' }));
export const optionalEmailSchema = emailSchema.optional();

export type emailType = z.infer<typeof emailSchema>;
export type optionalEmailType = z.infer<typeof optionalEmailSchema>;
