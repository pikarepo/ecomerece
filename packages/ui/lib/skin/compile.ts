import type { Interactive, Material, Role, Skin } from './types';
import { ROLES, SLAB_ROLES } from './types';

/**
 * Skin compiler + validator — DESIGN.md §37/§41 + v3.1 amendments (A1 palette,
 * A2 accentHint, A3 typography, A4 card tones).
 *
 * ONE generated CSS file per skin:
 *   - every variable in every mode block (light, auto-dark media, explicit dark)
 *   - `--k-*` decor palette emitted per mode
 *   - guaranteed solid fallbacks under @supports-not, reduced-transparency,
 *     contrast:more and data-fidelity="low"
 *   - blur values gated inside @supports when the skin `needs` backdrop-filter
 *   - system ALSO matches the bare-root default state
 *   - all blocks live in `@layer skins` for deterministic layer order
 */

/* ───────────────────────── colour helpers (§3.3) ──────────────────────── */

const lin = (c: number): number => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

/** WCAG relative luminance of a #RRGGBB hex. */
export const lum = (hex: string): number => {
  const n = parseInt(hex.replace('#', ''), 16);
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
};

const CHANNEL = /^#([0-9a-fA-F]{6})$/;

/** Contrast ratio between two hex colours. */
export const contrast = (aHex: string, bHex: string): number => {
  const x = lum(aHex);
  const y = lum(bHex);
  const hi = Math.max(x, y);
  const lo = Math.min(x, y);
  return (hi + 0.05) / (lo + 0.05);
};

/** Parse 'rgb(var(--x) / .5)' style references against a palette — approximated
 *  by blending a hex channel at that alpha over a worst-case backdrop. */
