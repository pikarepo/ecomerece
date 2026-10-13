import { z } from 'zod';
import {
  colorSchema,
  idSchema,
  imageInputSchema,
  positiveNumberSchema,
  titleSchema,
} from '../../dtos';

export const createSlideDtoSchema = z.object({
  tag: titleSchema,
  title: titleSchema,
  subhead: titleSchema.default(''),
  subtitle: titleSchema.default(''),
  cta: titleSchema,
  image: imageInputSchema,
  accent: colorSchema.default('#3B82F6'),
  displayOrder: positiveNumberSchema.optional(),
});

export type CreateSlideDtoType = z.infer<typeof createSlideDtoSchema>;

export const updateSlideDtoSchema = z.object({
  id: idSchema,
  tag: titleSchema.optional(),
  title: titleSchema.optional(),
  subhead: titleSchema.optional(),
  subtitle: titleSchema.optional(),
  cta: titleSchema.optional(),
  image: imageInputSchema.optional(),
  accent: colorSchema.optional(),
});

export type UpdateSlideDtoType = z.infer<typeof updateSlideDtoSchema>;

export const deleteSlideDtoSchema = z.object({
  id: idSchema,
});

export type DeleteSlideDtoType = z.infer<typeof deleteSlideDtoSchema>;

export const reorderSlidesDtoSchema = z.object({
  orderedIds: z.array(idSchema).min(1, 'orderedIds array must contain at least one ID'),
});

export type ReorderSlidesDtoType = z.infer<typeof reorderSlidesDtoSchema>;
