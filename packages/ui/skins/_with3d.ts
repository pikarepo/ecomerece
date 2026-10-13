import type { Lighting, Material, Pbr, Role, Skin } from '../lib/skin/types';
import { SLAB_ROLES } from '../lib/skin/types';

/**
 * with3d v2 — real-3d-spec §4. Derives a WebGL slab skin from any 2D sibling.
 *
 * v1 (CSS-3D) is gone: no blur stripping, no mode mutation beyond the slab
 * elevation ladder, no perspective/tilt depth. The derived skin declares
 * `renderer: 'webgl-slabs'`, needs `webgl2`, and falls back to the 2D base
 * skin when WebGL2 is unavailable (V13'). Material identity (front faces are
 * UNLIT) comes from per-role `pbr`; scene light comes from `lighting`.
 */

/** Base slab elevation per role (px above the screen plane, read from
 *  `--m-*-z`). Wells stay inset at 0; chrome/overlay are never slabs — their
 *  z is inert DOM stacking metadata. */
export const Z_LADDER: Record<Role, string> = {
  ground: '0px',
  panel: '4px',
  card: '8px',
  raised: '14px',
  well: '0px',
  control: '6px',
  primary: '6px',
  chrome: '20px',
  overlay: '28px',
};

/** Default slab materials: front = UNLIT token (keeps §3.2 contrast windows
 *  valid), side = lit wall token. Controls stay ≤10px thick (V13'). */
type SlabRole = 'panel' | 'card' | 'raised' | 'well' | 'control' | 'primary';
const DEFAULT_PBR: Record<SlabRole, Pbr> = {
  panel: { front: 'surface-1', side: 'surface-1', thickness: 14, bevel: 4, roughness: 0.75 },
  card: { front: 'surface-2', side: 'surface-1', thickness: 10, bevel: 3, roughness: 0.65 },
  raised: { front: 'surface-3', side: 'surface-2', thickness: 14, bevel: 4, roughness: 0.55 },
  well: { front: 'surface-1', side: 'surface-1', thickness: 6, bevel: 2, roughness: 0.85 },
  control: { front: 'surface-3', side: 'surface-2', thickness: 8, bevel: 2, roughness: 0.5 },
  primary: { front: 'accent', side: 'accent', thickness: 8, bevel: 2, roughness: 0.45 },
};

/** Scene light helper — φ = screen-plane angle (0° right, 90° top),
 *  θ = tilt from the viewer axis (≤80°, V13'). Top-left key = 135/φ. */
export function keyLight(phi: number, theta: number, over: Partial<Lighting> = {}): Lighting {
  return {
    key: { phi, theta, intensity: 1.1, ...(over.key ?? {}) },
    ambient: over.ambient ?? 0.5,
    env: over.env ?? 0.4,
    shadow: { opacity: 0.32, softness: 6, catcherLight: 0.04, ...(over.shadow ?? {}) },
  };
}

/** Merge per-role PBR overrides over the defaults (all 6 slab roles resolve). */
export function slabSet(
  over: Partial<Record<Role, Partial<Pbr>>> = {},
): Partial<Record<Role, Pbr>> {
  const out = {} as Partial<Record<Role, Pbr>>;
  for (const role of SLAB_ROLES) {
    out[role] = { ...DEFAULT_PBR[role as SlabRole], ...(over[role] ?? {}) };
  }
  return out;
}

function stampZ(m: Skin['modes']['light'], z: Record<Role, string>): Skin['modes']['light'] {
  const out: Skin['modes']['light'] = {};
  for (const role of Object.keys(z) as Role[]) {
    const base: Material = m[role] ?? {};
    out[role] = { ...base, z: z[role] };
  }
  return out;
}

export function with3d(
  base: Skin,
  o: {
    id?: string;
    label?: string;
    /** Per-role slab material overrides, merged over `slabSet()` defaults. */
    pbr?: Partial<Record<Role, Partial<Pbr>>>;
    /** Required: φ/θ scene light for this skin (B.2 table). */
    lighting: Lighting;
    post?: Skin['post'];
    slabCap?: Skin['slabCap'];
    /** Elevation overrides over Z_LADDER (px strings). */
    z?: Partial<Record<Role, string>>;
  },
): Skin {
  const z = { ...Z_LADDER, ...(o.z ?? {}) } as Record<Role, string>;

  return {
    ...base,
    id: o.id ?? `${base.id}-3d`,
    label: o.label ?? `${base.label} 3D`,
    extends: base.id,
    dimension: '3d',
    renderer: 'webgl-slabs',
    needs: ['webgl2'],
    cost: 'high',
    fallback: base.id, // degraded form = the 2D sibling
    pbr: slabSet(o.pbr),
    lighting: o.lighting,
    ...(o.post ? { post: o.post } : {}),
    ...(o.slabCap ? { slabCap: o.slabCap } : {}),
    modes: {
      light: stampZ(base.modes.light, z),
      dark: stampZ(base.modes.dark, z),
    },
  };
}
