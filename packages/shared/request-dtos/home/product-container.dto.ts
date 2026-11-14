import { z } from 'zod';
import { idSchema, positiveNumberSchema, titleSchema } from '../../dtos';

export const baseQueryDtoSchema = z.object({
  filter: z.record(z.string(), z.unknown(), { message: 'Filter must be an object' }).default({}),
  cursor: z.string({ message: 'Cursor must be a string' }).nullable().optional(),
  limit: positiveNumberSchema.default(20),
  direction: z
    .enum(['next', 'prev'], { message: 'Direction must be either next or prev' })
    .default('next'),
  sort: z
    .record(z.string(), z.union([z.literal(1), z.literal(-1)]), {
      message: 'Sort must be an object of 1 or -1 values',
    })
    .nullable()
    .optional(),
});

export type BaseQueryDtoType = z.infer<typeof baseQueryDtoSchema>;

export const createProductContainerDtoSchema = z.object({
  heading: titleSchema,
  subTitle: titleSchema.default(''),
  query: baseQueryDtoSchema.default({ filter: {}, limit: 20, direction: 'next' }),
  displayOrder: positiveNumberSchema.optional(),
});

export type CreateProductContainerDtoType = z.infer<typeof createProductContainerDtoSchema>;

export const updateProductContainerDtoSchema = z.object({
  id: idSchema,
  heading: titleSchema.optional(),
  subTitle: titleSchema.optional(),
  query: baseQueryDtoSchema.optional(),
  displayOrder: positiveNumberSchema.optional(),
});

export type UpdateProductContainerDtoType = z.infer<typeof updateProductContainerDtoSchema>;

export const deleteProductContainerDtoSchema = z.object({
  id: idSchema,
});

export type DeleteProductContainerDtoType = z.infer<typeof deleteProductContainerDtoSchema>;

export const reorderProductContainersDtoSchema = z.object({
  orderedIds: z.array(idSchema).min(1, 'orderedIds array must contain at least one ID'),
});

export type ReorderProductContainersDtoType = z.infer<typeof reorderProductContainersDtoSchema>;
