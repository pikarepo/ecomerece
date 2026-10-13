import { describe, expect, test } from 'bun:test';
import { compileSkinCss, resolveInheritance, validateSkin } from '../lib/skin/compile';
import type { Skin } from '../lib/skin/types';
import { bundledSkins } from '../skins';

const lookup = (id: string): Skin | undefined => bundledSkins.find((s) => s.id === id);
const resolved = bundledSkins.map((s) => resolveInheritance(s, lookup));

/**
 * Performance gates are deliberately budgeted (~10x typical) so they catch
 * algorithmic regressions (e.g. O(n²) selectors, size blow-ups) without
 * flaking on slow CI machines. Tighten once a harness can run in a browser.
 */
describe('skin compile performance', () => {
  test('whole registry validates under 250ms', () => {
    const start = performance.now();
    for (const s of resolved) validateSkin(s);
    const ms = performance.now() - start;
    expect(ms, `validateSkin took ${ms.toFixed(1)}ms`).toBeLessThan(250);
  });

  test('whole registry compiles under 2000ms', () => {
    const start = performance.now();
    for (const s of resolved) compileSkinCss(s, lookup);
    const ms = performance.now() - start;
    expect(ms, `compileSkinCss took ${ms.toFixed(1)}ms for ${resolved.length} skins`).toBeLessThan(
      2000,
    );
  });

  test('no single skin output exceeds 120 KB', () => {
    for (const s of resolved) {
      const css = compileSkinCss(s, lookup);
      const kb = css.length / 1024;
      expect(kb, `${s.id} output ${kb.toFixed(1)} KB`).toBeLessThan(120);
    }
  });

  test('compile is deterministic (identical output across runs)', () => {
    for (const s of resolved) {
      const a = compileSkinCss(s, lookup);
      const b = compileSkinCss(s, lookup);
      expect(a).toBe(b);
    }
  });

  test('system stylesheet baseline stays bounded (dev/WIP guard)', () => {
    const sys = resolved.find((s) => s.id === 'system');
    if (!sys) throw new Error('system skin missing from registry');
    const css = compileSkinCss(sys, lookup);
    expect(css.length).toBeGreaterThan(10_000); // ships with every page
    expect(css.length).toBeLessThan(80_000);
  });
});
