import { describe, expect, test } from 'bun:test';
import { contrast, resolveHex, resolveInheritance, THEME } from '../lib/skin/compile';
import { ROLES, type Skin } from '../lib/skin/types';
import { bundledSkins, registry } from '../skins';
import { MIN_CHIP_CONTRAST, swatchFor } from '../skins/swatch';

/**
 * Task 16 — picker swatches must be READABLE and HONEST.
 *
 * The old hand-written chips drifted: bento 1.00:1 / clay 1.15:1 /
 * neumorph 1.23:1 / glass 1.47:1 / skeuo 2.41:1 / blue 2.70:1 were below the
 * 3:1 non-text contrast two tones need, `system/soft/material/depth` shared
 * one identical pair, and several chips showed colours the skin never renders.
 * Every chip is now derived from the skin's own tokens (`skins/swatch.ts`).
 */

const lookup = (id: string): Skin | undefined => bundledSkins.find((s) => s.id === id);
const HEX = /^#[0-9a-fA-F]{6}$/;

/** Every colour this skin can actually render (own tokens + inherited ones). */
function ownColours(skin: Skin): Set<string> {
  const s = resolveInheritance(skin, lookup);
  const out = new Set<string>();
  const add = (v?: string | null) => {
    if (!v) return;
    const hex = resolveHex(v, {}, 'light') ?? resolveHex(v, {}, 'dark');
    if (hex) out.add(hex);
    if (HEX.test(v)) out.add(v.toLowerCase());
  };

  for (const mode of ['light', 'dark'] as const) {
    for (const [, v] of Object.entries(s.palette?.[mode] ?? {})) add(v);
    add(s.accentHint?.[mode].accent);
    add(s.accentHint?.[mode].accentInk);
    add(s.scene?.[mode]);
    for (const role of ROLES) {
      const m = s.modes[mode][role];
      if (!m) continue;
      add(resolveHex(m.bg, s.palette?.[mode] ?? {}, mode));
      add(resolveHex(m.solid, s.palette?.[mode] ?? {}, mode));
      add(resolveHex(m.edge, s.palette?.[mode] ?? {}, mode));
      add(resolveHex(m.glow, s.palette?.[mode] ?? {}, mode));
    }
  }
  // theme tokens every skin inherits
  for (const mode of ['light', 'dark'] as const) {
    for (const v of Object.values(THEME[mode])) add(v);
  }
  return out;
}

function chipOf(key: string): [string, string] {
  const entry = registry[key as keyof typeof registry];
  if (!entry) throw new Error(`no registry entry: ${key}`);
  return entry.swatch;
}

/**
 * The inputs that decide a chip: declared accent, palette hexes and the
 * resolved surface/primary fills. Two skins colliding is only acceptable when
 * these are equal — i.e. the shared chip is simply the truth.
 */
function definingColours(skin: Skin): string[] {
  const s = resolveInheritance(skin, lookup);
  const out: string[] = [];
  for (const mode of ['light', 'dark'] as const) {
    const pal = s.palette?.[mode] ?? {};
    for (const [, v] of Object.entries(pal)) if (HEX.test(v)) out.push(v.toLowerCase());
    if (s.accentHint) {
      out.push(s.accentHint[mode].accent.toLowerCase(), s.accentHint[mode].accentInk.toLowerCase());
    }
    for (const role of ['card', 'panel', 'ground', 'primary'] as const) {
      const hex = resolveHex(s.modes[mode][role]?.bg, pal, mode);
      if (hex) out.push(hex);
    }
  }
  return [...new Set(out)].sort();
}

describe("picker swatches (task 16 — derived from the skin's own tokens)", () => {
  test('every chip is two lowercase hexes with ≥ 3:1 between the halves', () => {
    for (const key of Object.keys(registry)) {
      const [base, mark] = chipOf(key);
      expect(HEX.test(base), `${key} base ${base}`).toBe(true);
      expect(HEX.test(mark), `${key} mark ${mark}`).toBe(true);
      expect(HEX.test(base) && base).toBe(base.toLowerCase());
      const ratio = contrast(base, mark);
      expect(ratio, `${key} chip ${base}/${mark} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(
        MIN_CHIP_CONTRAST,
      );
    }
  });

  test('both halves are colours the skin actually renders (no lying chips)', () => {
    for (const key of Object.keys(registry)) {
      const entry = registry[key as keyof typeof registry];
      const colours = ownColours(entry.skin);
      const [base, mark] = entry.swatch;
      expect(colours.has(base), `${key} base ${base} is not one of its colours`).toBe(true);
      expect(colours.has(mark), `${key} mark ${mark} is not one of its colours`).toBe(true);
    }
  });

  test('a -3d slab variant shows the same palette as its 2D sibling', () => {
    for (const key of Object.keys(registry)) {
      if (!key.endsWith('-3d')) continue;
      const base = key.slice(0, -3);
      if (!(base in registry)) continue;
      expect(chipOf(key), `${key} vs ${base}`).toEqual(chipOf(base));
    }
  });

  test('collisions are provably identical skins only (never accidental)', () => {
    const byChip = new Map<string, string[]>();
    for (const key of Object.keys(registry)) {
      const chip = chipOf(key).join('/');
      byChip.set(chip, [...(byChip.get(chip) ?? []), key]);
    }

    // The five skins that share every hex are permitted — they are provably
    // colour-identical (same own-colour set) and differ only by geometry/motion.
    const IDENTICAL = ['system', 'soft', 'minimal', 'material', 'depth'].sort();

    for (const [, keys] of byChip) {
      if (keys.length < 2) continue;
      const sorted = [...keys].sort();
      const isIdenticalGroup =
        sorted.length === IDENTICAL.length && IDENTICAL.every((id, i) => id === sorted[i]);
      const isSiblingPair = sorted.length === 2 && sorted[1] === `${sorted[0]}-3d`;

      if (isIdenticalGroup) {
        // PROVE the collision: identical chips may only come from skins whose
        // colour DECISIONS are literally equal — otherwise it is a bug in the
        // derivation, not an unavoidable consequence of shared tokens.
        const [first, ...rest] = sorted;
        const reference = definingColours(registry[first as keyof typeof registry].skin);
        for (const id of rest) {
          expect(
            definingColours(registry[id as keyof typeof registry].skin),
            `${id} collides with ${first} but defines different colours`,
          ).toEqual(reference);
        }
      }

      expect(
        isIdenticalGroup || isSiblingPair,
        `unexpected swatch collision: ${keys.join(', ')}`,
      ).toBe(true);
    }
  });

  test('the registry is really derived — no hand-edited chips', () => {
    for (const [key, entry] of Object.entries(registry)) {
      expect(entry.swatch, `${key} chip drifted from its tokens`).toEqual(
        swatchFor(entry.skin, lookup),
      );
    }
  });
});
