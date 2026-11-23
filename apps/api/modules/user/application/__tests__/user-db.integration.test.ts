import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { UserModel } from '../../infrastructure/user.models';
import {
  integrationEnabled,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';
import {
  createSecurityKit,
  expectUnauthorized,
  type AttackResult,
  type SecurityKit,
} from '../../../../testing/security-kit';

let kit: SecurityKit;
let harness: ApiIntegrationHarness;

const userStateOf = async (userId: string) => {
  const user = await UserModel.findById(userId).lean();
  if (user === null) throw new Error('User row disappeared.');
  return user;
};

describe.skipIf(!integrationEnabled)('user API database integration', () => {
  beforeAll(async () => {
    kit = await createSecurityKit();
    harness = kit.harness;
  }, 30_000);

  beforeEach(() => {
    harness.events.length = 0;
  });

  afterEach(async () => {
    await harness.cleanup();
    await kit.send('admin', '/users/admin/ban/lift', { method: 'PATCH', body: { userId: harness.userIds.buyer } });
    await kit.send('admin', '/users/admin/block/lift', { method: 'PATCH', body: { userId: harness.userIds.buyer } });
    await kit.send('admin', '/users/admin/recover', { method: 'PATCH', body: { userId: harness.userIds.buyer } });
  });

  afterAll(async () => {
    if (kit) await kit.dispose();
  });

  it('reads the caller user record from the database', async () => {
    const me = harness.expectSuccess<{ id: string }>(await harness.requestAs('buyer', '/users/my'));

    expect(me.id).toBe(harness.userIds.buyer);
    const user = await userStateOf(harness.userIds.buyer);
    expect(user.role.role).toBe('customer');
    expect(user.block.blocked).toBe(false);
    expect(user.deleted.deleted).toBe(false);
  }, 30_000);

  it('blocks and lifts a user through admin routes', async () => {
    harness.expectSuccess(
      await harness.requestAs('admin', '/users/admin/block', {
        method: 'PATCH',
        body: { userId: harness.userIds.buyer, reason: 'Integration block.' },
      }),
    );
    expect((await userStateOf(harness.userIds.buyer)).block.blocked).toBe(true);
    expect(harness.events).toContain('user.blocked');

    harness.events.length = 0;
    harness.expectSuccess(
      await harness.requestAs('admin', '/users/admin/block/lift', {
        method: 'PATCH',
        body: { userId: harness.userIds.buyer },
      }),
    );

    expect((await userStateOf(harness.userIds.buyer)).block.blocked).toBe(false);
    expect(harness.events).toContain('user.block-lifted');
  }, 30_000);

  // ------------------------------------------------------------- exploit set

  it('does not let a banned user back in through initialization', async () => {
    harness.expectSuccess(
      await harness.requestAs('admin', '/users/admin/ban', {
        method: 'PATCH',
        body: { userId: harness.userIds.buyer, forDays: 7, reason: 'Exploit ban test.' },
      }),
    );

    const reInit = await kit.send('buyer', '/users/init', { method: 'POST' });
    const me = await kit.send('buyer', '/users/my');
    const user = await userStateOf(harness.userIds.buyer);

    kit.evidence('USR-01', {
      initStatus: reInit.status,
      meStatus: me.status,
      banIsBan: user.ban?.banned ?? false,
      banUntil: user.ban.until,
    });

    expect(reInit.status, 'A banned account re-initialized itself.').toBe(400);
    expect(user.ban?.banned).toBe(true);
    expect([401, 403]).toContain(me.status);
  }, 30_000);

  it('does not let a blocked user back in through initialization', async () => {
    harness.expectSuccess(
      await harness.requestAs('admin', '/users/admin/block', {
        method: 'PATCH',
        body: { userId: harness.userIds.buyer, reason: 'Exploit block test.' },
      }),
    );

    const reInit = await kit.send('buyer', '/users/init', { method: 'POST' });
    const user = await userStateOf(harness.userIds.buyer);

    kit.evidence('USR-02', {
      initStatus: reInit.status,
      blocked: user.block.blocked,
      lastLogin: user.lastLogin,
    });

    expect(reInit.status, 'A blocked account re-initialized itself.').toBe(400);
    expect(user.block.blocked).toBe(true);
  }, 30_000);

  it('does not let a deleted account resurrect itself', async () => {
    harness.expectSuccess(
      await harness.requestAs('buyer', '/users/my', {
        method: 'DELETE',
        body: { reason: 'Buyer deletes their own account.' },
      }),
    );

    const reInit = await kit.send('buyer', '/users/init', { method: 'POST' });
    const rows = await UserModel.countDocuments({ _id: harness.userIds.buyer });
    const user = await userStateOf(harness.userIds.buyer);

    kit.evidence('USR-03', {
      initStatus: reInit.status,
      rowsForDeletedId: rows,
      deleted: user.deleted.deleted,
    });

    expect(reInit.status, 'A deleted account resurrected itself.').toBe(400);
    expect(rows).toBe(1);
    expect(user.deleted.deleted).toBe(true);
  }, 30_000);

  it('refuses role assignment from a buyer', async () => {
    const escalation = await kit.send('buyer', '/users/admin/role', {
      method: 'PATCH',
      body: {
        userId: harness.userIds.buyer,
        role: 'admin',
        reason: 'Buyer promotes themselves.',
      },
    });
    const user = await userStateOf(harness.userIds.buyer);

    kit.evidence('USR-04', {
      escalateStatus: escalation.status,
      storedRole: user.role.role,
    });

    expect([401, 403]).toContain(escalation.status);
    expect(user.role.role).toBe('customer');
  }, 30_000);

  it('refuses user enumeration and admin mutations from a buyer', async () => {
    const read = await kit.send('buyer', `/users/admin/${harness.userIds.vendor}`);
    const ban = await kit.send('buyer', '/users/admin/ban', {
      method: 'PATCH',
      body: { userId: harness.userIds.vendor, forDays: 7, reason: 'Buyer bans a vendor.' },
    });
    const softDelete = await kit.send('buyer', '/users/admin/soft', {
      method: 'DELETE',
      body: { userId: harness.userIds.vendor, reason: 'Buyer deletes a vendor.' },
    });
    const vendor = await userStateOf(harness.userIds.vendor);

    kit.evidence('USR-05', {
      readStatus: read.status,
      banStatus: ban.status,
      deleteStatus: softDelete.status,
      vendorBanned: vendor.ban.banned,
      vendorDeleted: vendor.deleted.deleted,
    });

    expect([401, 403]).toContain(read.status);
    expect([401, 403]).toContain(ban.status);
    expect([401, 403]).toContain(softDelete.status);
    expect(vendor.ban.banned).toBe(false);
    expect(vendor.deleted.deleted).toBe(false);
  }, 30_000);

  it('refuses an anonymous caller any user record', async () => {
    const me = await kit.sendAnonymously('/users/my');
    const adminRead = await kit.sendAnonymously(`/users/admin/${harness.userIds.buyer}`);
    expectUnauthorized(me, 'Anonymous self read');
    expectUnauthorized(adminRead, 'Anonymous admin read');
  }, 30_000);

  it('refuses to ban or block an administrator', async () => {
    const ban = await kit.send('admin', '/users/admin/ban', {
      method: 'PATCH',
      body: { userId: harness.userIds.admin, forDays: 7, reason: 'Admin bans another admin.' },
    });
    const block = await kit.send('admin', '/users/admin/block', {
      method: 'PATCH',
      body: { userId: harness.userIds.admin, reason: 'Admin blocks another admin.' },
    });
    const admin = await userStateOf(harness.userIds.admin);

    kit.evidence('USR-06', {
      selfBanStatus: ban.status,
      selfBlockStatus: block.status,
      adminBanned: admin.ban.banned,
      adminBlocked: admin.block.blocked,
    });

    expect(ban.status).toBe(400);
    expect(block.status).toBe(400);
    expect(admin.role.role).toBe('admin');
  }, 30_000);

  it('rejects a role that does not exist', async () => {
    const result: AttackResult = await kit.send('admin', '/users/admin/role', {
      method: 'PATCH',
      body: {
        userId: harness.userIds.buyer,
        role: 'superadmin',
        reason: 'Invented role name.',
      },
    });
    const user = await userStateOf(harness.userIds.buyer);

    kit.evidence('USR-07', { invalidRoleStatus: result.status, storedRole: user.role.role });

    expect(result.status).toBe(400);
    expect(user.role.role).toBe('customer');
  }, 30_000);
});
