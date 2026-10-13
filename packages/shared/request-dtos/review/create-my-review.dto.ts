import z from 'zod';
import { descriptionSchema, idSchema, ratingSchema, titleSchema, urlSchema } from '../../dtos';

export { z } from 'zod';

export const createMyReviewDtoSchema = z.object({
  productId: idSchema,
  orderId: idSchema,
  rating: ratingSchema,
  title: titleSchema,
  comment: descriptionSchema,
  images: z.array(urlSchema).optional(),
});

export type createMyReviewDtoType = z.infer<typeof createMyReviewDtoSchema>;
