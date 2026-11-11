import { z } from 'zod';
import { descriptionSchema, ratingSchema, titleSchema, urlSchema } from '../../dtos';

export const updateMyReviewDto = z.object({
  rating: ratingSchema,
  title: titleSchema,
  comment: descriptionSchema,
  images: z.array(urlSchema).optional(),
});

export type updateMyReviewDtoType = z.infer<typeof updateMyReviewDto>;
