import { z } from 'zod';
import { reasonSchema } from '../../dtos';

export const blockReviewDto = z.object({
  reason: reasonSchema,
});

export type blockReviewDtoType = z.infer<typeof blockReviewDto>;
