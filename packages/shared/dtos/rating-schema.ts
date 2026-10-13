import { z } from 'zod';

export const ratingSchema = z
  .number()
  .min(1, 'Rating must be at least 1')
  .max(5, 'Rating must not exceed 5');
export const optionalRatingSchema = ratingSchema.optional();
export type optionalRatingType = z.infer<typeof optionalRatingSchema>;
export type ratingType = z.infer<typeof ratingSchema>;
