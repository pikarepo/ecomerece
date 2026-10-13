import type { Skin } from '../lib/skin/types';
import { both, SYSTEM_STACK } from './_kit';

/**
 * `neo-brutal` — pastel colour blocks, 2px ink outlines, hard offset shadows,
 * chunky grotesk; controls "sink into their shadow" on press
 * (Skin Pack brief §6.7, reference implementation).
 */
export const neoBrutal: Skin = {
  id: 'neo-brutal',
  label: 'Neo-brutal',
  extends: 'system',
  dimension: 'layered',
  needs: [],
  cost: 'low',
  a11yTier: 'AA',
  fallback: 'self',
  geometry: { chip: '6px', control: '10px', card: '14px', sheet: '18px', stroke: '2px' },
  motion: {
    ease: 'cubic-bezier(.2,.8,.2,1)',
    easeExit: 'cubic-bezier(.4,0,1,1)',
    dur: '120ms',
    durSlow: '200ms',
    press: 0.97,
  },
  typography: {
    fontUi: `'Space Grotesk', ${SYSTEM_STACK}`,
    displayWeight: 800,
    displayTracking: '-0.03em',
    import: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap',
  },
  palette: {
    light: {
      'tint-a': '#FFF3B8',
      'tint-b': '#FFD9EC',
      'tint-c': '#D9FAE7',
      'tint-d': '#E4F2FF',
      'hue-1': '#0B0D12',
      'hue-2': '#C21E73',
      'hue-3': '#0E7C5A',
      'hue-4': '#1D6FB8',
    },
    dark: {
      'tint-a': '#1A1608',
      'tint-b': '#1F0F18',
      'tint-c': '#0C1A14',
      'tint-d': '#0E1824',
      'hue-1': '#FFE14D',
      'hue-2': '#FF6BB5',
      'hue-3': '#5CE0A0',
      'hue-4': '#6CB8FF',
    },
  },
  accentHint: {
    light: { accent: '#C21E73', accentInk: '#FFFFFF' },
    dark: { accent: '#FF6BB5', accentInk: '#2B0A1C' },
  },
  modes: both({
    ground: { bg: 'rgb(var(--canvas))' },
    panel: { bg: 'rgb(var(--surface-1))', edge: 'rgb(var(--ink))', shadow: 'none' },
    card: {
      bg: 'rgb(var(--surface-2))',
      edge: 'rgb(var(--ink))',
      shadow: '4px 4px 0 rgb(var(--k-hue-1))',
      tones: [
        { bg: 'rgb(var(--k-tint-a))' },
        { bg: 'rgb(var(--k-tint-b))' },
        { bg: 'rgb(var(--k-tint-c))' },
        { bg: 'rgb(var(--k-tint-d))' },
      ],
    },
    raised: {
      bg: 'rgb(var(--surface-3))',
      edge: 'rgb(var(--ink))',
      shadow: '3px 3px 0 rgb(var(--k-hue-1))',
    },
    overlay: {
      bg: 'rgb(var(--surface-4))',
      edge: 'rgb(var(--ink))',
      shadow: '8px 8px 0 rgb(var(--k-hue-1))',
    },
    chrome: {
      bg: 'rgb(var(--surface-3))',
      edge: 'rgb(var(--ink))',
      shadow: 'none',
      backdrop: 'none',
    },
    well: {
      bg: 'rgb(var(--surface-1))',
      edge: 'rgb(var(--ink))',
      shadow: 'inset 2px 2px 0 rgb(var(--ink)/.25)',
    },
    control: {
      bg: 'rgb(var(--surface-3))',
      edge: 'rgb(var(--ink))',
      shadow: '3px 3px 0 rgb(var(--k-hue-1))',
      hover: { bg: 'rgb(var(--k-tint-a))' },
      // shadow collapses = "sinks into its shadow"; scale does the rest
      press: { bg: 'rgb(var(--k-tint-a))', shadow: '0 0 0 rgb(var(--k-hue-1))' },
    },
    primary: {
      bg: 'rgb(var(--accent))',
      edge: 'rgb(var(--ink))',
      shadow: '3px 3px 0 rgb(var(--k-hue-1))',
    },
  }),
};
