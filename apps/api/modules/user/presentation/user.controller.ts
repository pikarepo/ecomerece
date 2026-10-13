import {
  BanUserDTOSchema,
  BlockUserDTOSchema,
  DeleteMeDTOSchema,
  DeleteUserDTOSchema,
  ExtendBanDTOSchema,
  getAdminPaginatedUsersQuerySchema,
  getPaginatedUsersQuerySchema,
  idSchema,
  ObjUserIdDTOSchema,
  UserRoleDtoSchema,
} from '@ecomerece/shared';
import type { Context } from 'hono';
import { BaseController } from '../../../core/controller/base.controller';
import { clerkUserIdSchema } from '../../../shared/validation/clerkSchema';
import type { UserAppService } from '../application/user.app.service';

export class UserController extends BaseController<UserAppService> {
  getPaginatedUsers = async (c: Context) => {
    const query = this.query(c, getPaginatedUsersQuerySchema);
    return this.ok(c, await this.service.findPublicPaginatedUsers(query));
  };

  getAdminPaginatedUsers = async (c: Context) => {
    const query = this.query(c, getAdminPaginatedUsersQuerySchema);
    return this.ok(c, await this.service.findAdminPaginatedUsers(query));
  };

  getUserById = async (c: Context) => {
    const clerkId = this.param(c, 'id', clerkUserIdSchema);
    return this.ok(c, await this.service.getUserById(clerkId));
  };
  initUser = async (c: Context) => {
    const id = c.get('userId');

    return this.accepted(c, await this.service.initUser(id));
  };
  assignRole = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, UserRoleDtoSchema);
    return this.ok(c, await this.service.assignRole(data, actor));
  };

  getMe = async (c: Context) => {
    const actor = c.get('user');
    return this.ok(c, await this.service.getMe(actor));
  };
  blockUser = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, BlockUserDTOSchema);
    return this.ok(c, await this.service.blockUser(data, actor));
  };
  blockLift = async (c: Context) => {
    const actor = c.get('user');

    const data = await this.body(c, ObjUserIdDTOSchema);

    return this.ok(c, await this.service.blockLift(data.userId, actor));
  };
  banUser = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, BanUserDTOSchema);
    return this.ok(c, await this.service.banUser(data, actor));
  };

  banLift = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, ObjUserIdDTOSchema);
    return this.ok(c, await this.service.banLift(data.userId, actor));
  };
  extendBan = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, ExtendBanDTOSchema);
    return this.ok(c, await this.service.extendBan(data, actor));
  };
  shortBan = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, ExtendBanDTOSchema);
    return this.ok(c, await this.service.shortenBan(data, actor));
  };
  softDelete = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, DeleteUserDTOSchema);
    return this.ok(c, await this.service.softDeleteUser(data, actor));
  };
  recover = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, ObjUserIdDTOSchema);
    return this.ok(c, await this.service.recoverUser(data.userId, actor));
  };
  softDeleteMe = async (c: Context) => {
    const actor = c.get('user');
    const data = await this.body(c, DeleteMeDTOSchema);
    return this.ok(c, await this.service.softDeleteMe(data, actor));
  };
}
