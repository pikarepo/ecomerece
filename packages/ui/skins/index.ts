import type { Pbr, Skin } from '../lib/skin/types';
import { keyLight, with3d } from './_with3d';
import { bento } from './bento';
import { blue } from './blue';
import { brutal } from './brutal';
import { clay } from './clay';
import { cyber } from './cyber';
import { depth } from './depth';
import { editorial } from './editorial';
import { flat } from './flat';
import { glass } from './glass';
import { material } from './material';
import { maximal } from './maximal';
import { minimal } from './minimal';
import { neoBrutal } from './neo-brutal';
import { neumorph } from './neumorph';
import { retro } from './retro';
import { skeuo } from './skeuo';
import { soft } from './soft';
import { swatchFor } from './swatch';
import { system } from './system';
import { y2k } from './y2k';

/** B.3 — acrylic slab material for glass-3d: unlit tint front (alpha from
 *  the caller), transmissive walls. */
const acrylic = (frontAlpha: number): Partial<Pbr> => ({
  front: 'k-tint',
  frontAlpha,
  side: 'surface-3',
  thickness: 10,
  bevel: 3,
  roughness: 0.2,
  transmission: 0.55,
  ior: 1.45,
  thicknessVol: 6,
});

export interface SkinEntry {
  skin: Skin;
  /** Two hex colours for the picker swatch. */
  swatch: [string, string];
  /** Picker group (brief §8): Everyday · Expressive · Dimensional. */
  group: 'everyday' | 'expressive' | 'dimensional';
  /** Short picker description; flags dense-view warnings and contrast tiers. */
  note?: string;
}

