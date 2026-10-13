import type { Skin } from '../lib/skin/types';
import { both, TONAL } from './_kit';

/**
 * `material` — Material 3 tonal (§6.10): tonal elevation instead of heavy
 * shadow, state layers on hover/press (text colour NEVER changes), emphasized
 * easing, pill controls. No ripple (I6: only target-driven response).
 */
export const material: Skin = {
  id: 'material',
  label: 'Material',
  extends: 'system',
  dimension: 'layered',
  needs: [],
  cost: 'low',
  a11yTier: 'AA',
  fallback: 'self',
  geometry: { chip: '8px', control: '999px', card: '12px', sheet: '28px', stroke: '1px' },
  motion: {
    ease: 'cubic-bezier(.2,0,0,1)',
    easeExit: 'cubic-bezier(.3,0,.8,.15)',
    dur: '250ms',
    durSlow: '350ms',
    press: 1,
  },
  typography: { displayWeight: 500 },
  palette: {
    light: { s1: '0.04', s2: '0.05' },
    dark: { s1: '0.03', s2: '0.03' },
  },
  shadows: {
    light: [
      '0 1px 2px rgb(0 0 0/.30), 0 1px 3px 1px rgb(0 0 0/.15)',
      '0 1px 2px rgb(0 0 0/.30), 0 2px 6px 2px rgb(0 0 0/.15)',
      '0 1px 3px rgb(0 0 0/.30), 0 4px 8px 3px rgb(0 0 0/.15)',
    ],
    dark: [
      '0 1px 2px rgb(0 0 0/.30), 0 1px 3px 1px rgb(0 0 0/.15)',
      '0 1px 2px rgb(0 0 0/.30), 0 2px 6px 2px rgb(0 0 0/.15)',
      '0 1px 3px rgb(0 0 0/.30), 0 4px 8px 3px rgb(0 0 0/.15)',
    ],
  },
  modes: both({
    ground: { bg: 'rgb(var(--canvas))' },
    panel: {
      bg: 'rgb(var(--surface-1))',
      edge: 'transparent',
      sheen: TONAL('var(--k-s1)'),
      shadow: 'none',
    },
    card: {
      bg: 'rgb(var(--surface-2))',
      edge: 'transparent',
      sheen: TONAL('var(--k-s1)'),
      shadow: 'var(--shadow-sm)',
    },
    raised: {
      bg: 'rgb(var(--surface-3))',
      edge: 'rgb(var(--ink-3))',
      sheen: TONAL('var(--k-s1)'),
      shadow: 'none',
    },
    overlay: {
      bg: 'rgb(var(--surface-4))',
      edge: 'transparent',
      sheen: TONAL('var(--k-s2)'),
      shadow: 'var(--shadow-lg)',
    },
    chrome: {
      bg: 'rgb(var(--surface-2))',
      edge: 'transparent',
      sheen: TONAL('var(--k-s2)'),
      shadow: 'none',
      backdrop: 'none',
    },
    well: { bg: 'rgb(var(--surface-1))', edge: 'rgb(var(--ink-3))', shadow: 'none' },
    control: {
      bg: 'rgb(var(--surface-3))',
      edge: 'rgb(var(--ink-3))',
      shadow: 'none',
      hover: { sheen: TONAL('.05') },
      press: { sheen: TONAL('.07') },
    },
    primary: { bg: 'rgb(var(--accent))', edge: 'transparent', shadow: 'var(--shadow-sm)' },
  }),
};
