import { z } from 'zod';
import { clerkUserIdSchema } from '../../dtos';

export const ExtendBanDTOSchema = z.object({
  userId: clerkUserIdSchema,
  forDays: z.number().min(1, 'Extension must be at least 1 day'),
});

export type ExtendBanDTO = z.infer<typeof ExtendBanDTOSchema>;
