import type { Skin } from '../lib/skin/types';
import { both } from './_kit';

/**
 * `bento` — modular soft tiles (§6.11): uniform gutters, big radii, pastel
 * tones, quiet lift. Layout is Part IV (`mat-card-t1..t4` + container grid);
 * the skin only makes each tile read as a bento cell.
 */
export const bento: Skin = {
  id: 'bento',
  label: 'Bento',
  extends: 'system',
  dimension: 'layered',
  needs: [],
  cost: 'low',
  a11yTier: 'AA',
  fallback: 'self',
  geometry: { chip: '10px', control: '16px', card: '28px', sheet: '36px', stroke: '1px' },
  motion: {
    ease: 'cubic-bezier(.32,.72,0,1)',
    easeExit: 'cubic-bezier(.4,0,1,1)',
    dur: '260ms',
    durSlow: '340ms',
    press: 0.98,
  },
  palette: {
    light: {
      'tint-a': '#F3F6FF',
      'tint-b': '#FFF4EC',
      'tint-c': '#F1FBF4',
      'tint-d': '#F8F2FF',
      s: '0.04',
    },
    dark: {
      'tint-a': '#0F1522',
      'tint-b': '#1C120F',
      'tint-c': '#0D1A12',
      'tint-d': '#17102A',
      s: '0.025',
    },
  },
  modes: both({
    ground: { bg: 'rgb(var(--canvas))' },
    panel: { bg: 'rgb(var(--surface-1))', edge: 'transparent', shadow: 'none' },
    card: {
      bg: 'rgb(var(--surface-2))',
      edge: 'rgb(var(--line)/.08)',
      sheen: 'radial-gradient(120% 90% at 0% 0%, rgb(var(--accent)/var(--k-s)), transparent 60%)',
      shadow: 'inset 0 1px 0 rgb(255 255 255/.5), 0 12px 24px -14px rgb(15 18 26/.14)',
      tones: [
        { bg: 'rgb(var(--k-tint-a))' },
        { bg: 'rgb(var(--k-tint-b))' },
        { bg: 'rgb(var(--k-tint-c))' },
        { bg: 'rgb(var(--k-tint-d))' },
      ],
    },
    raised: { bg: 'rgb(var(--surface-3))', edge: 'rgb(var(--line)/.12)', shadow: 'none' },
    overlay: {
      bg: 'rgb(var(--surface-4))',
      edge: 'rgb(var(--line)/.12)',
      shadow: 'var(--shadow-lg)',
    },
    chrome: {
      bg: 'rgb(var(--surface-3)/.85)',
      edge: 'rgb(var(--line)/.08)',
      backdrop: 'blur(24px) saturate(150%)',
      shadow: 'none',
    },
    well: { bg: 'rgb(var(--surface-1))', edge: 'rgb(var(--line)/.12)', shadow: 'none' },
    control: {
      bg: 'rgb(var(--surface-3))',
      edge: 'rgb(var(--ink)/.45)',
      shadow: 'none',
      hover: { bg: 'rgb(var(--surface-4))', shadow: 'none' },
      press: { bg: 'rgb(var(--surface-2))', shadow: 'none' },
    },
    primary: { bg: 'rgb(var(--accent))', edge: 'transparent', shadow: 'var(--shadow-sm)' },
  }),
};
