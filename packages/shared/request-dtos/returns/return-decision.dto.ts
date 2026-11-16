import { z } from 'zod';
import { reasonSchema } from '../../dtos';

/** Rejecting or cancelling a return always carries a written explanation. */
export const returnDecisionDto = z.object({
  reason: reasonSchema,
});

export type returnDecisionDtoType = z.infer<typeof returnDecisionDto>;