function blendOver(hex: string, alpha: number, backdropHex: string): string {
  if (!CHANNEL.test(hex) || alpha <= 0) return backdropHex;
  if (alpha >= 1) return hex;
  const n = parseInt(hex.slice(1), 16);
  const b = parseInt(backdropHex.replace('#', ''), 16);
  const mix = (a: number, c: number) => Math.round(a * alpha + c * (1 - alpha));
  const r = mix((n >> 16) & 255, (b >> 16) & 255);
  const g = mix((n >> 8) & 255, (b >> 8) & 255);
  const bl = mix(n & 255, b & 255);
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, '0')}`;
}

/** A value like 'rgb(var(--k-hue-1))' resolves to the palette hex. */
function resolveValue(
  value: string,
  palette: Record<string, string>,
  mode: 'light' | 'dark',
): string {
  const p = palette ?? {};
  // exact single-ref case: rgb(var(--k-x)) or rgb(var(--k-x)/.5)
  const m = value.match(/^rgb\(var\(--([a-z0-9-]+)\)\s*(?:\/\s*([.\d]+))?\)$/);
  if (m) {
    const hex = p[m[1]];
    if (hex && CHANNEL.test(hex)) {
      if (m[2]) {
        // alpha — blend over the worst-case channel tint for this mode
        const worst = mode === 'light' ? '#000000' : '#FFFFFF';
        return blendOver(hex, Number(m[2]), worst);
      }
      return hex;
    }
  }
  return value; // opaque token fill or complex composite → checked structurally below
}

function hexChannels(hex: string): string {
  if (!CHANNEL.test(hex)) return hex;
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/* ────────────────────────── theme constants (§3.1) ───────────────────── */

const THEME = {
  light: {
    canvas: '#F1F5F9',
    'surface-1': '#F8FAFC',
    'surface-2': '#FCFDFF',
    'surface-3': '#FFFFFF',
    'surface-4': '#FFFFFF',
    ink: '#0F172A',
    line: '#0F172A',
    accent: '#2563EB',
    'accent-ink': '#FFFFFF',
  },
  dark: {
    canvas: '#0B0F17',
    'surface-1': '#131A26',
    'surface-2': '#1B2432',
    'surface-3': '#253041',
    'surface-4': '#313E52',
    ink: '#E8EEF7',
    line: '#FFFFFF',
    accent: '#60A5FA',
    'accent-ink': '#0B1220',
  },
} as const;

/** Text-bearing roles that must keep ink-3 legible (§3.2 luminance windows). */
const TEXT_BEARING: Role[] = ['panel', 'card', 'raised', 'overlay', 'chrome', 'control', 'well'];
const CARD_TONE_NAMES = ['t1', 't2', 't3', 't4'] as const;

/* ───────────────────────────── validation (§41) ────────────────────────── */

const RADIUS_ORDER = ['chip', 'control', 'card', 'sheet'] as const;

export function validateSkin(skin: Skin): string[] {
  const problems: string[] = [];
  const id0 = skin.id;

  if (!/^[a-z0-9-]{1,32}$/.test(id0)) problems.push(`bad id: ${id0}`);
  if (!/^[A-Z][A-Za-z]*$|^[A-Z][a-z]+/.test(skin.label)) {
    // label must be a noun; don't over-prescribe — just require non-empty
    if (!skin.label.trim()) problems.push(`${id0}: label must be a non-empty noun`);
  }

  for (const mode of ['light', 'dark'] as const) {
    for (const role of ROLES) {
      if (!skin.modes[mode][role]) {
        problems.push(`${id0}: role \`${role}\` missing in ${mode} (must resolve or inherit)`);
      }
    }
  }

  // V13' (real-3d-spec §7): webgl-slabs renderer checks. The old CSS-3D
  // 'preserve-3d' requirement is deleted with the CSS-3D tier.
  if (skin.dimension === '3d') {
    if (skin.renderer !== 'webgl-slabs') {
      problems.push(`${id0}: dimension '3d' requires renderer 'webgl-slabs' (V13')`);
    }
    if (!skin.needs.includes('webgl2')) {
      problems.push(`${id0}: webgl-slabs skin must need 'webgl2' (V13')`);
    }
    if (
      !/^[a-z0-9-]{1,32}$/.test(skin.fallback) ||
      skin.fallback === 'self' ||
      skin.fallback === 'solid'
    ) {
      problems.push(`${id0}: webgl-slabs skin must fall back to a real 2D skin id (V13')`);
    }
    for (const role of SLAB_ROLES) {
      const p = skin.pbr?.[role];
      if (!p) problems.push(`${id0}: webgl-slabs skin needs pbr for '${role}' (V13')`);
    }
    for (const [role, p] of Object.entries(skin.pbr ?? {})) {
      if (p) {
        if (role === 'chrome' || role === 'overlay') {
          problems.push(`${id0}: chrome/overlay can never be slabs — remove pbr.${role} (V13'/E1)`);
        }
        if (p.thickness > 48) problems.push(`${id0}: ${role} thickness ${p.thickness} > 48 (V13')`);
        if (role === 'control' && p.thickness > 10) {
          problems.push(`${id0}: control thickness ${p.thickness} > 10 (V13')`);
        }
        if (p.bevel > p.thickness / 2) problems.push(`${id0}: ${role} bevel > thickness/2 (V13')`);
        if (p.echoes && p.echoes.length > 3) {
          problems.push(`${id0}: ${role} has ${p.echoes.length} echoes — cap 3 (V13')`);
        }
        if (p.echoes?.some((e) => Math.abs(e.dz) > 24)) {
          problems.push(`${id0}: ${role} echo |dz| > 24px (V13')`);
        }
      }
    }
    if (skin.lighting) {
      if (
        !Number.isFinite(skin.lighting.key.theta) ||
        skin.lighting.key.theta < 0 ||
        skin.lighting.key.theta > 80
      ) {
        problems.push(`${id0}: key theta must be within [0, 80] (V13')`);
      }
      if (skin.lighting.shadow.catcherLight > 0.05) {
        problems.push(`${id0}: shadow.catcherLight must be ≤ .05 (V13'/§2.2)`);
      }
    } else {
      problems.push(`${id0}: webgl-slabs skin needs lighting (V13')`);
    }
    // z slots: base elevation per role is advisory, but control ≤ 10 and overlay ignored
    const zOf = (roleName: string): number => {
      const z = skin.modes.light[roleName as Role]?.z;
      const px = z ? Number.parseFloat(z) : 0;
      return Number.isFinite(px) ? px : 0;
    };
    if (zOf('control') > 10) problems.push(`${id0}: control z must be ≤ 10px (V13')`);
  } else if (skin.needs.includes('webgl2')) {
    problems.push(`${id0}: needs 'webgl2' but dimension is not '3d' (V13')`);
  }

  // V10 — radius sanity: chip ≤ control ≤ card ≤ sheet, never 0
  const radii = RADIUS_ORDER.map((k) => Number.parseInt(skin.geometry[k], 10) || 0);
  radii.forEach((px, i) => {
    if (px === 999) return; // pill convention
    if (px < 2) problems.push(`${id0}: radius ${RADIUS_ORDER[i]} is ${px}px — 2px minimum (V10)`);
    if (i > 0 && radii[i - 1] !== 999 && px < radii[i - 1]) {
      problems.push(
        `${id0}: ${RADIUS_ORDER[i]} (${px}px) < ${RADIUS_ORDER[i - 1]} — must ascend (V10)`,
      );
    }
  });

  // V11 — motion sanity
  const dur = Number.parseInt(skin.motion.dur, 10);
  if (Number.isFinite(dur) && dur > 400)
    problems.push(`${id0}: dur ${skin.motion.dur} > 400ms (V11)`);
  if (skin.motion.press < 0.9 || skin.motion.press > 1) {
    problems.push(`${id0}: press ${skin.motion.press} outside [.9, 1] (V11)`);
  }

  // A3 — typography: fontUi must end with a generic family (system stack's
  // `sans-serif` or, for raw/mono skins per §3.5, `monospace`); import needs a family
  if (skin.typography?.fontUi) {
    if (!/(sans-serif|monospace)\s*$/.test(skin.typography.fontUi.trim())) {
      problems.push(
        `${id0}: typography.fontUi must end with a generic family — sans-serif or monospace (A3)`,
      );
    }
  }
  if (skin.typography?.import && !/family=[^&]+/.test(skin.typography.import)) {
    problems.push(`${id0}: typography.import must be a Google Fonts CSS2 URL (A3)`);
  }

  // V4 — AA-with-fallback rules
  if (skin.a11yTier === 'AA-with-fallback') {
    if (!skin.contrastEdge) problems.push(`${id0}: AA-with-fallback requires contrastEdge (V4)`);
  }
  if (skin.a11yTier === 'AA-with-fallback' && id0 === 'system') {
    problems.push(`${id0}: default skin must be plain AA`);
  }

  // ── V2/V3/V4/V5 with real colour math, per mode ──
  for (const mode of ['light', 'dark'] as const) {
    const palette = (skin.palette?.[mode] ?? {}) as Record<string, string>;
    const accentInkHex = skin.accentHint
      ? mode === 'light'
        ? skin.accentHint.light.accentInk
        : skin.accentHint.dark.accentInk
      : mode === 'light'
        ? THEME.light['accent-ink']
        : THEME.dark['accent-ink'];
    const accentHex = skin.accentHint
      ? mode === 'light'
        ? skin.accentHint.light.accent
        : skin.accentHint.dark.accent
      : mode === 'light'
        ? THEME.light.accent
        : THEME.dark.accent;
    const s2 = mode === 'light' ? THEME.light['surface-2'] : THEME.dark['surface-2'];

    // V2 — a palette name shadowing a theme token is a bug
    for (const name of Object.keys(palette)) {
      if (/^(canvas|surface|ink|line|accent|success|warning|danger|info)/.test(name)) {
        problems.push(`${id0}: palette name \`${name}\` shadows a theme token (V2)`);
      }
    }

    // check fills + tones
    const rolesToCheck: Array<[string, Material | undefined]> = [];
    for (const role of TEXT_BEARING) {
      rolesToCheck.push([role, skin.modes[mode][role]]);
      const t = (skin.modes[mode][role] as Interactive | undefined)?.tones;
      if (role === 'card' && t) {
        t.forEach((tone, i) => {
          if (tone) rolesToCheck.push([`card.t${i + 1}`, tone]);
        });
      }
    }

    for (const [name_, m] of rolesToCheck) {
      if (!m) continue;
      const bgRaw = m.bg;
      if (!bgRaw) continue; // inherited fill checked via inheritance merge
      const resolved = resolveValue(bgRaw, palette, mode);
      if (CHANNEL.test(resolved)) {
        const a = resolved.toLowerCase();
        if (mode === 'light' && lum(a) < 0.86) {
          problems.push(
            `${id0}: ${name_} bg ${a} L=${lum(a).toFixed(2)} — light text-bearing fills need L ≥ 0.86 (V3/§3.2)`,
          );
        }
        if (mode === 'dark' && lum(a) > 0.014) {
          problems.push(
            `${id0}: ${name_} bg ${a} L=${lum(a).toFixed(2)} — dark text-bearing fills need L ≤ 0.014 (V3/§3.2)`,
          );
        }
      }
      // accent-ink on primary fill ≥ 4.5:1
      if (name_ === 'primary' && CHANNEL.test(resolved)) {
        const crInk = contrast(accentInkHex, resolved.toLowerCase());
        if (crInk < 4.5) {
          problems.push(
            `${id0}: accent-ink on primary fill ${resolved} = ${crInk.toFixed(2)}:1 < 4.5 (V3)`,
          );
        }
      }
    }

    // V4 — interactive edges (control, raised, well)
    for (const role of ['control', 'raised', 'well'] as const) {
      const m = skin.modes[mode][role];
      const edgeRaw = m?.edge;
      if (!edgeRaw) continue;
      const resolvedEdge = resolveValue(edgeRaw, palette, mode);
      if (CHANNEL.test(resolvedEdge)) {
        const crEdge = contrast(resolvedEdge.toLowerCase(), s2);
        if (crEdge < 3) {
          problems.push(
            `${id0}: ${role} edge ${resolvedEdge} = ${crEdge.toFixed(2)}:1 vs surface-2, need ≥ 3 (V4)`,
          );
        }
      } else if (edgeRaw.includes('var(--line)')) {
        // depend on default stroke boundary — token edges are legal
      }
    }

    // V5 — focus: accent ring vs canvas
    const crFocus = contrast(accentHex, mode === 'light' ? THEME.light.canvas : THEME.dark.canvas);
    if (crFocus < 3) {
      problems.push(
        `${id0}: focus accent ${accentHex} vs canvas = ${crFocus.toFixed(2)}:1 < 3 (V5)`,
      );
    }
  }

  // V12 — blur budget: at most 3 roles with backdrop PER MODE; never on control/raised/well
  for (const mode of ['light', 'dark'] as const) {
    let blurred = 0;
    for (const role of ROLES) {
      const m = skin.modes[mode][role];
      if (role === 'control' || role === 'raised' || role === 'well') {
        if (m?.backdrop && m.backdrop !== 'none') {
          problems.push(`${id0}: ${role} must never blur (V12)`);
        }
      } else if (m?.backdrop && m.backdrop !== 'none') {
        blurred += 1;
      }
    }
    if (blurred > 3) {
      problems.push(`${id0}: ${blurred} roles carry backdrop in ${mode} — cap is 3 (V12)`);
    }
  }

  // V13 (CSS-3D era) is superseded by V13' above; only the structural inset
  // rule survives — wells sit ON the ground plane (engine slab z = 0).
  if (skin.dimension === '3d') {
    const zw = skin.modes.light.well?.z;
    if (zw && Number.parseFloat(zw) !== 0) {
      problems.push(`${id0}: well.z must stay 0px — wells are inset (V13)`);
    }
  }

  return problems;
}

