import type { Skin } from '../lib/skin/types';

/**
 * `glass` v2 — Glass v2 final prompt A.3.
 *
 * Contrast-safe frosted materials over a 4-corner orb scene. Every glass
 * fill is bounded by an explicit alpha (`--k-a-*`) and paired with an opaque
 * `solid` paint (A.4 governor + hard fallbacks). Exactly 3 blurred roles —
 * card, overlay, chrome (V12). Controls, raised, well and panel NEVER blur;
 * they carry `line/.45` edges instead.
 *
 * Tuning order when text contrast drifts: lower the orb alpha `o` → raise the
 * role alphas `a-*` in .04 steps (cap .94) → adjust `bb-*` blur radii last.
 */

/** Tinted glass fill: colour × role alpha, both from the decor palette. */
const T = (c: string, a: string): string => `rgb(var(--k-${c}) / var(--k-${a}))`;
/** Opaque paint for the same material — governor `solid` + hard fallbacks. */
const T2 = (c: string): string => `rgb(var(--k-${c}))`;
/** Interactive edge: the ink hairline at a fixed safe alpha (V4 via token). */
const LINE = 'rgb(var(--line) / .45)';
/** Dark-only lightening sheen, clipped to §3.2 (.03). */
const SHEEN_L = 'linear-gradient(135deg, rgb(255 255 255 / var(--k-hl)), transparent 42%)';
const SHEEN_D = 'linear-gradient(135deg, rgb(255 255 255 / var(--k-sp)), transparent 42%)';

