import type { Skin } from '../lib/skin/types';
import { both, GRID, SCAN, SYSTEM_STACK } from './_kit';

/**
 * `cyber` — dark-first neon on near-black (§6.14): sharp corners, neon edges,
 * scanline sheen, faint perspective grid scene. Daylight form for light theme:
 * pale cool paper, deep neon edges, hard offsets, `g = .00` so glows vanish.
 * No glitch/flicker/looping animation (I6). Blur budget: chrome only.
 */
export const cyber: Skin = {
  id: 'cyber',
  label: 'Cyber',
  extends: 'system',
  dimension: 'layered',
  needs: [],
  cost: 'medium',
  a11yTier: 'AA',
  fallback: 'solid',
  geometry: { chip: '2px', control: '4px', card: '4px', sheet: '6px', stroke: '1px' },
  motion: {
    ease: 'cubic-bezier(.2,.9,.1,1)',
    easeExit: 'cubic-bezier(.4,0,1,1)',
    dur: '140ms',
    durSlow: '220ms',
    press: 0.98,
  },
  typography: {
    fontUi: `'Chakra Petch', ${SYSTEM_STACK}`,
    displayWeight: 700,
    displayTracking: '0',
    iconStroke: 1.75,
    import: 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;700&display=swap',
  },
  palette: {
    light: {
      'tint-a': '#F1F6FA',
      'tint-b': '#F5F0FA',
      'tint-c': '#FAF1F6',
      'tint-d': '#F7F6E6',
      'hue-1': '#0E7490',
      'hue-2': '#BE185D',
      'hue-3': '#8A5A00',
      'hue-4': '#5B34C9',
      'hue-5': '#0F7B3F',
      s: '0.03',
      g: '0.0',
    },
    dark: {
      'tint-a': '#070B14',
      'tint-b': '#0B0614',
      'tint-c': '#100612',
      'tint-d': '#0F0E04',
      'hue-1': '#22E5FF',
      'hue-2': '#FF2BD6',
      'hue-3': '#FCEE0A',
      'hue-4': '#8B5CFF',
      'hue-5': '#39FF88',
      s: '0.02',
      g: '0.35',
    },
  },
  accentHint: {
    light: { accent: '#0E7490', accentInk: '#FFFFFF' },
    dark: { accent: '#22E5FF', accentInk: '#031418' },
  },
  scene: {
    light: `${GRID('rgb(var(--k-hue-1)/.07)')}, radial-gradient(50% 40% at 85% 0%, rgb(var(--k-hue-2)/.10), transparent), radial-gradient(45% 35% at 10% 100%, rgb(var(--k-hue-1)/.08), transparent), rgb(var(--canvas))`,
    dark: `${GRID('rgb(var(--k-hue-1)/.06)')}, radial-gradient(50% 40% at 85% 0%, rgb(var(--k-hue-2)/.14), transparent), radial-gradient(45% 35% at 10% 100%, rgb(var(--k-hue-1)/.12), transparent), rgb(var(--canvas))`,
  },
  modes: {
    ...both({
      ground: { bg: 'rgb(var(--canvas))' },
      panel: { bg: 'rgb(var(--k-tint-b))', edge: 'rgb(var(--k-hue-4)/.55)', shadow: 'none' },
      card: {
        bg: 'rgb(var(--k-tint-a))',
        edge: 'rgb(var(--k-hue-1)/.65)',
        sheen: SCAN,
        shadow: '0 0 0 1px rgb(var(--k-hue-1)/.20), 0 0 18px rgb(var(--k-hue-1)/var(--k-g))',
        tones: [
          { bg: 'rgb(var(--k-tint-b))', edge: 'rgb(var(--k-hue-2)/.65)' },
          { bg: 'rgb(var(--k-tint-c))', edge: 'rgb(var(--k-hue-2)/.65)' },
          { bg: 'rgb(var(--k-tint-d))', edge: 'rgb(var(--k-hue-3)/.65)' },
          { bg: 'rgb(var(--k-tint-a))', edge: 'rgb(var(--k-hue-1)/.65)' },
        ],
      },
      raised: { bg: 'rgb(var(--k-tint-a))', edge: 'rgb(var(--k-hue-1))', shadow: 'none' },
      overlay: {
        bg: 'rgb(var(--k-tint-a))',
        edge: 'rgb(var(--k-hue-2))',
        shadow:
          '0 0 0 1px rgb(var(--k-hue-2)/.30), 0 0 28px rgb(var(--k-hue-2)/var(--k-g)), 0 20px 48px rgb(0 0 0/.45)',
      },
      chrome: {
        bg: 'rgb(var(--k-tint-a)/.88)',
        edge: 'rgb(var(--k-hue-1)/.55)',
        backdrop: 'blur(12px)',
        shadow: 'none',
      },
      control: {
        bg: 'rgb(var(--k-tint-a))',
        edge: 'rgb(var(--k-hue-1))',
        shadow: '0 0 12px rgb(var(--k-hue-1)/var(--k-g))',
        hover: {
          bg: 'rgb(var(--k-tint-b))',
          edge: 'rgb(var(--k-hue-2))',
          shadow: '0 0 12px rgb(var(--k-hue-2)/var(--k-g))',
        },
        press: { bg: 'rgb(var(--k-tint-c))', shadow: 'inset 0 0 10px rgb(var(--k-hue-1)/.35)' },
      },
      primary: {
        bg: 'rgb(var(--accent))',
        edge: 'rgb(var(--k-hue-1))',
        shadow: '0 0 16px rgb(var(--k-hue-1)/var(--k-g))',
      },
      well: {
        bg: 'rgb(var(--k-tint-b))',
        edge: 'rgb(var(--k-hue-4))',
        shadow: 'inset 0 0 8px rgb(var(--k-hue-4)/.35)',
      },
    }),
    // light mode override: glows off; crisp offsets instead
    light: {
      ground: { bg: 'rgb(var(--canvas))' },
      panel: { bg: 'rgb(var(--k-tint-b))', edge: 'rgb(var(--k-hue-4)/.55)', shadow: 'none' },
      card: {
        bg: 'rgb(var(--k-tint-a))',
        edge: 'rgb(var(--k-hue-1)/.65)',
        sheen: SCAN,
        shadow: '3px 3px 0 rgb(var(--k-hue-1)/.35)',
        tones: [
          { bg: 'rgb(var(--k-tint-b))', edge: 'rgb(var(--k-hue-2)/.65)' },
          { bg: 'rgb(var(--k-tint-c))', edge: 'rgb(var(--k-hue-2)/.65)' },
          { bg: 'rgb(var(--k-tint-d))', edge: 'rgb(var(--k-hue-3)/.65)' },
          { bg: 'rgb(var(--k-tint-a))', edge: 'rgb(var(--k-hue-1)/.65)' },
        ],
      },
      raised: {
        bg: 'rgb(var(--k-tint-a))',
        edge: 'rgb(var(--k-hue-1))',
        shadow: '2px 2px 0 rgb(var(--k-hue-1)/.35)',
      },
      overlay: {
        bg: 'rgb(var(--k-tint-a))',
        edge: 'rgb(var(--k-hue-2))',
        shadow: '3px 3px 0 rgb(var(--k-hue-2)/.35), 0 20px 48px rgb(0 0 0/.12)',
      },
      chrome: {
        bg: 'rgb(var(--k-tint-a)/.88)',
        edge: 'rgb(var(--k-hue-1)/.55)',
        backdrop: 'blur(12px)',
        shadow: 'none',
      },
      control: {
        bg: 'rgb(var(--k-tint-a))',
        edge: 'rgb(var(--k-hue-1))',
        shadow: 'none',
        hover: { bg: 'rgb(var(--k-tint-b))', edge: 'rgb(var(--k-hue-2))', shadow: 'none' },
        press: { bg: 'rgb(var(--k-tint-c))', shadow: 'inset 0 0 0 1px rgb(var(--k-hue-1)/.5)' },
      },
      primary: {
        bg: 'rgb(var(--accent))',
        edge: 'rgb(var(--k-hue-1))',
        shadow: '2px 2px 0 rgb(var(--k-hue-1)/.35)',
      },
      well: {
        bg: 'rgb(var(--k-tint-b))',
        edge: 'rgb(var(--k-hue-4))',
        shadow: 'inset 0 0 0 1px rgb(var(--k-hue-4)/.4)',
      },
    },
  },
};
