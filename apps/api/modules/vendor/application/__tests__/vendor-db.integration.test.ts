import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { VendorModel } from '../../infrastructure/vendor.models';
import {
  createApiIntegrationHarness,
  integrationEnabled,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';

let harness: ApiIntegrationHarness;

describe.skipIf(!integrationEnabled)('vendor API database integration', () => {
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

  it('persists vendor metadata updates under the owner', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    harness.events.length = 0;
    const title = `Updated vendor ${harness.runId}`;
    const slug = `updated-vendor-${harness.runId}`;

    harness.expectSuccess(
      await harness.requestAs('vendor', '/vendor/me/meta', {
        method: 'PATCH',
        body: {
          title,
          slug,
          description: 'Updated integration vendor description.',
        },
      }),
    );

    const vendor = await VendorModel.findById(context.vendorId).lean();
    expect(vendor?.title).toBe(title);
    expect(vendor?.slug).toBe(slug);
    expect(vendor?.ownerId).toBe(harness.userIds.vendor);
    expect(harness.events).toContain('vendor.meta-updated');
  }, 30_000);

  it('toggles stats refresh and keeps verification state in the database', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    harness.events.length = 0;

    harness.expectSuccess(
      await harness.requestAs('vendor', '/vendor/me/stats-refresh', {
        method: 'PATCH',
        body: { enabled: false },
      }),
    );

    const vendor = await VendorModel.findById(context.vendorId).lean();
    expect(vendor?.statsRefreshEnabled).toBe(false);
    expect(vendor?.verification.isVerified).toBe(true);
    expect(harness.events).toContain('vendor.stats-refresh-toggled');
  }, 30_000);
});
