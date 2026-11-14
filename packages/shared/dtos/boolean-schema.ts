import { z } from 'zod';

export const booleanSchema = z.boolean({ message: 'Must be a boolean' }).optional().default(false);
export type booleanType = z.infer<typeof booleanSchema>;
