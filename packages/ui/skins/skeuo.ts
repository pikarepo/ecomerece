import type { Skin } from '../lib/skin/types';
import { NOISE, SYSTEM_STACK } from './_kit';

/**
 * `skeuo` — a lighting model (§6.8): top light, bevels, glossy buttons,
 * grain on surfaces, recessed wells, real drop shadows. Alpha-safe sheens:
 * gloss/grain ride the fill top edge, never wash text zones (§3.2).
 */
export const skeuo: Skin = {
  id: 'skeuo',
  label: 'Skeuo',
  extends: 'system',
  dimension: 'layered',
  needs: [],
  cost: 'medium',
  a11yTier: 'AA',
  fallback: 'self',
  geometry: { chip: '6px', control: '12px', card: '16px', sheet: '22px', stroke: '1px' },
  motion: {
    ease: 'cubic-bezier(.25,.8,.3,1)',
    easeExit: 'cubic-bezier(.4,0,1,1)',
    dur: '180ms',
    durSlow: '260ms',
    press: 0.97,
  },
  typography: { fontUi: SYSTEM_STACK, displayWeight: 700 },
  palette: {
    light: {
      'tint-a': '#F4F5F7',
      'tint-b': '#EDEFF2',
      hi: '#FFFFFF',
      lo: '#0B0D12',
      gloss: '0.55',
      s: '0.06',
    },
    dark: {
      'tint-a': '#1D1F23',
      'tint-b': '#15171A',
      hi: '#FFFFFF',
      lo: '#000000',
      gloss: '0.03',
      s: '0.04',
    },
  },
  modes: {
    light: {
      ground: { bg: 'rgb(var(--canvas))' },
      panel: {
        bg: 'rgb(var(--k-tint-b))',
        edge: 'rgb(var(--k-lo)/.18)',
        sheen: NOISE(0.05),
        shadow: 'none',
      },
      card: {
        bg: 'rgb(var(--k-tint-a))',
        edge: 'rgb(var(--k-lo)/.18)',
        sheen: `linear-gradient(180deg, rgb(255 255 255/var(--k-gloss)), rgb(255 255 255/0) 40%), ${NOISE(0.05)}`,
        shadow:
          'inset 0 1px 0 rgb(255 255 255/.9), inset 0 -1px 0 rgb(var(--k-lo)/.12), 0 1px 2px rgb(var(--k-lo)/.20), 0 10px 20px -6px rgb(var(--k-lo)/.22)',
      },
      raised: {
        bg: 'rgb(var(--k-tint-b))',
        edge: 'rgb(var(--k-lo)/.18)',
        sheen: `linear-gradient(180deg, rgb(255 255 255/var(--k-gloss)), rgb(255 255 255/0) 40%), ${NOISE(0.05)}`,
        shadow:
          'inset 0 1px 0 rgb(255 255 255/.9), 0 1px 2px rgb(var(--k-lo)/.20), 0 8px 16px -6px rgb(var(--k-lo)/.20)',
      },
      overlay: {
        bg: 'rgb(var(--surface-4))',
        edge: 'rgb(var(--k-lo)/.18)',
        sheen: `linear-gradient(180deg, rgb(255 255 255/var(--k-gloss)), rgb(255 255 255/0) 34%)`,
        shadow: '0 24px 48px -12px rgb(var(--k-lo)/.35), inset 0 1px 0 rgb(255 255 255/.9)',
      },
      chrome: {
        bg: 'rgb(var(--k-tint-a))',
        edge: 'rgb(var(--k-lo)/.18)',
        sheen: NOISE(0.05),
        backdrop: 'none',
        shadow: 'inset 0 1px 0 rgb(255 255 255/.8), 0 2px 6px rgb(var(--k-lo)/.15)',
      },
      well: {
        bg: 'rgb(var(--k-tint-b))',
        edge: 'rgb(var(--k-lo)/.30)',
        shadow: 'inset 0 2px 5px rgb(var(--k-lo)/.30), 0 1px 0 rgb(255 255 255/.8)',
      },
      control: {
        bg: 'rgb(var(--k-tint-a))',
        edge: 'rgb(var(--k-lo)/.45)',
        sheen:
          'linear-gradient(180deg, rgb(255 255 255/var(--k-gloss)) 0, rgb(255 255 255/calc(var(--k-gloss) * .3)) 50%, transparent 51%)',
        shadow:
          'inset 0 1px 0 rgb(255 255 255/.9), 0 1px 1px rgb(var(--k-lo)/.30), 0 3px 6px rgb(var(--k-lo)/.20)',
        hover: {
          bg: 'rgb(var(--surface-4))',
          shadow:
            'inset 0 1px 0 rgb(255 255 255/.9), 0 1px 1px rgb(var(--k-lo)/.30), 0 3px 6px rgb(var(--k-lo)/.20)',
        },
        press: {
          sheen: 'none',
          shadow: 'inset 0 3px 6px rgb(var(--k-lo)/.35)',
        },
      },
      primary: {
        bg: 'rgb(var(--accent))',
        edge: 'rgb(var(--k-lo)/.45)',
        sheen:
          'linear-gradient(180deg, rgb(255 255 255/var(--k-gloss)) 0, rgb(255 255 255/calc(var(--k-gloss) * .3)) 50%, transparent 51%)',
        shadow:
          'inset 0 1px 0 rgb(255 255 255/.5), 0 1px 1px rgb(var(--k-lo)/.30), 0 3px 6px rgb(var(--k-lo)/.20)',
      },
    },
    dark: {
      ground: { bg: 'rgb(var(--canvas))' },
      panel: {
        bg: 'rgb(var(--k-tint-b))',
        edge: 'rgb(var(--k-lo)/.35)',
        sheen: NOISE(0.04),
        shadow: 'none',
      },
      card: {
        bg: 'rgb(var(--k-tint-a))',
        edge: 'rgb(var(--k-lo)/.35)',
        sheen: `linear-gradient(180deg, rgb(255 255 255/var(--k-gloss)), rgb(255 255 255/0) 40%), ${NOISE(0.04)}`,
        shadow:
          'inset 0 1px 0 rgb(255 255 255/.08), inset 0 -1px 0 rgb(0 0 0/.45), 0 1px 2px rgb(0 0 0/.4), 0 10px 20px -6px rgb(0 0 0/.45)',
      },
      raised: {
        bg: 'rgb(var(--k-tint-b))',
        edge: 'rgb(var(--k-lo)/.35)',
        sheen: `linear-gradient(180deg, rgb(255 255 255/var(--k-gloss)), rgb(255 255 255/0) 40%), ${NOISE(0.04)}`,
        shadow: 'inset 0 1px 0 rgb(255 255 255/.08), 0 1px 2px rgb(0 0 0/.4)',
      },
      overlay: {
        bg: 'rgb(var(--surface-4))',
        edge: 'rgb(var(--k-lo)/.35)',
        shadow: '0 24px 48px -12px rgb(0 0 0/.55), inset 0 1px 0 rgb(255 255 255/.08)',
      },
      chrome: {
        bg: 'rgb(var(--k-tint-a))',
        edge: 'rgb(var(--k-lo)/.35)',
        sheen: NOISE(0.04),
        backdrop: 'none',
        shadow: 'inset 0 1px 0 rgb(255 255 255/.06), 0 2px 6px rgb(0 0 0/.35)',
      },
      well: {
        bg: 'rgb(var(--k-tint-b))',
        edge: 'rgb(var(--k-lo)/.55)',
        shadow: 'inset 0 2px 5px rgb(0 0 0/.45), 0 1px 0 rgb(255 255 255/.06)',
      },
      control: {
        bg: 'rgb(var(--k-tint-a))',
        edge: 'rgb(var(--k-lo)/.55)',
        sheen:
          'linear-gradient(180deg, rgb(255 255 255/var(--k-gloss)) 0, rgb(255 255 255/calc(var(--k-gloss) * .3)) 50%, transparent 51%)',
        shadow:
          'inset 0 1px 0 rgb(255 255 255/.08), 0 1px 1px rgb(0 0 0/.4), 0 3px 6px rgb(0 0 0/.30)',
        hover: {
          bg: 'rgb(var(--surface-3))',
          shadow:
            'inset 0 1px 0 rgb(255 255 255/.08), 0 1px 1px rgb(0 0 0/.4), 0 3px 6px rgb(0 0 0/.30)',
        },
        press: {
          sheen: 'none',
          shadow: 'inset 0 3px 6px rgb(0 0 0/.5)',
        },
      },
      primary: {
        bg: 'rgb(var(--accent))',
        edge: 'rgb(var(--k-lo)/.55)',
        sheen:
          'linear-gradient(180deg, rgb(255 255 255/var(--k-gloss)) 0, rgb(255 255 255/calc(var(--k-gloss) * .3)) 50%, transparent 51%)',
        shadow: 'inset 0 1px 0 rgb(255 255 255/.2), 0 1px 1px rgb(0 0 0/.4)',
      },
    },
  },
};
