import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import type { CreateVendorModule } from '../vendor.module';

type VendorController = ReturnType<typeof CreateVendorModule>['vendorController'];

export function createVendorRoutes(vendorController: VendorController) {
  const vendorRoutes = new Hono();

vendorRoutes.post('/my', authMiddleware, vendorController.createMyVendor);
vendorRoutes.get('/my', authMiddleware, vendorController.getMyVendor);
vendorRoutes.patch('/my/meta', authMiddleware, vendorController.updateMyVendorMeta);
vendorRoutes.patch('/my/contact', authMiddleware, vendorController.updateMyVendorContact);
vendorRoutes.patch('/my/image', authMiddleware, vendorController.updateMyVendorImage);
vendorRoutes.patch('/my/stats-refresh', authMiddleware, vendorController.updateMyStatsRefresh);
vendorRoutes.delete('/my', authMiddleware, vendorController.deleteMyVendor);
vendorRoutes.delete('/soft', authMiddleware, adminMiddleware, vendorController.softDeleteVendor);
vendorRoutes.patch('/recover', authMiddleware, adminMiddleware, vendorController.recoverVendor);
vendorRoutes.patch('/verify', authMiddleware, adminMiddleware, vendorController.verifyVendor);
vendorRoutes.patch(
  '/reject',
  authMiddleware,
  adminMiddleware,
  vendorController.rejectVendorVerification,
);
vendorRoutes.get('/', vendorController.getPaginatedVendors);
vendorRoutes.get(
  '/admin/all',
  authMiddleware,
  adminMiddleware,
  vendorController.getAdminPaginatedVendors,
);
vendorRoutes.get('/:id', vendorController.getVendorById);

  return vendorRoutes;
}
