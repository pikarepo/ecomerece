import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { AddressModel } from '../../infrastructure/address.models';
import {
  createApiIntegrationHarness,
  integrationEnabled,
  type ApiData,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';

let harness: ApiIntegrationHarness;

const address = {
  streetAddress: '123 Integration Street',
  city: 'Lahore',
  state: 'Punjab',
  postalCode: '54000',
  country: 'Pakistan',
};

describe.skipIf(!integrationEnabled)('address API database integration', () => {
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

  it('creates a buyer address with normalized fields', async () => {
    const created = harness.expectSuccess<ApiData>(
      await harness.requestAs('buyer', '/address/my', { method: 'POST', body: address }),
    );
    const addressId = harness.track(harness.idFromData(created));

    const doc = await AddressModel.findById(addressId).lean();
    expect(doc?.ownerId).toBe(harness.userIds.buyer);
    expect(doc?.streetAddress).toBe(address.streetAddress);
    expect(doc?.city).toBe(address.city);
    expect(doc?.fullAddress).toContain(address.city);
    expect(doc?.deleted.deleted).toBe(false);
  }, 30_000);

  it('sets an address as the buyer default', async () => {
    const created = harness.expectSuccess<ApiData>(
      await harness.requestAs('buyer', '/address/my', { method: 'POST', body: address }),
    );
    const addressId = harness.track(harness.idFromData(created));

    harness.expectSuccess(
      await harness.requestAs('buyer', `/address/my/${addressId}/default`, { method: 'PATCH' }),
    );

    const doc = await AddressModel.findById(addressId).lean();
    expect(doc?.defaultDate).not.toBeNull();
    expect(harness.events).toContain('address.set-as-default');
  }, 30_000);
});
