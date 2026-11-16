import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { vendorMiddleware } from '../../../middleware/vendor';
import type { ShippingController } from './shipping.controller';

export function createShippingRoutes(shippingController: ShippingController) {
  const ShippingRoutes = new Hono();

  // Public — the tracking number is the credential.
  ShippingRoutes.get('/track/:trackingNumber', shippingController.trackShipment);

  // Buyer
  ShippingRoutes.get('/my/all', authMiddleware, shippingController.getMyShipments);
  ShippingRoutes.get('/my/:id', authMiddleware, shippingController.getMyShipmentById);

  // Vendor
  ShippingRoutes.get(
    '/vendor/all',
    authMiddleware,
    vendorMiddleware,
    shippingController.getVendorShipments,
  );
  ShippingRoutes.post(
    '/vendor',
    authMiddleware,
    vendorMiddleware,
    shippingController.createVendorShipment,
  );
  ShippingRoutes.get(
    '/vendor/:id',
    authMiddleware,
    vendorMiddleware,
    shippingController.getVendorShipmentById,
  );
  ShippingRoutes.patch(
    '/vendor/:id',
    authMiddleware,
    vendorMiddleware,
    shippingController.assignVendorTracking,
  );
  ShippingRoutes.post(
    '/vendor/:id/dispatch',
    authMiddleware,
    vendorMiddleware,
    shippingController.dispatchVendorShipment,
  );
  ShippingRoutes.post(
    '/vendor/:id/in-transit',
    authMiddleware,
    vendorMiddleware,
    shippingController.inTransitVendorShipment,
  );
  ShippingRoutes.post(
    '/vendor/:id/out-for-delivery',
    authMiddleware,
    vendorMiddleware,
    shippingController.outForDeliveryVendorShipment,
  );
  ShippingRoutes.post(
    '/vendor/:id/deliver',
    authMiddleware,
    vendorMiddleware,
    shippingController.deliverVendorShipment,
  );
  ShippingRoutes.post(
    '/vendor/:id/fail',
    authMiddleware,
    vendorMiddleware,
    shippingController.failVendorShipment,
  );
  ShippingRoutes.post(
    '/vendor/:id/return',
    authMiddleware,
    vendorMiddleware,
    shippingController.returnVendorShipment,
  );
  ShippingRoutes.post(
    '/vendor/:id/cancel',
    authMiddleware,
    vendorMiddleware,
    shippingController.cancelVendorShipment,
  );

  // Admin
  ShippingRoutes.get(
    '/admin/all',
    authMiddleware,
    adminMiddleware,
    shippingController.getAdminShipments,
  );
  ShippingRoutes.post(
    '/admin',
    authMiddleware,
    adminMiddleware,
    shippingController.createAdminShipment,
  );
  ShippingRoutes.get(
    '/admin/:id',
    authMiddleware,
    adminMiddleware,
    shippingController.getAdminShipmentById,
  );
  ShippingRoutes.patch(
    '/admin/:id',
    authMiddleware,
    adminMiddleware,
    shippingController.assignAdminTracking,
  );
  ShippingRoutes.post(
    '/admin/:id/dispatch',
    authMiddleware,
    adminMiddleware,
    shippingController.dispatchAdminShipment,
  );
  ShippingRoutes.post(
    '/admin/:id/in-transit',
    authMiddleware,
    adminMiddleware,
    shippingController.inTransitAdminShipment,
  );
  ShippingRoutes.post(
    '/admin/:id/out-for-delivery',
    authMiddleware,
    adminMiddleware,
    shippingController.outForDeliveryAdminShipment,
  );
  ShippingRoutes.post(
    '/admin/:id/deliver',
    authMiddleware,
    adminMiddleware,
    shippingController.deliverAdminShipment,
  );
  ShippingRoutes.post(
    '/admin/:id/fail',
    authMiddleware,
    adminMiddleware,
    shippingController.failAdminShipment,
  );
  ShippingRoutes.post(
    '/admin/:id/return',
    authMiddleware,
    adminMiddleware,
    shippingController.returnAdminShipment,
  );
  ShippingRoutes.post(
    '/admin/:id/cancel',
    authMiddleware,
    adminMiddleware,
    shippingController.cancelAdminShipment,
  );
  ShippingRoutes.delete(
    '/admin/:id',
    authMiddleware,
    adminMiddleware,
    shippingController.deleteShipment,
  );
  ShippingRoutes.patch(
    '/admin/:id/recover',
    authMiddleware,
    adminMiddleware,
    shippingController.recoverShipment,
  );

  return ShippingRoutes;
}
