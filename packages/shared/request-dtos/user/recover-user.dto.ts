import { z } from 'zod';

export const RecoverUserDTOSchema = z.object({
  userId: z.string().trim().min(1, 'UserId is required'),
});

export type RecoverUserDTO = z.infer<typeof RecoverUserDTOSchema>;