/** Merge child over parent per role, per mode, per slot. Missing roles
 *  inherit from `system` implicitly (§36: `extends` defaults to 'system'). */
export function resolveInheritance(skin: Skin, lookup: (id: string) => Skin | undefined): Skin {
  if (skin.id === 'system') return skin; // the root never inherits
  const parentId = skin.extends ?? 'system';
  const parent = lookup(parentId);
  if (!parent || parent.id === skin.id) return skin;
  const resolvedParent = resolveInheritance(parent, lookup);

  const modes: Skin['modes'] = { light: {}, dark: {} };
  for (const mode of ['light', 'dark'] as const) {
    for (const role of ROLES) {
      modes[mode][role] = {
        ...resolvedParent.modes[mode][role],
        ...skin.modes[mode][role],
      } as Material;
      // Nested interactive slots merge too (hover/press). Tones only merge at
      // the card level when the child defines them.
      const target = modes[mode][role];
      const childRole = skin.modes[mode][role];
      if (target && childRole?.hover) {
        target.hover = {
          ...resolvedParent.modes[mode][role]?.hover,
          ...childRole.hover,
        };
      }
      if (target && childRole?.press) {
        target.press = {
          ...resolvedParent.modes[mode][role]?.press,
          ...childRole.press,
        };
      }
      if (target && childRole?.tones) {
        target.tones = childRole.tones;
      }
    }
  }

  return {
    ...resolvedParent,
    ...skin,
    modes,
    geometry: { ...resolvedParent.geometry, ...skin.geometry },
    motion: { ...resolvedParent.motion, ...skin.motion },
    shadows: skin.shadows ?? resolvedParent.shadows,
    scene: skin.scene ?? resolvedParent.scene,
    depth: skin.depth ?? resolvedParent.depth,
    typography: skin.typography ?? resolvedParent.typography,
    palette: skin.palette ?? resolvedParent.palette,
    accentHint: skin.accentHint ?? resolvedParent.accentHint,
  };
}

