/**
 * Local skin-CSS cache — todo/14 (DESIGN.md §38.5).
 *
 * The engine used to fetch `/skins/<id>.css` from the server on every visit
 * (a render-blocking stylesheet request). This module caches the compiled CSS
 * **text** locally so repeat visits paint the active skin with zero network:
 *
 *   1. bootstrap reads `skincache.v1.<id>` → injects `<style>` synchronously
 *      (no request, no flash) — see `skinCacheRuntimeScript`.
 *   2. a background revalidate fetches the CSS once and replaces the entry if
 *      the build changed it (versioned key + content compare).
 *   3. `useSkin` populates the cache after a live swap, so a skin chosen today
 *      is offline-instant tomorrow.
 *
 * Storage is bounded (LRU by timestamp): only the most-recently-seen
 * `MAX_CACHE_ENTRIES` skins under `MAX_CACHE_BYTES` survive — a 27-skin
 * registry must never blow the ~5 MB localStorage quota.
 */

/** Bump to invalidate every cached entry (part of the storage key). */
export const SKIN_CACHE_VERSION = 1;

/** Storage-key prefix; the inline bootstrap must use the exact same value. */
export const SKIN_CACHE_PREFIX = `skincache.v${SKIN_CACHE_VERSION}.`;

/** Total cached bytes allowed before LRU eviction kicks in. */
export const MAX_CACHE_BYTES = 512 * 1024;

/** Maximum cached skins kept. */
export const MAX_CACHE_ENTRIES = 8;

/** Single entrys larger than this are not cached (a malformed build). */
export const MAX_ENTRY_BYTES = 128 * 1024;

const SKIN_ID_PATTERN = /^[a-z0-9-]{1,32}$/;

export interface CacheEntry {
  css: string;
  /** Epoch ms of the last write — the LRU clock. */
  ts: number;
}

export interface CacheMeta {
  id: string;
  bytes: number;
  ts: number;
}

/** The subset of `localStorage` the cache needs (injectable for tests). */
export interface CacheStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  key(index: number): string | null;
  readonly length: number;
}

export interface SkinCache {
  get(id: string): CacheEntry | null;
  has(id: string): boolean;
  /** Store CSS; LRU-evicts, refuses oversize entries, survives quota errors. */
  put(id: string, css: string, ts?: number): boolean;
  remove(id: string): void;
  list(): CacheMeta[];
  totalBytes(): number;
  clear(): void;
}

export function cacheKey(id: string): string {
  return `${SKIN_CACHE_PREFIX}${id}`;
}

/**
 * NOTE the `typeof` guard: `RegExp.test(undefined)` coerces to the STRING
 * "undefined", which itself matches `^[a-z0-9-]{1,32}$` — so a bare pattern
 * check happily accepted a missing id and produced `GET /skins/undefined.css`
 * on every default-skin visit (reported at localhost:3000/skins/undefined.css).
 */
export function isValidSkinId(id: unknown): boolean {
  return typeof id === 'string' && SKIN_ID_PATTERN.test(id);
}

/** Byte length of a string without pulling in a TextEncoder dependency. */
function byteLength(value: string): number {
  let bytes = 0;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code < 0x80) bytes += 1;
    else if (code < 0x800) bytes += 2;
    else if (code >= 0xd800 && code <= 0xdbff) {
      bytes += 4; // surrogate pair
      i++;
    } else bytes += 3;
  }
  return bytes;
}

/** Read all cache entries (corrupt ones are removed, never thrown). */
function readAll(storage: CacheStorage): CacheMeta[] {
  const out: CacheMeta[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key?.startsWith(SKIN_CACHE_PREFIX)) continue;
    const id = key.slice(SKIN_CACHE_PREFIX.length);
    const raw = storage.getItem(key);
    if (raw === null) continue;
    try {
      const parsed = JSON.parse(raw) as Partial<CacheEntry>;
      if (typeof parsed.css !== 'string' || typeof parsed.ts !== 'number') throw new Error('shape');
      out.push({ id, bytes: byteLength(raw), ts: parsed.ts });
    } catch {
      storage.removeItem(key); // self-heal corrupt / foreign entry
    }
  }
  return out;
}

/**
 * LRU eviction: keep the newest `MAX_CACHE_ENTRIES` under `MAX_CACHE_BYTES`.
 * Pure over the metadata list — the caller performs the removals.
 */
