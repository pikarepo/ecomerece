import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import { HomeModel } from '../../infrastructure/home.models';
import { DEFAULT_HOME_ID } from '../../infrastructure/home.repository';
import {
  integrationEnabled,
  runId,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';
import {
  createSecurityKit,
  expectRejected,
  expectUnauthorized,
  type AttackResult,
  type SecurityKit,
  type Tenant,
} from '../../../../testing/security-kit';

let kit: SecurityKit;
let harness: ApiIntegrationHarness;

const categoryBody = (name = `Attack category ${nameSuffix()}`) => ({
  name,
  image: 'https://example.com/home-category.png',
  accent: '#3B82F6',
  icon: 'Box',
});

function nameSuffix(): string {
  return Id.create().value.slice(0, 8);
}

async function addCategory(payload: unknown = categoryBody()) {
  return await kit.send('admin', '/home/admin/categories', { method: 'POST', body: payload });
}

async function homeDoc() {
  return await HomeModel.findById(DEFAULT_HOME_ID).lean();
}

function errorCode(result: AttackResult): string {
  const body = result.body as { error?: { code?: string } } | null;
  return body?.error?.code ?? 'unknown';
}

async function asTenant(
  tenant: Tenant,
  path: string,
  method: 'POST' | 'PATCH' | 'DELETE' | 'PUT',
  body?: unknown,
) {
  return await kit.send(tenant, path, { method: method as 'POST', body });
}

describe.skipIf(!integrationEnabled)('home API database integration', () => {
  beforeAll(async () => {
    kit = await createSecurityKit();
    harness = kit.harness;
  }, 30_000);

  beforeEach(() => {
    harness.events.length = 0;
    harness.track(DEFAULT_HOME_ID);
  });

  afterEach(async () => {
    await harness.cleanup();
  });

  afterAll(async () => {
    if (kit) await kit.dispose();
  });

  it('adds a home category to the persisted home layout', async () => {
    const name = `Integration Category ${runId}`;

    harness.expectSuccess(
      await harness.requestAs('admin', '/home/admin/categories', {
        method: 'POST',
        body: {
          name,
          image: 'https://example.com/home-category.png',
          accent: '#3B82F6',
          icon: 'Box',
        },
      }),
    );

    const home = await HomeModel.findById(DEFAULT_HOME_ID).lean();
    const category = home?.categories.find((item) => item.name === name);
    expect(category).toBeDefined();
    expect(category?.image).toBe('https://example.com/home-category.png');
    expect(category?.accent).toBe('#3B82F6');
    expect(harness.events).toContain('home.category-added');
  }, 30_000);

  it('adds a home slide to the persisted home layout', async () => {
    const title = `Integration Slide ${runId}`;

    harness.expectSuccess(
      await harness.requestAs('admin', '/home/admin/slides', {
        method: 'POST',
        body: {
          tag: 'Integration',
          title,
          subhead: 'Integration subhead',
          subtitle: 'Integration subtitle',
          cta: 'Shop now',
          image: 'https://example.com/home-slide.png',
          accent: '#3B82F6',
          displayOrder: 1,
        },
      }),
    );

    const home = await HomeModel.findById(DEFAULT_HOME_ID).lean();
    const slide = home?.slides.find((item) => item.title === title);
    expect(slide).toBeDefined();
    expect(slide?.tag).toBe('Integration');
    expect(slide?.cta).toBe('Shop now');
    expect(slide?.displayOrder).toBe(0);
    expect(harness.events).toContain('home.slide-added');
  }, 30_000);

  it('HOM-01 refuses cross-tenant tenants on every home write', async () => {
    await kit.sendAnonymously('/home');
    const attempts = [
      await asTenant('buyerAlt', '/home/admin/categories', 'POST', categoryBody()),
      await asTenant('vendorAlt', '/home/admin/slides', 'POST', {
        tag: 'Attack',
        title: 'Foreign slide',
        cta: 'Shop',
        image: 'https://example.com/slide.png',
      }),
      await asTenant('buyer', '/home/admin/promos', 'POST', {
        title: 'Foreign promo',
        subtitle: 'Foreign subtitle',
        image: 'https://example.com/promo.png',
      }),
      await asTenant('vendor', '/home/admin/features', 'POST', {
        title: 'Foreign feature',
        detail: 'Foreign feature detail',
      }),
      await asTenant('buyerAlt', '/home/admin/containers', 'POST', {
        heading: 'Foreign container',
      }),
      await asTenant('buyerAlt', '/home/admin/categories/reorder', 'PATCH', {
        orderedIds: [Id.create().value],
      }),
    ];
    const home = await homeDoc();

    kit.evidence('HOM-01', {
      statuses: kit.statuses(attempts).join(','),
      categories: home?.categories.length,
      slides: home?.slides.length,
      promos: home?.promos.length,
      features: home?.features.length,
      containers: home?.productContainers.length,
    });
    for (const result of attempts) expectUnauthorized(result, 'cross-tenant home write');
    expect(home?.categories).toHaveLength(0);
    expect(home?.slides).toHaveLength(0);
    expect(home?.promos).toHaveLength(0);
    expect(home?.features).toHaveLength(0);
    expect(home?.productContainers).toHaveLength(0);
  }, 30_000);

  it('HOM-02 serves fresh public payload immediately after a database change', async () => {
    const before = await kit.sendAnonymously('/home');
    const added = await addCategory(categoryBody(`Fresh category ${nameSuffix()}`));
    const afterAdd = await kit.sendAnonymously('/home');
    const created = await homeDoc();
    const createdId = created?.categories[0]?.id;
    if (!createdId) throw new Error('Category was not persisted.');

    const removed = await asTenant('admin', '/home/admin/categories', 'DELETE', { id: createdId });
    const afterRemove = await kit.sendAnonymously('/home');
    const names = (result: AttackResult) => {
      const body = result.body as { data?: { categories?: Array<{ name?: string }> } };
      return (body.data?.categories ?? []).map((category) => category.name);
    };

    kit.evidence('HOM-02', {
      addStatus: added.status,
      removeStatus: removed.status,
      beforeCount: names(before).length,
      afterAddCount: names(afterAdd).length,
      afterRemoveCount: names(afterRemove).length,
      servedName: names(afterAdd)[0],
    });
    expect(before.accepted).toBe(true);
    expect(added.accepted).toBe(true);
    expect(names(afterAdd)).toContain(created?.categories[0]?.name);
    expect(names(afterRemove)).not.toContain(created?.categories[0]?.name);
  }, 30_000);

  it('HOM-03 keeps the aggregate version consistent under concurrent writes', async () => {
    const attempts = await kit.race(
      6,
      async (index) => await addCategory(categoryBody(`Race category ${index}-${nameSuffix()}`)),
    );
    const home = await homeDoc();

    kit.evidence('HOM-03', {
      statuses: kit.statuses(attempts).join(','),
      accepted: kit.accepted(attempts).length,
      categories: home?.categories.length,
      version: home?.version,
    });
    expect(home?.categories).toHaveLength(kit.accepted(attempts).length);
    expect(home?.version).toBe(kit.accepted(attempts).length);
    expect(attempts.every((result) => result.status < 500)).toBe(true);
  }, 60_000);

  it('HOM-04 refuses a duplicate category name without changing the layout', async () => {
    const name = `Duplicate ${nameSuffix()}`;
    const first = await addCategory(categoryBody(name));
    const duplicate = await addCategory(categoryBody(name));
    const home = await homeDoc();

    kit.evidence('HOM-04', {
      firstStatus: first.status,
      duplicateStatus: duplicate.status,
      duplicateCode: errorCode(duplicate),
      categories: home?.categories.length,
      version: home?.version,
    });
    expect(first.accepted).toBe(true);
    expectRejected(duplicate, 'duplicate home category name');
    expect(home?.categories).toHaveLength(1);
    expect(home?.version).toBe(1);
  }, 30_000);

  it('HOM-05 stops category creation at the aggregate maximum', async () => {
    for (let index = 0; index < 24; index += 1) {
      const result = await addCategory(categoryBody(`Max category ${index}-${nameSuffix()}`));
      if (!result.accepted) throw new Error(`Fixture category ${index} failed: ${result.status}`);
    }
    const over = await addCategory(categoryBody('One category too many'));
    const home = await homeDoc();

    kit.evidence('HOM-05', {
      overStatus: over.status,
      overCode: errorCode(over),
      categories: home?.categories.length,
      version: home?.version,
    });
    expectRejected(over, '25th home category');
    expect(home?.categories).toHaveLength(24);
    expect(home?.version).toBe(24);
  }, 60_000);

  it('HOM-06 refuses duplicate ids and invented ids in reorder requests', async () => {
    const first = await addCategory(categoryBody(`Reorder one ${nameSuffix()}`));
    const second = await addCategory(categoryBody(`Reorder two ${nameSuffix()}`));
    expect(first.accepted && second.accepted).toBe(true);
    const home = await homeDoc();
    const ids = (home?.categories ?? []).map((category) => category.id);

    const invented = await asTenant('admin', '/home/admin/categories/reorder', 'PATCH', {
      orderedIds: [Id.create().value, Id.create().value],
    });
    const duplicate = await asTenant('admin', '/home/admin/categories/reorder', 'PATCH', {
      orderedIds: [ids[0], ids[0]],
    });
    const after = await homeDoc();

    kit.evidence('HOM-06', {
      inventedStatus: invented.status,
      duplicateStatus: duplicate.status,
      orderUnchanged:
        JSON.stringify(ids) === JSON.stringify((after?.categories ?? []).map((c) => c.id)),
      version: after?.version,
    });
    expectRejected(invented, 'reorder with invented ids');
    expectRejected(duplicate, 'reorder with duplicate ids');
    expect((after?.categories ?? []).map((category) => category.id)).toEqual(ids);
    expect(after?.version).toBe(2);
  }, 30_000);

  it('HOM-07 rejects boundary names, colors, icons and images without a write', async () => {
    await kit.sendAnonymously('/home');
    const before = await homeDoc();
    const empty = await addCategory({ ...categoryBody(), name: '' });
    const huge = await addCategory({ ...categoryBody(), name: 'x'.repeat(10_000) });
    const badColor = await addCategory({ ...categoryBody(), accent: 'not-a-color' });
    const badIcon = await addCategory({ ...categoryBody(), icon: '../../etc/passwd' });
    const badImage = await addCategory({ ...categoryBody(), image: 'javascript:alert(1)' });
    const after = await homeDoc();

    kit.evidence('HOM-07', {
      statuses: [empty.status, huge.status, badColor.status, badIcon.status, badImage.status].join(
        ',',
      ),
      codes: [errorCode(empty), errorCode(badColor), errorCode(badImage)].join(','),
      versionBefore: before?.version,
      versionAfter: after?.version,
    });
    for (const result of [empty, huge, badColor, badIcon, badImage]) {
      expectRejected(result, 'invalid home category');
    }
    expect(after?.version).toBe(before?.version);
  }, 30_000);

  it('HOM-08 ignores client-supplied ids and versions when creating a category', async () => {
    const attackerId = Id.create().value;
    const result = await addCategory({
      ...categoryBody(`Mass assignment ${nameSuffix()}`),
      id: attackerId,
      version: 99,
    });
    const home = await homeDoc();
    const stored = home?.categories.find((category) => category.id !== attackerId);

    kit.evidence('HOM-08', {
      status: result.status,
      attackerId: attackerId,
      storedId: stored?.id,
      storedVersion: home?.version,
    });
    expect(result.accepted).toBe(true);
    expect(stored?.id).toBeDefined();
    expect(stored?.id).not.toBe(attackerId);
    expect(home?.version).toBe(1);
  }, 30_000);

  it('HOM-09 bounds feature replacement at eight and rejects the ninth', async () => {
    const feature = (index: number) => ({
      title: `Feature ${index}`,
      detail: `Feature detail number ${index}`,
    });
    const nine = await asTenant('admin', '/home/admin/features', 'PUT', {
      features: Array.from({ length: 9 }, (_, index) => feature(index)),
    });
    const eight = await asTenant('admin', '/home/admin/features', 'PUT', {
      features: Array.from({ length: 8 }, (_, index) => feature(index)),
    });
    const home = await homeDoc();

    kit.evidence('HOM-09', {
      nineStatus: nine.status,
      nineCode: errorCode(nine),
      eightStatus: eight.status,
      features: home?.features.length,
      version: home?.version,
    });
    expectRejected(nine, 'ninth feature');
    expect(eight.accepted).toBe(true);
    expect(home?.features).toHaveLength(8);
    expect(home?.version).toBe(1);
  }, 30_000);

  it('HOM-10 stores arbitrary container filters but executes none of them server-side', async () => {
    const filter = { 'deleted.deleted': false, $where: '1 == 1' };
    const omittedSubtitle = await asTenant('admin', '/home/admin/containers', 'POST', {
      heading: 'Default subtitle container',
      query: { filter, limit: 1e9 },
    });
    const created = await asTenant('admin', '/home/admin/containers', 'POST', {
      heading: 'Injected container',
      subTitle: 'Explicit subtitle',
      query: { filter, limit: 1e9 },
    });
    const home = await homeDoc();
    const container = home?.productContainers[0];
    const publicHome = await kit.sendAnonymously('/home');

    kit.evidence('HOM-10', {
      omittedSubtitleStatus: omittedSubtitle.status,
      omittedSubtitleCode: errorCode(omittedSubtitle),
      status: created.status,
      storedFilter: JSON.stringify(container?.query.filter),
      storedLimit: container?.query.limit,
      homeHasProductRows: JSON.stringify(publicHome.body).includes('productId'),
    });
    expectRejected(omittedSubtitle, 'container with the defaulted empty subtitle');
    expect(created.accepted).toBe(true);
    expect(JSON.stringify(container?.query.filter)).toContain('$where');
    expect(container?.query.limit).toBeLessThanOrEqual(100);
    expect(JSON.stringify(publicHome.body)).not.toContain('productId');
  }, 30_000);

  it('HOM-11 fails closed on malformed ids and invented update targets', async () => {
    await addCategory(categoryBody(`Error probe ${nameSuffix()}`));
    const before = await homeDoc();
    const malformedUpdate = await asTenant('admin', '/home/admin/categories', 'PATCH', {
      id: 'not-a-uuid',
      name: 'Malformed target',
    });
    const inventedDelete = await asTenant('admin', '/home/admin/categories', 'DELETE', {
      id: Id.create().value,
    });
    const malformedReorder = await asTenant('admin', '/home/admin/slides/reorder', 'PATCH', {
      orderedIds: ['not-a-uuid'],
    });
    const after = await homeDoc();

    kit.evidence('HOM-11', {
      malformedUpdateStatus: malformedUpdate.status,
      inventedDeleteStatus: inventedDelete.status,
      malformedReorderStatus: malformedReorder.status,
      versionBefore: before?.version,
      versionAfter: after?.version,
    });
    expectRejected(malformedUpdate, 'malformed home update id');
    expectRejected(inventedDelete, 'invented home delete id');
    expectRejected(malformedReorder, 'malformed home reorder id');
    expect(after?.version).toBe(before?.version);
    expect(after?.categories).toHaveLength(1);
  }, 30_000);
});