const FALLBACK_BG: Record<Role, string> = {
  ground: 'rgb(var(--canvas))',
  panel: 'rgb(var(--surface-1))',
  card: 'rgb(var(--surface-2))',
  raised: 'rgb(var(--surface-3))',
  overlay: 'rgb(var(--surface-4))',
  chrome: 'rgb(var(--surface-3))',
  well: 'rgb(var(--surface-1))',
  control: 'rgb(var(--surface-3))',
  primary: 'rgb(var(--accent))',
};

const SLOT_SUFFIX: Record<string, string> = {
  bg: 'bg',
  solid: 'solid',
  sheen: 'sheen',
  edge: 'edge',
  shadow: 'shadow',
  backdrop: 'backdrop',
  glow: 'glow',
  z: 'z',
};

function roleVars(role: Role, m: Material, out: string[]): void {
  const slots = m as unknown as Record<string, string | undefined>;
  for (const [slot, suffix] of Object.entries(SLOT_SUFFIX)) {
    const value = slots[slot];
    if (value === undefined) continue;
    out.push(`  --m-${role}-${suffix}: ${value};`);
  }
  const interactive = m as Interactive;
  if (interactive.hover) {
    for (const [slot, suffix] of Object.entries(SLOT_SUFFIX)) {
      const value = (interactive.hover as Record<string, string | undefined>)[slot];
      if (value === undefined) continue;
      out.push(`  --m-${role}-hover-${suffix}: ${value};`);
    }
  }
  if (interactive.press) {
    for (const [slot, suffix] of Object.entries(SLOT_SUFFIX)) {
      const value = (interactive.press as Record<string, string | undefined>)[slot];
      if (value === undefined) continue;
      out.push(`  --m-${role}-press-${suffix}: ${value};`);
    }
  }
}