export function evictionsFor(entries: CacheMeta[]): string[] {
  const sorted = [...entries].sort((a, b) => b.ts - a.ts);
  const drop: string[] = [];
  let total = 0;
  sorted.forEach((entry, index) => {
    total += entry.bytes;
    if (index >= MAX_CACHE_ENTRIES || total > MAX_CACHE_BYTES) drop.push(entry.id);
  });
  return drop;
}

export function createSkinCache(storage: CacheStorage): SkinCache {
  const get = (id: string): CacheEntry | null => {
    if (!isValidSkinId(id)) return null;
    const key = cacheKey(id);
    const raw = storage.getItem(key);
    if (raw === null) return null;
    try {
      const parsed = JSON.parse(raw) as Partial<CacheEntry>;
      if (typeof parsed.css !== 'string' || typeof parsed.ts !== 'number') throw new Error('shape');
      // Refresh timestamp on read (LRU) — keep hot entries recently used.
      try {
        storage.setItem(key, JSON.stringify({ css: parsed.css, ts: Date.now() }));
      } catch {}
      return { css: parsed.css, ts: Date.now() };
    } catch {
      storage.removeItem(key);
      return null;
    }
  };

  const remove = (id: string): void => {
    if (!isValidSkinId(id)) return;
    try {
      storage.removeItem(cacheKey(id));
    } catch {}
  };

  const put = (id: string, css: string, ts = Date.now()): boolean => {
    if (!isValidSkinId(id)) return false;
    const payload = JSON.stringify({ css, ts });
    if (byteLength(payload) > MAX_ENTRY_BYTES) return false;
    try {
      storage.setItem(cacheKey(id), payload);
    } catch {
      // Quota exceeded — evict the oldest entries and retry once.
      for (const dropId of evictionsFor(readAll(storage))) {
        if (dropId === id) continue;
        remove(dropId);
      }
      try {
        storage.setItem(cacheKey(id), payload);
      } catch {
        return false;
      }
    }
    // Enforce the caps after a successful write.
    for (const dropId of evictionsFor(readAll(storage))) {
      if (dropId !== id) remove(dropId);
    }
    return true;
  };

  return {
    get,
    has: (id) => get(id) !== null,
    put,
    remove,
    list: () => readAll(storage).sort((a, b) => b.ts - a.ts),
    totalBytes: () => readAll(storage).reduce((sum, entry) => sum + entry.bytes, 0),
    clear: () => {
      for (const entry of readAll(storage)) remove(entry.id);
    },
  };
}

/** Convenience over `window.localStorage` (returns null when unavailable). */
export function browserSkinCache(): SkinCache | null {
  if (typeof window === 'undefined') return null;
  try {
    return createSkinCache(window.localStorage);
  } catch {
    return null;
  }
}

/**
 * Replace the LIVE sheet of the active skin so a freshly-installed/fetched CSS
 * is visible immediately (no reload). `revalidateSkinCss` used to only write
 * localStorage — the Install/Reinstall/Refresh buttons updated the cache while
 * the screen kept showing the OLD skin. Handles both sheet shapes: the cached
 * `<style>` (text swap) and the first-visit `<link>` (replaced by an inline
 * `<style>` so no second request is needed).
 */
export function hotSwapActiveSheet(id: string, css: string): boolean {
  if (typeof document === 'undefined') return false;
  const root = document.documentElement;
  if (!isValidSkinId(id) || root.getAttribute('data-skin') !== id) return false;
  const current = document.getElementById('skin-css');
  if (current?.tagName === 'STYLE') {
    if (current.textContent !== css) current.textContent = css;
    return true;
  }
  const style = document.createElement('style');
  style.id = 'skin-css';
  style.setAttribute('data-skin-sheet', '');
  style.textContent = css;
  // add BEFORE removing: there is never a frame with no active sheet
  document.head.appendChild(style);
  current?.remove();
  return true;
}

/**
 * Fetch a skin's CSS and store it (§38.5). Used by the design-page manager's
 * Install/Reinstall actions and by freshening. Never throws — the boolean
 * reports success. If the skin is the ACTIVE one, the live sheet is hot-swapped
 * so the old skin cannot survive an install.
 */
