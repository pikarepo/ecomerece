import type { Skin } from '../lib/skin/types';
import { both, SYSTEM_STACK, TOPRULE } from './_kit';

/**
 * `editorial` — print layout (§6.15): warm paper, serif display, 2px section
 * rules, hairlines, whitespace. No shadows anywhere, no backdrop. Differs
 * from `minimal` by serif display, warm paper, top-rule material, 180ms.
 */
export const editorial: Skin = {
  id: 'editorial',
  label: 'Editorial',
  extends: 'system',
  dimension: 'flat',
  needs: [],
  cost: 'low',
  a11yTier: 'AA',
  fallback: 'self',
  geometry: { chip: '2px', control: '2px', card: '2px', sheet: '4px', stroke: '1px' },
  motion: {
    ease: 'cubic-bezier(.4,0,.2,1)',
    dur: '180ms',
    durSlow: '260ms',
    press: 1,
  },
  typography: {
    fontUi: `Inter, ${SYSTEM_STACK}`,
    fontDisplay: `'Fraunces', 'Playfair Display', Georgia, serif`,
    displayWeight: 700,
    displayTracking: '-0.02em',
    import:
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap',
  },
  palette: {
    light: {
      'tint-a': '#FBF8F1',
      'tint-b': '#F4F0E6',
      'tint-c': '#FFF4C7',
      'hue-1': '#0B0D12',
    },
    dark: {
      'tint-a': '#14120F',
      'tint-b': '#100E0B',
      'tint-c': '#1A1606',
      'hue-1': '#F5F6F8',
    },
  },
  accentHint: {
    light: { accent: '#B3261E', accentInk: '#FFFFFF' },
    dark: { accent: '#FF7A6B', accentInk: '#2B0B08' },
  },
  modes: both({
    ground: { bg: 'rgb(var(--canvas))' },
    panel: { bg: 'rgb(var(--k-tint-b))', edge: 'rgb(var(--line)/.12)', shadow: 'none' },
    card: {
      bg: 'rgb(var(--k-tint-a))',
      edge: 'transparent',
      sheen: TOPRULE('rgb(var(--k-hue-1))', 2),
      shadow: 'none',
      tones: [{ bg: 'rgb(var(--k-tint-c))' }],
    },
    raised: { bg: 'rgb(var(--k-tint-a))', edge: 'rgb(var(--ink)/.45)', shadow: 'none' },
    overlay: {
      bg: 'rgb(var(--surface-4))',
      edge: 'rgb(var(--ink)/.55)',
      sheen: TOPRULE('rgb(var(--k-hue-1))', 2),
      shadow: 'none',
    },
    chrome: {
      bg: 'rgb(var(--k-tint-a))',
      edge: 'rgb(var(--line)/.12)',
      sheen: TOPRULE('rgb(var(--k-hue-1))', 3),
      shadow: 'none',
      backdrop: 'none',
    },
    well: { bg: 'rgb(var(--k-tint-b))', edge: 'rgb(var(--ink)/.45)', shadow: 'none' },
    control: {
      bg: 'rgb(var(--k-tint-a))',
      edge: 'rgb(var(--ink)/.45)',
      shadow: 'none',
      hover: { bg: 'rgb(var(--k-tint-b))', shadow: 'none' },
      press: { bg: 'rgb(var(--k-tint-b))', shadow: 'none' },
    },
    primary: { bg: 'rgb(var(--accent))', edge: 'transparent', shadow: 'none' },
  }),
};
