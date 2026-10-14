/**
 * Small-device (phone / narrow viewport) engine policy — todo/11.
 *
 * Pure, dependency-free helpers so the slab engine's mobile behavior is unit
 * testable without WebGL. Phones ship DPR-3 displays and tile-based GPUs;
 * a full-screen 2x canvas with a shadow pass overloads them and triggers
 * `webglcontextlost` (the reported mobile crash). The policy here trims the
 * engine cost on small viewports while keeping 3D skins alive.
 */

/** Viewports at or below this width (CSS px) count as a small device. */
export const SMALL_VIEWPORT_MAX = 430;

/** Trailing debounce for resize handling (mobile URL-bar show/hide storms). */
export const RESIZE_DEBOUNCE_MS = 120;

export function isSmallViewport(width: number): boolean {
  return width <= SMALL_VIEWPORT_MAX;
}

/**
 * Canvas pixel ratio for the slab engine. Desktop caps at 2 (retina), small
 * devices at 1.5 — pixel count is the dominant GPU cost of a full-screen
 * canvas and DPR-3 phones would otherwise render ~4x the desktop workload.
 */
export function slabPixelRatio(devicePixelRatio: number, width: number): number {
  const dpr = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
  const cap = isSmallViewport(width) ? 1.5 : 2;
  return Math.min(dpr, cap);
}

/**
 * The soft-shadow pass (shadow map render + catcher) is the single biggest
 * GPU cost of the engine — disabled outright on small devices, where the
 * catcher contributes ≤0.05 light anyway (validator cap).
 */
export function slabShadowsEnabled(width: number): boolean {
  return !isSmallViewport(width);
}

/** Shadow map resolution (px) when shadows are on — halved on small devices. */
export function slabShadowMapSize(width: number): number {
  return isSmallViewport(width) ? 512 : 1024;
}

/**
 * Effective slab cap for the viewport: skin.slabCap overrides the defaults
 * (desktop 80 / mobile 36), then the guard's degradation scale is applied
 * (never below 4 — matches the engine's historical floor).
 */
export function slabCapFor(
  cap: { desktop?: number; mobile?: number } | undefined,
  width: number,
  scale = 1,
): number {
  const base = isSmallViewport(width) ? (cap?.mobile ?? 36) : (cap?.desktop ?? 80);
  return Math.max(4, Math.floor(base * scale));
}
