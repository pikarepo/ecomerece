import type { Skin } from '../lib/skin/types';

/**
 * `clay` — volume instead of hairlines (§36.3): stacked inset + drop shadows,
 * stroke 0. The slight overshoot curve is allowed ONLY on the touched element
 * (§17, validator V11). v3.1 refinement: pastel clay tints via palette tones
 * (all inside the §3.2 luminance windows) + warm accent hint.
 */
export const clay: Skin = {
  id: 'clay',
  label: 'Clay',
  dimension: 'layered',
  needs: [],
  cost: 'medium',
  a11yTier: 'AA',
  fallback: 'self',
  geometry: { chip: '14px', control: '20px', card: '28px', sheet: '36px', stroke: '0px' },
  motion: {
    ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // slight overshoot on the touched element
    easeExit: 'cubic-bezier(0.4, 0, 1, 1)',
    dur: '260ms',
    durSlow: '340ms',
    press: 0.94,
  },
  palette: {
    light: {
      'tint-a': '#F3EEFF',
      'tint-b': '#FFF1EA',
      'tint-c': '#EAF8F1',
      'tint-d': '#EAF3FF',
      hi: '#FFFFFF',
      lo: '#0B0D12',
    },
    dark: {
      'tint-a': '#150F24',
      'tint-b': '#1C1210',
      'tint-c': '#0C1A14',
      'tint-d': '#0E1624',
      hi: '#FFFFFF',
      lo: '#000000',
    },
  },
  accentHint: {
    light: { accent: '#C2410C', accentInk: '#FFFFFF' },
    dark: { accent: '#FF6B4A', accentInk: '#2B0A02' },
  },
  modes: {
    light: {
      card: {
        bg: 'rgb(var(--surface-2))',
        edge: 'transparent',
        shadow:
          '0 14px 28px rgb(15 18 26/.10), inset 0 -8px 14px rgb(15 18 26/.06), inset 0 8px 12px rgb(255 255 255/.90)',
        tones: [
          { bg: 'rgb(var(--k-tint-a))' },
          { bg: 'rgb(var(--k-tint-b))' },
          { bg: 'rgb(var(--k-tint-c))' },
          { bg: 'rgb(var(--k-tint-d))' },
        ],
      },
      raised: {
        bg: 'rgb(var(--surface-3))',
        edge: 'transparent',
        shadow:
          '0 8px 16px rgb(15 18 26/.12), inset 0 -4px 8px rgb(15 18 26/.08), inset 0 4px 8px rgb(255 255 255/.95)',
      },
      chrome: {
        bg: 'rgb(var(--surface-3)/.85)',
        edge: 'transparent',
        backdrop: 'blur(20px) saturate(150%)',
        shadow: '0 8px 16px rgb(15 18 26/.10)',
      },
      overlay: {
        bg: 'rgb(var(--surface-4))',
        edge: 'transparent',
        shadow:
          '0 24px 48px rgb(15 18 26/.16), inset 0 -10px 18px rgb(15 18 26/.06), inset 0 10px 16px rgb(255 255 255/.85)',
      },
      control: {
        bg: 'rgb(var(--surface-3))',
        edge: 'transparent',
        shadow:
          '0 8px 16px rgb(15 18 26/.12), inset 0 -4px 8px rgb(15 18 26/.08), inset 0 4px 8px rgb(255 255 255/.95)',
        hover: {
          bg: 'rgb(var(--surface-4))',
          shadow:
            '0 8px 16px rgb(15 18 26/.12), inset 0 -4px 8px rgb(15 18 26/.08), inset 0 4px 8px rgb(255 255 255/.95)',
        },
        press: { shadow: 'inset 0 6px 12px rgb(15 18 26/.16)' },
      },
      well: {
        bg: 'rgb(var(--surface-1))',
        edge: 'transparent',
        shadow: 'inset 0 4px 8px rgb(15 18 26/.12)',
      },
      primary: {
        bg: 'rgb(var(--accent))',
        edge: 'transparent',
        shadow: '0 8px 16px rgb(15 18 26/.14), inset 0 4px 8px rgb(255 255 255/.35)',
      },
    },
    dark: {
      card: {
        bg: 'rgb(var(--surface-2))',
        edge: 'transparent',
        shadow:
          '0 14px 28px rgb(0 0 0/.45), inset 0 -8px 14px rgb(0 0 0/.35), inset 0 6px 10px rgb(255 255 255/.05)',
        tones: [
          { bg: 'rgb(var(--k-tint-a))' },
          { bg: 'rgb(var(--k-tint-b))' },
          { bg: 'rgb(var(--k-tint-c))' },
          { bg: 'rgb(var(--k-tint-d))' },
        ],
      },
      raised: {
        bg: 'rgb(var(--surface-3))',
        edge: 'transparent',
        shadow:
          '0 8px 16px rgb(0 0 0/.45), inset 0 -4px 8px rgb(0 0 0/.35), inset 0 3px 6px rgb(255 255 255/.07)',
      },
      chrome: {
        bg: 'rgb(var(--surface-3)/.85)',
        edge: 'transparent',
        backdrop: 'blur(20px) saturate(140%)',
        shadow: '0 8px 16px rgb(0 0 0/.40)',
      },
      overlay: {
        bg: 'rgb(var(--surface-4))',
        edge: 'transparent',
        shadow: '0 24px 48px rgb(0 0 0/.55), inset 0 6px 10px rgb(255 255 255/.04)',
      },
      control: {
        bg: 'rgb(var(--surface-3))',
        edge: 'transparent',
        shadow:
          '0 8px 16px rgb(0 0 0/.45), inset 0 -4px 8px rgb(0 0 0/.35), inset 0 3px 6px rgb(255 255 255/.07)',
        hover: {
          bg: 'rgb(var(--surface-4))',
          shadow:
            '0 8px 16px rgb(0 0 0/.45), inset 0 -4px 8px rgb(0 0 0/.35), inset 0 3px 6px rgb(255 255 255/.07)',
        },
        press: { shadow: 'inset 0 6px 12px rgb(0 0 0/.55)' },
      },
      well: {
        bg: 'rgb(var(--canvas))',
        edge: 'transparent',
        shadow: 'inset 0 4px 8px rgb(0 0 0/.55)',
      },
      primary: {
        bg: 'rgb(var(--accent))',
        edge: 'transparent',
        shadow: '0 8px 16px rgb(0 0 0/.40), inset 0 3px 6px rgb(255 255 255/.25)',
      },
    },
  },
};
