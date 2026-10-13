import type { Skin } from '../lib/skin/types';

/**
 * `neumorph` — paired opposed shadows, inverted wells (§36.5). The honest
 * hard case: shadows alone fail WCAG 1.4.11, so it ships with
 * a11yTier 'AA-with-fallback' and a contrastEdge that appears under
 * prefers-contrast:more / fidelity=low, where it degrades to `system`.
 */
export const neumorph: Skin = {
  id: 'neumorph',
  label: 'Soft emboss',
  dimension: 'layered',
  needs: [],
  cost: 'medium',
  a11yTier: 'AA-with-fallback',
  fallback: 'system',
  contrastEdge: 'rgb(var(--line)/.45)',
  geometry: { chip: '12px', control: '16px', card: '24px', sheet: '32px', stroke: '1px' },
  motion: {
    ease: 'cubic-bezier(0.32, 0.72, 0, 1)',
    easeExit: 'cubic-bezier(0.4, 0, 1, 1)',
    dur: '220ms',
    durSlow: '300ms',
    press: 0.98,
  },
  modes: {
    light: {
      ground: { bg: 'rgb(var(--canvas))', edge: 'transparent', shadow: 'none' },
      card: {
        bg: 'rgb(var(--canvas))',
        edge: 'transparent',
        shadow: '8px 8px 16px rgb(15 18 26/.14), -8px -8px 16px rgb(255 255 255/.90)',
      },
      raised: {
        bg: 'rgb(var(--canvas))',
        edge: 'transparent',
        shadow: '6px 6px 12px rgb(15 18 26/.14), -6px -6px 12px rgb(255 255 255/.90)',
      },
      overlay: {
        bg: 'rgb(var(--surface-2))',
        edge: 'transparent',
        shadow: '12px 12px 24px rgb(15 18 26/.18), -12px -12px 24px rgb(255 255 255/.85)',
      },
      chrome: {
        bg: 'rgb(var(--canvas))',
        edge: 'transparent',
        shadow: '0 8px 16px rgb(15 18 26/.10), 0 -4px 10px rgb(255 255 255/.70)',
      },
      control: {
        bg: 'rgb(var(--canvas))',
        edge: 'transparent',
        shadow: '6px 6px 12px rgb(15 18 26/.14), -6px -6px 12px rgb(255 255 255/.90)',
        hover: {
          bg: 'rgb(var(--surface-1))',
          shadow: '6px 6px 12px rgb(15 18 26/.14), -6px -6px 12px rgb(255 255 255/.90)',
        },
        press: {
          shadow: 'inset 4px 4px 8px rgb(15 18 26/.16), inset -4px -4px 8px rgb(255 255 255/.90)',
        },
      },
      primary: {
        bg: 'rgb(var(--accent))',
        edge: 'transparent',
        shadow: '6px 6px 12px rgb(15 18 26/.20), -6px -6px 12px rgb(255 255 255/.70)',
      },
      well: {
        bg: 'rgb(var(--canvas))',
        edge: 'transparent',
        shadow: 'inset 4px 4px 8px rgb(15 18 26/.14), inset -4px -4px 8px rgb(255 255 255/.90)',
      },
      panel: {
        bg: 'rgb(var(--canvas))',
        edge: 'transparent',
        shadow: '6px 6px 12px rgb(15 18 26/.10), -6px -6px 12px rgb(255 255 255/.85)',
      },
    },
    dark: {
      ground: { bg: 'rgb(var(--canvas))', edge: 'transparent', shadow: 'none' },
      card: {
        bg: 'rgb(var(--canvas))',
        edge: 'transparent',
        shadow: '8px 8px 16px rgb(0 0 0/.55), -8px -8px 16px rgb(255 255 255/.04)',
      },
      raised: {
        bg: 'rgb(var(--canvas))',
        edge: 'transparent',
        shadow: '6px 6px 12px rgb(0 0 0/.55), -6px -6px 12px rgb(255 255 255/.04)',
      },
      overlay: {
        bg: 'rgb(var(--surface-1))',
        edge: 'transparent',
        shadow: '12px 12px 24px rgb(0 0 0/.6), -12px -12px 24px rgb(255 255 255/.03)',
      },
      chrome: {
        bg: 'rgb(var(--canvas))',
        edge: 'transparent',
        shadow: '0 8px 16px rgb(0 0 0/.45), 0 -4px 10px rgb(255 255 255/.03)',
      },
      control: {
        bg: 'rgb(var(--canvas))',
        edge: 'transparent',
        shadow: '6px 6px 12px rgb(0 0 0/.55), -6px -6px 12px rgb(255 255 255/.04)',
        hover: {
          bg: 'rgb(var(--surface-1))',
          shadow: '6px 6px 12px rgb(0 0 0/.55), -6px -6px 12px rgb(255 255 255/.04)',
        },
        press: {
          shadow: 'inset 4px 4px 8px rgb(0 0 0/.6), inset -4px -4px 8px rgb(255 255 255/.04)',
        },
      },
      primary: {
        bg: 'rgb(var(--accent))',
        edge: 'transparent',
        shadow: '6px 6px 12px rgb(0 0 0/.5), -6px -6px 12px rgb(255 255 255/.05)',
      },
      well: {
        bg: 'rgb(var(--canvas))',
        edge: 'transparent',
        shadow: 'inset 4px 4px 8px rgb(0 0 0/.55), inset -4px -4px 8px rgb(255 255 255/.04)',
      },
      panel: {
        bg: 'rgb(var(--canvas))',
        edge: 'transparent',
        shadow: '6px 6px 12px rgb(0 0 0/.45), -6px -6px 12px rgb(255 255 255/.03)',
      },
    },
  },
};
