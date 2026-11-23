import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { AddressModel } from '../../infrastructure/address.models';
import {
  integrationEnabled,
  type ApiData,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';
import {
  createSecurityKit,
  expectNoLeak,
  expectRejected,
  expectUnauthorized,
  type AttackResult,
  type SecurityKit,
  type Tenant,
} from '../../../../testing/security-kit';

let kit: SecurityKit;
let harness: ApiIntegrationHarness;

const address = {
  streetAddress: '123 Integration Street',
  city: 'Lahore',
  state: 'Punjab',
  postalCode: '54000',
  country: 'Pakistan',
};

type CreatedAddress = { data?: { updatedData?: { id?: string } } };

async function createAddressAs(tenant: Tenant, payload: unknown = address): Promise<AttackResult> {
  const result = await kit.send(tenant, '/address/my', { method: 'POST', body: payload });
  if (result.accepted) {
    const id = (result.body as CreatedAddress).data?.updatedData?.id;
    if (id !== undefined) harness.track(id);
  }
  return result;
}

function addressAt(index: number) {
  return { ...address, streetAddress: `${index} Attack Street` };
}

async function activeCount(ownerId = harness.userIds.buyer): Promise<number> {
  return await AddressModel.countDocuments({ ownerId, 'deleted.deleted': false });
}

function errorCode(result: AttackResult): string {
  const body = result.body as { error?: { code?: string } } | null;
  return body?.error?.code ?? 'unknown';
}

describe.skipIf(!integrationEnabled)('address API database integration', () => {
  beforeAll(async () => {
    kit = await createSecurityKit();
    harness = kit.harness;
  }, 30_000);

  beforeEach(() => {
    harness.events.length = 0;
  });

  afterEach(async () => {
    await harness.cleanup();
  });

  afterAll(async () => {
    if (kit) await kit.dispose();
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

  it('ADDR-01 refuses cross-tenant address reads without leaking the record', async () => {
    const created = await createAddressAs('buyer', addressAt(1));
    const addressId = harness.idFromData((created.body as { data: ApiData }).data);
    const ownedBefore = await AddressModel.findById(addressId).lean();

    const foreign = await kit.send('buyerAlt', `/address/my/${addressId}`);
    const anonymous = await kit.sendAnonymously(`/address/my/${addressId}`);
    const malformed = await kit.send('buyerAlt', '/address/my/not-a-uuid');

    const ownedAfter = await AddressModel.findById(addressId).lean();
    kit.evidence('ADDR-01', {
      foreignStatus: foreign.status,
      anonymousStatus: anonymous.status,
      malformedStatus: malformed.status,
      docUnchanged: ownedBefore?.streetAddress === ownedAfter?.streetAddress,
    });
    expectRejected(foreign, 'cross-tenant address read');
    expectUnauthorized(anonymous, 'anonymous address read');
    expectRejected(malformed, 'malformed address id');
    expectNoLeak(foreign, [ownedBefore?.streetAddress ?? 'missing-street'], 'foreign address read');
    expect(ownedAfter?.ownerId).toBe(harness.userIds.buyer);
  }, 30_000);

  it('ADDR-02 refuses cross-tenant update, delete and default writes with no DB change', async () => {
    const created = await createAddressAs('buyer', addressAt(2));
    const addressId = harness.idFromData((created.body as { data: ApiData }).data);
    const before = await AddressModel.findById(addressId).lean();

    const update = await kit.send('buyerAlt', `/address/my/${addressId}`, {
      method: 'PATCH',
      body: { ...addressAt(99), streetAddress: 'Stolen Foreign Street' },
    });
    const deletion = await kit.send('buyerAlt', `/address/my/${addressId}`, { method: 'DELETE' });
    const makeDefault = await kit.send('buyerAlt', `/address/my/${addressId}/default`, {
      method: 'PATCH',
    });

    const after = await AddressModel.findById(addressId).lean();
    kit.evidence('ADDR-02', {
      updateStatus: update.status,
      deleteStatus: deletion.status,
      defaultStatus: makeDefault.status,
      streetBefore: before?.streetAddress,
      streetAfter: after?.streetAddress,
      deletedAfter: after?.deleted.deleted,
      defaultSet: after?.defaultDate !== null,
    });
    expectRejected(update, 'cross-tenant address update');
    expectRejected(deletion, 'cross-tenant address delete');
    expectRejected(makeDefault, 'cross-tenant default write');
    expect(after?.streetAddress).toBe(before?.streetAddress);
    expect(after?.deleted.deleted).toBe(false);
    expect(after?.defaultDate).toBeNull();
  }, 30_000);

  it('ADDR-03 stops a sequential fifth active address and leaves no partial row', async () => {
    const before = await activeCount();
    const created = await Promise.all(
      [3, 4, 5, 6].map(async (index) => await createAddressAs('buyer', addressAt(index))),
    );
    expect(created.every((result) => result.accepted)).toBe(true);
    const fifth = await createAddressAs('buyer', addressAt(7));

    const after = await activeCount();
    kit.evidence('ADDR-03', {
      before,
      created: created.filter((result) => result.accepted).length,
      fifthStatus: fifth.status,
      fifthCode: errorCode(fifth),
      after,
    });
    expectRejected(fifth, 'fifth active address');
    expect(after).toBe(4);
    expect(await AddressModel.countDocuments({ streetAddress: '7 Attack Street' })).toBe(0);
  }, 30_000);

  /**
   * EXPLOIT ADDR-04 — the four-address limit is read from Mongo and then the
   * row is inserted as a separate operation. Eight concurrent creates all see
   * an empty set and all insert.
   */
  it.failing('limits concurrent address creation to four rows', async () => {
    const before = await activeCount();
    expect(before, 'fixture must start with no active buyer addresses').toBe(0);

    const attempts = 8;
    const results = await kit.race(
      attempts,
      async (index) => await createAddressAs('buyer', addressAt(10 + index)),
    );
    const after = await activeCount();

    kit.evidence('ADDR-04', {
      before,
      attempts,
      statuses: kit.statuses(results).join(','),
      accepted: kit.accepted(results).length,
      after,
    });
    expect(
      kit.accepted(results).length,
      'The cap check cannot pass for every parallel create.',
    ).toBeLessThanOrEqual(4);
    expect(after, 'A buyer must never own more than four active addresses.').toBeLessThanOrEqual(4);
  }, 60_000);

  it('ADDR-05 rejects postal-code and oversized-field boundaries before any insert', async () => {
    const before = await activeCount();
    const longPostal = await createAddressAs('buyer', {
      ...addressAt(20),
      postalCode: '12345678901',
    });
    const longStreet = await createAddressAs('buyer', {
      ...addressAt(21),
      streetAddress: 'x'.repeat(10_000),
    });
    const emptyCity = await createAddressAs('buyer', { ...addressAt(22), city: '' });
    const inventedCountry = await createAddressAs('buyer', {
      ...addressAt(23),
      country: 'Atlantis',
    });

    kit.evidence('ADDR-05', {
      longPostalStatus: longPostal.status,
      longPostalCode: errorCode(longPostal),
      longStreetStatus: longStreet.status,
      emptyCityStatus: emptyCity.status,
      inventedCountryStatus: inventedCountry.status,
      activeBefore: before,
      activeAfter: await activeCount(),
    });
    expectRejected(longPostal, '11-character postal code');
    expectRejected(longStreet, '10k-character street address');
    expectRejected(emptyCity, 'empty city');
    expect(await AddressModel.countDocuments({ country: 'Atlantis' })).toBe(
      inventedCountry.accepted ? 1 : 0,
    );
    expect(await activeCount()).toBe(before + (inventedCountry.accepted ? 1 : 0));
  }, 30_000);

  it('ADDR-06 rejects unknown fields without mass-assigning ownership', async () => {
    const created = await createAddressAs('buyer', {
      ...addressAt(24),
      ownerId: harness.userIds.vendor,
      role: 'admin',
      _id: '00000000-0000-4000-8000-000000000000',
    });
    const id = harness.idFromData((created.body as { data: ApiData }).data);
    const doc = (await AddressModel.findById(id).lean()) as unknown as Record<
      string,
      unknown
    > | null;

    kit.evidence('ADDR-06', {
      status: created.status,
      requestedOwner: harness.userIds.vendor,
      storedOwner: doc?.ownerId,
      storedRole: doc?.role,
      storedId: doc?._id,
    });
    expect(created.accepted).toBe(true);
    expect(doc?.ownerId).toBe(harness.userIds.buyer);
    expect(doc?._id).toBe(id);
    expect(doc).not.toHaveProperty('role');
  }, 30_000);

  it('ADDR-07 requires a valid live token for every buyer scope', async () => {
    const created = await createAddressAs('buyer', addressAt(25));
    const addressId = harness.idFromData((created.body as { data: ApiData }).data);

    const noToken = await kit.sendAnonymously('/address/my');
    const garbageToken = await kit.send('buyer', '/address/my', {
      headers: { authorization: 'Bearer definitely-not-a-jwt' },
    });
    const adminAll = await kit.send('buyer', '/address/admin/all');

    kit.evidence('ADDR-07', {
      anonymousStatus: noToken.status,
      garbageTokenStatus: garbageToken.status,
      buyerOnAdminStatus: adminAll.status,
      addressId,
    });
    expectUnauthorized(noToken, 'anonymous address list');
    expectUnauthorized(garbageToken, 'malformed token');
    expectUnauthorized(adminAll, 'buyer on admin route');
    expect(await activeCount()).toBe(1);
  }, 30_000);

  it('ADDR-08 serves a deleted address read-only but never lets it be reused by a foreign write', async () => {
    const created = await createAddressAs('buyer', addressAt(26));
    const addressId = harness.idFromData((created.body as { data: ApiData }).data);
    harness.expectSuccess(
      await harness.requestAs('buyer', `/address/my/${addressId}/default`, { method: 'PATCH' }),
    );
    const deletion = await kit.send('buyer', `/address/my/${addressId}`, { method: 'DELETE' });
    const secondDelete = await kit.send('buyer', `/address/my/${addressId}`, { method: 'DELETE' });
    const updateAfterDelete = await kit.send('buyer', `/address/my/${addressId}`, {
      method: 'PATCH',
      body: addressAt(27),
    });
    const doc = await AddressModel.findById(addressId).lean();

    kit.evidence('ADDR-08', {
      deleteStatus: deletion.status,
      secondDeleteStatus: secondDelete.status,
      updateAfterDeleteStatus: updateAfterDelete.status,
      deletedFlag: doc?.deleted.deleted,
      defaultDateKept: doc?.defaultDate !== null,
      streetAfter: doc?.streetAddress,
    });
    expect(deletion.accepted).toBe(true);
    expectRejected(secondDelete, 'double delete');
    expectRejected(updateAfterDelete, 'update of deleted address');
    expect(doc?.deleted.deleted).toBe(true);
    expect(doc?.streetAddress).toBe(addressAt(26).streetAddress);
  }, 30_000);

  it('ADDR-09 refuses a non-owner admin recovery and leaves the deletion intact', async () => {
    const created = await createAddressAs('buyer', addressAt(28));
    const addressId = harness.idFromData((created.body as { data: ApiData }).data);
    harness.expectSuccess(
      await harness.requestAs('buyer', `/address/my/${addressId}`, { method: 'DELETE' }),
    );

    const recovery = await kit.send('admin', `/address/admin/${addressId}/recover`, {
      method: 'PATCH',
    });
    const doc = await AddressModel.findById(addressId).lean();

    kit.evidence('ADDR-09', {
      recoveryStatus: recovery.status,
      recoveryCode: errorCode(recovery),
      deletedAfter: doc?.deleted.deleted,
      activeCount: await activeCount(),
    });
    expectRejected(recovery, 'admin recovery of a foreign address');
    expect(doc?.deleted.deleted).toBe(true);
    expect(await activeCount()).toBe(0);
  }, 30_000);

  it('ADDR-10 rejects wrong verbs and array payloads without touching Mongo', async () => {
    const before = await activeCount();
    const wrongVerb = await kit.send(
      'buyer',
      `/address/my/${'00000000-0000-4000-8000-000000000000'}`,
      {
        method: 'POST',
        body: addressAt(29),
      },
    );
    const arrayBody = await kit.send('buyer', '/address/my', {
      method: 'POST',
      body: [addressAt(30), addressAt(31)],
    });
    const nullBody = await kit.send('buyer', '/address/my', { method: 'POST', body: null });

    kit.evidence('ADDR-10', {
      wrongVerbStatus: wrongVerb.status,
      arrayBodyStatus: arrayBody.status,
      nullBodyStatus: nullBody.status,
      activeBefore: before,
      activeAfter: await activeCount(),
    });
    expectRejected(arrayBody, 'array where an object belongs');
    expectRejected(nullBody, 'null body');
    expect(await activeCount()).toBe(before);
  }, 30_000);
});
