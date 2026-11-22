import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { UserModel } from '../../infrastructure/user.models';
import {
  createApiIntegrationHarness,
  integrationEnabled,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';

let harness: ApiIntegrationHarness;

describe.skipIf(!integrationEnabled)('user API database integration', () => {
  beforeAll(async () => {
    harness = await createApiIntegrationHarness();
  }, 30_000);

  beforeEach(() => {
    harness.events.length = 0;
  });

  afterEach(async () => {
    await harness.cleanup();
  });

  afterAll(async () => {
    if (harness) await harness.close();
  });

  it('reads the caller user record from the database', async () => {
    const me = harness.expectSuccess<{ id: string }>(await harness.requestAs('buyer', '/users/my'));

    expect(me.id).toBe(harness.userIds.buyer);
    const user = await UserModel.findById(harness.userIds.buyer).lean();
    expect(user?.role.role).toBe('customer');
    expect(user?.block.blocked).toBe(false);
    expect(user?.deleted.deleted).toBe(false);
  }, 30_000);

  it('blocks and lifts a user through admin routes', async () => {
    harness.expectSuccess(
      await harness.requestAs('admin', '/users/admin/block', {
        method: 'PATCH',
        body: { userId: harness.userIds.buyer, reason: 'Integration block.' },
      }),
    );
    expect((await UserModel.findById(harness.userIds.buyer).lean())?.block.blocked).toBe(true);
    expect(harness.events).toContain('user.blocked');

    harness.events.length = 0;
    harness.expectSuccess(
      await harness.requestAs('admin', '/users/admin/block/lift', {
        method: 'PATCH',
        body: { userId: harness.userIds.buyer },
      }),
    );

    expect((await UserModel.findById(harness.userIds.buyer).lean())?.block.blocked).toBe(false);
    expect(harness.events).toContain('user.block-lifted');
  }, 30_000);
});
