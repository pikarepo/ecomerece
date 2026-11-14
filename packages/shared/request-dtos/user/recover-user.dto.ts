import { z } from 'zod';

export const RecoverUserDTOSchema = z.object({
  userId: z.string({ message: 'UserId must be a string' }).trim().min(1, 'UserId is required'),
});

export type RecoverUserDTO = z.infer<typeof RecoverUserDTOSchema>;
