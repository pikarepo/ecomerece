import type { Skin } from '../lib/skin/types';
import { both } from './_kit';

/**
 * `flat` — zero depth cues (§6.9): colour blocking + edges only. No shadows,
 * no gradients, no sheen anywhere. Interactive = accent only; the Flat-UI
 * palette hues appear solely as card tones (decor, inside luminance windows).
 */
export const flat: Skin = {
  id: 'flat',
  label: 'Flat',
  extends: 'system',
  dimension: 'flat',
  needs: [],
  cost: 'low',
  a11yTier: 'AA',
  fallback: 'self',
  geometry: { chip: '4px', control: '6px', card: '8px', sheet: '12px', stroke: '1px' },
  motion: {
    ease: 'cubic-bezier(.4,0,.2,1)',
    dur: '150ms',
    durSlow: '220ms',
    press: 0.98,
  },
  palette: {
    light: {
      'tint-a': '#EAF7F4',
      'tint-b': '#EAF3FB',
      'tint-c': '#F3EAF8',
      'tint-d': '#FDF6E3',
      'hue-1': '#0E7C6B',
      'hue-2': '#1F5FA8',
      'hue-3': '#7B3FA0',
      'hue-4': '#B9570A',
      'hue-5': '#B3261E',
    },
    dark: {
      'tint-a': '#0C1B19',
      'tint-b': '#0B1520',
      'tint-c': '#150E1C',
      'tint-d': '#1B1507',
      'hue-1': '#1ABC9C',
      'hue-2': '#3498DB',
      'hue-3': '#9B59B6',
      'hue-4': '#F1C40F',
      'hue-5': '#E74C3C',
    },
  },
  modes: both({
    ground: { bg: 'rgb(var(--canvas))' },
    panel: { bg: 'rgb(var(--k-tint-b))', edge: 'transparent', shadow: 'none' },
    card: {
      bg: 'rgb(var(--surface-2))',
      edge: 'transparent',
      shadow: 'none',
      tones: [
        { bg: 'rgb(var(--k-tint-a))', shadow: 'none' },
        { bg: 'rgb(var(--k-tint-b))', shadow: 'none' },
        { bg: 'rgb(var(--k-tint-c))', shadow: 'none' },
        { bg: 'rgb(var(--k-tint-d))', shadow: 'none' },
      ],
    },
    raised: { bg: 'rgb(var(--surface-3))', edge: 'rgb(var(--ink)/.45)', shadow: 'none' },
    overlay: { bg: 'rgb(var(--surface-4))', edge: 'rgb(var(--ink)/.45)', shadow: 'none' },
    chrome: { bg: 'rgb(var(--k-tint-a))', edge: 'transparent', shadow: 'none', backdrop: 'none' },
    well: { bg: 'rgb(var(--k-tint-b))', edge: 'rgb(var(--ink)/.45)', shadow: 'none' },
    control: {
      bg: 'rgb(var(--accent)/.10)',
      edge: 'rgb(var(--accent))',
      shadow: 'none',
      hover: { bg: 'rgb(var(--accent)/.16)', shadow: 'none' },
      press: { bg: 'rgb(var(--accent)/.22)', shadow: 'none' },
    },
    primary: { bg: 'rgb(var(--accent))', edge: 'transparent', shadow: 'none' },
  }),
};
