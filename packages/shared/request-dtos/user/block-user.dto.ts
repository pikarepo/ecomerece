import { z } from 'zod';
import { clerkUserIdSchema, reasonSchema } from '../../dtos';

export const BlockUserDTOSchema = z.object({
  userId: clerkUserIdSchema,
  reason: reasonSchema,
});

export type BlockUserDTO = z.infer<typeof BlockUserDTOSchema>;