/** A4 — emit `--m-card-t{n}-*` slot vars. */
function toneVars(s: Skin, mode: 'light' | 'dark', out: string[]): void {
  const t = (s.modes[mode].card as Interactive | undefined)?.tones;
  if (!t) return;
  t.forEach((tone, i) => {
    if (!tone) return;
    const n = i + 1;
    const slots = tone as unknown as Record<string, string | undefined>;
    for (const [slot, suffix] of Object.entries(SLOT_SUFFIX)) {
      const value = slots[slot];
      if (value === undefined) continue;
      out.push(`  --m-card-t${n}-${suffix}: ${value};`);
    }
  });
}

function paletteVars(s: Skin, mode: 'light' | 'dark', out: string[]): void {
  const palette = s.palette?.[mode];
  if (!palette) return;
  for (const [name, value] of Object.entries(palette)) {
    // '#RRGGBB' → space-separated channels (composable with rgb()/alpha);
    // plain numbers (alphas like .05) pass through unchanged.
    out.push(`  --k-${name}: ${CHANNEL.test(value) ? hexChannels(value) : value};`);
  }
}

function typographyVars(s: Skin, out: string[]): void {
  const t = s.typography;
  if (!t) return;
  if (t.fontUi) out.push(`  --font-ui: ${t.fontUi};`);
  if (t.fontDisplay) out.push(`  --font-display: ${t.fontDisplay};`);
  if (t.displayWeight !== undefined) out.push(`  --display-weight: ${t.displayWeight};`);
  if (t.displayTracking !== undefined) out.push(`  --display-tracking: ${t.displayTracking};`);
  if (t.iconStroke !== undefined) out.push(`  --icon-stroke: ${t.iconStroke};`);
}

