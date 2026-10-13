import type { Skin } from '../lib/skin/types';

/**
 * `minimal` — flat, hairline-only (§36.4). First skin shipped after `soft`
 * because it is the easiest and proves the schema (§42.5).
 */
export const minimal: Skin = {
  id: 'minimal',
  label: 'Minimal',
  dimension: 'flat',
  needs: [],
  cost: 'low',
  a11yTier: 'AA',
  fallback: 'self',
  geometry: { chip: '6px', control: '8px', card: '10px', sheet: '12px', stroke: '1px' },
  motion: {
    ease: 'cubic-bezier(0.2, 0, 0, 1)',
    dur: '120ms',
    durSlow: '180ms',
    press: 1,
  },
  // v3.1 polish (§6.1): tighter display tracking; no palette, no accent hint.
  typography: { displayTracking: '-0.025em' },
  shadows: {
    light: ['none', 'none', '0 8px 24px rgb(15 18 26/.10)'],
    dark: ['none', 'none', '0 8px 24px rgb(0 0 0/.45)'],
  },
  modes: (['light', 'dark'] as const).reduce(
    (m, k) => {
      m[k] = {
        card: { bg: 'rgb(var(--surface-2))', edge: 'rgb(var(--line)/.12)', shadow: 'none' },
        raised: { bg: 'rgb(var(--surface-3))', edge: 'rgb(var(--line)/.18)', shadow: 'none' },
        overlay: {
          bg: 'rgb(var(--surface-4))',
          edge: 'rgb(var(--line)/.18)',
          shadow: 'var(--shadow-lg)', // only the floating layer casts a shadow
        },
        chrome: {
          bg: 'rgb(var(--surface-1))',
          edge: 'rgb(var(--line)/.12)',
          backdrop: 'none', // opaque; no blur
        },
        control: {
          bg: 'rgb(var(--surface-3))',
          edge: 'rgb(var(--line)/.45)', // ≥3:1 UI boundary
          shadow: 'none',
          hover: { bg: 'rgb(var(--surface-4))' },
          press: { bg: 'rgb(var(--surface-2))', shadow: 'none' },
        },
        primary: { bg: 'rgb(var(--accent))', edge: 'transparent', shadow: 'none' },
      };
      return m;
    },
    {} as Skin['modes'],
  ),
};
