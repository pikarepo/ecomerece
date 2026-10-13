import type { Skin } from '../lib/skin/types';
import { keyLight, slabSet } from './_with3d';

/**
 * `depth` — real Z-space (§36.6, §40, real-3d-spec). Extends `system` for
 * materials and renders its surfaces as WebGL slabs (renderer 'webgl-slabs'):
 * a deep elevation ladder, thick materials, and a top-left key light at
 * φ 135° / θ 38°. Falls back to `system` without WebGL2. Blur stays
 * restricted to chrome — slabs carry the depth, not backdrop.
 */
export const depth: Skin = {
  id: 'depth',
  label: 'Depth',
  extends: 'system',
  dimension: '3d',
  renderer: 'webgl-slabs',
  needs: ['webgl2'],
  cost: 'high',
  a11yTier: 'AA',
  fallback: 'system',
  geometry: { chip: '10px', control: '16px', card: '22px', sheet: '30px', stroke: '1px' },
  motion: {
    ease: 'cubic-bezier(0.32, 0.72, 0, 1)',
    easeExit: 'cubic-bezier(0.4, 0, 1, 1)',
    dur: '240ms',
    durSlow: '320ms',
    press: 0.97,
  },
  pbr: slabSet({
    panel: { thickness: 20, bevel: 6 },
    card: { thickness: 18, bevel: 6 },
    raised: { thickness: 22, bevel: 8 },
    control: { thickness: 8, bevel: 2 },
    primary: { thickness: 8, bevel: 2 },
  }),
  lighting: keyLight(135, 38),
  modes: (['light', 'dark'] as const).reduce(
    (m, k) => {
      m[k] = {
        card: { z: '12px' },
        raised: { z: '24px' },
        overlay: { z: '48px' },
        chrome: { z: '36px', backdrop: 'blur(24px) saturate(150%)' },
        control: { z: '8px' }, // hit-target rule: control z ≤ 10px (V13')
      };
      return m;
    },
    {} as Skin['modes'],
  ),
};