function modeBlock(s: Skin, mode: 'light' | 'dark'): string {
  const out: string[] = [];
  out.push(`  --r-chip: ${s.geometry.chip};`);
  out.push(`  --r-control: ${s.geometry.control};`);
  out.push(`  --r-card: ${s.geometry.card};`);
  out.push(`  --r-sheet: ${s.geometry.sheet};`);
  out.push(`  --stroke: ${s.geometry.stroke};`);
  out.push(`  --ease: ${s.motion.ease};`);
  if (s.motion.easeExit) out.push(`  --ease-exit: ${s.motion.easeExit};`);
  out.push(`  --dur: ${s.motion.dur};`);
  if (s.motion.durSlow) out.push(`  --dur-slow: ${s.motion.durSlow};`);
  out.push(`  --press-scale: ${s.motion.press};`);
  if (s.scene?.[mode]) out.push(`  --scene: ${s.scene[mode]};`);
  if (s.depth) {
    out.push(`  --persp: ${s.depth.persp};`);
    out.push(`  --tilt-max: ${s.depth.tiltMax};`);
  }
  typographyVars(s, out);
  paletteVars(s, mode, out);
  if (s.shadows) {
    const [sm, md, lg] = s.shadows[mode];
    out.push(`  --shadow-sm: ${sm};`);
    out.push(`  --shadow-md: ${md};`);
    out.push(`  --shadow-lg: ${lg};`);
  }
  for (const role of ROLES) {
    const m = s.modes[mode][role];
    if (m) roleVars(role, m, out);
  }
  toneVars(s, mode, out);
  return out.join('\n');
}

/** — Fallback body: opaque fills, no sheen/backdrop/z, contrast edge forced — */
function fallbackBlock(s: Skin, opts: { contrastEdge?: boolean } = {}): string {
  const out: string[] = ['  --scene: rgb(var(--canvas));'];
  for (const role of ROLES) {
    out.push(`  --m-${role}-sheen: none;`);
    out.push(`  --m-${role}-backdrop: none;`);
    out.push(`  --m-${role}-z: 0px;`);
  }
  // tones degrade to the plain card fill
  for (const n of CARD_TONE_NAMES) {
    out.push(`  --m-card-${n}-sheen: none;`);
    out.push(`  --m-card-${n}-backdrop: none;`);
  }
  // palette decor becomes inert — tints/edges re-resolve through theme channels
  const palette = s.palette?.light ?? {};
  for (const name of Object.keys(palette)) {
    if (CHANNEL.test(palette[name])) {
      out.push(`  --k-${name}: ${hexChannels(palette[name])};`);
    }
  }
  for (const role of ROLES) {
    // prefer the skin's own opaque `solid` variant when it defines one —
    // that is the exact paint the governor switched from (§A.4)
    const solid = s.modes.light[role]?.solid;
    if (solid) {
      out.push(`  --m-${role}-bg: ${solid};`);
    } else {
      out.push(`  --m-${role}-bg: ${FALLBACK_BG[role]};`);
    }
    if (opts.contrastEdge && s.contrastEdge) {
      out.push(`  --m-${role}-edge: ${s.contrastEdge};`);
    }
  }
  return out.join('\n');
}