const core = {
  // Everyday
  system: { skin: system, group: 'everyday' as const },
  soft: { skin: soft, group: 'everyday' as const },
  minimal: { skin: minimal, group: 'everyday' as const },
  flat: { skin: flat, group: 'everyday' as const },
  material: {
    skin: material,
    group: 'everyday' as const,
    note: 'Best for dense views and tables',
  },
  editorial: { skin: editorial, group: 'everyday' as const },

  // Expressive
  maximal: {
    skin: maximal,
    group: 'expressive' as const,
    note: 'Avoid dense tables',
  },
  'neo-brutal': { skin: neoBrutal, group: 'expressive' as const },
  brutal: { skin: brutal, group: 'expressive' as const },
  retro: { skin: retro, group: 'expressive' as const },
  y2k: {
    skin: y2k,
    group: 'expressive' as const,
    note: 'Blur + glow — avoid dense tables',
  },
  bento: { skin: bento, group: 'expressive' as const },
  blue: {
    skin: blue,
    group: 'expressive' as const,
    note: 'Bright & playful — pill controls, yellow/red accents',
  },

  // Dimensional
  glass: {
    skin: glass,
    group: 'dimensional' as const,
    note: 'Needs backdrop-filter — avoid dense tables',
  },
  clay: { skin: clay, group: 'dimensional' as const },
  neumorph: {
    skin: neumorph,
    group: 'dimensional' as const,
    note: 'Soft emboss — lower contrast',
  },
  skeuo: { skin: skeuo, group: 'dimensional' as const },
  cyber: {
    skin: cyber,
    group: 'dimensional' as const,
    note: 'Best in dark; dense-table caution',
  },
  depth: {
    skin: depth,
    group: 'dimensional' as const,
    note: 'Requires WebGL — slab engine',
  },

  // 3D variants — real-3d-spec: WebGL slabs (renderer webgl-slabs), one per
  // 2D sibling except the skip list (brutal, flat, material, minimal,
  // editorial, retro, neumorph). Lighting = B.2 φ/θ table.
  'skeuo-3d': {
    skin: with3d(skeuo, {
      lighting: keyLight(135, 35),
      pbr: {
        card: { thickness: 16, bevel: 5, clearcoat: 0.5, roughness: 0.35 },
        raised: { thickness: 16, bevel: 5, clearcoat: 0.5, roughness: 0.35 },
      },
    }),
    group: 'dimensional' as const,
    note: 'Requires WebGL — glossy slabs',
  },
  'neo-brutal-3d': {
    skin: with3d(neoBrutal, {
      lighting: keyLight(135, 45),
      // hard edges: bevel 0, matte walls
      pbr: {
        card: { thickness: 14, bevel: 0, roughness: 0.95 },
        raised: { thickness: 18, bevel: 0, roughness: 0.95 },
        control: { thickness: 8, bevel: 0, roughness: 0.95 },
        primary: { thickness: 8, bevel: 0, roughness: 0.95 },
      },
    }),
    group: 'dimensional' as const,
    note: 'Requires WebGL — hard-edge slabs',
  },
  'cyber-3d': {
    skin: with3d(cyber, {
      lighting: keyLight(125, 50, { ambient: 0.35, env: 0.5 }),
      // hologram stack: dark metal walls with a hue-1 emissive rim
      pbr: {
        panel: { front: 'k-tint-a', thickness: 14, bevel: 4, metalness: 0.3, roughness: 0.3 },
        card: {
          front: 'k-tint-a',
          thickness: 12,
          bevel: 3,
          metalness: 0.3,
          roughness: 0.3,
          emissive: 'k-hue-1',
          emissiveIntensity: 0.25,
        },
        raised: { front: 'k-tint-b', thickness: 14, bevel: 4, metalness: 0.3, roughness: 0.3 },
        control: { front: 'k-tint-b', thickness: 8, bevel: 2, metalness: 0.2, roughness: 0.35 },
      },
    }),
    group: 'dimensional' as const,
    note: 'Requires WebGL — 3D hologram stack, dark-first',
  },
  'bento-3d': {
    skin: with3d(bento, {
      lighting: keyLight(135, 35),
      pbr: {
        card: { thickness: 12, bevel: 3, clearcoat: 0.3, roughness: 0.5 },
        raised: { thickness: 12, bevel: 3, clearcoat: 0.3, roughness: 0.5 },
      },
    }),
    group: 'dimensional' as const,
    note: 'Requires WebGL — bento tiles',
  },
  'clay-3d': {
    skin: with3d(clay, {
      lighting: keyLight(120, 30),
      // puffy clay: thick bodies, fat bevels, fully matte
      pbr: {
        panel: { thickness: 22, bevel: 8, roughness: 0.95 },
        card: { thickness: 18, bevel: 8, roughness: 0.95 },
        raised: { thickness: 20, bevel: 8, roughness: 0.95 },
        well: { thickness: 6, bevel: 3, roughness: 0.95 },
        control: { thickness: 8, bevel: 4, roughness: 0.95 },
        primary: { thickness: 8, bevel: 4, roughness: 0.95 },
      },
    }),
    group: 'dimensional' as const,
    note: 'Requires WebGL — puffy clay slabs',
  },
  'y2k-3d': {
    skin: with3d(y2k, {
      lighting: keyLight(135, 40),
      // wet gloss: clearcoat everywhere
      pbr: {
        card: { thickness: 12, bevel: 4, clearcoat: 1, roughness: 0.2 },
        raised: { thickness: 12, bevel: 4, clearcoat: 1, roughness: 0.2 },
        control: { thickness: 8, bevel: 2, clearcoat: 1, roughness: 0.2 },
        primary: { thickness: 8, bevel: 2, clearcoat: 1, roughness: 0.2 },
      },
    }),
    group: 'dimensional' as const,
    note: 'Requires WebGL — floating gloss panes',
  },
  'glass-3d': {
    skin: with3d(glass, {
      lighting: keyLight(135, 35, { env: 0.6 }),
      // B.3 — acrylic slabs: unlit tint front (alpha .78/.74), transmissive
      // walls, tight caps so the blur budget stays honest.
      slabCap: { desktop: 24, mobile: 16 },
      pbr: {
        panel: acrylic(0.74),
        card: acrylic(0.78),
        raised: acrylic(0.78),
        well: acrylic(0.74),
        control: acrylic(0.74),
        primary: { front: 'accent', side: 'accent', thickness: 8, bevel: 2, roughness: 0.3 },
      },
    }),
    group: 'dimensional' as const,
    note: 'Requires WebGL — acrylic slabs',
  },
  'maximal-3d': {
    skin: with3d(maximal, {
      lighting: keyLight(135, 40),
      pbr: {
        card: { thickness: 12, bevel: 4, roughness: 0.5 },
        raised: { thickness: 14, bevel: 5, roughness: 0.5 },
      },
    }),
    group: 'dimensional' as const,
    note: 'Requires WebGL — layered collage',
  },
} satisfies Record<string, Omit<SkinEntry, 'swatch'>>;

export type SkinId = keyof typeof core;

const coreSkins: Skin[] = Object.values(core).map((e) => e.skin);
const coreLookup = (id: string): Skin | undefined => coreSkins.find((s) => s.id === id);

/**
 * Picker chips are DERIVED from each skin's own resolved tokens (task 16) —
 * `skins/swatch.ts` documents the BASE/MARK rules. Hand-written pairs drifted
 * and several were unreadable (bento 1.00:1, clay 1.15:1, neumorph 1.23:1,
 * glass 1.47:1, skeuo 2.41:1, blue 2.70:1 — all below the 3:1 a two-tone chip
 * needs, plus four skins sharing one identical pair).
 */
type DerivedSwatch = { swatch: [string, string] };
export const registry = Object.fromEntries(
  Object.entries(core).map(([id, entry]) => [
    id,
    { ...entry, swatch: swatchFor(entry.skin, coreLookup) } satisfies SkinEntry & DerivedSwatch,
  ]),
) as { [K in keyof typeof core]: (typeof core)[K] & DerivedSwatch };

/** Compile-time full list; the compiler iterates this. */
export const bundledSkins: Skin[] = coreSkins;

export {
  bento,
  brutal,
  clay,
  cyber,
  depth,
  editorial,
  flat,
  glass,
  material,
  maximal,
  minimal,
  neoBrutal,
  neumorph,
  retro,
  skeuo,
  soft,
  system,
  y2k,
};
