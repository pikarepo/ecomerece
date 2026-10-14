import { afterAll, describe, expect, test } from 'bun:test';
import {
  isSmallViewport,
  RESIZE_DEBOUNCE_MS,
  SMALL_VIEWPORT_MAX,
  slabCapFor,
  slabPixelRatio,
  slabShadowMapSize,
  slabShadowsEnabled,
} from '../lib/depth/devicePolicy';
import { createSlabEngine } from '../lib/depth/slabEngine';
import { installDom, restoreDom } from './_dom';

installDom();
afterAll(() => restoreDom());

describe('devicePolicy (todo/11 — small-device engine policy)', () => {
  test('small-viewport boundary is 430px inclusive', () => {
    expect(isSmallViewport(320)).toBe(true);
    expect(isSmallViewport(390)).toBe(true);
    expect(isSmallViewport(SMALL_VIEWPORT_MAX)).toBe(true);
    expect(isSmallViewport(431)).toBe(false);
    expect(isSmallViewport(1440)).toBe(false);
  });

  test('pixel ratio: phones cap at 1.5, desktop at 2, junk values become 1', () => {
    // DPR-3 phone → 1.5 (the mobile context-loss fix)
    expect(slabPixelRatio(3, 390)).toBe(1.5);
    expect(slabPixelRatio(2.75, 430)).toBe(1.5);
    // DPR-1 phone stays 1
    expect(slabPixelRatio(1, 390)).toBe(1);
    // Desktop keeps the retina 2x cap
    expect(slabPixelRatio(3, 1440)).toBe(2);
    expect(slabPixelRatio(1.5, 1024)).toBe(1.5);
    // Degenerate devicePixelRatio
    expect(slabPixelRatio(0, 390)).toBe(1);
    expect(slabPixelRatio(Number.NaN, 1440)).toBe(1);
    expect(slabPixelRatio(-2, 1440)).toBe(1);
  });

  test('shadows are off on small devices, on on desktop; map size follows', () => {
    expect(slabShadowsEnabled(390)).toBe(false);
    expect(slabShadowsEnabled(430)).toBe(false);
    expect(slabShadowsEnabled(431)).toBe(true);
    expect(slabShadowMapSize(390)).toBe(512);
    expect(slabShadowMapSize(1440)).toBe(1024);
  });

  test('slab cap: mobile 36 / desktop 80 defaults, skin overrides, guard scale, floor of 4', () => {
    expect(slabCapFor(undefined, 390)).toBe(36);
    expect(slabCapFor(undefined, 1440)).toBe(80);
    expect(slabCapFor({ mobile: 16, desktop: 24 }, 390)).toBe(16);
    expect(slabCapFor({ mobile: 16, desktop: 24 }, 1440)).toBe(24);
    // guard degradation halves the active cap …
    expect(slabCapFor(undefined, 1440, 0.5)).toBe(40);
    // … but never below the historical floor
    expect(slabCapFor({ mobile: 6 }, 390, 0.1)).toBe(4);
    expect(slabCapFor(undefined, 1440, 0)).toBe(4);
  });

  test('resize debounce constant exists and is small enough to feel instant', () => {
    expect(RESIZE_DEBOUNCE_MS).toBeGreaterThan(0);
    expect(RESIZE_DEBOUNCE_MS).toBeLessThanOrEqual(250);
  });
});

describe('slabEngine fail-safe (todo/11 — mobile crash regression)', () => {
  test('no WebGL2: engine hands the 3D skin back to its 2D fallback and never throws', () => {
    document.documentElement.setAttribute('data-skin', 'depth');
    const container = document.createElement('div');
    document.body.appendChild(container);

    // `as` keeps the declared union type — a plain `= null` initializer would
    // narrow these to `null` (assignments inside the callbacks are invisible).
    let fallbackId = null as string | null;
    let engine = null as { dispose(): void } | null;

    expect(() => {
      engine = createSlabEngine(container, (id) => {
        fallbackId = id;
      });
    }).not.toThrow();

    // happy-dom has no WebGL2 → the engine must synchronously reject the
    // webgl-slabs skin ('depth' falls back to 'system') instead of crashing.
    expect(fallbackId).toBe('system');
    expect(typeof engine?.dispose).toBe('function');

    // dispose is idempotent and must not throw either
    expect(() => {
      engine?.dispose();
      engine?.dispose();
    }).not.toThrow();

    document.documentElement.removeAttribute('data-skin');
    container.remove();
  });

  test('non-3D skin: engine stays inert without notifying a fallback', () => {
    document.documentElement.setAttribute('data-skin', 'glass');
    const container = document.createElement('div');
    document.body.appendChild(container);

    let called = false;
    const engine = createSlabEngine(container, () => {
      called = true;
    });

    expect(called).toBe(false);
    engine.dispose();

    document.documentElement.removeAttribute('data-skin');
    container.remove();
  });
});
