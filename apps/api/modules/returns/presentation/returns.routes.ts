import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { vendorMiddleware } from '../../../middleware/vendor';
import type { ReturnsController } from './returns.controller';

export function createReturnsRoutes(returnsController: ReturnsController) {
  const ReturnRoutes = new Hono();

  // Buyer
  ReturnRoutes.post('/my', authMiddleware, returnsController.createMyReturn);
  ReturnRoutes.get('/my/all', authMiddleware, returnsController.getMyReturns);
  ReturnRoutes.get('/my/:id', authMiddleware, returnsController.getMyReturnById);
  ReturnRoutes.post('/my/:id/cancel', authMiddleware, returnsController.cancelMyReturn);

  // Vendor
  ReturnRoutes.get(
    '/vendor/all',
    authMiddleware,
    vendorMiddleware,
    returnsController.getVendorReturns,
  );
  ReturnRoutes.get(
    '/vendor/:id',
    authMiddleware,
    vendorMiddleware,
    returnsController.getVendorReturnById,
  );
  ReturnRoutes.post(
    '/vendor/:id/approve',
    authMiddleware,
    vendorMiddleware,
    returnsController.approveVendorReturn,
  );
  ReturnRoutes.post(
    '/vendor/:id/reject',
    authMiddleware,
    vendorMiddleware,
    returnsController.rejectVendorReturn,
  );
  ReturnRoutes.post(
    '/vendor/:id/shipped-back',
    authMiddleware,
    vendorMiddleware,
    returnsController.shippedBackVendorReturn,
  );
  ReturnRoutes.post(
    '/vendor/:id/received',
    authMiddleware,
    vendorMiddleware,
    returnsController.receivedVendorReturn,
  );

  // Admin
  ReturnRoutes.get(
    '/admin/all',
    authMiddleware,
    adminMiddleware,
    returnsController.getAdminReturns,
  );
  ReturnRoutes.get(
    '/admin/:id',
    authMiddleware,
    adminMiddleware,
    returnsController.getAdminReturnById,
  );
  ReturnRoutes.post(
    '/admin/:id/approve',
    authMiddleware,
    adminMiddleware,
    returnsController.approveAdminReturn,
  );
  ReturnRoutes.post(
    '/admin/:id/reject',
    authMiddleware,
    adminMiddleware,
    returnsController.rejectAdminReturn,
  );
  ReturnRoutes.post(
    '/admin/:id/shipped-back',
    authMiddleware,
    adminMiddleware,
    returnsController.shippedBackAdminReturn,
  );
  ReturnRoutes.post(
    '/admin/:id/received',
    authMiddleware,
    adminMiddleware,
    returnsController.receivedAdminReturn,
  );
  ReturnRoutes.post(
    '/admin/:id/cancel',
    authMiddleware,
    adminMiddleware,
    returnsController.cancelAdminReturn,
  );
  ReturnRoutes.delete(
    '/admin/:id',
    authMiddleware,
    adminMiddleware,
    returnsController.deleteReturn,
  );
  ReturnRoutes.patch(
    '/admin/:id/recover',
    authMiddleware,
    adminMiddleware,
    returnsController.recoverReturn,
  );

  return ReturnRoutes;
}
