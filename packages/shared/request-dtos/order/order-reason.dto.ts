import { z } from 'zod';
import { reasonSchema } from '../../dtos';

export const orderReasonDto = z.object({
  reason: reasonSchema,
});

export type orderReasonDtoType = z.infer<typeof orderReasonDto>;
