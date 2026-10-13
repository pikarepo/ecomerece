import { z } from 'zod';
import { colorSchema, descriptionSchema, iconSchema, idSchema, titleSchema } from '../../dtos';

export const createFeatureDtoSchema = z.object({
  title: titleSchema,
  detail: descriptionSchema,
  accent: colorSchema.default('#10B981'),
  icon: iconSchema.default('Sparkles'),
});

export type CreateFeatureDtoType = z.infer<typeof createFeatureDtoSchema>;

export const updateFeatureDtoSchema = z.object({
  id: idSchema,
  title: titleSchema.optional(),
  detail: descriptionSchema.optional(),
  accent: colorSchema.optional(),
  icon: iconSchema.optional(),
});

export type UpdateFeatureDtoType = z.infer<typeof updateFeatureDtoSchema>;

export const deleteFeatureDtoSchema = z.object({
  id: idSchema,
});

export type DeleteFeatureDtoType = z.infer<typeof deleteFeatureDtoSchema>;

export const setFeaturesDtoSchema = z.object({
  features: z.array(createFeatureDtoSchema).max(8, 'Cannot exceed maximum of 8 features'),
});

export type SetFeaturesDtoType = z.infer<typeof setFeaturesDtoSchema>;
