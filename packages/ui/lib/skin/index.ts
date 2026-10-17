import type { Dimension } from './types';

export { bootstrapScript, bootstrapScriptTag, SKIN_ID_PATTERN } from './bootstrap';
export { supportsBackdropFilter, supportsWebgl2 } from './capabilities';
export { compileSkinCss, resolveInheritance, validateSkin } from './compile';
export type { Capability, Cost, Dimension, Material, Materials, Role, Skin } from './types';
export { ROLES } from './types';

export interface RegistryEntry {
  id: string;
  label: string;
  cost: 'low' | 'medium' | 'high';
  a11yTier: 'AA' | 'AA-with-fallback';
  dimension: Dimension;
  swatch: [string, string];
}

export { startBlurGovernor } from '../depth/blurGovernor';
export type { CacheEntry, CacheMeta, CacheStorage, SkinCache } from './skinCache';
export {
  browserSkinCache,
  cacheKey,
  createSkinCache,
  evictionsFor,
  isValidSkinId,
  MAX_CACHE_BYTES,
  MAX_CACHE_ENTRIES,
  MAX_ENTRY_BYTES,
  revalidateSkinCss,
  SKIN_CACHE_PREFIX,
  SKIN_CACHE_RUNTIME_MARKERS,
  SKIN_CACHE_VERSION,
  skinCacheRuntimeScript,
} from './skinCache';
export type { UseSkinResult } from './useSkin';
export { useSkin } from './useSkin';
