import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import type { createAddressModule } from '../address.module';

type AddressController = ReturnType<typeof createAddressModule>['addressController'];

/**
 * Path convention: scope (`my` | `admin`), then `all` or `:id`, then the command.
 * Addresses are always read through the buyer's own scope; the old unscoped
 * `GET /:id` invited callers to treat the router as a global address table.
 */
export function createAddressRoutes(addressController: AddressController) {
  const AddressRoutes = new Hono();

  // Buyer
  AddressRoutes.get('/my', authMiddleware, addressController.getMyAddresses);
  AddressRoutes.post('/my', authMiddleware, addressController.createMyAddress);
  AddressRoutes.get('/my/:id', authMiddleware, addressController.getAddressById);
  AddressRoutes.patch('/my/:id', authMiddleware, addressController.updateMyAddress);
  AddressRoutes.delete('/my/:id', authMiddleware, addressController.deleteMyAddress);
  AddressRoutes.patch('/my/:id/default', authMiddleware, addressController.setMyAddressAsDefault);

  // Admin
  AddressRoutes.get(
    '/admin/all',
    authMiddleware,
    adminMiddleware,
    addressController.getAdminPaginatedAddresses,
  );
  AddressRoutes.patch(
    '/admin/:id/recover',
    authMiddleware,
    adminMiddleware,
    addressController.recoverAddress,
  );

  return AddressRoutes;
}
