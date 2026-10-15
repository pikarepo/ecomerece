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

export const registry = {
  // Everyday
  system: { skin: system, swatch: ['#F8FAFC', '#2563EB'], group: 'everyday' as const },
  soft: { skin: soft, swatch: ['#F8FAFC', '#2563EB'], group: 'everyday' as const },
  minimal: { skin: minimal, swatch: ['#F8F9FB', '#0B0D12'], group: 'everyday' as const },
  flat: { skin: flat, swatch: ['#EAF7F4', '#0E7C6B'], group: 'everyday' as const },
  material: {
    skin: material,
    swatch: ['#F8FAFC', '#2563EB'],
    group: 'everyday' as const,
    note: 'Best for dense views and tables',
  },
  editorial: { skin: editorial, swatch: ['#FBF8F1', '#0B0D12'], group: 'everyday' as const },

  // Expressive
  maximal: {
    skin: maximal,
    swatch: ['#FFF4F9', '#D6217F'],
    group: 'expressive' as const,
    note: 'Avoid dense tables',
  },
  'neo-brutal': { skin: neoBrutal, swatch: ['#FFF3B8', '#0B0D12'], group: 'expressive' as const },
  brutal: { skin: brutal, swatch: ['#FFFFFF', '#0B0D12'], group: 'expressive' as const },
  retro: { skin: retro, swatch: ['#FFF6E5', '#C2410C'], group: 'expressive' as const },
  y2k: {
    skin: y2k,
    swatch: ['#EAF6FF', '#D6217F'],
    group: 'expressive' as const,
    note: 'Blur + glow — avoid dense tables',
  },
  bento: { skin: bento, swatch: ['#F3F6FF', '#FFF4EC'], group: 'expressive' as const },
  blue: {
    skin: blue,
    swatch: ['#F0F7FD', '#00A0E9'],
    group: 'expressive' as const,
    note: 'Bright & playful — pill controls, yellow/red accents',
  },

  // Dimensional
  glass: {
    skin: glass,
    swatch: ['#BFD6FF', '#FFFFFF'],
    group: 'dimensional' as const,
    note: 'Needs backdrop-filter — avoid dense tables',
  },
  clay: { skin: clay, swatch: ['#F1F2F5', '#E1E3E9'], group: 'dimensional' as const },
  neumorph: {
    skin: neumorph,
    swatch: ['#E9EAEE', '#D2D4DB'],
    group: 'dimensional' as const,
    note: 'Soft emboss — lower contrast',
  },
  skeuo: { skin: skeuo, swatch: ['#F4F5F7', '#9AA0AA'], group: 'dimensional' as const },
  cyber: {
    skin: cyber,
    swatch: ['#070B14', '#22E5FF'],
    group: 'dimensional' as const,
    note: 'Best in dark; dense-table caution',
  },
  depth: {
    skin: depth,
    swatch: ['#F8FAFC', '#2563EB'],
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
    swatch: ['#F4F5F7', '#9AA0AA'],
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
    swatch: ['#FFF3B8', '#0B0D12'],
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
    swatch: ['#070B14', '#22E5FF'],
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
    swatch: ['#F3F6FF', '#FFF4EC'],
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
    swatch: ['#F1F2F5', '#E1E3E9'],
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
    swatch: ['#EAF6FF', '#D6217F'],
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
    swatch: ['#BFD6FF', '#FFFFFF'],
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
    swatch: ['#FFF4F9', '#D6217F'],
    group: 'dimensional' as const,
    note: 'Requires WebGL — layered collage',
  },
} satisfies Record<string, SkinEntry>;

export type SkinId = keyof typeof registry;

/** Compile-time full list; the compiler iterates this. */
export const bundledSkins: Skin[] = Object.values(registry).map((e) => e.skin);

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
