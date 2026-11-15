import { describe, expect, it } from 'bun:test';
import { BadRequestError } from '../../errors/app-error';
import { EmailVO, Id, PersonName, Reason, UrlVO } from '../../value-objects';
import { NameInfoVO } from '../user/value-objects/name-info.vo';
import { UserAggregate } from '../user/user.aggregate';
import { RoleInfoVO, UserRoleVO } from '../user/value-objects/role-info.vo';

const id = (n: number) => Id.create(`00000000-0000-7000-8000-${String(n).padStart(12, '0')}`);
const reason = () => Reason.create('violates the marketplace policy');

function user() {
  return UserAggregate.create({
    id: id(7),
    name: NameInfoVO.create(PersonName.create('Jane'), null, PersonName.create('Doe')),
    email: EmailVO.create('jane@example.com'),
    image: UrlVO.create('https://cdn.example.com/avatar.png'),
  });
}

function admin() {
  const aggregate = user();
  aggregate.assignRole(UserRoleVO.create('admin'), id(9), reason());
  aggregate.clearEvents();
  return aggregate;
}

describe('UserAggregate creation', () => {
  it('starts as an unblocked, unbanned customer', () => {
    const aggregate = user();

    expect(aggregate.role.isCustomer).toBe(true);
    expect(aggregate.role.isAdmin).toBe(false);
    expect(aggregate.ban.isBan).toBe(false);
    expect(aggregate.block.isBlocked).toBe(false);
    expect(aggregate.deleted.isDeleted).toBe(false);
    expect(aggregate.lastLogin).toBeNull();
    expect(aggregate.name.fullName).toBe('Jane Doe');
    expect(aggregate.pullEvents()).toEqual([]);
  });
});

describe('UserAggregate roles', () => {
  it('assigns a new role with actor and reason', () => {
    const aggregate = user();
    aggregate.clearEvents();

    aggregate.assignRole(UserRoleVO.create('vendor'), id(9), reason());

    expect(aggregate.role.isVendor).toBe(true);
    expect(aggregate.role.performedBy).toEqual(id(9));
    expect(aggregate.role.reason).toEqual(reason());
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual(['user.role-assigned']);
  });

  it('refuses assigning the role the user already has', () => {
    expect(() => user().assignRole(UserRoleVO.create('customer'), id(9), reason())).toThrow(
      'User already has this role.',
    );
  });

  it('refuses an invalid role value', () => {
    expect(() => UserRoleVO.create('superuser')).toThrow(BadRequestError);
  });

  it('does not report a system role as explicitly assigned', () => {
    expect(RoleInfoVO.none().isSystemAssigned).toBe(true);
    expect(RoleInfoVO.system(UserRoleVO.create('admin')).isAdmin).toBe(true);
  });
});

describe('UserAggregate bans', () => {
  it('bans a customer and refuses a second ban', () => {
    const aggregate = user();

    aggregate.banUser(id(9), 7, reason());
    expect(aggregate.ban.isBan).toBe(true);
    expect(aggregate.ban.until?.remainingDays).toBeGreaterThan(0);
    expect(() => aggregate.banUser(id(9), 7, reason())).toThrow(BadRequestError);
  });

  it('refuses self-ban and admin bans', () => {
    expect(() => user().banUser(id(7), 7, reason())).toThrow('You cannot ban yourself.');
    expect(() => admin().banUser(id(9), 7, reason())).toThrow('Administrators cannot be banned.');
  });

  it('extends, shortens and lifts an existing ban', () => {
    const aggregate = user();
    aggregate.banUser(id(9), 7, reason());
    aggregate.clearEvents();
    const before = aggregate.ban.until?.remainingDays ?? 0;

    aggregate.extendBan(id(9), 3);
    expect(aggregate.ban.until?.remainingDays).toBeGreaterThanOrEqual(before + 2);

    aggregate.shortenBan(id(9), 2);
    aggregate.unBanUser(id(9));
    expect(aggregate.ban.isBan).toBe(false);
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual([
      'user.ban-extended',
      'user.ban-shortened',
      'user.ban-lifted',
    ]);
  });

  it('refuses ban operations when no ban exists', () => {
    expect(() => user().extendBan(id(9), 1)).toThrow(BadRequestError);
    expect(() => user().shortenBan(id(9), 1)).toThrow(BadRequestError);
    expect(() => user().unBanUser(id(9))).toThrow('This user is not currently banned.');
  });

  it('refuses self-managed and admin ban extensions', () => {
    const aggregate = user();
    aggregate.banUser(id(9), 7, reason());

    expect(() => aggregate.extendBan(id(7), 1)).toThrow(BadRequestError);
    expect(() => aggregate.shortenBan(id(7), 1)).toThrow(BadRequestError);
    expect(() => aggregate.unBanUser(id(7))).toThrow(BadRequestError);
    expect(() => admin().extendBan(id(9), 1)).toThrow(BadRequestError);
  });
});

