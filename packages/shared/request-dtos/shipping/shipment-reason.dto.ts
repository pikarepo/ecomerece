import { z } from 'zod';
import { reasonSchema } from '../../dtos';

/** Cancel, fail and return all need a human-readable reason of the same shape. */
export const shipmentReasonDto = z.object({
  reason: reasonSchema,
});

export type shipmentReasonDtoType = z.infer<typeof shipmentReasonDto>;
