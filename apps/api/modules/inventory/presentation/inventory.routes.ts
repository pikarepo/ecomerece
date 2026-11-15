import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { vendorMiddleware } from '../../../middleware/vendor';
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
  inventoryRoutes.get(
    '/my/all',
    authMiddleware,
    vendorMiddleware,
    inventoryController.getVendorPaginatedInventory,
  );
  inventoryRoutes.get(
    '/my/:id',
    authMiddleware,
    vendorMiddleware,
    inventoryController.getVendorInventoryById,
  );
  inventoryRoutes.post(
    '/my/create',
    authMiddleware,
    vendorMiddleware,
    inventoryController.createMyInventory,
  );
  inventoryRoutes.delete(
    '/my/:id',
    authMiddleware,
    vendorMiddleware,
    inventoryController.deleteMyInventory,
  );
  inventoryRoutes.patch(
    '/my/:id/purchase',
    authMiddleware,
    vendorMiddleware,
    inventoryController.buyMyInventory,
  );
  inventoryRoutes.patch(
    '/my/:id/threshold',
    authMiddleware,
    vendorMiddleware,
    inventoryController.updateMylowStockThreshold,
  );
  inventoryRoutes.patch(
    '/:id/remove',
    authMiddleware,
    vendorMiddleware,
    inventoryController.removeMyInventoryStock,
  );
  inventoryRoutes.get('/:id', inventoryController.getInventoryByVarientId);

  return inventoryRoutes;
}
