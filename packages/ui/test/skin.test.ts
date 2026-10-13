import { describe, expect, test } from 'bun:test';
import { SKIN_ID_PATTERN } from '../lib/skin/bootstrap';
import { compileSkinCss, resolveInheritance, validateSkin } from '../lib/skin/compile';
import { ROLES, type Skin, SLAB_ROLES } from '../lib/skin/types';
import { bundledSkins } from '../skins';

const lookup = (id: string): Skin | undefined => bundledSkins.find((s) => s.id === id);

function must(id: string): Skin {
  const s = lookup(id);
  if (!s) throw new Error(`skin "${id}" missing from registry`);
  return s;
}

/** resolve + validate a registry skin; returns [] when it is production-ready. */
function resolve(skin: Skin): Skin {
  const resolved = resolveInheritance(skin, lookup);
  return resolved;
}

function assertClean(resolved: Skin): void {
  const problems = validateSkin(resolved);
  expect(problems, `validation problems for "${resolved.id}"`).toEqual([]);
}

describe('skin registry integrity', () => {
  test('every id matches the strict pattern and is unique', () => {
    const ids = bundledSkins.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(SKIN_ID_PATTERN.test(id)).toBe(true);
    }
    // "system" is the root default; a skin must never be named system as a child id
    expect(ids).toContain('system');
  });

  test('every resolved skin has every role in both modes (nothing unresolved)', () => {
    for (const skin of bundledSkins) {
      const r = resolve(skin);
      for (const mode of ['light', 'dark'] as const) {
        for (const role of ROLES) {
          expect(r.modes[mode][role], `${skin.id} ${mode} ${role}`).toBeDefined();
        }
      }
    }
  });

  test('every resolved skin passes §41 validation', () => {
    for (const skin of bundledSkins) {
      assertClean(resolve(skin));
    }
  });

  test('every registered skin compiles to CSS inside @layer skins', () => {
    for (const skin of bundledSkins) {
      const css = compileSkinCss(skin, lookup);
      expect(css).toContain('@layer skins');
      expect(css).toContain(`data-skin="${skin.id}"`);
    }
  });
});

describe('compile output structure', () => {
  test('system matches the bare-root default state (F2 regression)', () => {
    const css = compileSkinCss(resolve(must('system')), lookup);
    expect(css).toContain(':where(:root)');
    expect(css).toContain(':where(:root[data-skin="system"])');
  });

  test('every skin emits light, auto-dark and explicit-dark blocks', () => {
    for (const skin of bundledSkins) {
      const css = compileSkinCss(skin, lookup);
      expect(css).toContain('/* light */');
      expect(css).toContain('/* dark: auto');
      expect(css).toContain('/* dark: explicit override */');
      expect(css).toContain('@media (prefers-color-scheme: dark)');
    }
  });

  test('blur slots are gated behind @supports only for skins that need it', () => {
    for (const skin of bundledSkins) {
      const css = compileSkinCss(skin, lookup);
      const needs = skin.needs.includes('backdrop-filter');
      const hasSupports = css.includes('@supports (backdrop-filter: blur(1px))');
      expect(hasSupports).toBe(needs);
    }
  });
});

describe('validateSkin catches §41 defects', () => {
  /** structurally-complete skin derived from `system` so the validator runs
   *  past the precondition accessors and reports the real defect. */
  const fromSystem = (id: string): Skin => {
    const sys = resolve(must('system'));
    return structuredClone({ ...sys, id, label: 'Test' });
  };

  test('an otherwise-clean derived skin passes', () => {
    assertClean(fromSystem('testvalid'));
  });

  test('bad id', () => {
    const problems = validateSkin(fromSystem('Bad ID!'));
    expect(problems.some((p) => p.includes('bad id'))).toBe(true);
  });

  test('missing role in a mode', () => {
    const skin = fromSystem('test');
    delete skin.modes.light.panel;
    const problems = validateSkin(skin);
    expect(problems.some((p) => p.includes('missing in light'))).toBe(true);
  });

  test('non-ascending radii (V10)', () => {
    const skin = fromSystem('test');
    skin.geometry = { ...skin.geometry, control: '24', card: '8' };
    const problems = validateSkin(skin);
    expect(problems.some((p) => p.includes('must ascend'))).toBe(true);
  });

  test('3d skin without webgl-slabs renderer (V13′)', () => {
    const skin = fromSystem('test3d');
    skin.dimension = '3d';
    const problems = validateSkin(skin);
    expect(problems.some((p) => p.includes("requires renderer 'webgl-slabs'"))).toBe(true);
  });
});

describe('3D skins satisfy V13′', () => {
  for (const skin of bundledSkins) {
    if (skin.renderer !== 'webgl-slabs') continue;

    test(`${skin.id}: renderer/needs/fallback/pbr contract`, () => {
      const r = resolve(skin);
      expect(r.renderer).toBe('webgl-slabs');
      expect(r.needs).toContain('webgl2');
      expect(r.dimension).toBe('3d');
      if (r.fallback && r.fallback !== 'self' && r.fallback !== 'solid') {
        const fb = lookup(r.fallback);
        expect(fb, `${r.id} fallback ${r.fallback} must be a real skin`).toBeDefined();
        if (fb) expect(fb.renderer, 'fallback must be 2D').not.toBe('webgl-slabs');
      }
      for (const role of SLAB_ROLES) {
        expect(r.pbr?.[role], `${r.id} needs pbr for ${role}`).toBeDefined();
      }
    });
  }
});

describe('resolveInheritance', () => {
  const base = (id: string): Skin =>
    ({
      id,
      label: 'Test',
      extends: 'system',
      needs: [],
      modes: { light: {}, dark: {} },
    }) as unknown as Skin;

  test('system is the root and never inherits', () => {
    const sys = must('system');
    expect(resolveInheritance(sys, lookup).id).toBe('system');
  });

  test('child geometry overrides only the fields it declares', () => {
    const child = base('testchild') as Skin;
    child.geometry = { chip: '4', control: '10', card: '16', sheet: '20', stroke: '1' };
    const resolved = resolveInheritance(child, lookup);
    expect(resolved.geometry.chip).toBe('4');
    expect(resolved.geometry.card).toBe('16');
    // undeclared slots flow through from system
    expect(resolved.motion).toBeDefined();
    expect(resolved.modes.light.panel).toBeDefined();
  });

  test('blur budget V12: ≤3 blur roles per mode, control/raised/well never blur', () => {
    for (const skin of bundledSkins) {
      const r = resolve(skin);
      for (const mode of ['light', 'dark'] as const) {
        const blurred = ROLES.filter((role) => {
          const m = r.modes[mode][role];
          return m?.backdrop !== undefined && m?.backdrop !== 'none';
        });
        expect(blurred.length, `${r.id} ${mode} blur count`).toBeLessThanOrEqual(3);
        for (const role of ['control', 'raised', 'well'] as const) {
          const m = r.modes[mode][role];
          // explicit 'none' (non-blurring) is legal for these roles; a real blur is not
          expect(
            m?.backdrop === undefined || m?.backdrop === 'none',
            `${r.id} ${mode} ${role} must never blur`,
          ).toBe(true);
        }
      }
    }
  });
});
