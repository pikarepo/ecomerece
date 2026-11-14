import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import type { createInventoryModule } from '../inventory.module';

type InventoryController = ReturnType<typeof createInventoryModule>['inventoryController'];

export function createInventoryRoutes(inventoryController: InventoryController) {
  const inventoryRoutes = new Hono();

  inventoryRoutes.get(
    '/admin/all',
    authMiddleware,
    adminMiddleware,
    inventoryController.getAdminPaginatedInventory,
  );
  inventoryRoutes.get('/by-id/:id', inventoryController.getInventoryById);
  inventoryRoutes.get('/:id', inventoryController.getInventoryByVarientId);
  inventoryRoutes.post('/my/create', authMiddleware, inventoryController.createMyInventory);
  inventoryRoutes.delete('/my/:id', authMiddleware, inventoryController.deleteMyInventory);
  inventoryRoutes.patch('/my/:id/purchase', authMiddleware, inventoryController.buyMyInventory);
  inventoryRoutes.patch(
    '/my/:id/threshold',
    authMiddleware,
    inventoryController.updateMylowStockThreshold,
  );
  inventoryRoutes.patch('/:id/remove', authMiddleware, inventoryController.removeMyInventoryStock);

  return inventoryRoutes;
}
