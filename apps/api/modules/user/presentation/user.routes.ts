import { Hono } from 'hono';
import { adminMiddleware } from '../../../middleware/admin';
import { authMiddleware } from '../../../middleware/auth';
import { initAuthMiddleware } from '../../../middleware/init-auth';
import type { createUserModule } from '../user.module';

type UserController = ReturnType<typeof createUserModule>['userController'];

/**
 * User accounts split into two audiences: `/my` is always the caller and only
 * ever returns the caller's own record; `/admin` is the only way to address
 * somebody else. There is no unscoped user lookup.
 */
export function createUserRoutes(userController: UserController) {
  const usersRoutes = new Hono();

  usersRoutes.post('/init', initAuthMiddleware, userController.initUser);

  // Self
  usersRoutes.get('/my', authMiddleware, userController.getMe);
  usersRoutes.delete('/my', authMiddleware, userController.softDeleteMe);

  // Admin
  usersRoutes.get(
    '/admin/all',
    authMiddleware,
    adminMiddleware,
    userController.getAdminPaginatedUsers,
  );
  usersRoutes.get('/admin/:id', authMiddleware, adminMiddleware, userController.getUserById);
  usersRoutes.patch('/admin/block', authMiddleware, adminMiddleware, userController.blockUser);
  usersRoutes.patch('/admin/block/lift', authMiddleware, adminMiddleware, userController.blockLift);
  usersRoutes.patch('/admin/ban', authMiddleware, adminMiddleware, userController.banUser);
  usersRoutes.patch('/admin/ban/lift', authMiddleware, adminMiddleware, userController.banLift);
  usersRoutes.patch('/admin/ban/extend', authMiddleware, adminMiddleware, userController.extendBan);
  usersRoutes.patch('/admin/ban/short', authMiddleware, adminMiddleware, userController.shortBan);
  usersRoutes.patch('/admin/role', authMiddleware, adminMiddleware, userController.assignRole);
  usersRoutes.patch('/admin/recover', authMiddleware, adminMiddleware, userController.recover);
  usersRoutes.delete('/admin/soft', authMiddleware, adminMiddleware, userController.softDelete);

  return usersRoutes;
}