export async function revalidateSkinCss(
  url: string,
  id: string,
  cache: SkinCache | null = browserSkinCache(),
): Promise<boolean> {
  // Never request `/skins/undefined.css` (or anything else unvalidated): the
  // caller may have no active id (`__skinCacheActive__` is only set when a
  // non-system skin is applied — perf/caching audit, todo/15).
  if (!cache || typeof fetch !== 'function') return false;
  if (!isValidSkinId(id)) return false;
  try {
    // `no-cache` = ALWAYS revalidate with the server (ETag/304, no body on a
    // hit). Without it this fetch goes through the same warm HTTP cache whose
    // purpose is a fast FIRST PAINT — after a deploy it happily re-stores the
    // OLD bytes, `prev.css === txt` never trips, and the old skin sticks.
    const response = await fetch(url, { credentials: 'same-origin', cache: 'no-cache' });
    if (!response.ok) return false;
    const css = await response.text();
    const stored = cache.put(id, css);
    if (stored) hotSwapActiveSheet(id, css);
    return stored;
  } catch {
    return false;
  }
}

/**
 * Inline runtime injected by the bootstrap (§38.2) — a dependency-free string
 * so a repeat visit can read the cache and revalidate WITHOUT waiting for a
 * JS bundle. `__skinCacheRevalidate__` fetches the CSS once and refreshes the
 * entry; the cached `<style>` (if active) is hot-swapped when it changed.
 */
export function skinCacheRuntimeScript(prefix = SKIN_CACHE_PREFIX): string {
  return `window.__skinCachePrefix__=${JSON.stringify(prefix)};(function(){
var VALID=/^[a-z0-9-]{1,32}$/;
function store(id,txt){
  if(!id||!VALID.test(id))return;
  try{localStorage.setItem(window.__skinCachePrefix__+id,JSON.stringify({css:txt,ts:Date.now()}));}catch(e){}}
window.__skinCacheStore__=store;
window.__skinCacheRevalidate__=function(id){
  try{
    // Guard: bootstrap sets __skinCacheActive__ ONLY for a non-system skin, so
    // id can be undefined — without this, EVERY default visit requested
    // /skins/undefined.css.
    if(!id||!VALID.test(id))return;
    if(!window.fetch)return;
    // cache:'no-cache' → ask the server even when the HTTP cache is warm, so a
    // freshly deployed skin replaces the old bytes (ETag/304 keeps it cheap).
    fetch(window.__SKIN_BASE__+id+'.css',{credentials:'same-origin',cache:'no-cache'}).then(function(r){return r.ok?r.text():null;}).then(function(txt){
      if(!txt)return;
      var prev=null;try{var raw=localStorage.getItem(window.__skinCachePrefix__+id);prev=raw?JSON.parse(raw):null;}catch(e){}
      if(prev&&prev.css===txt){return;}
      store(id,txt);
      var el=document.getElementById('skin-css');
      if(document.documentElement.getAttribute('data-skin')!==id||!el)return;
      if(el.tagName==='STYLE'){
        if(el.textContent!==txt){el.textContent=txt;}
      }else{
        // first-visit <link> → inline fresh CSS so the OLD skin cannot outlive
        // an install; add before removing, never a frame without a sheet.
        var st=document.createElement('style');st.id='skin-css';st.setAttribute('data-skin-sheet','');st.textContent=txt;
        document.head.appendChild(st);el.remove();
      }
    }).catch(function(){});
  }catch(e){}
};
// Post-load refresh only matters while a non-system skin is active — the
// bootstrap leaves __skinCacheActive__ undefined otherwise (it used to fetch
// /skins/undefined.css on every default visit).
if(window.__skinCacheActive__){
  if(document.readyState==='complete'){setTimeout(function(){window.__skinCacheRevalidate__(window.__skinCacheActive__);},0);}
  else{window.addEventListener('load',function(){setTimeout(function(){window.__skinCacheRevalidate__(window.__skinCacheActive__);},0);});}
}
})();`;
}

/** Test seam: the exact expressions shared between the cache module and inline JS. */
export const SKIN_CACHE_RUNTIME_MARKERS = {
  prefixAssignment: '__skinCachePrefix__',
  revalidate: '__skinCacheRevalidate__',
  store: '__skinCacheStore__',
} as const;
