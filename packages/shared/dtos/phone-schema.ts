import { z } from 'zod';

export const phoneNumberSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{8,15}$/, {
    message: 'Phone number must contain 8–15 digits, with an optional leading +',
  });
export const optionalPhoneNumberSchema = phoneNumberSchema.optional();

export type phoneNumberType = z.infer<typeof phoneNumberSchema>;
export type optionalphoneNumberType = z.infer<typeof optionalPhoneNumberSchema>;
