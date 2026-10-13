import { BadRequestError } from '../../../../apps/api/errors/app-error';
import { AggregateRoot } from '../../aggregate-root';
import {
  BanInfoVO,
  BlockInfoVO,
  type DateVO,
  DeleteInfoVO,
  EffectiveDate,
  type EmailVO,
  ExpirationDate,
  type Id,
  Quantity,
  type Reason,
  type UrlVO,
} from '../../value-objects';
import { UserBanExtendedEvent } from './events/user-ban-extended.event';
import { UserBanLiftedEvent } from './events/user-ban-lifted.event';
import { UserBanShortenedEvent } from './events/user-ban-shortened.event';
import { UserBannedEvent } from './events/user-banned.event';
import { UserUnBlockLiftedEvent } from './events/user-block-lifted.event';
import { UserBlockedEvent } from './events/user-blocked.event';
import { UserDeleteLiftedEvent } from './events/user-delete-lifted.event';
import { UserDeletedEvent } from './events/user-deleted.event';
import { UserLoggedInEvent } from './events/user-logged-in.event';
import { UserRoleAssignedEvent } from './events/user-role-assigned.event';
import { UserSignedInEvent } from './events/user-signed-in.event';

import type { NameInfoVO } from './value-objects/name-info.vo';
import { RoleInfoVO, type UserRoleVO } from './value-objects/role-info.vo';

type CreateUserProps = {
  id: Id;
  name: NameInfoVO;
  email: EmailVO;
  image: UrlVO;
};

export class UserAggregate extends AggregateRoot {
  private constructor(
    private readonly _id: Id,
    private _name: NameInfoVO,
    private _email: EmailVO,
    private _image: UrlVO,
    private _role: RoleInfoVO,
    private _block: BlockInfoVO,
    private _ban: BanInfoVO,
    private _delete: DeleteInfoVO,
    private _lastLogin: DateVO | null,
    private _createdAt: DateVO,
    private _version: Quantity,
  ) {
    super();
  }
  get version() {
    return this._version;
  }

  get id() {
    return this._id;
  }
  get name() {
    return this._name;
  }
  get image() {
    return this._image;
  }
  get email() {
    return this._email;
  }
  get role() {
    return this._role;
  }

  get ban() {
    return this._ban;
  }

  get block() {
    return this._block;
  }

  get deleted() {
    return this._delete;
  }
  get lastLogin() {
    return this._lastLogin;
  }
  get createdAt() {
    return this._createdAt;
  }

  static create(props: CreateUserProps): UserAggregate {
    return new UserAggregate(
      props.id,
      props.name,
      props.email,
      props.image,
      RoleInfoVO.none(),
      BlockInfoVO.none(),
      BanInfoVO.none(),
      DeleteInfoVO.none(),
      null,
      EffectiveDate.today(),
      new Quantity(0),
    );
  }

  static rehydrate(
    id: Id,
    name: NameInfoVO,
    email: EmailVO,
    image: UrlVO,
    role: RoleInfoVO,
    block: BlockInfoVO,
    ban: BanInfoVO,
    deleted: DeleteInfoVO,
    lastLogin: DateVO | null,
    createdAt: DateVO,
    version: Quantity,
  ): UserAggregate {
    return new UserAggregate(
      id,
      name,
      email,
      image,
      role,
      block,
      ban,
      deleted,
      lastLogin,
      createdAt,
      version,
    );
  }
  signIn(id: Id): void {
    this.raise(new UserSignedInEvent({ userId: id }));
  }
  assignRole(role: UserRoleVO, actor: Id, reason: Reason): void {
    if (this._role.equals(role)) {
      throw new BadRequestError('User already has this role.');
    }
    this._role = RoleInfoVO.assigned(role, new EffectiveDate(new Date()), actor, reason);
    this.raise(new UserRoleAssignedEvent({ userId: this._id, roleInfo: this._role }));
  }

