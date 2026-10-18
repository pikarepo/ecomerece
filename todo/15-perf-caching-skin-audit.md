# TASK 15 — Deep audit: static runtime, caching, skin switching, /design payload

**Status:** DONE (gate green: lint ✓ · typecheck ✓ · `bun test` 916/0 · web build ✓, 2026-10-18)
**Scope:** everything the user reported — "engine has too many pages / performance is bad /
caching is broken / skin switching is slow and weak on phone and PC".

## A. Audit findings (measured on a production build)

| # | Finding | Evidence (BEFORE) | Severity |
|---|---|---|---|
| 1 | **No `Cache-Control` anywhere in `next.config.ts`** — the render-blocking active-skin stylesheet `/skins/<id>.css` re-validated on every single visit (worst on mobile networks). Public assets (`svg`, favicons, fonts) had no policy either. | `headers()` absent; `curl -I /skins/system.css` → no `Cache-Control` | High (blocks first paint) |
| 2 | **Skin switching always waited on the network.** `useSkin.setSkin` ignored the §38.5 localStorage cache entirely: every switch appended a `<link>` + `onload` round-trip, even though the exact CSS bytes were already on the device. Cache was only ever read by the *bootstrap*, never by a *swap* — "reusable but not reused". Cache misses also never stored the CSS the `<link>` downloaded, so a skin could miss forever (weak reuse loop). | `lib/skin/useSkin.ts` (old): link-only path | High (the "slow & weak" switch) |
| 3 | **`/design` was one 935 KB / 8,100-element client page** with all 89 sections rendered up-front on both server and client — the phone cost is hydration + style/layout/paint of sections nobody has scrolled to. | `design.html` 935 KB raw / 94 KB gzip / 8,100 elements / 89 `<h2>` | High (mobile scroll + hydration) |
| 4 | **6,000-row grid demo built at module scope** on BOTH server and client (~19 ms of eager JS evaluation before hydration could start). | `Array.from({ length: 6000 })` at module scope | Medium |
| 5 | Everything else checked out: `DataGrid` is virtualized, skin CSS files are small (19–33 KB), `globals.css` 4 KB, `three`/slab-engine load lazily and only for 3D skins, scroll listeners pass the perf-budget gate, scroll `passive` + `rAF`/`clearInterval` guards all green. | `perf-budget.test.ts`, `du` on `public/skins` | OK |

## B. Fixes shipped

### B1. Cache headers — `apps/web/next.config.ts`
- `/skins/:path*` → `public, max-age=600, stale-while-revalidate=86400` (short fresh window + long SWR; skin filenames are stable, content changes only on build).
- static public media (`png|jpg|jpeg|gif|webp|avif|svg|ico|woff2|woff|ttf|otf`) → `public, max-age=86400, stale-while-revalidate=604800`.
- Verified live against `next start`:
  - `/skins/system.css` → `Cache-Control: public, max-age=600, stale-while-revalidate=86400`
  - `/next.svg` → `Cache-Control: public, max-age=86400, stale-while-revalidate=604800`

### B2. Cache-first skin apply — `packages/ui/lib/skin/useSkin.ts`
- New `cachedSkinCss(id)` reads `skincache.v<version>.<id>` synchronously.
  - **Hit** → `<style id="skin-css">` inserted with the CSS already parsed, attributes/`localStorage`/`setSkinState` committed **in the same tick**: switching skins is instant on phone and PC, zero network.
  - **Miss** → the existing link path (swap only after `onload`, never an unstyled frame), unchanged — plus `commit()` now runs `__skinCacheRevalidate__` so the downloaded CSS is stored and the **next** switch takes the fast path (a real reuse loop, not write-only).
- Corrupt/foreign entries fall back to the network path instead of throwing.
- Tests: `test/useSkin.test.tsx` +2 (fast path applies with no pending link; corrupt entry → link path) — 12 pass.

### B3. `/design` deferred sections — `apps/web/app/design/Section.tsx` (extracted) + `page.tsx`
- **Deferred mount:** a section's children render only once it comes within ~2 viewports
  (`IntersectionObserver` in an effect — SSR and first client render paint the *same*
  deterministic skeleton, per the BusinessHours/InfiniteScrollLoader hydration rule; no-IO
  browsers mount immediately).
- **`content-visibility: auto` only while off-screen**, with `contain-intrinsic-size: auto 420px`:
  the browser skips style/layout/paint for far-away sections, while the paint containment that
  ships with `auto` can never clip a *visible* demo (fixed overlays, tooltips, sticky bars stay
  correct on screen — the reason blanket `content-visibility` was not applied).
- **`GridDemo`**: the 6,000-row array is now built lazily inside `useState(buildGridRows)`,
  i.e. only when that section actually mounts — no 19 ms module-eval hit, no SSR build cost;
  sort/density state moved into the card so those interactions no longer re-render the page.
- Behavior test `test/design-section.test.tsx` (2 cases): skeleton off-screen → mount on
  intersect → CV dropped in view → CV back when scrolled away; no-IO fallback.

### B4. Drive-by
- `packages/ui/components/controls/NavButtons.tsx` re-formatted by `bun run lint:fix`
  (pre-existing formatter drift that failed `bun run lint`).

## C. Evidence (AFTER)

| Metric | Before | After |
|---|---|---|
| `design.html` raw | **935 KB** | **115 KB** (−88%) |
| `design.html` gzip | 94 KB | 13 KB (−86%) |
| DOM elements shipped | 8,100 | 1,044 (89 headings + skeleton) |
| Grid rows in HTML | 13 baked-in + module build | 0 (lazy) |
| Skin switch | network `<link>` + onload | same-tick `<style>` from cache |
| `/skins/*.css` | no `Cache-Control` | `max-age=600, SWR=86400` |
| Gate | — | ✓ lint · ✓ typecheck · ✓ 916 tests · ✓ build |

## D. Follow-up fix — `GET /skins/undefined.css` (reported live at localhost:3000)

Root cause (two bugs stacked):
1. The §38.5 bootstrap sets `window.__skinCacheActive__` **only** when a non-system
   skin is active, but `skinCacheRuntimeScript()` registered its post-load
   `__skinCacheRevalidate__(window.__skinCacheActive__)` unconditionally — so every
   default-skin visit revalidated `undefined` and requested `/skins/undefined.css`.
2. `isValidSkinId(id)` was a bare `SKIN_ID_PATTERN.test(id)` — `RegExp.test(undefined)`
   coerces to the STRING `"undefined"`, which itself matches `^[a-z0-9-]{1,32}$`.
   Both the TS guard and the inline `VALID.test(id)` accepted a missing id.

Fixes: `isValidSkinId(id: unknown)` now requires `typeof id === 'string'`; the inline
runtime guards `if(!id||!VALID.test(id))return;` in `store`/`revalidate` **and** only
attaches the post-load refresh when `__skinCacheActive__` exists; `revalidateSkinCss`
refuses invalid ids before fetching.

Regression tests: `test/skinCacheRuntime.test.ts` (3 — executes the exact inline string:
no active id → zero requests; active id → exactly `/skins/<id>.css`; direct calls with
`undefined`/`''`/`../` → zero requests) + `test/skinCache.test.ts` (+1 for
`revalidateSkinCss`). 14 pass.

## E. Known limitations
- No browser is available in this environment, so above-the-fold pop-in was verified through
  the happy-dom behaviour test + prerendered HTML inspection, not a visual Lighthouse run.
- Sections mount one frame after hydration (before paint of section bodies). That is the cost of
  the deferred-mount trade-off chosen for this pass; raise `rootMargin` or pin the first three
  sections if it ever reads as a flash.