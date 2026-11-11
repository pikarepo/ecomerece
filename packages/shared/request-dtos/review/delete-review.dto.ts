import { z } from 'zod';
import { reasonSchema } from '../../dtos';

export const deleteMyReviewDto = z.object({
  reason: reasonSchema,
});

export type deleteMyReviewDtoType = z.infer<typeof deleteMyReviewDto>;
