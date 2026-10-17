# TASK 14 — Performance enforcement + local skin cache + skin manager

**Status: ✅ DONE (2026-10-17) — `bun run gate` green: lint ✓ · typecheck ✓ · `bun test` 896/0 · build ✓ (`/design` prerendered).**

## Goal
Make "best performance" an enforced property of the engine, and stop re-fetching
the active skin's CSS from the server on every visit. Ship a design-page panel to
install / reinstall / delete cached skins.

## Why (the bugs / requirements)
- Design-page perf debt from the early component batches: `Math.random()` at module
  scope (SSR/client hydration mismatch on the 6000-row grid) and a 1 Hz `hookTicks`
  interval hoisted into the top-level page (re-rendered the entire 7k-line tree).
- The head bootstrap (§38.2) requested `/skins/<id>.css` on **every** load — a
  render-blocking network round-trip even when the skin never changes.
- No single place defined a frame budget; the slab engine / game / canvas each
  hardcoded their own caps.

## Plan / Shipped

### A. Local skin cache (§38.5) — `packages/ui/lib/skin/skinCache.ts`
- Storage: `skincache.v<version>.<id>` → `{css, ts}`; version bump invalidates all.
- `createSkinCache(storage)` — `get/put/has/remove/list/totalBytes/clear`;
  LRU by `ts`; caps `MAX_CACHE_ENTRIES=8`, `MAX_CACHE_BYTES=512 KiB`,
  `MAX_ENTRY_BYTES=128 KiB`; quota-error evict-retry; corrupt entries self-heal.
- `byteLength` (no `TextEncoder` dep), `evictionsFor`, `browserSkinCache`,
  `revalidateSkinCss(url, id, cache?)` (fetch + store, never throws).
- `skinCacheRuntimeScript()` — the inline `<head>` runtime (prefix + store +
  post-load revalidate) so a repeat visit reads the cache with no bundle.

### B. Bootstrap integration (§38.2/§38.5) — `packages/ui/lib/skin/bootstrap.ts`
- Cache **hit** → inject `<style id="skin-css">` synchronously from localStorage
  (zero requests, no flash). Cache **miss** → the existing `document.write` link.
- `bootstrapScript` now prepends the cache runtime before the bootstrap body.
- `useSkin.setSkin` calls `__skinCacheRevalidate__(next)` after a live swap to warm
  the cache.

### C. Engine perf layer (§28.6) — `packages/ui/lib/perf/frameMonitor.ts`
- `createFrameMonitor()` — rolling FPS over a window; escalates high→medium→low
  after N consecutive bad windows, recovers after M good ones (critical window = 2
  strikes). Pure + tested.
- `PERF_BUDGETS` / `perfBudgetFor(level)` — one table (particles, shadow map, DPR
  cap, blur) the engine features read instead of magic numbers.
- `prefersReducedMotion()` (SSR-safe).
- **Static guard** `test/perf-budget.test.ts` fails the gate on: non-passive scroll
  listeners, `setInterval` without `clearInterval`, `requestAnimationFrame` without
  `cancelAnimationFrame`, `getContext(` outside the two approved probe files.

### D. Skin manager UI (§38.5) — `packages/ui/components/modules/SkinManager.tsx`
- Controlled panel: per-skin status (Active/Cached/Remote), byte size, usage bar +
  **Install / Reinstall / Delete / Clear cache**; `formatBytes` exported + tested.
- Wired into `/design` axes card: `browserSkinCache()` + `revalidateSkinCss` supply
  the state/handlers; `managerItems` derived from `skinRegistry` + cache list.

### E. Design-page perf fixes
- `gridRows`: `Math.random()` → deterministic `seededPrice(i)` (stable hydration).
- Extract `HookTicker` component so the demo interval no longer re-renders the page.
- `Mobile.tsx` visualViewport `scroll` listener is now `{ passive: true }`.

## Files
```
packages/ui/
  lib/skin/skinCache.ts             NEW  cache algorithm + runtime script
  lib/skin/bootstrap.ts             cache-aware bootstrap + runtime injection
  lib/skin/useSkin.ts               warm cache after a live swap
  lib/skin/index.ts  index.ts       exports
  lib/perf/frameMonitor.ts          NEW  monitor + budget table + reduced-motion
  lib/perf/index.ts                 NEW  barrel
  components/modules/SkinManager.tsx NEW  installed-skins cache manager
  components/modules/index.ts       export
  components/surface/Mobile.tsx     passive scroll listener
  test/skinCache.test.ts            NEW  10 cases
  test/perf-frameMonitor.test.ts    NEW  8 cases
  test/perf-budget.test.ts          NEW  4 cases (static guard)
apps/web/app/design/page.tsx        SkinManager panel + deterministic grid + HookTicker
DESIGN.md                           §28.6 · §38.5 · E.1 · TOC
```

## Tests
- `skinCache.test.ts` (10): key/version, get, corrupt self-heal, put/has/list,
  remove, LRU entry cap, byte cap, invalid-id rejection, clear.
- `perf-frameMonitor.test.ts` (8): defaults, good windows stay high, degrade,
  critical drop, recovery, `nextLevel` clamps, budget table, SSR-safe reduced-motion.
- `perf-budget.test.ts` (4): static anti-pattern guard over components + lib.
- `useSkin.test.tsx` (9) still green (link mechanism unchanged; runtime call is a
  no-op in tests). Full suite 896/0.

## Done when
- [x] `bun run gate` green (lint · typecheck · `bun test` 896/0 · web build)
- [x] `/design` prerenders (static) with the cache panel + cache-aware bootstrap
- [x] cache hit path injects `<style>` with no stylesheet request
- [x] LRU caps enforced; quota/corrupt entries never throw
- [x] static perf guard fails on the banned patterns

## Follow-ups (not in this task)
- Route the slab engine (`shadowMapSize`) and `DriveGame` particles through
  `perfBudgetFor(level)` (budget exists; wiring is a follow-up).
- Optional server-side inline of the active skin from a cookie (CSP no-`document.write`).
