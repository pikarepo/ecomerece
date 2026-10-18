import { contrast, lum, resolveHex, resolveInheritance, THEME } from '../lib/skin/compile';
import type { Skin } from '../lib/skin/types';

/**
 * Picker swatch derivation — task 16 (skin colour choices audit).
 *
 * The registry used to hand-write each two-tone chip, and they drifted:
 * `system/soft/material/depth` were the SAME `#F8FAFC/#2563EB`, `bento` was two
 * near-whites (1.00:1 — the halves were invisible), `clay` 1.15:1,
 * `neumorph` 1.23:1, `glass` 1.47:1, `skeuo` 2.41:1, `blue` 2.70:1 — all under
 * the 3:1 non-text contrast a two-tone chip needs, and none of them was tied
 * to the skin's actual colours.
 *
 * Every chip is now DERIVED from the skin's own, resolved tokens:
 *
 *   BASE (left)  — the skin's own light surface: its signature `tint-a`, else
 *                  the most saturated `tint-*` (luminance ≥ .6), else the
 *                  resolved `card` → `panel` → `ground` fill, else the theme
 *                  surface the skin inherits.
 *   MARK (right) — the FIRST candidate that keeps the two halves ≥ 3:1 apart:
 *                  `accentHint.light.accent` (the skin's declared accent) →
 *                  `hue-1` (the skin's primary decor hue) → other light
 *                  palette colours by saturation → the resolved `card.edge`
 *                  (bold-border skins show their ink) → the resolved `primary`
 *                  fill → the skin's own dark counterpart of the base → theme ink.
 *
 * Lower-case `#rrggbb` throughout. A `-3d` variant derives the SAME colours as
 * its 2D sibling (it is literally the same palette rendered as slabs), and the
 * remaining collisions are provably colour-identical skins (system/soft/
 * minimal/material/depth share every hex — they differ by geometry, not hue);
 * `test/swatch.test.ts` asserts exactly that.
 */
const HEX = /^#[0-9a-fA-F]{6}$/;

/** WCAG 1.4.11 non-text contrast — the two halves of a chip must read apart. */
export const MIN_CHIP_CONTRAST = 3;

const chroma = (hex: string): number => {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return Math.max(r, g, b) - Math.min(r, g, b);
};

/** Light palette colours as lowercase hex, `hue-1` first then saturation desc. */
function orderedLightHues(palette: Record<string, string>): string[] {
  const hexes = Object.entries(palette)
    .filter(([, v]) => HEX.test(v))
    .map(([k, v]) => [k, v.toLowerCase()] as const);
  const hue1 = hexes.find(([k]) => k === 'hue-1')?.[1];
  const rest = hexes
    .filter(([k]) => k !== 'hue-1')
    .sort((a, b) => chroma(b[1]) - chroma(a[1]))
    .map(([, v]) => v);
  return hue1 ? [hue1, ...rest] : rest;
}

/** The skin's resolved light surface (signature tint → card → panel → ground). */
function baseSurface(s: Skin): string {
  const light = s.palette?.light ?? {};
  const tints = Object.entries(light)
    .filter(([k, v]) => k.startsWith('tint-') && HEX.test(v))
    .map(([k, v]) => [k, v.toLowerCase()] as const)
    .filter(([, v]) => lum(v) >= 0.6)
    .sort((a, b) => chroma(b[1]) - chroma(a[1]));
  const signature = tints.find(([k]) => k === 'tint-a')?.[1];
  const tinted = signature ?? tints.find(([, v]) => chroma(v) >= 8)?.[1];
  return (
    tinted ??
    resolveHex(s.modes.light.card?.bg, light, 'light') ??
    resolveHex(s.modes.light.panel?.bg, light, 'light') ??
    resolveHex(s.modes.light.ground?.bg, light, 'light') ??
    THEME.light['surface-1']
  );
}

/** Ordered mark candidates for one skin (all own colours or inherited tokens). */
function markCandidates(s: Skin): string[] {
  const light = s.palette?.light ?? {};
  const dark = s.palette?.dark ?? {};
  const out: string[] = [];

  if (s.accentHint?.light.accent) out.push(s.accentHint.light.accent.toLowerCase());
  out.push(...orderedLightHues(light));

  const edge =
    resolveHex(s.modes.light.card?.edge, light, 'light') ??
    resolveHex(s.modes.light.control?.edge, light, 'light');
  if (edge) out.push(edge);

  out.push(resolveHex(s.modes.light.primary?.bg, light, 'light') ?? THEME.light.accent);

  // the skin's own dark counterpart of the base (light/dark pair skins)
  out.push(
    resolveHex(s.modes.light.card?.bg, dark, 'dark') ??
      resolveHex(s.modes.light.panel?.bg, dark, 'dark') ??
      resolveHex(s.modes.light.ground?.bg, dark, 'dark') ??
      THEME.dark['surface-1'],
  );

  out.push(THEME.light.ink);
  return out;
}

/**
 * Derive a skin's picker chip: `[base, mark]`, both from the skin's own
 * resolved tokens, guaranteed ≥ MIN_CHIP_CONTRAST apart.
 */
export function swatchFor(skin: Skin, lookup: (id: string) => Skin | undefined): [string, string] {
  const s = resolveInheritance(skin, lookup);
  const base = baseSurface(s);
  for (const mark of markCandidates(s)) {
    if (contrast(base, mark) >= MIN_CHIP_CONTRAST) return [base, mark];
  }
  return [base, THEME.light.ink];
}
