import { z } from 'zod';
import { altSchema, booleanSchema, idSchema, titleSchema, urlSchema } from '../../dtos';

export const ProductImageDto = z.object({
  url: urlSchema,
  alt: altSchema,
  default: booleanSchema,
});

export const DisclaimerDto = z.object({
  name: z.string().trim().min(1, 'Disclaimer name is required'),
  title: z.string().trim().min(1, 'Disclaimer title is required'),
});

export const IngredientDto = z.object({
  isIngredients: booleanSchema,
  ingredients: z.array(z.string().trim().min(1, 'Ingredient name is required')),
});

export const DisclaimerInfoDto = z.object({
  isDisclaimer: booleanSchema,
  disclaimers: z.array(DisclaimerDto),
});

export const ImageInfoDto = z.object({
  images: z.array(ProductImageDto).min(1, 'At least one image is required'),
});

export const CreateMyProductDtoSchema = z.object({
  title: titleSchema,
  categoryId: idSchema,
  appearance: z.enum(['public', 'private'], { message: 'Appearance must be public or private' }),
  description: z.string().trim().min(1, 'Description is required'),
  ingredient: IngredientDto,
  disclaimer: DisclaimerInfoDto,
  image: ImageInfoDto,
});

export type CreateMyProductDto = z.infer<typeof CreateMyProductDtoSchema>;
