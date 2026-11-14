import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { initAuthMiddleware } from '../../../middleware/init-auth';
import type { createUserModule } from '../user.module';

type UserController = ReturnType<typeof createUserModule>['userController'];

export function createUserRoutes(userController: UserController) {
  const usersRoutes = new Hono();
  usersRoutes.post('/init', initAuthMiddleware, userController.initUser);
  usersRoutes.get('/me', authMiddleware, userController.getMe);
  usersRoutes.delete('/me/soft', authMiddleware, userController.softDeleteMe);
  usersRoutes.get('/', authMiddleware, adminMiddleware, userController.getPaginatedUsers);
  usersRoutes.get(
    '/admin/all',
    authMiddleware,
    adminMiddleware,
    userController.getAdminPaginatedUsers,
  );
  usersRoutes.patch('/block/lift', authMiddleware, adminMiddleware, userController.blockLift);
  usersRoutes.patch('/ban/lift', authMiddleware, adminMiddleware, userController.banLift);
  usersRoutes.patch('/ban/extend', authMiddleware, adminMiddleware, userController.extendBan);
  usersRoutes.patch('/ban/short', authMiddleware, adminMiddleware, userController.shortBan);
  usersRoutes.patch('/block', authMiddleware, adminMiddleware, userController.blockUser);
  usersRoutes.patch('/ban', authMiddleware, adminMiddleware, userController.banUser);
  usersRoutes.patch('/role', authMiddleware, adminMiddleware, userController.assignRole);
  usersRoutes.patch('/recover', authMiddleware, adminMiddleware, userController.recover);
  usersRoutes.delete('/soft', authMiddleware, adminMiddleware, userController.softDelete);

  usersRoutes.get('/:id', authMiddleware, adminMiddleware, userController.getUserById);

  return usersRoutes;
}
