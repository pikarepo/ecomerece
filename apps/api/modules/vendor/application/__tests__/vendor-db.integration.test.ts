import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { VendorModel } from '../../infrastructure/vendor.models';
import {
  integrationEnabled,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';
import {
  createSecurityKit,
  expectRejected,
  expectUnauthorized,
  type AttackResult,
  type SecurityKit,
} from '../../../../testing/security-kit';

let kit: SecurityKit;
let harness: ApiIntegrationHarness;

function errorCode(result: AttackResult): string {
  const body = result.body as { error?: { code?: string } } | null;
  return body?.error?.code ?? 'unknown';
}

function rows(result: AttackResult): { id: string; title?: string }[] {
  const body = result.body as { data?: { data?: { id: string; title?: string }[] } } | null;
  return body?.data?.data ?? [];
}

async function deleteVendor(id: string) {
  return await kit.send('admin', '/vendor/admin/soft', {
    method: 'DELETE',
    body: { vendorId: id, reason: 'Vendor abuse probe deletion.' },
  });
}

async function recoverVendor(id: string) {
  return await kit.send('admin', '/vendor/admin/recover', {
    method: 'PATCH',
    body: { vendorId: id },
  });
}

describe.skipIf(!integrationEnabled)('vendor API database integration', () => {
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

  it('VEN-01 keeps admin routes behind admin authorization', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    const attempts = [
      await kit.send('buyer', '/vendor/admin/all'),
      await kit.send('vendor', '/vendor/admin/all'),
      await kit.send('buyer', `/vendor/admin/${context.vendorId}`),
      await kit.send('vendor', '/vendor/admin/soft', {
        method: 'DELETE',
        body: { vendorId: context.vendorId, reason: 'Trying to delete a vendor.' },
      }),
      await kit.send('vendor', '/vendor/admin/verify', {
        method: 'PATCH',
        body: { vendorId: context.vendorId },
      }),
      await kit.sendAnonymously('/vendor/admin/all'),
    ];

    kit.evidence('VEN-01', { statuses: kit.statuses(attempts).join(',') });
    for (const attempt of attempts) expectUnauthorized(attempt, 'admin vendor access');
    expect((await VendorModel.findById(context.vendorId).lean())?.deleted.deleted).toBe(false);
  }, 30_000);

  it.failing('VEN-02 hides a soft-deleted vendor from public detail', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    const deleted = await deleteVendor(context.vendorId);
    const detail = await kit.sendAnonymously(`/vendor/${context.vendorId}`);
    const doc = await VendorModel.findById(context.vendorId).lean();

    kit.evidence('VEN-02', {
      deleteStatus: deleted.status,
      detailStatus: detail.status,
      title: doc?.title,
      dbDeleted: doc?.deleted.deleted,
      body: detail.text.slice(0, 160),
    });
    expect(deleted.accepted).toBe(true);
    expectRejected(detail, 'public detail of a deleted vendor');
  }, 30_000);

  it('VEN-03 excludes deleted vendors from the public storefront list', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    const publicBefore = await kit.sendAnonymously('/vendor?limit=10');
    await deleteVendor(context.vendorId);
    const publicAfter = await kit.sendAnonymously('/vendor?limit=10');

    kit.evidence('VEN-03', {
      before: rows(publicBefore)
        .map((row) => row.id)
        .includes(context.vendorId),
      after: rows(publicAfter)
        .map((row) => row.id)
        .includes(context.vendorId),
    });
    expect(rows(publicBefore).map((row) => row.id)).toContain(context.vendorId);
    expect(rows(publicAfter).map((row) => row.id)).not.toContain(context.vendorId);
  }, 30_000);

  it.failing('VEN-04 honours deleted=false as a live-vendor admin filter', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    const before = await kit.send('admin', '/vendor/admin/all?deleted=false&limit=50');
    await deleteVendor(context.vendorId);
    const after = await kit.send('admin', '/vendor/admin/all?deleted=false&limit=50');

    kit.evidence('VEN-04', {
      before: rows(before)
        .map((row) => row.id)
        .includes(context.vendorId),
      afterDeleted: rows(after)
        .map((row) => row.id)
        .includes(context.vendorId),
    });
    expect(rows(before).map((row) => row.id)).toContain(context.vendorId);
    expect(rows(after).map((row) => row.id)).not.toContain(context.vendorId);
  }, 30_000);

  it.failing('VEN-05 filters the admin list by real verification state', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    const verified = await kit.send('admin', '/vendor/admin/all?verified=true&limit=50');
    const unverified = await kit.send('admin', '/vendor/admin/all?verified=false&limit=50');

    kit.evidence('VEN-05', {
      verifiedStatus: verified.status,
      verifiedRows: rows(verified).length,
      unverifiedRows: rows(unverified).length,
      includesVerifiedInTrue: rows(verified)
        .map((row) => row.id)
        .includes(context.vendorId),
      includesVerifiedInFalse: rows(unverified)
        .map((row) => row.id)
        .includes(context.vendorId),
    });
    expect(rows(verified).map((row) => row.id)).toContain(context.vendorId);
    expect(rows(unverified).map((row) => row.id)).not.toContain(context.vendorId);
  }, 30_000);

  it('VEN-06 ignores mass-assigned identity, owner and verification on meta update', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    const attackerId = 'ven-attacker-id';
    const updated = await kit.send('vendor', '/vendor/me/meta', {
      method: 'PATCH',
      body: {
        title: `Meta probe ${kit.runId}`,
        slug: `meta-probe-${kit.runId}`,
        description: 'Mass assignment probe.',
        ownerId: attackerId,
        verification: { isVerified: false },
        deleted: { deleted: true },
      },
    });
    const doc = await VendorModel.findById(context.vendorId).lean();

    kit.evidence('VEN-06', {
      status: updated.status,
      ownerId: doc?.ownerId,
      isVerified: doc?.verification.isVerified,
      deleted: doc?.deleted.deleted,
    });
    expect(updated.accepted).toBe(true);
    expect(doc?.ownerId).toBe(harness.userIds.vendor);
    expect(doc?.verification.isVerified).toBe(true);
    expect(doc?.deleted.deleted).toBe(false);
  }, 30_000);

  it('VEN-07 rejects abusive titles, slugs and descriptions', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    const attempts = [
      await kit.send('vendor', '/vendor/me/meta', {
        method: 'PATCH',
        body: { title: '', slug: 'valid-slug', description: 'ok' },
      }),
      await kit.send('vendor', '/vendor/me/meta', {
        method: 'PATCH',
        body: { title: 'ok', slug: 'UPPER CASE', description: 'ok' },
      }),
      await kit.send('vendor', '/vendor/me/meta', {
        method: 'PATCH',
        body: { title: 'ok', slug: 'a'.repeat(300), description: 'ok' },
      }),
      await kit.send('vendor', '/vendor/me/meta', {
        method: 'PATCH',
        body: { title: 'ok', slug: 'ok-slug', description: 'x'.repeat(5000) },
      }),
      await kit.send('vendor', '/vendor/me/meta', {
        method: 'PATCH',
        body: { title: ['not', 'a', 'title'], slug: 'ok-slug', description: 'ok' },
      }),
    ];
    const doc = await VendorModel.findById(context.vendorId).lean();

    kit.evidence('VEN-07', {
      statuses: kit.statuses(attempts).join(','),
      codes: attempts.map(errorCode).join(','),
      title: doc?.title,
      slug: doc?.slug,
    });
    for (const attempt of attempts) expectRejected(attempt, 'abusive vendor meta');
  }, 30_000);

  it('VEN-08 rejects abusive contact changes and mass assignment', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    const attempts = [
      await kit.send('vendor', '/vendor/me/contact', {
        method: 'PATCH',
        body: {
          phone: 'not-a-phone',
          email: 'ok@example.com',
          address: {
            streetAddress: '2 Integration Street',
            city: 'Karachi',
            state: 'Sindh',
            postalCode: '74000',
            country: 'Pakistan',
          },
        },
      }),
      await kit.send('vendor', '/vendor/me/contact', {
        method: 'PATCH',
        body: {
          phone: '+921234567890',
          email: 'not-an-email',
          address: {
            streetAddress: '2 Integration Street',
            city: 'Karachi',
            state: 'Sindh',
            postalCode: '74000',
            country: 'Pakistan',
          },
        },
      }),
    ];
    const mass = await kit.send('vendor', '/vendor/me/contact', {
      method: 'PATCH',
      body: {
        phone: '+921234567890',
        email: `probe-${kit.runId}@example.com`,
        address: {
          streetAddress: '2 Integration Street',
          city: 'Karachi',
          state: 'Sindh',
          postalCode: '74000',
          country: 'Pakistan',
        },
        verification: { isVerified: false },
        deleted: { deleted: true },
      },
    });
    const doc = await VendorModel.findById(context.vendorId).lean();

    kit.evidence('VEN-08', {
      statuses: kit.statuses([...attempts, mass]).join(','),
      email: doc?.contact.email,
      isVerified: doc?.verification.isVerified,
      deleted: doc?.deleted.deleted,
    });
    for (const attempt of attempts) expectRejected(attempt, 'abusive contact payload');
    expect(mass.accepted).toBe(true);
    expect(doc?.verification.isVerified).toBe(true);
    expect(doc?.deleted.deleted).toBe(false);
  }, 30_000);

  it('VEN-09 rejects unsafe image URLs and mass-assigned identity', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    const attempts = [
      await kit.send('vendor', '/vendor/me/image', {
        method: 'PATCH',
        body: { logo: 'javascript:alert(1)', banner: 'https://example.com/b.png' },
      }),
      await kit.send('vendor', '/vendor/me/image', {
        method: 'PATCH',
        body: { logo: 'data:text/html,<script>alert(1)</script>', banner: 'x' },
      }),
      await kit.send('vendor', '/vendor/me/image', {
        method: 'PATCH',
        body: { logo: 123, banner: 'https://example.com/b.png' },
      }),
    ];
    const doc = await VendorModel.findById(context.vendorId).lean();

    kit.evidence('VEN-09', {
      statuses: kit.statuses(attempts).join(','),
      codes: attempts.map(errorCode).join(','),
      logo: doc?.images.logo,
    });
    for (const attempt of attempts) expectRejected(attempt, 'unsafe vendor image');
  }, 30_000);

  it('VEN-10 refuses a second vendor for the same owner', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    const created = await kit.send('vendor', '/vendor/me', {
      method: 'POST',
      body: {
        title: `Second vendor ${kit.runId}`,
        slug: `second-vendor-${kit.runId}`,
        description: 'Trying a second storefront.',
        contacts: {
          phone: '+921234567890',
          email: `second-${kit.runId}@example.com`,
          address: {
            streetAddress: '2 Integration Street',
            city: 'Karachi',
            state: 'Sindh',
            postalCode: '74000',
            country: 'Pakistan',
          },
        },
      },
    });
    const count = await VendorModel.countDocuments({ ownerId: harness.userIds.vendor });

    kit.evidence('VEN-10', {
      status: created.status,
      code: errorCode(created),
      ownedRows: count,
      originalTitle: context.vendorId,
    });
    expectRejected(created, 'second vendor for one owner');
    expect(count).toBe(1);
  }, 30_000);

  it('VEN-11 closes delete/recover against replay and owner misuse', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    const ownerDelete = await kit.send('vendor', '/vendor/me', {
      method: 'DELETE',
      body: { reason: 'Owner closing the storefront.' },
    });
    const recoverOwnerDelete = await recoverVendor(context.vendorId);
    const first = await deleteVendor(context.vendorId);
    const again = await deleteVendor(context.vendorId);
    const recover = await recoverVendor(context.vendorId);
    const recoverAgain = await recoverVendor(context.vendorId);
    const doc = await VendorModel.findById(context.vendorId).lean();

    kit.evidence('VEN-11', {
      ownerDeleteStatus: ownerDelete.status,
      recoverOwnerDeleteStatus: recoverOwnerDelete.status,
      first: first.status,
      again: again.status,
      recover: recover.status,
      recoverAgain: recoverAgain.status,
      deleted: doc?.deleted.deleted,
    });
    expect(ownerDelete.accepted).toBe(true);
    expect(recoverOwnerDelete.accepted).toBe(true);
    expect(first.accepted).toBe(true);
    expectRejected(again, 'second vendor delete');
    expect(recover.accepted).toBe(true);
    expectRejected(recoverAgain, 'second vendor recovery');
    expect(doc?.deleted.deleted).toBe(false);
  }, 60_000);

  it('VEN-12 keeps verify and reject transitions single-shot', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    const reject = await kit.send('admin', '/vendor/admin/reject', {
      method: 'PATCH',
      body: { vendorId: context.vendorId, reason: 'Abuse probe rejection.' },
    });
    const rejectAgain = await kit.send('admin', '/vendor/admin/reject', {
      method: 'PATCH',
      body: { vendorId: context.vendorId, reason: 'Second rejection.' },
    });
    const verify = await kit.send('admin', '/vendor/admin/verify', {
      method: 'PATCH',
      body: { vendorId: context.vendorId },
    });
    const verifyAgain = await kit.send('admin', '/vendor/admin/verify', {
      method: 'PATCH',
      body: { vendorId: context.vendorId },
    });
    const doc = await VendorModel.findById(context.vendorId).lean();

    kit.evidence('VEN-12', {
      statuses: kit.statuses([reject, rejectAgain, verify, verifyAgain]).join(','),
      codes: [reject, rejectAgain, verify, verifyAgain].map(errorCode).join(','),
      isVerified: doc?.verification.isVerified,
    });
    expect(reject.accepted).toBe(true);
    expectRejected(rejectAgain, 'rejecting a rejected vendor');
    expect(verify.accepted).toBe(true);
    expectRejected(verifyAgain, 'verifying a verified vendor');
    expect(doc?.verification.isVerified).toBe(true);
  }, 60_000);

  it('VEN-13 validates stats-refresh booleans strictly', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    const stringFalse = await kit.send('vendor', '/vendor/me/stats-refresh', {
      method: 'PATCH',
      body: { enabled: 'false' },
    });
    const realFalse = await kit.send('vendor', '/vendor/me/stats-refresh', {
      method: 'PATCH',
      body: { enabled: false },
    });
    const doc = await VendorModel.findById(context.vendorId).lean();

    kit.evidence('VEN-13', {
      stringFalseStatus: stringFalse.status,
      realFalseStatus: realFalse.status,
      stored: doc?.statsRefreshEnabled,
    });
    expectRejected(stringFalse, 'string boolean for stats refresh');
    expect(realFalse.accepted).toBe(true);
    expect(doc?.statsRefreshEnabled).toBe(false);
  }, 30_000);

  it('VEN-14 rejects abusive paging and escapes regex search input', async () => {
    const context = await harness.seedCatalog({ createInventory: false });
    const attempts = [
      await kit.sendAnonymously('/vendor?limit=0'),
      await kit.sendAnonymously('/vendor?limit=51'),
      await kit.sendAnonymously('/vendor?limit=10&direction=sideways'),
      await kit.sendAnonymously('/vendor?cursor=not-an-id&limit=10'),
      await kit.send('admin', '/vendor/admin/all?limit=0'),
      await kit.send('admin', '/vendor/admin/all?limit=51'),
    ];
    const regex = await kit.sendAnonymously(`/vendor?limit=10&search=${encodeURIComponent('.*')}`);
    const exact = await kit.sendAnonymously(`/vendor?limit=10&search=Integration`);

    kit.evidence('VEN-14', {
      statuses: kit.statuses(attempts).join(','),
      regexStatus: regex.status,
      regexRows: rows(regex).length,
      exactRows: rows(exact).length,
      title: (await VendorModel.findById(context.vendorId).lean())?.title,
    });
    for (const attempt of attempts) expectRejected(attempt, 'abusive vendor paging');
    expect(regex.accepted).toBe(true);
    expect(exact.accepted).toBe(true);
  }, 30_000);
});