export function compileSkinCss(skin: Skin, lookup: (id: string) => Skin | undefined): string {
  const s = resolveInheritance(skin, lookup);
  const problems = validateSkin(s);
  if (problems.length) {
    throw new Error(
      `Skin "${skin.id}" failed validation:\n${problems.map((p) => `- ${p}`).join('\n')}`,
    );
  }

  const light = modeBlock(s, 'light');
  const dark = modeBlock(s, 'dark');
  const needsBackdrop = s.needs.includes('backdrop-filter');

  const SEL = `[data-skin="${s.id}"]`;
  const isSystem = s.id === 'system';
  const lightSels = isSystem
    ? [':where(:root)', `:where(:root${SEL})`, `:where(${SEL})`]
    : [`:where(:root${SEL})`, `:where(${SEL})`];
  const darkSels = isSystem
    ? [
        ':where(:root:not([data-theme="light"]))',
        `:where(:root:not([data-theme="light"])${SEL})`,
        `:where(:root:not([data-theme="light"]) ${SEL})`,
      ]
    : [
        `:where(:root:not([data-theme="light"])${SEL})`,
        `:where(:root:not([data-theme="light"]) ${SEL})`,
      ];
  const darkExplicitSels = isSystem
    ? [
        ':where(:root[data-theme="dark"])',
        `:where(:root[data-theme="dark"]${SEL})`,
        `:where(:root[data-theme="dark"] ${SEL})`,
      ]
    : [`:where(:root[data-theme="dark"]${SEL})`, `:where(:root[data-theme="dark"] ${SEL})`];
  const lowFiSels = isSystem
    ? [
        ':where(:root[data-fidelity="low"])',
        `:where(:root[data-fidelity="low"]${SEL})`,
        `:where(:root[data-fidelity="low"] ${SEL})`,
      ]
    : [`:where(:root[data-fidelity="low"]${SEL})`, `:where(:root[data-fidelity="low"] ${SEL})`];

  const joinSels = (sels: string[]) => sels.join(',\n');

  const lines: string[] = [];
  lines.push(`/* ═══ GENERATED FILE — ${s.id} skin (DESIGN.md §37). Do not edit. ═══ */`);
  lines.push(
    `/* Source: packages/ui/skins/${s.id}.ts → compiled by packages/ui/scripts/build-skins.ts */`,
  );
  lines.push('');

  // Optional webfont import (A3) — must be first so font-display: swap applies.
  if (s.typography?.import) {
    lines.push(`@import url('${s.typography.import}');`);
    lines.push('');
  }

  lines.push(`@layer skins {`);
  // ─── LIGHT ───
  lines.push(`/* light */`);
  lines.push(`${joinSels(lightSels)} {`);
  lines.push(light);
  lines.push('}');
  lines.push('');

  // Blur slots are gated behind @supports for skins that need backdrop-filter
  if (needsBackdrop) {
    lines.push(
      '  @supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {',
    );
    lines.push(`  ${joinSels(lightSels)} {`);
    for (const role of ROLES) {
      const m = s.modes.light[role];
      if (m?.backdrop) lines.push(`    --m-${role}-backdrop: ${m.backdrop};`);
    }
    lines.push('  }');
    lines.push('  }');
    lines.push('');
  }

  // A.4 — blur governor hook + solid paint. `data-blur="off"` (set by the
  // runtime governor or the OS) switches blur-carrying roles to their opaque
  // `solid` variant; border width is untouched so layout never shifts.
  const blurRoles = ROLES.filter((r) => {
    const m = s.modes.light[r];
    return m?.backdrop && m.backdrop !== 'none';
  });
  const governorRoles = [
    ...new Set([...blurRoles, ...ROLES.filter((r) => s.modes.light[r]?.solid)]),
  ];
  if (governorRoles.length > 0) {
    lines.push(`/* A.4 — blur governor: data-blur="off" → opaque solid paint */`);
    lines.push(`${governorRoles.map((r) => `${SEL} .mat-${r}[data-blur="off"]`).join(',\n')} {`);
    for (const r of governorRoles) {
      const m = s.modes.light[r];
      lines.push(`  --m-${r}-backdrop: none;`);
      if (m?.solid) {
        lines.push(`  --m-${r}-sheen: none;`);
        lines.push(`  --m-${r}-bg: ${m.solid};`);
      }
    }
    lines.push('}');
    lines.push('');
  }

  // §2.3 — slab switch: engine-rendered surfaces must not paint 2D materials.
  // Specificity 0-2-0 beats .mat-card (0-1-0) and .mat-control:hover (0-2-0 tie
  // resolved by order — engine.css imports BEFORE skin files).
  if (s.pbr && Object.keys(s.pbr).length > 0) {
    lines.push(`/* real-3d §2.3 — slabbed surfaces hand painting to the WebGL canvas */`);
    lines.push(`[data-skin="${s.id}"] [data-slab="on"] {`);
    lines.push('  background: none;');
    lines.push('  border-color: transparent;');
    lines.push('  box-shadow: none;');
    lines.push('  backdrop-filter: none;');
    lines.push('  -webkit-backdrop-filter: none;');
    lines.push('}');
    lines.push('');
    // hover state on slabbed controls must not resurrect a 2D paint either
    lines.push(`[data-skin="${s.id}"] .mat-control[data-slab="on"]:hover,`);
    lines.push(`[data-skin="${s.id}"] .mat-control[data-slab="on"]:active {`);
    lines.push('  background: none;');
    lines.push('  box-shadow: none;');
    lines.push('  border-color: transparent;');
    lines.push('}');
    lines.push('');
  }

  // Focus boost — inner canvas ring when the accent ring lacks contrast
  // (glass / glass-3d). Emitted for ANY skin that declares it, slabbed or not.
  if (s.focusRingBoost) {
    lines.push(`/* focus boost — inner ring under the accent ring */`);
    lines.push(`${joinSels(lightSels)} {`);
    lines.push(`  --focus-ring-boost: ${s.focusRingBoost};`);
    lines.push('}');
    lines.push('');
  }

  // ─── A2 — optional per-skin accent, OFF unless data-accent="skin" ───
  if (s.accentHint) {
    lines.push(`/* A2 — accentHint: applied only under data-accent="skin" */`);
    // attribute goes INSIDE :where() so specificity stays 0 and :root state
    // matching still works: :where(:root[data-accent="skin"]), subtree form too.
    const accentLight = lightSels.map(asAccentSelector);
    lines.push(`${joinSels(accentLight)} {`);
    lines.push(`  --accent: ${hexChannels(s.accentHint.light.accent)};`);
    lines.push(`  --accent-ink: ${hexChannels(s.accentHint.light.accentInk)};`);
    lines.push('}');
    lines.push(`@media (prefers-color-scheme: dark) {`);
    lines.push(`  ${joinSels(darkSels.map(asAccentSelector))} {`);
    lines.push(`    --accent: ${hexChannels(s.accentHint.dark.accent)};`);
    lines.push(`    --accent-ink: ${hexChannels(s.accentHint.dark.accentInk)};`);
    lines.push('  }');
    lines.push('}');
    lines.push(`${joinSels(darkExplicitSels.map(asAccentSelector))} {`);
    lines.push(`  --accent: ${hexChannels(s.accentHint.dark.accent)};`);
    lines.push(`  --accent-ink: ${hexChannels(s.accentHint.dark.accentInk)};`);
    lines.push('}');
    lines.push('');
  }

  // ─── DARK (auto) ───
  lines.push(`/* dark: auto (follows the OS) */`);
  lines.push(`@media (prefers-color-scheme: dark) {`);
  lines.push(`  ${joinSels(darkSels)} {`);
  lines.push(dark);
  lines.push('  }');
  lines.push('}');
  lines.push('');

  // ─── DARK (explicit) ───
  lines.push(`/* dark: explicit override */`);
  lines.push(`${joinSels(darkExplicitSels)} {`);
  lines.push(dark);
  lines.push('}');
  lines.push('');

  // ─── Fallbacks ───
  const fallbackFor = (contrastEdge: boolean) => fallbackBlock(s, { contrastEdge });
  const emitFallback = (block: string) => {
    lines.push(`${joinSels(lightSels)} {`);
    lines.push(block);
    lines.push('}');
    lines.push(`${joinSels(darkSels)} {`);
    lines.push(block);
    lines.push('}');
    lines.push(`${joinSels(darkExplicitSels)} {`);
    lines.push(block);
    lines.push('}');
  };

  lines.push(`/* fallback: no backdrop-filter support */`);
  lines.push(
    `@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {`,
  );
  emitFallback(fallbackFor(false));
  lines.push('}');
  lines.push('');

  lines.push(`/* fallback: reduced transparency */`);
  lines.push(`@media (prefers-reduced-transparency: reduce) {`);
  emitFallback(fallbackFor(false));
  lines.push('}');
  lines.push('');

  lines.push(`/* fallback: more contrast → edge forced to contrastEdge */`);
  lines.push(`@media (prefers-contrast: more) {`);
  emitFallback(fallbackFor(true));
  lines.push('}');
  lines.push('');

  lines.push(`/* fallback: data-fidelity="low" */`);
  lines.push(`${joinSels(lowFiSels)} {`);
  lines.push(fallbackFor(false));
  lines.push('}');

  lines.push(`} /* end @layer skins */`);

  return lines.join('\n');
}

/** `:where(:root[data-skin="x"])` → `:where(:root[data-skin="x"][data-accent="skin"])`;
 *  subtree form `:where([data-skin="x"])` → `:where([data-skin="x"][data-accent="skin"])`. */
function asAccentSelector(sel: string): string {
  return sel.replace(/\]\)$/, '][data-accent="skin"])');
}