  banUser(actor: Id, days: number, reason: Reason): void {
    if (this._ban.isBan)
      throw new BadRequestError(
        `This user is already banned for ${this._ban.until?.remainingDays} days.`,
      );
    if (this._id.value === actor.value) throw new BadRequestError('You cannot ban yourself.');
    if (this._role.isAdmin) throw new BadRequestError('Administrators cannot be banned.');
    this._ban = BanInfoVO.create(
      actor,
      EffectiveDate.today(),
      ExpirationDate.fromDays(days),
      reason,
    );
    this.raise(new UserBannedEvent({ userId: this._id, banInfo: this._ban }));
  }

  blockUser(actor: Id, reason: Reason): void {
    if (this._block.isBlocked) throw new BadRequestError('This user is already blocked.');
    if (this._id.value === actor.value) throw new BadRequestError('You cannot block yourself.');
    if (this._role.isAdmin) throw new BadRequestError('Administrators cannot be blocked.');
    this._block = BlockInfoVO.create(actor, reason);
    this.raise(new UserBlockedEvent({ userId: this._id, blockInfo: this._block }));
  }

  deleteUser(actor: Id, reason: Reason): void {
    if (this._delete.isDeleted) throw new BadRequestError('This user has already been deleted.');
    if (this._role.isAdmin) throw new BadRequestError('Administrators cannot be deleted.');
    this._delete = DeleteInfoVO.create(actor, reason);
    this.raise(new UserDeletedEvent({ userId: this._id, deleteInfo: this._delete }));
  }
  loginUser(): void {
    if (this._ban.isBan)
      throw new BadRequestError(`This user is banned for ${this._ban.until?.remainingDays} days.`);
    if (this._block.isBlocked) throw new BadRequestError('This user is banned.');
    if (this._delete.isDeleted) throw new BadRequestError('This user was removed.');
    this._lastLogin = EffectiveDate.today();
    this.raise(new UserLoggedInEvent({ userId: this._id }));
  }

  extendBan(actor: Id, days: number): void {
    if (!this._ban.isBan) throw new BadRequestError('User is not banned.');
    if (this._id.value === actor.value)
      throw new BadRequestError('You cannot extend your own ban period.');
    if (this._role.isAdmin)
      throw new BadRequestError('An administrator ban period cannot be extended.');
    this._ban = this._ban.extend(days);
    this.raise(new UserBanExtendedEvent({ userId: this._id, banInfo: this._ban }));
  }

  shortenBan(actor: Id, days: number): void {
    if (!this._ban.isBan)
      throw new BadRequestError('The user must be banned before the ban period can be shortened.');
    if (this._id.value === actor.value)
      throw new BadRequestError('You cannot shorten your own ban period.');
    this._ban = this._ban.shorten(days);
    this.raise(new UserBanShortenedEvent({ userId: this._id, banInfo: this._ban }));
  }

  unBanUser(actor: Id): void {
    if (!this._ban.isBan) throw new BadRequestError('This user is not currently banned.');
    if (this._id.value === actor.value) throw new BadRequestError('You cannot unban yourself.');
    this._ban = BanInfoVO.none();
    this.raise(new UserBanLiftedEvent({ userId: this._id, banInfo: this._ban }));
  }

  unBlockUser(actor: Id): void {
    if (!this._block.isBlocked) throw new BadRequestError('This user is not currently blocked.');
    if (this._id.value === actor.value) throw new BadRequestError('You cannot unblock yourself.');
    this._block = BlockInfoVO.none();
    this.raise(new UserUnBlockLiftedEvent({ userId: this._id, blockInfo: this._block }));
  }

  recoverUser(actor: Id): void {
    if (!this._delete.isDeleted) throw new BadRequestError('This user has not been deleted.');
    if (this._id.value === actor.value) throw new BadRequestError('You cannot recover yourself.');
    this._delete = DeleteInfoVO.none();
    this.raise(new UserDeleteLiftedEvent({ userId: this._id, recoverInfo: this._delete }));
  }
}
