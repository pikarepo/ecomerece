import { z } from 'zod';

export const moneySchema = z
  .number({ message: 'Price must be a number' })
  .min(1, 'Price must be at least 1');
export const optionalMoneySchema = moneySchema.optional();

export type moneySchemaType = z.infer<typeof moneySchema>;
export type optionalMoneySchemaType = z.infer<typeof optionalMoneySchema>;
