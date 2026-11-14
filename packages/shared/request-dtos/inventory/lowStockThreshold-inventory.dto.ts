import { z } from 'zod';

export const updateMylowStockThresholdDto = z.object({
  lowStockThreshold: z
    .number({ message: 'Low stock threshold must be a number' })
    .min(1, 'Low stock threshold must be at least 1'),
});

export type updateMylowStockThresholdDtoType = z.infer<typeof updateMylowStockThresholdDto>;
