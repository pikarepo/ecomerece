import { z } from 'zod';
import { colorSchema, idSchema, imageInputSchema, titleSchema, urlSchema } from '../../dtos';

export const createPromoDtoSchema = z.object({
  title: titleSchema,
  subtitle: titleSchema,
  image: imageInputSchema,
  accent: colorSchema.default('#FB923C'),
  link: urlSchema.default('https://example.com/client/home'),
});

export type CreatePromoDtoType = z.infer<typeof createPromoDtoSchema>;

export const updatePromoDtoSchema = z.object({
  id: idSchema,
  title: titleSchema.optional(),
  subtitle: titleSchema.optional(),
  image: imageInputSchema.optional(),
  accent: colorSchema.optional(),
  link: urlSchema.optional(),
});

export type UpdatePromoDtoType = z.infer<typeof updatePromoDtoSchema>;

export const deletePromoDtoSchema = z.object({
  id: idSchema,
});

export type DeletePromoDtoType = z.infer<typeof deletePromoDtoSchema>;
