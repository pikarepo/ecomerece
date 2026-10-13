import { z } from 'zod';
export const clerkUserIdSchema = z
  .string()
  .trim()
  .min(1, 'UserId is required')
  .max(50, 'UserId must be 50 characters or less')
  .regex(/^user_[a-zA-Z0-9]+$/, 'Invalid userId format');

export type clerkUserIdType = z.infer<typeof clerkUserIdSchema>;
