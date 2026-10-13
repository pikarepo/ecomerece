import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createInventoryModule } from '../inventory.module';

export const inventoryRoutes = new Hono();

const { inventoryController } = createInventoryModule();

inventoryRoutes.get(
  '/admin/all',
  authMiddleware,
  adminMiddleware,
  inventoryController.getAdminPaginatedInventory,
);
inventoryRoutes.get('/:id', inventoryController.getInventoryByVarientId);
inventoryRoutes.post('/my/create', authMiddleware, inventoryController.createMyInventory);
inventoryRoutes.patch('/my/:id/purchase', authMiddleware, inventoryController.buyMyInventory);
inventoryRoutes.patch(
  '/my/:id/threshold',
  authMiddleware,
  inventoryController.updateMylowStockThreshold,
);
inventoryRoutes.patch('/:id/remove', authMiddleware, inventoryController.removeMyInventoryStock);
