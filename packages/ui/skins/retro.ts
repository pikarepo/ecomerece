import type { Skin } from '../lib/skin/types';
import { both, NOISE, STRIPES, SYSTEM_STACK } from './_kit';

/**
 * `retro` — 1970s analog (§6.13): warm paper, earthy palette, rounded
 * geometry, grain, the three-band stripe motif in sheens, serif display.
 * `hue-2` (mustard) is darkened to stay at/below the light-edge window where
 * it is used as an edge; brighter values ride sheens only.
 */
export const retro: Skin = {
  id: 'retro',
  label: 'Retro',
  extends: 'system',
  dimension: 'layered',
  needs: [],
  cost: 'low',
  a11yTier: 'AA',
  fallback: 'self',
  geometry: { chip: '6px', control: '10px', card: '16px', sheet: '22px', stroke: '2px' },
  motion: {
    ease: 'cubic-bezier(.25,.8,.25,1)',
    easeExit: 'cubic-bezier(.4,0,1,1)',
    dur: '240ms',
    durSlow: '340ms',
    press: 0.97,
  },
  typography: {
    fontUi: `'DM Sans', ${SYSTEM_STACK}`,
    fontDisplay: `'Fraunces', 'Playfair Display', Georgia, serif`,
    displayWeight: 700,
    displayTracking: '-0.01em',
    import:
      'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap',
  },
  palette: {
    light: {
      'tint-a': '#FFF6E5',
      'tint-b': '#FFE8D6',
      'tint-c': '#FFF1C9',
      'tint-d': '#EAF3E1',
      'hue-1': '#C2410C',
      'hue-2': '#A9770B',
      'hue-3': '#1F7A7A',
      'hue-4': '#5B3A29',
      'hue-5': '#5F6B1E',
      s: '0.06',
    },
    dark: {
      'tint-a': '#1C130D',
      'tint-b': '#170F0B',
      'tint-c': '#1A1406',
      'tint-d': '#0F1710',
      'hue-1': '#FF8A4C',
      'hue-2': '#F2C14E',
      'hue-3': '#3FB8AF',
      'hue-4': '#D9B99B',
      'hue-5': '#A9B84A',
      s: '0.04',
    },
  },
  accentHint: {
    light: { accent: '#C2410C', accentInk: '#FFFFFF' },
    dark: { accent: '#FF6B4A', accentInk: '#2B0A02' },
  },
  modes: both({
    ground: { bg: 'rgb(var(--canvas))' },
    panel: { bg: 'rgb(var(--k-tint-b))', edge: 'rgb(var(--k-hue-4))', shadow: 'none' },
    card: {
      bg: 'rgb(var(--k-tint-a))',
      edge: 'rgb(var(--k-hue-4))',
      sheen: `${STRIPES('rgb(var(--k-hue-1))', 'rgb(var(--k-hue-2))', 'rgb(var(--k-hue-3))')}, ${NOISE(0.05)}`,
      shadow: '3px 3px 0 rgb(var(--k-hue-4)/.85)',
      tones: [
        { bg: 'rgb(var(--k-tint-b))' },
        { bg: 'rgb(var(--k-tint-c))' },
        { bg: 'rgb(var(--k-tint-d))' },
        { bg: 'rgb(var(--k-tint-a))' },
      ],
    },
    raised: {
      bg: 'rgb(var(--k-tint-c))',
      edge: 'rgb(var(--k-hue-4))',
      shadow: '2px 2px 0 rgb(var(--k-hue-4)/.85)',
    },
    overlay: {
      bg: 'rgb(var(--surface-4))',
      edge: 'rgb(var(--k-hue-4))',
      sheen: STRIPES('rgb(var(--k-hue-1))', 'rgb(var(--k-hue-2))', 'rgb(var(--k-hue-3))'),
      shadow: '6px 6px 0 rgb(var(--k-hue-4)/.85)',
    },
    chrome: {
      bg: 'rgb(var(--k-tint-a))',
      edge: 'rgb(var(--k-hue-4))',
      sheen: `linear-gradient(180deg, rgb(var(--k-hue-1)) 0 3px, rgb(var(--k-hue-2)) 3px 6px, transparent 6px), ${NOISE(0.04)}`,
      backdrop: 'none',
      shadow: 'none',
    },
    well: {
      bg: 'rgb(var(--k-tint-b))',
      edge: 'rgb(var(--k-hue-4))',
      shadow: 'inset 2px 2px 0 rgb(var(--k-hue-4)/.30)',
    },
    control: {
      bg: 'rgb(var(--k-tint-c))',
      edge: 'rgb(var(--k-hue-4))',
      shadow: '2px 2px 0 rgb(var(--k-hue-4)/.85)',
      hover: { bg: 'rgb(var(--k-tint-a))', shadow: '2px 2px 0 rgb(var(--k-hue-4)/.85)' },
      press: { bg: 'rgb(var(--k-tint-b))', shadow: '0 0 0 transparent' },
    },
    primary: {
      bg: 'rgb(var(--accent))',
      edge: 'rgb(var(--k-hue-4))',
      shadow: '2px 2px 0 rgb(var(--k-hue-4)/.85)',
    },
  }),
};
