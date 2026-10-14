/**
 * Skin definition format — DESIGN.md §36.
 *
 * A skin is ONE typed object. `scripts/build-skins.ts` compiles it to one
 * generated CSS file per skin (§37). Nobody hand-writes skin CSS.
 */

export type Role =
  | 'ground'
  | 'panel'
  | 'card'
  | 'raised'
  | 'overlay'
  | 'chrome'
  | 'well'
  | 'control'
  | 'primary';

export type Capability = 'backdrop-filter' | 'webgl2';
export type Dimension = 'flat' | 'layered' | '3d';
export type Renderer = 'dom' | 'dom+webgl' | 'webgl-slabs' | 'spatial';
export type Cost = 'low' | 'medium' | 'high';
export type A11yTier = 'AA' | 'AA-with-fallback';

/** One appearance slot of a role. `bg` is always a <color>; `sheen` is an <image>. */
export interface Material {
  bg?: string;
  /** A2-safe opaque variant used by the blur governor and hard fallbacks. */
  solid?: string;
  sheen?: string;
  edge?: string;
  shadow?: string;
  backdrop?: string;
  /** Emissive halo colour (`rgb(var(--k-hue-1))` etc.) read by effect buttons
   * via `--m-<role>-glow`; never carries text/meaning. Optional/skin-owned. */
  glow?: string;
  /** Real-3D: slab elevation in px, read by the slab engine (never CSS translate). */
  z?: string;
}

export interface Interactive extends Material {
  hover?: Material;
  press?: Material;
  /** A4 (v3.1): optional card tones t1–t4; validated exactly like `card`. */
  tones?: [Material?, Material?, Material?, Material?];
}

export type Materials = Partial<Record<Role, Interactive>>;

/** All nine roles must resolve in BOTH modes (validator §41 V1). */
export interface SkinModes {
  light: Materials;
  dark: Materials;
}

/**
 * A1 (v3.1): decor-only palette. Hues the theme layer forbids (V2) live here
 * as private `--k-*` variables. They never carry text or meaning; they appear
 * only in bg tints (inside luminance windows), edge, shadow, sheen, scene.
 * Values: '#RRGGBB' → emitted as channels `R G B`; bare numbers pass through
 * unchanged (alphas: `rgb(var(--k-hue-1) / var(--k-s))`).
 */
export interface SkinPalette {
  light: Record<string, string>;
  dark: Record<string, string>;
}

/** A2 (v3.1): optional per-skin accent. OFF by default; the picker toggles
 * `data-accent="skin"` per subtree/root; still exactly one accent (I5). */
export interface AccentHint {
  light: { accent: string; accentInk: string };
  dark: { accent: string; accentInk: string };
}

export interface SkinTypography {
  fontUi?: string; // MUST end with the system stack as its tail
  fontDisplay?: string;
  displayWeight?: number;
  displayTracking?: string;
  iconStroke?: number;
  /** Webfont stylesheet URL; must use font-display: swap (validator A3). */
  import?: string;
}

/** Real-3D (real-3d-spec §3): PBR descriptor for one role's slab.
 * `front` is UNLIT (MeshBasicMaterial) so contrast windows stay valid.
 * Values are token exprs: 'surface-2' | 'k-tint-a' | 'accent' | 'ink'. */
export interface Pbr {
  front: string;
  frontAlpha?: number;
  side: string;
  thickness: number;
  bevel: number;
  bevelSegments?: number;
  roughness?: number;
  metalness?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  sheen?: number;
  transmission?: number;
  ior?: number;
  thicknessVol?: number;
  /** walls only, never the cap */
  emissive?: string;
  emissiveIntensity?: number;
  /** real hard-shadow slabs behind (replaces 2D offset shadows on slabs) */
  echoes?: { color: string; dx: number; dy: number; dz: number }[];
}

export interface Lighting {
  /** key: phi = screen-plane angle (0° right, 90° top, 180° left); theta = tilt
   * from the viewer axis (0° straight on, 80° max). Top-left key = 135/35. */
  key: { phi: number; theta: number; intensity: number; color?: string };
  ambient: number;
  env: number;
  shadow: { opacity: number; softness: number; catcherLight: number };
}

/** Slab roles for renderer 'webgl-slabs' — chrome and overlay are never slabs
 * (sticky/positioned chrome + portalled overlays must stay DOM; final-correction §0.2 E1). */
export const SLAB_ROLES: readonly Role[] = [
  'panel',
  'card',
  'raised',
  'well',
  'control',
  'primary',
] as const;

export interface Skin {
  /** /^[a-z0-9-]{1,32}$/ — validated before it touches a stylesheet URL. */
  id: string;
  /** A noun: "System", "Glass". */
  label: string;
  /** Parent skin; per-role, per-mode, per-slot inheritance. Default 'system'. */
  extends?: string;
  dimension: Dimension;
  renderer?: Renderer;
  /** Real-3D: per-role slab materials + scene lighting (renderer webgl-slabs). */
  pbr?: Partial<Record<Role, Pbr>>;
  lighting?: Lighting;
  /** Dark theme + desktop + fidelity=high only. */
  post?: { bloom?: { strength: number; threshold: number } };
  /** Slab element caps (default 80 desktop / 36 mobile). */
  slabCap?: { desktop: number; mobile: number };
  /** e.g. '0 0 0 2px rgb(var(--canvas))' — inner ring when the accent ring lacks contrast. */
  focusRingBoost?: string;
  /** Gated by @supports / runtime detection in useSkin(). */
  needs: Capability[];
  /** §28.3 — drives fidelity=auto. */
  cost: Cost;
  /**
   * a11yTier: 'AA-with-fallback' is only allowed for non-default skins and
   * requires `contrastEdge` to reach 3:1 (§41 V4).
   */
  a11yTier: A11yTier;
  /** 'self' already opaque · 'solid' opaque fills of this skin · or a skin id. */
  fallback: 'self' | 'solid' | string;
  geometry: { chip: string; control: string; card: string; sheet: string; stroke: string };
  motion: { ease: string; easeExit?: string; dur: string; durSlow?: string; press: number };
  /** sm, md, lg shadow tokens; optional (system's are the default). */
  shadows?: { light: [string, string, string]; dark: [string, string, string] };
  /** <background> for <body>; the LAST layer must be a solid colour (§41 V8). */
  scene?: { light: string; dark: string };
  depth?: { persp: string; tiltMax: string };
  typography?: SkinTypography;
  /** A1: decor-only palette, emitted as --k-<name> in every mode block. */
  palette?: SkinPalette;
  /** A2: optional per-skin accent, applied only when data-accent="skin". */
  accentHint?: AccentHint;
  /** Edge colour forced under prefers-contrast:more / low fidelity (§41 V4). */
  contrastEdge?: string;
  modes: SkinModes;
}

/** Fixed vocabulary — skins fill these in; components only ever name a role. */
export const ROLES: readonly Role[] = [
  'ground',
  'panel',
  'card',
  'raised',
  'overlay',
  'chrome',
  'well',
  'control',
  'primary',
] as const;
