import type { UserRolesType } from '../value-objects/role-info.vo';

export interface UserReadModel {
  id: string;
  fullName: string;
  email: string | null;
  image: string | null;
  role: UserRolesType;
  isBlocked: boolean;
  isBanned: boolean;
  bannedUntil: Date | null;
  isDeleted: boolean;
  lastLogin: Date | null;
  createdAt: Date;
}
