import { NameInfoVO, UserAggregate, UserRoleVO } from '@ecomerece/domain';
import { EmailVO } from '@ecomerece/domain/value-objects/email.vo';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { PersonName } from '@ecomerece/domain/value-objects/name.vo';
import { Quantity } from '@ecomerece/domain/value-objects/quantity.vo';
import { Reason } from '@ecomerece/domain/value-objects/reason.vo';
import { UrlVO } from '@ecomerece/domain/value-objects/url.vo';
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
import type { FilterQuery } from 'mongoose';
import type { InMemoryEventBus } from '../../../core/infrastructure/buses/in-memory-event-bus';
import { BaseService } from '../../../core/services/base.services';
import { BadRequestError } from '../../../errors/app-error';
import { getUserById } from '../../../lib/supabase';
import { UserMapper } from '../infrastructure/user.mapper';
import type { UserPersistence } from '../infrastructure/user.models';
import type { UserRepository } from '../infrastructure/user.repository';
import { UserMessages, type UserMessagesType } from '../presentation/user.messages';

export class UserAppService extends BaseService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly eventBus: InMemoryEventBus,
  ) {
    super();
  }

  private async publishEvents(user: UserAggregate): Promise<void> {
    const events = user.pullEvents();
    if (events.length > 0) {
      await this.eventBus.publish(events);
    }
  }

  async initUser(userId: string) {
    const SupabaseUser = await getUserById(userId);

    if (!SupabaseUser.email) throw new BadRequestError('Invalid user.');

    const email = EmailVO.create(SupabaseUser.email);

    const id = Id.create(userId);
    const user = await this.userRepo.FindById(id);

    if (user) {
      user.loginUser();
      await this.userRepo.Save(user);
      await this.publishEvents(user);

      return UserMessages.initialized(id);
    }

    const image = new UrlVO(
      SupabaseUser.user_metadata?.avatar_url || SupabaseUser.user_metadata?.picture,
    );
    const fullName = SupabaseUser.user_metadata.full_name;
    const nameArray = fullName.trim().split(/\s+/);
    const firstName = nameArray[0] || '';
    const lastName = nameArray.length > 1 ? nameArray[nameArray.length - 1] : '';
    const middleName = nameArray.length > 2 ? nameArray.slice(1, -1).join(' ') : '';
    const name = NameInfoVO.create(
      PersonName.create(firstName ?? ''),
      middleName ? PersonName.create(middleName) : null,
      lastName ? PersonName.create(lastName) : null,
    );
    const User = UserAggregate.create({
      id,
      name,
      email,
      image,
    });
    User.signIn(User.id);
    await this.userRepo.Create(User);
    await this.publishEvents(User);
    return UserMessages.initialized(id);
  }

  async getUserById(userId: string): Promise<UserResponseReadModel> {
    const id = Id.create(userId);
    const user = await this.userRepo.FindByIdOrThrow(id);
    return UserMapper.aggregateToResponseReadModel(user);
  }

  async assignRole(data: UserRoleDto, actor: UserPersistence): Promise<UserMessagesType> {
    const actorId = Id.create(actor._id);
    const id = Id.create(data.userId);
    const role = UserRoleVO.create(data.role);
    const reason = Reason.create(data.reason);
    const user = await this.userRepo.FindByIdOrThrow(id);
    user.assignRole(role, actorId, reason);
    await this.userRepo.Save(user);
    await this.publishEvents(user);

    return UserMessages.assignRole(id, role, actorId);
  }

  async getMe(actor: UserPersistence): Promise<UserResponseReadModel> {
    const id = Id.create(actor._id);
    const user = await this.userRepo.FindByIdOrThrow(id);
    return UserMapper.aggregateToResponseReadModel(user);
  }
  async softDeleteUser(data: DeleteUserDTO, actor: UserPersistence): Promise<UserMessagesType> {
    const actorId = Id.create(actor._id);
    const id = Id.create(data.userId);
    const user = await this.userRepo.FindByIdOrThrow(id);
    const reason = Reason.create(data.reason);
    user.deleteUser(actorId, reason);
    await this.userRepo.Save(user);
    await this.publishEvents(user);

    return UserMessages.delete(id, actorId);
  }

  async softDeleteMe(data: DeleteMeDTO, actor: UserPersistence): Promise<UserMessagesType> {
    const actorId = Id.create(actor._id);
    const user = await this.userRepo.FindByIdOrThrow(actorId);
    const reason = Reason.create(data.reason);
    user.deleteUser(actorId, reason);
    await this.userRepo.Save(user);
    await this.publishEvents(user);

    return UserMessages.delete(actorId, actorId);
  }
  async recoverUser(id: string, actor: UserPersistence): Promise<UserMessagesType> {
    const actorId = Id.create(actor._id);
    const userId = Id.create(id);
    const user = await this.userRepo.FindByIdOrThrow(userId);
    user.recoverUser(actorId);
    await this.userRepo.Save(user);
    await this.publishEvents(user);

    return UserMessages.recover(userId, actorId);
  }
  async blockUser(data: BlockUserDTO, actor: UserPersistence): Promise<UserMessagesType> {
    const id = Id.create(data.userId);
    const actorId = Id.create(actor._id);
    const reason = Reason.create(data.reason);
    const user = await this.userRepo.FindByIdOrThrow(id);
    user.blockUser(actorId, reason);
    await this.userRepo.Save(user);
    await this.publishEvents(user);

    return UserMessages.block(id, actorId);
  }
  async blockLift(userId: string, actor: UserPersistence): Promise<UserMessagesType> {
    const id = Id.create(userId);
    const actorId = Id.create(actor._id);

    const user = await this.userRepo.FindByIdOrThrow(id);

    user.unBlockUser(actorId);

    await this.userRepo.Save(user);
    await this.publishEvents(user);

    return UserMessages.blockLift(id, actorId);
  }
  async banUser(data: BanUserDTO, actor: UserPersistence): Promise<UserMessagesType> {
    const id = Id.create(data.userId);
    const actorId = Id.create(actor._id);
    const reason = Reason.create(data.reason);
    const user = await this.userRepo.FindByIdOrThrow(id);
    user.banUser(actorId, data.forDays, reason);
    await this.userRepo.Save(user);
    await this.publishEvents(user);

    return UserMessages.ban(id, actorId, data.forDays);
  }
  async banLift(userId: string, actor: UserPersistence): Promise<UserMessagesType> {
    const id = Id.create(userId);
    const actorId = Id.create(actor._id);
    const user = await this.userRepo.FindByIdOrThrow(id);
    user.unBanUser(actorId);
    await this.userRepo.Save(user);
    await this.publishEvents(user);

    return UserMessages.banLift(id, actorId);
  }
  async extendBan(data: ExtendBanDTO, actor: UserPersistence): Promise<UserMessagesType> {
    const id = Id.create(data.userId);
    const actorId = Id.create(actor._id);
    const user = await this.userRepo.FindByIdOrThrow(id);
    user.extendBan(actorId, data.forDays);
    await this.userRepo.Save(user);
    await this.publishEvents(user);

    return UserMessages.extendBan(id, actorId, data.forDays);
  }
  async shortenBan(data: ExtendBanDTO, actor: UserPersistence): Promise<UserMessagesType> {
    const id = Id.create(data.userId);
    const actorId = Id.create(actor._id);
    const user = await this.userRepo.FindByIdOrThrow(id);
    user.shortenBan(actorId, data.forDays);
    await this.userRepo.Save(user);
    await this.publishEvents(user);

    return UserMessages.shortBan(id, actorId, data.forDays);
  }

  // Public: non-deleted users — accessible to authenticated users
  async findPublicPaginatedUsers(query: GetPaginatedUsersQueryDto) {
    const filter: FilterQuery<UserPersistence> = {
      'deleted.deleted': false,
    };
    if (query.search) {
      filter['name.fullName'] = { $regex: query.search, $options: 'i' } as any;
    }
    const cursor = query.cursor ? Id.create(query.cursor) : undefined;
    const limit = query.limit ? Quantity.create(query.limit) : undefined;
    const result = await this.userRepo.FindPaginated({
      filter,
      cursor,
      limit,
      direction: query.direction,
    });
    return {
      data: result.data.map((u) => UserMapper.aggregateToResponseReadModel(u)),
      meta: result.meta,
    };
  }

  // Admin: all users — no baseline restrictions, optional filters
  async findAdminPaginatedUsers(query: GetAdminPaginatedUsersQueryDto) {
    const filter: FilterQuery<UserPersistence> = {};
    if (query.search) {
      filter['name.fullName'] = { $regex: query.search, $options: 'i' } as any;
    }
    if (query.role) filter['role.role'] = query.role;
    if (query.deleted !== undefined) filter['deleted.deleted'] = query.deleted;
    if (query.blocked !== undefined) filter['block.blocked'] = query.blocked;
    if (query.banned !== undefined) filter['ban.banned'] = query.banned;
    const cursor = query.cursor ? Id.create(query.cursor) : undefined;
    const limit = query.limit ? Quantity.create(query.limit) : undefined;
    const result = await this.userRepo.FindPaginated({
      filter,
      cursor,
      limit,
      direction: query.direction,
    });
    return {
      data: result.data.map((u) => UserMapper.aggregateToResponseReadModel(u)),
      meta: result.meta,
    };
  }
}
