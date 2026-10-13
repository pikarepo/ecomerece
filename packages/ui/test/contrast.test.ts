import { describe, expect, test } from 'bun:test';
import { contrast, lum, resolveInheritance } from '../lib/skin/compile';
import type { Role, Skin } from '../lib/skin/types';
import { bundledSkins } from '../skins';

/*
 * Task 02-C — a11y contrast SNAPSHOT for every skin's light/dark text-bearing
 * fills (pure TS, no DOM). Guards the §3.2 / V3 contract against palette or
 * fill drift. The compile-time validator can only resolve theme-token fills;
 * this test also resolves `--k-*` palette tints (including var alphas) so
 * expressive/glass fills are covered too.
 *
 * Rules asserted (must match DESIGN.md §3.2 + validator §41 V3):
 *   - text-bearing fill vs the mode's ink: ≥ 4.5:1 (AA body text)
 *   - primary fill vs accent-ink:              ≥ 4.5:1
 * Anything a resolver can't turn into a single hex (e.g. layered composites)
 * is snapshotted as its raw token string and never ratio-asserted.
 */

// Mirror of compile.ts THEME (§3.1). Keep in sync when the theme palette changes.
const THEME: Record<'light' | 'dark', Record<string, string>> = {
  light: {
    canvas: '#F1F5F9',
    'surface-1': '#F8FAFC',
    'surface-2': '#FCFDFF',
    'surface-3': '#FFFFFF',
    'surface-4': '#FFFFFF',
    ink: '#0F172A',
    line: '#0F172A',
    accent: '#2563EB',
    'accent-ink': '#FFFFFF',
  },
  dark: {
    canvas: '#0B0F17',
    'surface-1': '#131A26',
    'surface-2': '#1B2432',
    'surface-3': '#253041',
    'surface-4': '#313E52',
    ink: '#E8EEF7',
    line: '#FFFFFF',
    accent: '#60A5FA',
    'accent-ink': '#0B1220',
  },
};

const TEXT_BEARING: readonly Role[] = [
  'panel',
  'card',
  'raised',
  'overlay',
  'chrome',
  'control',
  'well',
] as const;

const ROLE_ORDER = [...TEXT_BEARING, 'primary' as const];

const HEX = /^#[0-9a-fA-F]{6}$/;

function toHex(number: number): string {
  return `#${number.toString(16).padStart(6, '0')}`;
}

function blendOver(hex: string, alpha: number, backdrop: string): string {
  if (!HEX.test(hex) || alpha <= 0) return backdrop;
  if (alpha >= 1) return hex;
  const n = parseInt(hex.slice(1), 16);
  const b = parseInt(backdrop.replace('#', ''), 16);
  const mix = (a: number, c: number) => Math.round(a * alpha + c * (1 - alpha));
  const r = mix((n >> 16) & 255, (b >> 16) & 255);
  const g = mix((n >> 8) & 255, (b >> 8) & 255);
  const bl = mix(n & 255, b & 255);
  return toHex((r << 16) | (g << 8) | bl);
}

interface Ctx {
  mode: 'light' | 'dark';
  palette: Record<string, string>;
}

/**
 * Resolve one fill: `rgb(var(--surface-2))`, `rgb(var(--k-tint-a)/.8)`,
 * `rgb(var(--k-tint)/var(--k-a-panel))` or a bare hex. Returns either a hex
 * (`{ hex, alpha }` flag) or the raw token string (unverifiable → snapped,
 * not ratio-asserted). Alpha composites use the mode's canvas as the backdrop
 * (fills sit over the page base).
 */
