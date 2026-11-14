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
  inventoryRoutes.get(
    '/admin/:id',
    authMiddleware,
    adminMiddleware,
    inventoryController.getAdminInventoryById,
  );
  inventoryRoutes.post(
    '/admin/create',
    authMiddleware,
    adminMiddleware,
    inventoryController.createInventory,
  );
  inventoryRoutes.patch(
    '/admin/:id/restock',
    authMiddleware,
    adminMiddleware,
    inventoryController.buyAdminInventory,
  );
  inventoryRoutes.patch(
    '/admin/:id/threshold',
    authMiddleware,
    adminMiddleware,
    inventoryController.updateAdminLowStockThreshold,
  );
  inventoryRoutes.patch(
    '/admin/:id/remove',
    authMiddleware,
    adminMiddleware,
    inventoryController.removeAdminInventoryStock,
  );
  inventoryRoutes.delete(
    '/admin/:id',
    authMiddleware,
    adminMiddleware,
    inventoryController.deleteAdminInventory,
  );
  inventoryRoutes.get('/:id', inventoryController.getInventoryByVarientId);
  inventoryRoutes.get('/my/all', authMiddleware, inventoryController.getVendorPaginatedInventory);
  inventoryRoutes.get('/my/:id', authMiddleware, inventoryController.getVendorInventoryById);
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
