import { z } from 'zod';

const MAX_URL_LENGTH = 2048;

// Mirrors UrlVO: http(s) only, no credentials, and a bounded length.
export const urlSchema = z
  .string()
  .trim()
  .max(MAX_URL_LENGTH, 'URL must not exceed 2048 characters')
  .refine((value) => {
    try {
      const parsed = new URL(value);
      return (
        (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
        !parsed.username &&
        !parsed.password
      );
    } catch {
      return false;
    }
  }, 'Must be a valid HTTP(S) URL without credentials');

export const optionalUrlSchema = urlSchema.optional();

export type UrlType = z.infer<typeof urlSchema>;
export type optionalUrlType = z.infer<typeof optionalUrlSchema>;
