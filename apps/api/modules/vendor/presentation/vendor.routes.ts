import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import type { CreateVendorModule } from '../vendor.module';

type VendorController = ReturnType<typeof CreateVendorModule>['vendorController'];

/**
 * Public reads return the storefront projection; `/me` is the owner's own
 * record and `/admin` is the only scope that sees contact details and stats.
 */
export function createVendorRoutes(vendorController: VendorController) {
  const vendorRoutes = new Hono();

  // Public
  vendorRoutes.get('/', vendorController.getPaginatedVendors);

  // Owner
  vendorRoutes.get('/me', authMiddleware, vendorController.getMyVendor);
  vendorRoutes.post('/me', authMiddleware, vendorController.createMyVendor);
  vendorRoutes.patch('/me/meta', authMiddleware, vendorController.updateMyVendorMeta);
  vendorRoutes.patch('/me/contact', authMiddleware, vendorController.updateMyVendorContact);
  vendorRoutes.patch('/me/image', authMiddleware, vendorController.updateMyVendorImage);
  vendorRoutes.patch('/me/stats-refresh', authMiddleware, vendorController.updateMyStatsRefresh);
  vendorRoutes.delete('/me', authMiddleware, vendorController.deleteMyVendor);

  // Admin
  vendorRoutes.get(
    '/admin/all',
    authMiddleware,
    adminMiddleware,
    vendorController.getAdminPaginatedVendors,
  );
  vendorRoutes.get(
    '/admin/:id',
    authMiddleware,
    adminMiddleware,
    vendorController.getAdminVendorById,
  );
  vendorRoutes.delete(
    '/admin/soft',
    authMiddleware,
    adminMiddleware,
    vendorController.softDeleteVendor,
  );
  vendorRoutes.patch(
    '/admin/recover',
    authMiddleware,
    adminMiddleware,
    vendorController.recoverVendor,
  );
  vendorRoutes.patch(
    '/admin/verify',
    authMiddleware,
    adminMiddleware,
    vendorController.verifyVendor,
  );
  vendorRoutes.patch(
    '/admin/reject',
    authMiddleware,
    adminMiddleware,
    vendorController.rejectVendorVerification,
  );

  // Public detail last so `/me` and `/admin/...` match first.
  vendorRoutes.get('/:id', vendorController.getPublicVendorById);

  return vendorRoutes;
}
