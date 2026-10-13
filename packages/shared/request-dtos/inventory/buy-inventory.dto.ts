import { z } from 'zod';

export const buyMyInventoryStockDto = z.object({
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

export type buyMyInventoryStockDtoType = z.infer<typeof buyMyInventoryStockDto>;
