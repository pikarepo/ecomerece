/**
 * Shared skin-building kit — Skin Pack brief §4. Copy, don't reinvent.
 * Palette colours referenced via rgb(var(--k-…)) resolve per mode, so one
 * materials definition usually serves both themes (`both`).
 */

import type { Materials, Skin } from '../lib/skin/types';

/** A0 — the system stack every custom fontUi must end with (validator A3). */
export const SYSTEM_STACK =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI Variable', 'Segoe UI', Roboto, Inter, sans-serif";

/** Same materials for both modes — palette vars resolve per mode. */
export const both = (m: Materials): Skin['modes'] => ({ light: m, dark: m });

/** Grain: a = alpha (§3.2 — ≤.06 light / ≤.04 dark). */
export const NOISE = (a = 0.05): string =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 ${a} 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export const HARD = (px: number, c: string): string => `${px}px ${px}px 0 ${c}`;

export const GLOW = (c: string, a: string): string =>
  `0 0 0 1px ${c}, 0 0 18px rgb(var(--k-g-c)/${a})`;

export const SCAN = `repeating-linear-gradient(180deg, rgb(var(--ink)/var(--k-s)) 0 1px, transparent 1px 3px)`;

export const GRID = (c: string): string =>
  `linear-gradient(${c} 1px, transparent 1px) 0 0/40px 40px, linear-gradient(90deg, ${c} 1px, transparent 1px) 0 0/40px 40px`;

export const TOPRULE = (c: string, px = 2): string =>
  `linear-gradient(${c} 0 ${px}px, transparent ${px}px)`;

export const STRIPES = (a: string, b: string, c: string): string =>
  `linear-gradient(180deg, ${a} 0 3px, ${b} 3px 6px, ${c} 6px 9px, transparent 9px)`;

export const TONAL = (a: string): string =>
  `linear-gradient(rgb(var(--accent)/${a}), rgb(var(--accent)/${a}))`;
