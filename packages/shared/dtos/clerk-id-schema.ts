import { z } from 'zod';
export const clerkUserIdSchema = z
  .string()
  .trim()
  .min(1, 'UserId is required')
  .max(50, 'UserId must be 50 characters or less')
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid userId format');

export type clerkUserIdType = z.infer<typeof clerkUserIdSchema>;
