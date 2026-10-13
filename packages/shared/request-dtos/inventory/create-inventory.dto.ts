import { z } from 'zod';
import { idSchema } from '../../dtos';

export const createMyInventoryDto = z.object({
  variantId: idSchema,
  lowStockThreshold: z.number().min(1, 'Low stock threshold must be at least 1'),
  available: z.number().min(1, 'Available stock must be at least 1'),
});

export type createMyInventoryDtoType = z.infer<typeof createMyInventoryDto>;
