import { z } from 'zod';

export const removeMyInventoryStockDto = z.object({
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

export type removeMyInventoryStockDtoType = z.infer<typeof removeMyInventoryStockDto>;
