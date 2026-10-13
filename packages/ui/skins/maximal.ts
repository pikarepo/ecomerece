import type { Skin } from '../lib/skin/types';
import { both, SYSTEM_STACK } from './_kit';

/**
 * `maximal` — more is more (§6.2): colour-blocked pastel layers, pattern
 * sheen, thick coloured edges, stacked hard offset shadows, bouncy radii.
 * Decoration lives in the skin only; screens still respect I5.
 */
export const maximal: Skin = {
  id: 'maximal',
  label: 'Maximal',
  extends: 'system',
  dimension: 'layered',
  needs: [],
  cost: 'medium',
  a11yTier: 'AA',
  fallback: 'self',
  geometry: { chip: '8px', control: '20px', card: '32px', sheet: '44px', stroke: '2px' },
  motion: {
    ease: 'cubic-bezier(.34,1.56,.64,1)',
    easeExit: 'cubic-bezier(.4,0,1,1)',
    dur: '280ms',
    durSlow: '380ms',
    press: 0.95,
  },
  typography: {
    fontUi: `'Space Grotesk', ${SYSTEM_STACK}`,
    displayWeight: 800,
    displayTracking: '-0.03em',
    iconStroke: 2.25,
    import: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap',
  },
  palette: {
    light: {
      'tint-a': '#FFF4F9',
      'tint-b': '#F5EEFF',
      'tint-c': '#E6FBF0',
      'tint-d': '#FFF6C2',
      'hue-1': '#D6217F',
      'hue-2': '#6D28D9',
      'hue-3': '#0891B2',
      'hue-4': '#EA580C',
      'hue-5': '#4D7C0F',
      s: '0.05',
    },
    dark: {
      'tint-a': '#160B1F',
      'tint-b': '#0D0F26',
      'tint-c': '#07181A',
      'tint-d': '#1C1606',
      'hue-1': '#FF4FB0',
      'hue-2': '#A78BFA',
      'hue-3': '#22D3EE',
      'hue-4': '#FB923C',
      'hue-5': '#A3E635',
      s: '0.03',
    },
  },
  accentHint: {
    light: { accent: '#6D28D9', accentInk: '#FFFFFF' },
    dark: { accent: '#A78BFA', accentInk: '#1A0B33' },
  },
  scene: {
    light:
      'radial-gradient(35% 30% at 10% 5%, rgb(var(--k-hue-1)/.18), transparent), radial-gradient(35% 30% at 95% 20%, rgb(var(--k-hue-3)/.16), transparent), radial-gradient(rgb(var(--k-hue-2)/.20) 1.5px, transparent 1.5px) 0 0/22px 22px, rgb(var(--canvas))',
    dark: 'radial-gradient(35% 30% at 10% 5%, rgb(var(--k-hue-1)/.14), transparent), radial-gradient(35% 30% at 95% 20%, rgb(var(--k-hue-3)/.12), transparent), radial-gradient(rgb(var(--k-hue-2)/.16) 1.5px, transparent 1.5px) 0 0/22px 22px, rgb(var(--canvas))',
  },
  modes: both({
    ground: { bg: 'rgb(var(--canvas))' },
    panel: { bg: 'rgb(var(--k-tint-c))', edge: 'rgb(var(--k-hue-3))', shadow: 'none' },
    card: {
      bg: 'rgb(var(--k-tint-a))',
      edge: 'rgb(var(--k-hue-2))',
      shadow: '5px 5px 0 rgb(var(--k-hue-1)), 10px 10px 0 rgb(var(--k-hue-3))',
      sheen:
        'repeating-linear-gradient(135deg, rgb(var(--k-hue-2)/var(--k-s)) 0 6px, transparent 6px 14px)',
      tones: [
        { bg: 'rgb(var(--k-tint-b))' },
        { bg: 'rgb(var(--k-tint-c))' },
        { bg: 'rgb(var(--k-tint-d))' },
        { bg: 'rgb(var(--k-tint-a))', edge: 'rgb(var(--k-hue-4))' },
      ],
    },
    raised: {
      bg: 'rgb(var(--k-tint-b))',
      edge: 'rgb(var(--k-hue-2))',
      shadow: '3px 3px 0 rgb(var(--k-hue-3))',
    },
    overlay: {
      bg: 'rgb(var(--k-tint-d))',
      edge: 'rgb(var(--k-hue-2))',
      shadow: '8px 8px 0 rgb(var(--k-hue-1)), 16px 16px 0 rgb(var(--k-hue-4))',
    },
    chrome: {
      bg: 'rgb(var(--k-tint-b))',
      edge: 'rgb(var(--k-hue-2))',
      shadow: 'none',
      backdrop: 'none',
      sheen:
        'linear-gradient(90deg, rgb(var(--k-hue-1)), rgb(var(--k-hue-4)), rgb(var(--k-hue-5)), rgb(var(--k-hue-3)), rgb(var(--k-hue-2))) bottom/100% 4px no-repeat',
    },
    well: {
      bg: 'rgb(var(--k-tint-b))',
      edge: 'rgb(var(--k-hue-2))',
      shadow: 'inset 0 3px 0 rgb(var(--k-hue-2)/.30)',
    },
    control: {
      bg: 'rgb(var(--k-tint-c))',
      edge: 'rgb(var(--k-hue-2))',
      shadow: '3px 3px 0 rgb(var(--k-hue-1))',
      hover: { bg: 'rgb(var(--k-tint-d))', shadow: '3px 3px 0 rgb(var(--k-hue-1))' },
      press: { bg: 'rgb(var(--k-tint-c))', shadow: '1px 1px 0 rgb(var(--k-hue-1))' },
    },
    primary: {
      bg: 'rgb(var(--accent))',
      edge: 'rgb(var(--ink))',
      shadow: '4px 4px 0 rgb(var(--k-hue-4))',
    },
  }),
};
