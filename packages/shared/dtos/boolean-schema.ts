import { z } from 'zod';

export const booleanSchema = z.boolean().optional().default(false);
export type booleanType = z.infer<typeof booleanSchema>;
