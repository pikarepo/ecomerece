import type { Skin } from '../lib/skin/types';
import { SYSTEM_STACK } from './_kit';

/**
 * `doraemon` — the 22nd-century robot-cat skin (reference: Doraemon Gadget Hub
 * palette). Bright `#00A0E9` brand blue is the DECOR hue (chrome top rule,
 * sheens, glows, edges); interactive fills/links use the AA-safe deeper blue
 * `#0077C8` (white ink 4.7:1, focus 4.3:1 on light canvas). Bell yellow
 * `#FFD100` + nose red `#E60012` ride tints, tones and glows with dark ink
 * (10.6:1 on yellow — the badge look). Pill controls (999) on 24/36 gadget
 * radii, 2px toy-box strokes, bouncy back-out ease, Nunito UI + Fredoka
 * display, blue-tinted "gadget" shadows and the 4D-pocket inset well.
 */
export const doraemon: Skin = {
  id: 'doraemon',
  label: 'Doraemon',
  extends: 'system',
  dimension: 'layered',
  needs: [],
  cost: 'low',
  a11yTier: 'AA',
  fallback: 'self',
  geometry: { chip: '999px', control: '999px', card: '24px', sheet: '36px', stroke: '2px' },
  motion: {
    ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    easeExit: 'cubic-bezier(0.4, 0, 1, 1)',
    dur: '220ms',
    durSlow: '320ms',
    press: 0.96,
  },
  shadows: {
    light: [
      '0 1px 2px rgb(0 160 233/.10), 0 1px 3px rgb(15 18 26/.05)',
      '0 6px 18px -4px rgb(0 160 233/.16), 0 2px 6px rgb(15 18 26/.06)',
      '0 16px 40px -6px rgb(0 160 233/.20), 0 4px 12px rgb(15 18 26/.08)',
    ],
    dark: [
      '0 1px 2px rgb(0 0 0/.45)',
      '0 6px 18px -4px rgb(0 160 233/.22), 0 4px 12px rgb(0 0 0/.45)',
      '0 16px 40px -6px rgb(0 160 233/.28), 0 8px 24px rgb(0 0 0/.5)',
    ],
  },
  scene: { light: '#F0F7FD', dark: '#0B1118' },
  typography: {
    fontUi: `'Nunito', ${SYSTEM_STACK}`,
    fontDisplay: `'Fredoka', 'Nunito', sans-serif`,
    displayWeight: 600,
    displayTracking: '-0.01em',
    iconStroke: 2,
    import:
      'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap',
  },
  palette: {
    light: {
      paper: '#FFFFFF',
      'tint-a': '#F0F7FD',
      'tint-b': '#E5F6FF',
      'tint-c': '#F5FAFF',
      'tint-d': '#FFF8DA',
      'tint-e': '#FFEDEF',
      'tint-f': '#E5F6FF',
      'hue-1': '#00A0E9',
      'hue-2': '#0077C8',
      'hue-3': '#FFD100',
      'hue-4': '#E60012',
      'hue-5': '#D8ECF8',
      s: '0.06',
    },
    dark: {
      paper: '#0D1620',
      'tint-a': '#0B1118',
      'tint-b': '#0A121B',
      'tint-c': '#101821',
      'tint-d': '#141708',
      'tint-e': '#170C10',
      'tint-f': '#0A121B',
      'hue-1': '#00A0E9',
      'hue-2': '#00A0E9',
      'hue-3': '#FFD100',
      'hue-4': '#E60012',
      'hue-5': '#1E3448',
      s: '0.04',
    },
  },
  accentHint: {
    light: { accent: '#0077C8', accentInk: '#FFFFFF' },
    dark: { accent: '#00A0E9', accentInk: '#1A2530' },
  },
  modes: {
    light: {
      ground: { bg: 'rgb(var(--k-tint-a))' },
      panel: { bg: 'rgb(var(--k-paper))', edge: 'rgb(var(--k-hue-5))', shadow: 'none' },
      card: {
        bg: 'rgb(var(--k-paper))',
        edge: 'rgb(var(--k-hue-5))',
        sheen: 'radial-gradient(140% 90% at 100% 0%, rgb(var(--k-hue-1)/.07), transparent 55%)',
        shadow: 'var(--shadow-md)',
        tones: [
          { bg: 'rgb(var(--k-tint-c))' },
          { bg: 'rgb(var(--k-tint-b))' },
          { bg: 'rgb(var(--k-tint-d))' },
          { bg: 'rgb(var(--k-tint-e))' },
        ],
      },
      raised: {
        bg: 'rgb(var(--k-tint-c))',
        edge: 'rgb(var(--k-hue-2))',
        shadow: 'var(--shadow-sm)',
      },
      overlay: {
        bg: 'rgb(var(--k-paper))',
        edge: 'rgb(var(--k-hue-5))',
        shadow: 'var(--shadow-lg)',
      },
      chrome: {
        bg: 'rgb(var(--k-tint-b))',
        edge: 'rgb(var(--k-hue-5))',
        sheen:
          'linear-gradient(180deg, rgb(var(--k-hue-1)) 0 3px, rgb(var(--k-hue-3)) 3px 5px, transparent 5px)',
        backdrop: 'none',
        shadow: '0 4px 14px -6px rgb(0 160 233/.25)',
      },
      well: {
        bg: 'rgb(var(--k-tint-b))',
        edge: 'rgb(var(--line)/.14)',
        shadow: 'inset 0 4px 10px rgb(0 160 233/.12)',
      },
      control: {
        bg: 'rgb(var(--k-paper))',
        edge: 'rgb(var(--k-hue-2))',
        shadow: '0 2px 8px -2px rgb(0 160 233/.18)',
        hover: { bg: 'rgb(var(--k-tint-b))', edge: 'rgb(var(--k-hue-1))' },
        press: { bg: 'rgb(var(--k-tint-c))', shadow: 'inset 0 2px 6px rgb(0 160 233/.16)' },
      },
      primary: {
        bg: 'rgb(var(--k-hue-2))',
        edge: 'transparent',
        sheen: 'linear-gradient(180deg, rgb(255 255 255/.18), transparent 45%)',
        shadow: '0 6px 16px -6px rgb(0 160 233/.45)',
        glow: '0 0 18px rgb(var(--k-hue-1)/.45)',
        hover: { bg: '#006FB4' },
        press: { bg: '#0062A5' },
      },
    },
    dark: {
      ground: { bg: 'rgb(var(--k-tint-a))' },
      panel: { bg: 'rgb(var(--k-paper))', edge: 'rgb(var(--k-hue-5))', shadow: 'none' },
      card: {
        bg: 'rgb(var(--k-paper))',
        edge: 'rgb(var(--k-hue-5))',
        sheen: 'radial-gradient(140% 90% at 100% 0%, rgb(var(--k-hue-1)/.10), transparent 55%)',
        shadow: 'var(--shadow-md)',
        tones: [
          { bg: 'rgb(var(--k-tint-c))' },
          { bg: 'rgb(var(--k-tint-f))' },
          { bg: 'rgb(var(--k-tint-d))' },
          { bg: 'rgb(var(--k-tint-e))' },
        ],
      },
      raised: {
        bg: 'rgb(var(--k-tint-c))',
        edge: 'rgb(var(--k-hue-2))',
        shadow: 'var(--shadow-sm)',
      },
      overlay: {
        bg: 'rgb(var(--k-paper))',
        edge: 'rgb(var(--k-hue-5))',
        shadow: 'var(--shadow-lg)',
      },
      chrome: {
        bg: 'rgb(var(--k-paper))',
        edge: 'rgb(var(--k-hue-5))',
        sheen:
          'linear-gradient(180deg, rgb(var(--k-hue-1)) 0 3px, rgb(var(--k-hue-3)) 3px 5px, transparent 5px)',
        backdrop: 'none',
        shadow: '0 4px 14px -6px rgb(0 160 233/.30)',
      },
      well: {
        bg: 'rgb(var(--k-tint-b))',
        edge: 'rgb(var(--line)/.14)',
        shadow: 'inset 0 4px 10px rgb(0 160 233/.18)',
      },
      control: {
        bg: 'rgb(var(--k-paper))',
        edge: 'rgb(var(--k-hue-2))',
        shadow: '0 2px 8px -2px rgb(0 160 233/.25)',
        hover: { bg: 'rgb(var(--k-tint-c))', edge: 'rgb(var(--k-hue-1))' },
        press: { bg: 'rgb(var(--k-tint-b))', shadow: 'inset 0 2px 6px rgb(0 160 233/.22)' },
      },
      primary: {
        bg: 'rgb(var(--k-hue-2))',
        edge: 'transparent',
        sheen: 'linear-gradient(180deg, rgb(255 255 255/.18), transparent 45%)',
        shadow: '0 6px 16px -6px rgb(0 160 233/.5)',
        glow: '0 0 18px rgb(var(--k-hue-1)/.55)',
        hover: { bg: '#33B5F0' },
        press: { bg: '#66CBF5' },
      },
    },
  },
};
