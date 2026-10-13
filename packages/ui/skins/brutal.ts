import type { Skin } from '../lib/skin/types';
import { both } from './_kit';

/**
 * `brutal` — the raw web, on purpose (§6.6): mono type, thick black rules,
 * 2px corners minimum (never 0), no shadows, highlighter hover, linear motion.
 */
export const brutal: Skin = {
  id: 'brutal',
  label: 'Brutal',
  extends: 'system',
  dimension: 'flat',
  needs: [],
  cost: 'low',
  a11yTier: 'AA',
  fallback: 'self',
  geometry: { chip: '2px', control: '2px', card: '2px', sheet: '2px', stroke: '2px' },
  motion: {
    ease: 'cubic-bezier(0,0,1,1)',
    dur: '80ms',
    durSlow: '120ms',
    press: 1,
  },
  typography: {
    fontUi: `'JetBrains Mono', 'IBM Plex Mono', ui-monospace, Menlo, monospace`,
    displayWeight: 800,
    displayTracking: '-0.01em',
    iconStroke: 2.5,
  },
  palette: {
    light: {
      'tint-a': '#FFFFFF',
      'tint-b': '#F4F4F0',
      'tint-c': '#FFFBD1',
      'hue-1': '#FFE600',
      s: '0.03',
    },
    dark: {
      'tint-a': '#000000',
      'tint-b': '#0A0A0A',
      'tint-c': '#1A1700',
      'hue-1': '#FFE600',
      s: '0.02',
    },
  },
  modes: both({
    ground: { bg: 'rgb(var(--canvas))' },
    panel: { bg: 'rgb(var(--k-tint-b))', edge: 'rgb(var(--ink))', shadow: 'none' },
    card: { bg: 'rgb(var(--k-tint-a))', edge: 'rgb(var(--ink))', shadow: 'none' },
    raised: { bg: 'rgb(var(--k-tint-b))', edge: 'rgb(var(--ink))', shadow: 'none' },
    overlay: {
      bg: 'rgb(var(--k-tint-a))',
      edge: 'rgb(var(--ink))',
      shadow: '0 0 0 2px rgb(var(--canvas)), 0 0 0 4px rgb(var(--ink))',
    },
    chrome: {
      bg: 'rgb(var(--k-tint-b))',
      edge: 'rgb(var(--ink))',
      shadow: 'none',
      backdrop: 'none',
    },
    well: {
      bg: 'rgb(var(--k-tint-b))',
      edge: 'rgb(var(--ink))',
      shadow: 'inset 3px 3px 0 rgb(var(--ink)/.25)',
    },
    control: {
      bg: 'rgb(var(--k-tint-a))',
      edge: 'rgb(var(--ink))',
      shadow: 'none',
      hover: { bg: 'rgb(var(--k-tint-c))', shadow: 'none' },
      press: { bg: 'rgb(var(--k-tint-c))', shadow: 'inset 0 0 0 2px rgb(var(--ink))' },
    },
    primary: { bg: 'rgb(var(--accent))', edge: 'rgb(var(--ink))', shadow: 'none' },
  }),
};
