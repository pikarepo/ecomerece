import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { createAddressModule } from '../address.module';

export const AddressRoutes = new Hono();

const { addressController } = createAddressModule();

AddressRoutes.get('/my', authMiddleware, addressController.getMyAddresses);
AddressRoutes.get(
  '/admin/all',
  authMiddleware,
  adminMiddleware,
  addressController.getAdminPaginatedAddresses,
);
AddressRoutes.post('/my', authMiddleware, addressController.createMyAddress);
AddressRoutes.delete('/my/:id', authMiddleware, addressController.deleteMyAddress);
AddressRoutes.patch('/my/:id/default', authMiddleware, addressController.setMyAddressAsDefault);
AddressRoutes.patch('/my/:id/update', authMiddleware, addressController.updateMyAddress);
AddressRoutes.patch(
  '/my/:id/recover',
  authMiddleware,
  adminMiddleware,
  addressController.recoverAddress,
);