function resolveFill(value: string, ctx: Ctx): { hex: string; alpha: boolean } | { raw: string } {
  if (HEX.test(value)) return { hex: value, alpha: false };

  const m = value.match(
    /^rgb\(\s*var\(--([a-z0-9-]+)\)\s*(?:\/\s*([.\d]+|var\(--[a-z0-9-]+\)))?\s*\)$/,
  );
  if (!m) return { raw: value };

  const [, nameRaw, alphaRaw] = m;
  // Palette names are emitted as `--k-<key>`; theme tokens keep their name.
  const name = nameRaw.replace(/^k-/, '');
  const hex = THEME[ctx.mode][name] ?? ctx.palette[name];
  if (!hex || !HEX.test(hex)) return { raw: value };

  if (alphaRaw === undefined) return { hex, alpha: false };
  const alphaToken = alphaRaw.match(/var\(--([a-z0-9-]+)\)/)?.[1];
  const amount = alphaToken ? ctx.palette[alphaToken.replace(/^k-/, '')] : alphaRaw;
  const alpha = Number(amount);
  if (Number.isNaN(alpha)) return { raw: value };

  return { hex: blendOver(hex, alpha, THEME[ctx.mode].canvas), alpha: true };
}

interface Row {
  id: string;
  mode: 'light' | 'dark';
  role: Role;
  /** resolved hex (lower) or the original token string when unverifiable */
  fill: string;
  /** contrast vs ink (text-bearing) or vs accent-ink (primary); null when raw */
  ratio: number | null;
  luminance: number | null;
}

const lookup = (id: string): Skin | undefined => bundledSkins.find((s) => s.id === id);

function buildRows(): Row[] {
  const rows: Row[] = [];
  for (const skin of bundledSkins) {
    const r = resolveInheritance(skin, lookup);
    for (const mode of ['light', 'dark'] as const) {
      const ctx: Ctx = { mode, palette: skin.palette?.[mode] ?? {} };
      const ink = THEME[mode].ink;
      const accentInk = THEME[mode]['accent-ink'];
      for (const role of ROLE_ORDER) {
        const bgRaw = r.modes[mode][role]?.bg;
        if (!bgRaw) continue;
        const resolved = resolveFill(bgRaw, ctx);
        if ('raw' in resolved) {
          rows.push({ id: r.id, mode, role, fill: resolved.raw, ratio: null, luminance: null });
          continue;
        }
        const fill = resolved.hex.toLowerCase();
        const text = role === 'primary' ? accentInk : ink;
        const ratio = contrast(text, fill);
        rows.push({ id: r.id, mode, role, fill, ratio, luminance: lum(fill) });
      }
    }
  }
  rows.sort(
    (a, b) =>
      a.id.localeCompare(b.id) || a.mode.localeCompare(b.mode) || a.role.localeCompare(b.role),
  );
  return rows;
}

describe('contrast snapshot: every skin × light/dark × text-bearing fill', () => {
  const rows = buildRows();

  test('snapshot — no fill drift (ratios + resolved hexes)', () => {
    const snap = rows.map((r) =>
      r.ratio === null
        ? `${r.id}|${r.mode}|${r.role}|raw:${r.fill}`
        : `${r.id}|${r.mode}|${r.role}|${r.fill}|${r.ratio.toFixed(2)}`,
    );
    expect(snap).toMatchSnapshot('text-bearing fill contrast ratios');
  });

  test('text-bearing fills keep ink ≥ 4.5:1 (AA body text)', () => {
    for (const r of rows) {
      if (r.role === 'primary' || r.ratio === null) continue;
      expect(r.ratio, `${r.id} ${r.mode} ${r.role} on ${r.fill}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('primary fill keeps accent-ink ≥ 4.5:1 (§41 V3)', () => {
    for (const r of rows) {
      if (r.role !== 'primary' || r.ratio === null) continue;
      expect(r.ratio, `${r.id} ${r.mode} primary on ${r.fill}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('every text-bearing fill resolves to a single hex', () => {
    const unresolved = rows.filter((r) => r.ratio === null);
    expect(unresolved.map((r) => `${r.id}|${r.mode}|${r.role}: ${r.fill}`)).toEqual([]);
  });

  test('exercises every skin and mode', () => {
    const ids = new Set(rows.map((r) => r.id));
    expect(ids.size).toBe(bundledSkins.length);
    const modes = new Set(rows.map((r) => r.mode));
    expect(modes).toEqual(new Set(['light', 'dark']));
  });
});
