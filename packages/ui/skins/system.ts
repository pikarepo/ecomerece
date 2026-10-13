import type { Skin } from '../lib/skin/types';

/**
 * `system` — the reference skin (§36.1). Reproduces v2.0's intended output
 * exactly: surface ladder + hairlines + cool shadows, 8/14/20/28 radii.
 * App default (user decision, see MIGRATION.md).
 */
export const system: Skin = {
  id: 'system',
  label: 'System',
  dimension: 'layered',
  needs: [],
  cost: 'low',
  a11yTier: 'AA',
  fallback: 'self',
  geometry: { chip: '8px', control: '14px', card: '20px', sheet: '28px', stroke: '1px' },
  motion: {
    ease: 'cubic-bezier(0.32, 0.72, 0, 1)',
    easeExit: 'cubic-bezier(0.4, 0, 1, 1)',
    dur: '200ms',
    durSlow: '300ms',
    press: 0.97,
  },
  shadows: {
    light: [
      '0 1px 2px rgb(15 18 26/.06), 0 1px 3px rgb(15 18 26/.04)',
      '0 4px 14px rgb(15 18 26/.08), 0 1px 3px rgb(15 18 26/.05)',
      '0 16px 40px rgb(15 18 26/.14), 0 2px 8px rgb(15 18 26/.06)',
    ],
    dark: ['0 1px 2px rgb(0 0 0/.35)', '0 4px 12px rgb(0 0 0/.40)', '0 8px 28px rgb(0 0 0/.50)'],
  },
  scene: { light: 'rgb(var(--canvas))', dark: 'rgb(var(--canvas))' },
  modes: (['light', 'dark'] as const).reduce(
    (m, k) => {
      m[k] = {
        ground: { bg: 'rgb(var(--canvas))', edge: 'transparent', shadow: 'none' },
        panel: { bg: 'rgb(var(--surface-1))', edge: 'rgb(var(--line)/.10)', shadow: 'none' },
        card: {
          bg: 'rgb(var(--surface-2))',
          edge: 'rgb(var(--line)/.10)',
          shadow: 'var(--shadow-sm)',
        },
        raised: {
          bg: 'rgb(var(--surface-3))',
          edge: 'rgb(var(--line)/.10)',
          shadow: 'var(--shadow-sm)',
        },
        overlay: {
          bg: 'rgb(var(--surface-4))',
          edge: 'rgb(var(--line)/.10)',
          shadow: 'var(--shadow-lg)',
        },
        chrome: {
          bg: 'rgb(var(--surface-3)/.72)',
          edge: 'rgb(var(--line)/.10)',
          shadow: 'none',
          backdrop: 'blur(30px) saturate(150%)',
        },
        well: {
          bg: 'rgb(var(--surface-1))',
          edge: 'rgb(var(--line)/.10)',
          shadow: 'none',
        },
        control: {
          bg: 'rgb(var(--surface-3))',
          edge: 'rgb(var(--line)/.10)',
          shadow: 'var(--shadow-sm)',
          hover: { bg: 'rgb(var(--surface-4))' },
          press: { bg: 'rgb(var(--surface-3))', shadow: 'none' },
        },
        primary: { bg: 'rgb(var(--accent))', edge: 'transparent', shadow: 'var(--shadow-sm)' },
      };
      return m;
    },
    {} as Skin['modes'],
  ),
};
