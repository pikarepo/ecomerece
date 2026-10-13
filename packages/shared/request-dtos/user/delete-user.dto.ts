import { z } from 'zod';
import { clerkUserIdSchema, reasonSchema } from '../../dtos';

export const DeleteUserDTOSchema = z.object({
  userId: clerkUserIdSchema,
  reason: reasonSchema,
});

export type DeleteUserDTO = z.infer<typeof DeleteUserDTOSchema>;

export const DeleteMeDTOSchema = z.object({
  reason: reasonSchema,
});

export type DeleteMeDTO = z.infer<typeof DeleteMeDTOSchema>;
