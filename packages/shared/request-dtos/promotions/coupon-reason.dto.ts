import { z } from 'zod';
import { reasonSchema } from '../../dtos';

export const couponReasonDto = z.object({
  reason: reasonSchema,
});

export type couponReasonDtoType = z.infer<typeof couponReasonDto>;
