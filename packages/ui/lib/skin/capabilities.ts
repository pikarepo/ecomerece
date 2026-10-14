'use client';

/*
 * Shared capability probes.
 *
 * `<canvas>.getContext('webgl2')` mints a LIVE WebGL context and browsers cap
 * how many may exist at once (≈16). Minting one per render — or keeping a
 * separate private cache in every consumer — exhausts the pool and fires
 * `webglcontextlost` on the slab engine. Probes are module-scoped and run at
 * most once for the lifetime of the page: exactly one WebGL2 context is ever
 * created, by whichever consumer probes first.
 */
let webgl2Supported: boolean | null = null;
let backdropSupported: boolean | null = null;

export function supportsWebgl2(): boolean {
  if (typeof window === 'undefined') return false;
  if (webgl2Supported !== null) return webgl2Supported;
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('webgl2') as WebGL2RenderingContext | null;
    webgl2Supported = !!ctx;
    // todo/11: free the probe context immediately. The answer is cached as a
    // boolean, and browsers (iOS Safari especially, ~8 live contexts) cap how
    // many contexts may exist — keeping the probe alive eats a slot the slab
    // engine or other canvases need on small devices.
    try {
      ctx?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      /* context already gone / extension missing — answer stands */
    }
  } catch {
    webgl2Supported = false;
  }
  return webgl2Supported;
}

export function supportsBackdropFilter(): boolean {
  if (typeof window === 'undefined') return false;
  if (backdropSupported !== null) return backdropSupported;
  try {
    backdropSupported =
      CSS.supports('backdrop-filter', 'blur(1px)') ||
      CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
  } catch {
    backdropSupported = false;
  }
  return backdropSupported;
}
