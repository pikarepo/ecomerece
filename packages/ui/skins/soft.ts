import type { Skin } from '../lib/skin/types';

/**
 * `soft` — the shipped pill language (§36.6). Resolves OLD-DESIGN.md
 * Appendix E.6 divergences #1, #2, #5 and #7 as a deliberate skin choice.
 * Extends `system` for every material; only geometry changes.
 */
export const soft: Skin = {
  id: 'soft',
  label: 'Soft',
  extends: 'system',
  dimension: 'layered',
  needs: [],
  cost: 'low',
  a11yTier: 'AA',
  fallback: 'self',
  geometry: { chip: '999px', control: '999px', card: '16px', sheet: '24px', stroke: '1px' },
  motion: {
    ease: 'cubic-bezier(0.32, 0.72, 0, 1)',
    easeExit: 'cubic-bezier(0.4, 0, 1, 1)',
    dur: '200ms',
    durSlow: '300ms',
    press: 0.97,
  },
  modes: { light: {}, dark: {} }, // all materials inherited from system
};
