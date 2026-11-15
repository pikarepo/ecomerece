import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { vendorMiddleware } from '../../../middleware/vendor';
import type { createInventoryModule } from '../inventory.module';

type InventoryController = ReturnType<typeof createInventoryModule>['inventoryController'];

/**
 * Stock rows hold the vendor's policy (reservations, thresholds), so only the
 * public availability projection is unauthenticated. Vendor and admin scopes
 * are separate routes with their own middleware.
 */
export function createInventoryRoutes(inventoryController: InventoryController) {
  const inventoryRoutes = new Hono();

  // Public: availability for one variant.
  inventoryRoutes.get('/variant/:id', inventoryController.getPublicInventoryByVariantId);

  // Vendor
  inventoryRoutes.get(
    '/vendor/all',
    authMiddleware,
    vendorMiddleware,
    inventoryController.getVendorPaginatedInventory,
  );
  inventoryRoutes.get(
    '/vendor/:id',
    authMiddleware,
    vendorMiddleware,
    inventoryController.getVendorInventoryById,
  );
  inventoryRoutes.post(
    '/vendor',
    authMiddleware,
    vendorMiddleware,
    inventoryController.createMyInventory,
  );
  inventoryRoutes.delete(
    '/vendor/:id',
    authMiddleware,
    vendorMiddleware,
    inventoryController.deleteMyInventory,
  );
  inventoryRoutes.patch(
    '/vendor/:id/purchase',
    authMiddleware,
    vendorMiddleware,
    inventoryController.buyMyInventory,
  );
  inventoryRoutes.patch(
    '/vendor/:id/threshold',
    authMiddleware,
    vendorMiddleware,
    inventoryController.updateMylowStockThreshold,
  );
  inventoryRoutes.patch(
    '/vendor/:id/remove',
    authMiddleware,
    vendorMiddleware,
    inventoryController.removeMyInventoryStock,
  );

  // Admin
  inventoryRoutes.get(
    '/admin/all',
    authMiddleware,
    adminMiddleware,
    inventoryController.getAdminPaginatedInventory,
  );
  inventoryRoutes.get(
    '/admin/:id',
    authMiddleware,
    adminMiddleware,
    inventoryController.getAdminInventoryById,
  );
  inventoryRoutes.post(
    '/admin',
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

  return inventoryRoutes;
}