describe('UserAggregate blocks', () => {
  it('blocks and unblocks once per state', () => {
    const aggregate = user();

    aggregate.blockUser(id(9), reason());
    expect(aggregate.block.isBlocked).toBe(true);
    expect(() => aggregate.blockUser(id(9), reason())).toThrow('This user is already blocked.');

    aggregate.unBlockUser(id(9));
    expect(aggregate.block.isBlocked).toBe(false);
    expect(() => aggregate.unBlockUser(id(9))).toThrow('This user is not currently blocked.');
  });

  it('refuses self-block and admin blocks', () => {
    expect(() => user().blockUser(id(7), reason())).toThrow('You cannot block yourself.');
    expect(() => admin().blockUser(id(9), reason())).toThrow('Administrators cannot be blocked.');
  });

  it('refuses self-unblock', () => {
    const aggregate = user();
    aggregate.blockUser(id(9), reason());

    expect(() => aggregate.unBlockUser(id(7))).toThrow(BadRequestError);
  });
});

describe('UserAggregate deletion', () => {
  it('deletes once and recovers once', () => {
    const aggregate = user();

    aggregate.deleteUser(id(9), reason());
    expect(aggregate.deleted.isDeleted).toBe(true);
    expect(() => aggregate.deleteUser(id(9), reason())).toThrow(BadRequestError);

    aggregate.recoverUser(id(9));
    expect(aggregate.deleted.isDeleted).toBe(false);
    expect(() => aggregate.recoverUser(id(9))).toThrow(BadRequestError);
  });

  it('refuses deleting an administrator', () => {
    expect(() => admin().deleteUser(id(9), reason())).toThrow('Administrators cannot be deleted.');
  });

  it('refuses self-recovery', () => {
    const aggregate = user();
    aggregate.deleteUser(id(9), reason());

    expect(() => aggregate.recoverUser(id(7))).toThrow(BadRequestError);
  });
});

describe('UserAggregate login and sign-in', () => {
  it('records the last login and raises user.logged-in', () => {
    const aggregate = user();

    aggregate.loginUser();

    expect(aggregate.lastLogin).not.toBeNull();
    expect(aggregate.pullEvents().map((event) => event.type)).toEqual(['user.logged-in']);
  });

  it('refuses login while banned, blocked or deleted', () => {
    const banned = user();
    banned.banUser(id(9), 3, reason());
    expect(() => banned.loginUser()).toThrow(BadRequestError);

    const blocked = user();
    blocked.blockUser(id(9), reason());
    expect(() => blocked.loginUser()).toThrow(BadRequestError);

    const deleted = user();
    deleted.deleteUser(id(9), reason());
    expect(() => deleted.loginUser()).toThrow(BadRequestError);
  });

  it('refuses a sign-in event for another user id', () => {
    expect(() => user().signIn(id(8))).toThrow('Sign-in id does not match this user.');
    expect(() => user().signIn(Id.create(id(7).value))).not.toThrow();
  });
});
