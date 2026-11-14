import { z } from 'zod';

export const removeMyInventoryStockDto = z.object({
  quantity: z
    .number({ message: 'Quantity must be a number' })
    .min(1, 'Quantity must be at least 1'),
});

export type removeMyInventoryStockDtoType = z.infer<typeof removeMyInventoryStockDto>;
