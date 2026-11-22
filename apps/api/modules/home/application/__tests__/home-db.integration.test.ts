import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { HomeModel } from '../../infrastructure/home.models';
import { DEFAULT_HOME_ID } from '../../infrastructure/home.repository';
import {
  createApiIntegrationHarness,
  integrationEnabled,
  runId,
  type ApiIntegrationHarness,
} from '../../../../testing/api-integration-harness';

let harness: ApiIntegrationHarness;

describe.skipIf(!integrationEnabled)('home API database integration', () => {
  beforeAll(async () => {
    harness = await createApiIntegrationHarness();
  }, 30_000);

  beforeEach(() => {
    harness.events.length = 0;
    harness.track(DEFAULT_HOME_ID);
  });

  afterEach(async () => {
    await harness.cleanup();
  });

  afterAll(async () => {
    if (harness) await harness.close();
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
});
