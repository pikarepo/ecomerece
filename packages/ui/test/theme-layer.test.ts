import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { compileSkinCss, resolveInheritance } from '../lib/skin/compile';
import { bundledSkins } from '../skins';

/**
 * Cascade-layer contract. Regression gate for the "themes totally broken"
 * blocker: skin variables only win if tokens.css lives in a layer BELOW
 * `skins` (skin selectors are `:where()` — specificity 0 — so only layer
 * priority can out-rank `tokens.css`). Unlayered styles form the implicit
 * final layer and silently beat every skin.
 */
const tokensPath = join(import.meta.dir, '../styles/tokens.css');
const globalsPath = join(import.meta.dir, '../../../apps/web/app/globals.css');

function read(path: string): string {
  return readFileSync(path, 'utf8');
}

describe('tokens.css token block is layered (not unlayered)', () => {
  const tokens = read(tokensPath);

  test('declares `@layer theme` wrapping the token variables', () => {
    const themeOpen = tokens.indexOf('@layer theme {');
    expect(themeOpen).toBeGreaterThan(-1);
    const baseOpen = tokens.indexOf('@layer base {');
    expect(baseOpen).toBeGreaterThan(themeOpen);
  });

  test('the skin-overridable tokens sit inside the theme layer, before base', () => {
    const themeOpen = tokens.indexOf('@layer theme {');
    const baseOpen = tokens.indexOf('@layer base {');
    for (const varName of ['--r-control:', '--r-card:', '--scene:', '--ease:', '--canvas:']) {
      const at = tokens.indexOf(varName);
      expect(at, `tokens.css should still define ${varName}`).toBeGreaterThan(-1);
      expect(at, `${varName} must be inside @layer theme, before @layer base`).toBeGreaterThan(
        themeOpen,
      );
      expect(at, `${varName} must be BEFORE @layer base`).toBeLessThan(baseOpen);
    }
  });

  test('tokens.css never declares the skins layer', () => {
    expect(tokens).not.toMatch(/@layer skins[;{]/);
  });
});

describe('globals.css declares skins as the last layer', () => {
  const globals = read(globalsPath);

  test('explicit order statement lists skins last', () => {
    expect(globals).toContain('@layer properties, theme, base, components, utilities, skins;');
  });
});

describe('skin output stays inside @layer skins (never unlayered)', () => {
  const lookup = (id: string) => bundledSkins.find((s) => s.id === id);
  const system = bundledSkins.find((s) => s.id === 'system');
  if (!system) throw new Error('system skin missing from registry');

  test('the bare `@layer skins {` block opens the compiled file body', () => {
    const css = compileSkinCss(resolveInheritance(system, lookup), lookup);
    const layerOpen = css.indexOf('@layer skins {');
    expect(layerOpen).toBeGreaterThan(-1);
    expect(css).toContain('} /* end @layer skins */');
  });

  test('every skin compiles into the skins layer', () => {
    for (const skin of bundledSkins) {
      const css = compileSkinCss(resolveInheritance(skin, lookup), lookup);
      expect(css, skin.id).toContain('@layer skins {');
    }
  });
});
