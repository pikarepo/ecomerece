// user.service.ts

import type {
  BanUserDTO,
  BlockUserDTO,
  DeleteMeDTO,
  DeleteUserDTO,
  ExtendBanDTO,
  GetAdminPaginatedUsersQueryDto,
  GetPaginatedUsersQueryDto,
  UserResponseReadModel,
  UserRoleDto,
} from '@ecomerece/shared';
import { http } from './../../lib';

/** Matches the backend's `{ success: true, data: { updatedData?, message } }` mutation envelope. */
export type UserMutationResult = {
  message: string;
  updatedData?: UserResponseReadModel;
};

export type PaginatedUsersResult = {
  data: UserResponseReadModel[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
};

export class UserService {
  getMe(): Promise<UserResponseReadModel> {
    return http.get<UserResponseReadModel>('/users/me');
  }

  getUserById(id: string): Promise<UserResponseReadModel> {
    return http.get<UserResponseReadModel>(`/users/${id}`);
  }

  getPaginatedUsers(params: GetPaginatedUsersQueryDto): Promise<PaginatedUsersResult> {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set('search', params.search);
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const qs = searchParams.toString();
    return http.get<PaginatedUsersResult>(`/users${qs ? `?${qs}` : ''}`);
  }

  getAdminPaginatedUsers(params: GetAdminPaginatedUsersQueryDto): Promise<PaginatedUsersResult> {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set('search', params.search);
    if (params.role) searchParams.set('role', params.role);
    if (params.deleted !== undefined) searchParams.set('deleted', String(params.deleted));
    if (params.blocked !== undefined) searchParams.set('blocked', String(params.blocked));
    if (params.banned !== undefined) searchParams.set('banned', String(params.banned));
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.direction) searchParams.set('direction', params.direction);
    const qs = searchParams.toString();
    return http.get<PaginatedUsersResult>(`/users/admin/all${qs ? `?${qs}` : ''}`);
  }

  assignRole(data: UserRoleDto): Promise<UserMutationResult> {
    return http.patch<UserMutationResult>('/users/role', data);
  }

  softDeleteUser(data: DeleteUserDTO): Promise<UserMutationResult> {
    return http.delete<UserMutationResult>('/users/soft', data);
  }

  softDeleteMe(data?: DeleteMeDTO): Promise<UserMutationResult> {
    return http.delete<UserMutationResult>('/users/me/soft', data);
  }

  recoverUser(userId: string): Promise<UserMutationResult> {
    return http.patch<UserMutationResult>('/users/recover', { userId });
  }

  blockUser(data: BlockUserDTO): Promise<UserMutationResult> {
    return http.patch<UserMutationResult>('/users/block', data);
  }

  blockLift(userId: string): Promise<UserMutationResult> {
    return http.patch<UserMutationResult>('/users/block/lift', { userId });
  }

  banUser(data: BanUserDTO): Promise<UserMutationResult> {
    return http.patch<UserMutationResult>('/users/ban', data);
  }

  banLift(userId: string): Promise<UserMutationResult> {
    return http.patch<UserMutationResult>('/users/ban/lift', { userId });
  }

  extendBan(data: ExtendBanDTO): Promise<UserMutationResult> {
    return http.patch<UserMutationResult>('/users/ban/extend', data);
  }

  shortenBan(data: ExtendBanDTO): Promise<UserMutationResult> {
    return http.patch<UserMutationResult>('/users/ban/short', data);
  }
}

export const userService = new UserService();