export const glass: Skin = {
  id: 'glass',
  label: 'Glass',
  dimension: 'layered',
  needs: ['backdrop-filter'],
  cost: 'high',
  a11yTier: 'AA',
  fallback: 'solid',
  geometry: { chip: '12px', control: '16px', card: '24px', sheet: '32px', stroke: '1px' },
  motion: {
    ease: 'cubic-bezier(0.32, 0.72, 0, 1)',
    easeExit: 'cubic-bezier(0.4, 0, 1, 1)',
    dur: '300ms',
    durSlow: '380ms',
    press: 0.97,
  },
  // A.4 — under prefers-contrast:more the ink hairline becomes the edge everywhere.
  contrastEdge: LINE,
  // Inner canvas ring when the accent ring lacks contrast against the glass.
  focusRingBoost: '0 0 0 2px rgb(var(--canvas))',
  palette: {
    light: {
      tint: '#FFFFFF',
      tint2: '#F1F3F7',
      solid: '#F6F7FA',
      well: '#E9EBF0',
      rim: '#FFFFFF',
      shadow: '#0F121A',
      base: '#E9EAEE',
      'orb-2': '#0F7B52',
      'orb-3': '#6D28D9',
      'orb-4': '#C2410C',
      o: '.26',
      'a-card': '.68',
      'a-panel': '.74',
      'a-chrome': '.84',
      'a-overlay': '.80',
      'a-control': '.72',
      'a-control-h': '.88',
      'a-control-p': '.58',
      'a-raised': '.86',
      'a-well': '.55',
      'rim-a': '.65',
      hl: '.45',
      sp: '.03',
      sh: '.10',
      sat: '160%',
      'bb-card': '24px',
      'bb-chrome': '30px',
      'bb-overlay': '34px',
      ps: '0',
    },
    dark: {
      tint: '#1B1D21',
      tint2: '#24262B',
      solid: '#1B1D21',
      well: '#131417',
      rim: '#FFFFFF',
      shadow: '#000000',
      base: '#0A0B0D',
      'orb-2': '#34C77B',
      'orb-3': '#A78BFA',
      'orb-4': '#FF5C5C',
      o: '.18',
      'a-card': '.58',
      'a-panel': '.66',
      'a-chrome': '.88',
      'a-overlay': '.84',
      'a-control': '.62',
      'a-control-h': '.80',
      'a-control-p': '.48',
      'a-raised': '.78',
      'a-well': '.48',
      'rim-a': '.10',
      hl: '.03',
      sp: '.03',
      sh: '.45',
      sat: '140%',
      'bb-card': '28px',
      'bb-chrome': '30px',
      'bb-overlay': '36px',
      ps: '0',
    },
  },
  // 4-corner orb scene: orb-1 is the accent (never repaints on accent swap —
  // the accent lives in the theme layer, the rest in --k-* decor).
  scene: {
    light:
      'radial-gradient(55% 45% at 12% 8%, rgb(var(--accent) / var(--k-o)), transparent), radial-gradient(50% 40% at 88% 12%, rgb(var(--k-orb-2) / var(--k-o)), transparent), radial-gradient(55% 45% at 88% 92%, rgb(var(--k-orb-3) / var(--k-o)), transparent), radial-gradient(50% 40% at 10% 90%, rgb(var(--k-orb-4) / var(--k-o)), transparent), rgb(var(--k-base))',
    dark: 'radial-gradient(55% 45% at 12% 8%, rgb(var(--accent) / var(--k-o)), transparent), radial-gradient(50% 40% at 88% 12%, rgb(var(--k-orb-2) / var(--k-o)), transparent), radial-gradient(55% 45% at 88% 92%, rgb(var(--k-orb-3) / var(--k-o)), transparent), radial-gradient(50% 40% at 10% 90%, rgb(var(--k-orb-4) / var(--k-o)), transparent), rgb(var(--k-base))',
  },
  modes: {
    light: {
      panel: {
        bg: T('tint', 'a-panel'),
        solid: T2('solid'),
        edge: LINE,
        shadow: '0 1px 2px rgb(var(--k-shadow) / var(--k-sh))',
      },
      card: {
        bg: T('tint', 'a-card'),
        solid: T2('solid'),
        edge: 'rgb(var(--k-rim) / var(--k-rim-a))',
        backdrop: 'blur(var(--k-bb-card)) saturate(var(--k-sat))',
        shadow: '0 8px 32px rgb(var(--k-shadow) / var(--k-sh))',
        sheen: SHEEN_L,
      },
      raised: {
        bg: T('tint2', 'a-raised'),
        solid: T2('tint2'),
        edge: LINE,
        shadow: '0 4px 14px rgb(var(--k-shadow) / var(--k-sh))',
        sheen: SHEEN_L,
      },
      overlay: {
        bg: T('tint', 'a-overlay'),
        solid: T2('solid'),
        edge: 'rgb(var(--k-rim) / var(--k-rim-a))',
        backdrop: 'blur(var(--k-bb-overlay)) saturate(var(--k-sat))',
        shadow: '0 24px 64px rgb(var(--k-shadow) / var(--k-sh))',
        sheen: SHEEN_L,
      },
      chrome: {
        bg: T('tint', 'a-chrome'),
        solid: T2('solid'),
        edge: LINE,
        backdrop: 'blur(var(--k-bb-chrome)) saturate(var(--k-sat))',
        sheen: SHEEN_L,
      },
      well: {
        bg: T('well', 'a-well'),
        solid: T2('well'),
        edge: LINE,
        shadow: 'inset 0 1px 3px rgb(var(--k-shadow) / var(--k-sh))',
      },
      control: {
        bg: T('tint', 'a-control'),
        solid: T2('solid'),
        edge: LINE,
        backdrop: 'none', // controls NEVER blur (V12)
        shadow: 'none',
        hover: {
          bg: T('tint', 'a-control-h'),
          solid: T2('solid'),
          backdrop: 'none',
          shadow: 'none',
          edge: LINE,
        },
        press: {
          bg: T('tint', 'a-control-p'),
          solid: T2('solid'),
          backdrop: 'none',
          shadow: 'none',
          edge: LINE,
        },
      },
      primary: {
        bg: 'rgb(var(--accent))',
        solid: 'rgb(var(--accent))',
        edge: 'transparent',
        shadow: '0 4px 14px rgb(var(--k-shadow) / var(--k-sh))',
      },
    },
    dark: {
      panel: {
        bg: T('tint', 'a-panel'),
        solid: T2('solid'),
        edge: LINE,
        shadow: '0 1px 2px rgb(var(--k-shadow) / var(--k-sh))',
      },
      card: {
        bg: T('tint', 'a-card'),
        solid: T2('solid'),
        edge: 'rgb(var(--k-rim) / var(--k-rim-a))',
        backdrop: 'blur(var(--k-bb-card)) saturate(var(--k-sat))',
        shadow: '0 8px 32px rgb(var(--k-shadow) / var(--k-sh))',
        sheen: SHEEN_D,
      },
      raised: {
        bg: T('tint2', 'a-raised'),
        solid: T2('tint2'),
        edge: LINE,
        shadow: '0 4px 14px rgb(var(--k-shadow) / var(--k-sh))',
        sheen: SHEEN_D,
      },
      overlay: {
        bg: T('tint', 'a-overlay'),
        solid: T2('solid'),
        edge: 'rgb(var(--k-rim) / var(--k-rim-a))',
        backdrop: 'blur(var(--k-bb-overlay)) saturate(var(--k-sat))',
        shadow: '0 24px 64px rgb(var(--k-shadow) / var(--k-sh))',
        sheen: SHEEN_D,
      },
      chrome: {
        bg: T('tint', 'a-chrome'),
        solid: T2('solid'),
        edge: LINE,
        backdrop: 'blur(var(--k-bb-chrome)) saturate(var(--k-sat))',
        sheen: SHEEN_D,
      },
      well: {
        bg: T('well', 'a-well'),
        solid: T2('well'),
        edge: LINE,
        shadow: 'inset 0 1px 3px rgb(var(--k-shadow) / var(--k-sh))',
      },
      control: {
        bg: T('tint', 'a-control'),
        solid: T2('solid'),
        edge: LINE,
        backdrop: 'none',
        shadow: 'none',
        hover: {
          bg: T('tint', 'a-control-h'),
          solid: T2('solid'),
          backdrop: 'none',
          shadow: 'none',
          edge: LINE,
        },
        press: {
          bg: T('tint', 'a-control-p'),
          solid: T2('solid'),
          backdrop: 'none',
          shadow: 'none',
          edge: LINE,
        },
      },
      primary: {
        bg: 'rgb(var(--accent))',
        solid: 'rgb(var(--accent))',
        edge: 'transparent',
        shadow: '0 4px 14px rgb(var(--k-shadow) / var(--k-sh))',
      },
    },
  },
};
