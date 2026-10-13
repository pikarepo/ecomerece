/**
 * Contrast helpers — Skin Pack brief §3.3.
 * Run before saving any palette: `bun run packages/ui/scripts/color.ts`
 * prints a luminance/contrast report for a hex list.
 *
 * Light text-bearing fills: L ≥ 0.86 · dark: L ≤ 0.014
 * Light interactive edges: contrast vs #FCFDFF ≥ 3 · dark: vs #1B2432 ≥ 3
 */

const lin = (c: number): number => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

export const L = (hex: string): number => {
  const n = parseInt(hex.replace('#', ''), 16);
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
};

export const cr = (a: string, b: string): number => {
  const x = L(a);
  const y = L(b);
  const hi = Math.max(x, y);
  const lo = Math.min(x, y);
  return (hi + 0.05) / (lo + 0.05);
};

export const okLightFill = (h: string): boolean => L(h) >= 0.86;
export const okDarkFill = (h: string): boolean => L(h) <= 0.014;
export const okLightEdge = (h: string): boolean => cr(h, '#FCFDFF') >= 3;
export const okDarkEdge = (h: string): boolean => cr(h, '#1B2432') >= 3;

if (import.meta.main) {
  const hexes = process.argv.slice(2).filter((a) => a.startsWith('#'));
  for (const hex of hexes) {
    const l = L(hex);
    const verdicts = [
      okLightFill(hex) ? 'light fill ✓' : 'light fill ✗ (L < .86)',
      okDarkFill(hex) ? 'dark fill ✓' : 'dark fill ✗ (L > .014)',
      okLightEdge(hex) ? 'light edge ✓' : 'light edge ✗ (<3:1)',
      okDarkEdge(hex) ? 'dark edge ✓' : 'dark edge ✗ (<3:1)',
    ];
    console.log(`${hex}  L=${l.toFixed(3)}  ${verdicts.join(' · ')}`);
  }
  if (hexes.length === 0) {
    console.log('usage: bun run packages/ui/scripts/color.ts "#RRGGBB" ...');
  }
}
