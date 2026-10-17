'use client';

/**
 * The whole library is a client-side headless kit: every component uses hooks,
 * event handlers or portals, so none of it can render as a React Server
 * Component. Marking the barrel keeps consuming apps from having to re-mark
 * each import.
 */
export * from './components/controls';
export * from './components/data';
export * from './components/feedback';
export * from './components/form';
export * from './components/list';
export * from './components/modules';
export * from './components/navigation';
export * from './components/overlay';
export * from './components/surface';

export { cn } from './lib/cn';
export { BlurGovernor, startBlurGovernor } from './lib/depth/blurGovernor';
export type { Stage3DProps } from './lib/depth/Stage3D';
export { Stage3D } from './lib/depth/Stage3D';
export { focusRing } from './lib/focus';
export { useClickAway, useInterval, usePrevious, useTimeout, useToggle } from './lib/hooks';
export { Portal } from './lib/Portal';
export type {
  FrameMonitor,
  FrameMonitorOptions,
  PerfBudget,
  PerfLevel,
} from './lib/perf/frameMonitor';
// Performance engine (DESIGN.md §39)
export {
  createFrameMonitor,
  PERF_BUDGETS,
  perfBudgetFor,
  prefersReducedMotion,
} from './lib/perf/frameMonitor';
// Skin engine (DESIGN.md Part VII)
export { bootstrapScript, bootstrapScriptTag, SKIN_ID_PATTERN } from './lib/skin/bootstrap';
export { supportsBackdropFilter, supportsWebgl2 } from './lib/skin/capabilities';
export { validateSkin } from './lib/skin/compile';
export type { CacheEntry, CacheMeta, CacheStorage, SkinCache } from './lib/skin/skinCache';
export {
  browserSkinCache,
  createSkinCache,
  MAX_CACHE_BYTES,
  MAX_CACHE_ENTRIES,
  revalidateSkinCss,
  SKIN_CACHE_PREFIX,
  SKIN_CACHE_VERSION,
} from './lib/skin/skinCache';
export type { Material, Materials, Role, Skin } from './lib/skin/types';
export { ROLES } from './lib/skin/types';
export type { RegistryEntry, UseSkinResult } from './lib/skin/useSkin';
export { useSkin } from './lib/skin/useSkin';
export type { OverlayOptions } from './lib/useOverlay';
export { useOverlay } from './lib/useOverlay';
export { bundledSkins, registry as skinRegistry } from './skins';
