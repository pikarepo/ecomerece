import { z } from 'zod';
import { clerkUserIdSchema, reasonSchema } from '../../dtos';

export const RoleSchema = z.enum(['customer', 'vendor', 'admin'], {
  message: 'Role must be customer, vendor, or admin',
});

export const UserRoleDtoSchema = z.object({
  role: RoleSchema.default('customer'),
  userId: clerkUserIdSchema,
  reason: reasonSchema,
});

export type UserRoleDto = z.infer<typeof UserRoleDtoSchema>;
