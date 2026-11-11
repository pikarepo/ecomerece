import { z } from 'zod';
import { reasonSchema } from '../../dtos';

export const reportReviewDto = z.object({
  reason: reasonSchema,
});

export type reportReviewDtoType = z.infer<typeof reportReviewDto>;
