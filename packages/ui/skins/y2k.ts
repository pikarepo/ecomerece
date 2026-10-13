import type { Skin } from '../lib/skin/types';
import { both, NOISE, SYSTEM_STACK } from './_kit';

/**
 * `y2k` — 1999–2003 optimism (§6.12): aqua gloss, glassy bubble controls,
 * pastel sky scene, silver chrome, glow. `backdrop-filter` needed for chrome
 * only. Dark gloss alpha is clamped to the §3.2 dark limit (.03).
 */
const GLOSS = (): string =>
  `linear-gradient(180deg, rgb(255 255 255/var(--k-gloss)) 0, rgb(255 255 255/calc(var(--k-gloss) * .3)) 49%, transparent 50%), ${NOISE(0.03)}`;

export const y2k: Skin = {
  id: 'y2k',
  label: 'Y2K',
  extends: 'system',
  dimension: 'layered',
  needs: ['backdrop-filter'],
  cost: 'medium',
  a11yTier: 'AA',
  fallback: 'solid',
  geometry: { chip: '12px', control: '999px', card: '24px', sheet: '32px', stroke: '1px' },
  motion: {
    ease: 'cubic-bezier(.34,1.3,.64,1)',
    easeExit: 'cubic-bezier(.4,0,1,1)',
    dur: '220ms',
    durSlow: '320ms',
    press: 0.96,
  },
  typography: {
    fontUi: `Nunito, ${SYSTEM_STACK}`,
    displayWeight: 800,
    iconStroke: 2.25,
    import: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;800&display=swap',
  },
  palette: {
    light: {
      'tint-a': '#EAF6FF',
      'tint-b': '#FFEAF6',
      'tint-c': '#F1FFE0',
      'tint-d': '#F0ECFF',
      'hue-1': '#D6217F',
      'hue-2': '#1D6FB8',
      'hue-3': '#6D28D9',
      'hue-4': '#4D7C0F',
      'hue-5': '#5B6475',
      gloss: '0.8',
      g: '0.3',
    },
    dark: {
      'tint-a': '#0B1424',
      'tint-b': '#1A0B1A',
      'tint-c': '#0C1A0B',
      'tint-d': '#0F0B24',
      'hue-1': '#FF5FB7',
      'hue-2': '#7CC8FF',
      'hue-3': '#B79CFF',
      'hue-4': '#B6F04A',
      'hue-5': '#C9D1E0',
      gloss: '0.03',
      g: '0.4',
    },
  },
  accentHint: {
    light: { accent: '#1D6FB8', accentInk: '#FFFFFF' },
    dark: { accent: '#7CC8FF', accentInk: '#06223A' },
  },
  scene: {
    light:
      'radial-gradient(40% 35% at 15% 10%, rgb(var(--k-hue-3)/.30), transparent), radial-gradient(35% 30% at 90% 20%, rgb(var(--k-hue-1)/.22), transparent), radial-gradient(40% 40% at 70% 95%, rgb(var(--k-hue-4)/.26), transparent), rgb(var(--canvas))',
    dark: 'radial-gradient(40% 35% at 15% 10%, rgb(var(--k-hue-3)/.22), transparent), radial-gradient(35% 30% at 90% 20%, rgb(var(--k-hue-1)/.16), transparent), radial-gradient(40% 40% at 70% 95%, rgb(var(--k-hue-4)/.20), transparent), rgb(var(--canvas))',
  },
  modes: both({
    ground: { bg: 'rgb(var(--canvas))' },
    panel: { bg: 'rgb(var(--k-tint-b))', edge: 'rgb(var(--k-hue-1)/.45)', shadow: 'none' },
    card: {
      bg: 'rgb(var(--k-tint-a))',
      edge: 'rgb(var(--k-hue-2)/.55)',
      sheen: GLOSS(),
      shadow: '0 8px 24px rgb(var(--k-hue-2)/var(--k-g))',
      tones: [
        { bg: 'rgb(var(--k-tint-b))', edge: 'rgb(var(--k-hue-2)/.55)' },
        { bg: 'rgb(var(--k-tint-c))', edge: 'rgb(var(--k-hue-2)/.55)' },
        { bg: 'rgb(var(--k-tint-d))', edge: 'rgb(var(--k-hue-2)/.55)' },
        { bg: 'rgb(var(--k-tint-a))', edge: 'rgb(var(--k-hue-2)/.55)' },
      ],
    },
    raised: { bg: 'rgb(var(--surface-3))', edge: 'rgb(var(--k-hue-2))', shadow: 'none' },
    overlay: {
      bg: 'rgb(var(--surface-4))',
      edge: 'rgb(var(--k-hue-3))',
      shadow: '0 20px 48px rgb(var(--k-hue-3)/var(--k-g))',
    },
    chrome: {
      bg: 'rgb(var(--k-tint-a)/.80)',
      edge: 'rgb(var(--k-hue-2)/.45)',
      backdrop: 'blur(20px) saturate(160%)',
      shadow: 'none',
    },
    well: {
      bg: 'rgb(var(--k-tint-d))',
      edge: 'rgb(var(--k-hue-2))',
      shadow: 'inset 0 2px 6px rgb(var(--k-hue-2)/.30)',
    },
    control: {
      bg: 'rgb(var(--k-tint-a))',
      edge: 'rgb(var(--k-hue-2))',
      sheen: GLOSS(),
      shadow: 'inset 0 -3px 6px rgb(var(--k-hue-2)/.25), 0 4px 12px rgb(var(--k-hue-1)/var(--k-g))',
      hover: {
        bg: 'rgb(var(--k-tint-d))',
        sheen: GLOSS(),
        shadow:
          'inset 0 -3px 6px rgb(var(--k-hue-2)/.25), 0 4px 12px rgb(var(--k-hue-1)/var(--k-g))',
      },
      press: {
        sheen: 'none',
        shadow: 'inset 0 3px 8px rgb(var(--k-hue-2)/.35)',
      },
    },
    primary: {
      bg: 'rgb(var(--accent))',
      edge: 'transparent',
      sheen: 'linear-gradient(180deg, rgb(255 255 255/var(--k-gloss)), rgb(255 255 255/0) 49%)',
      shadow: '0 4px 14px rgb(var(--k-hue-1)/var(--k-g))',
    },
  }),
};
