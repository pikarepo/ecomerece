import { describe, expect, test } from 'bun:test';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { bundledSkins, registry } from '../skins';

/**
 * Task 02-E — the "build anything fast" contract (todo/04-new-skin-fast-path.md):
 *   1. Components + app markup may ONLY bind to the active skin through `mat-*`
 *      role classes or `--m-<role>-*` indirection (or the two explicit skin
 *      tokens `--press-scale` / `--scene`). A raw theme token (colour channel,
 *      radius, shadow, status colour, `--k-*`) hardcoded in markup would dodge
 *      skin control — this test is the guard.
 *   2. The /design picker must surface EVERY bundled skin (registry → grouped
 *      rows). A skin with no entry (or a bad swatch/group) silently disappears.
 */

const COMPONENT_ROOT = join(import.meta.dir, '../components');
const DESIGN_PAGE = join(import.meta.dir, '../../../apps/web/app/design/page.tsx');

/** Each custom property a component may reference in markup. `--m-*` is the
 * role-indirection namespace; `--press-scale`/`--scene` are skin-adjustable
 * tokens; `--tw-*` are Tailwind internals. Everything else is a raw token. */
const ROLE_PREFIX = (t: string) => t.startsWith('m-');
const ALLOWED_SKIN_TOKENS = new Set(['press-scale', 'scene']);

const VALID_ROLES = new Set([
  'mat-ground',
  'mat-panel',
  'mat-card',
  'mat-raised',
  'mat-overlay',
  'mat-chrome',
  'mat-well',
  'mat-control',
  'mat-primary',
  'mat-card-t1',
  'mat-card-t2',
  'mat-card-t3',
  'mat-card-t4',
]);

function walkTs(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walkTs(full, out);
    else if (/\.(t|j)sx?$/.test(name)) out.push(full);
  }
  return out;
}

/** Strip JS comments so the scan only judges code, never docs. */
function stripComments(src: string): string {
  let out = src.replace(/\/\*[\s\S]*?\*\//g, '');
  out = out.replace(/(^|\s)\/\/[^\n]*/gm, '$1');
  return out;
}

function tokenRefs(src: string): string[] {
  return (stripComments(src).match(/--[a-z][a-z0-9-]*/g) ?? []).map((t) => t.slice(2));
}

function matRoles(src: string): string[] {
  const roles: string[] = [];
  for (const m of stripComments(src).matchAll(
    /mat-(?:ground|panel|card|raised|overlay|chrome|well|control|primary)(?:-t[1-4])?/g,
  )) {
    roles.push(m[0]);
  }
  return roles;
}

describe('design picker (02-E §2: a row for every skin)', () => {
  const GROUPS = ['everyday', 'expressive', 'dimensional'] as const;

  test('every registry entry has a valid picker group and a 2-hex swatch', () => {
    expect(Object.keys(registry).length).toBeGreaterThanOrEqual(bundledSkins.length);
    for (const entry of Object.values(registry)) {
      expect(GROUPS, entry.skin.label).toContain(entry.group);
      expect(entry.swatch).toHaveLength(2);
      for (const hex of entry.swatch) {
        expect(hex, entry.skin.label).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    }
  });

  test('every picker group is non-empty (Everyday · Expressive · Dimensional all render)', () => {
    const byGroup = new Map<string, number>();
    for (const entry of Object.values(registry)) {
      byGroup.set(entry.group, (byGroup.get(entry.group) ?? 0) + 1);
    }
    for (const group of GROUPS) {
      expect(byGroup.get(group) ?? 0, group).toBeGreaterThan(0);
    }
  });

  test('3D skins note their WebGL requirement (picker warns users)', () => {
    for (const [id, entry] of Object.entries(registry)) {
      const note = 'note' in entry ? entry.note : undefined;
      if (entry.skin.dimension === '3d') {
        expect(note, id).toMatch(/webgl|WebGL/);
      }
    }
  });
});

describe('markup contract (02-E §1: mat-* roles + --m-* indirection only)', () => {
  const files = [...walkTs(COMPONENT_ROOT), DESIGN_PAGE];

  test(`scan surface covers ${files.length - 1} component files + the design page`, () => {
    expect(files.length).toBeGreaterThan(5);
    expect(existsSync(DESIGN_PAGE)).toBe(true);
  });

  test('no markup file reads a raw theme token (only --m-*, --press-scale, --scene)', () => {
    const offenders: string[] = [];
    for (const file of files) {
      const src = readFileSync(file, 'utf8');
      for (const token of tokenRefs(src)) {
        const ok = ROLE_PREFIX(token) || ALLOWED_SKIN_TOKENS.has(token) || token.startsWith('tw-');
        if (!ok) offenders.push(`${relative(import.meta.dir, file)}: --${token}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  test("mat-* classes in markup map to a known role (no typo'd roles)", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const src = readFileSync(file, 'utf8');
      for (const role of matRoles(src)) {
        if (!VALID_ROLES.has(role)) offenders.push(`${relative(import.meta.dir, file)}: ${role}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
