# TASK 11 — Small-device (phone) engine/UI optimization + system performance

**Status: ✅ DONE (2026-10-14) — `bun run gate` green: lint ✓ · typecheck ✓ · `bun test` 362/0 · build ✓.**

## Shipped (this task)

- **`packages/ui/lib/depth/devicePolicy.ts`** (new): pure small-device policy —
  `isSmallViewport` (≤430), `slabPixelRatio` (DPR cap **1.5** on phones, 2 desktop),
  `slabShadowsEnabled` (shadow pass **off** on small devices), `slabShadowMapSize`
  (512/1024), `slabCapFor` (mobile 36 / desktop 80, guard scale, floor 4),
  `RESIZE_DEBOUNCE_MS` (120ms).
- **`slabEngine.ts` fail-safe rework:** lazy `three` boot (`ensureBooted`) — the
  engine chunk only loads when a webgl-slabs skin is active; **synchronous
  no-WebGL2 path** hands the 3D skin back to its 2D fallback immediately (the
  reported mobile crash path — three never even downloads); try/catch around
  init/activate/reconfigure/update/render/resize/ensure with `failTo2D()`;
  3 consecutive throwing frames → fallback; boot failures cached (no retry
  loop); debounced resize (URL-bar storm); `webglcontextlost` → fallback;
  pixel-ratio/shadow policy re-applied on rotation.
- **`capabilities.ts`:** the webgl2 probe context is released via
  `WEBGL_lose_context` (iOS Safari caps live contexts at ~8).
- **`Stage3D.tsx`:** `createSlabEngine` construction guarded → pure 2D.
- **Tests:** `test/device-policy.test.ts` (7 cases) — policy boundaries +
  no-WebGL2 regression (engine never throws, fallback = `system`, dispose
  idempotent).
- **Small-viewport UI audit:** viewport meta OK (`device-width`, `viewportFit`),
  no `100vw`/fixed-width overflow traps in kit or app pages, Table scrolls
  in-card (`min-w-[640px]` inside `overflow-auto`), SafeArea/KeyboardAvoiding/
  PullToRefresh (batch 28) available, blur governor mobile cap = 2. No further
  small-viewport fixes needed beyond the engine work.

## Goal

Make the UI work correctly and fast on small devices (phones, tablets, and any
narrow/low-power viewport). Fix the WebGL slab engine crash on mobile, make the
2D path the guaranteed-safe default on small devices, and tune system-level
performance budgets (blur governor, slab cap, pixel ratio, motion) so small
devices render smoothly instead of crashing or janking.

## Why

- **User report (2026-10-14):** the WebGL slab engine (`lib/depth/slabEngine.ts`)
  crashes on mobile devices — `Stage3D`/slab paths are broken on phone.
- **User report:** on phone / other small devices the UI "is not working well"
  — layout, blur, and engine layers degrade badly at small viewports.
- PROGRESS.md §0 previously *paused* mobile engine work until a dedicated task
  existed. **This file is that dedicated task**, created on explicit user
  instruction — the pause is lifted for this task only.
- Small devices are the weakest hardware: the engine guard, blur governor caps
  (2/3/4 by viewport), slab cap (mobile 36) and `setPixelRatio(min(dpr,2))` all
  exist but are not yet proven safe on a real phone-class device.

## Plan (ordered, testable)

1. **Reproduce/locate the mobile crash** in `packages/ui/lib/depth/slabEngine.ts`
   (and `Stage3D.tsx`): audit init path for mobile-only failure modes —
   `webgl2` context creation on tile-based GPUs, `getContext` returning null,
   context loss on backgrounding, `dpr` on high-DPI phones, viewport math at
   `innerWidth ≤ 430`, touch/pointer listeners, `ResizeObserver`/`visualViewport`.
2. **Fail-safe hardening:** engine must never throw on mobile — every failure
   (no webgl2, import failure, context loss, exception during init/render)
   degrades to the skin's 2D `fallback` id and leaves pure-DOM paint working.
   Wrap init + first render in try/catch; guard `ensure()`/`update()` per frame.
3. **Small-device policy:** decide + implement explicit mobile behavior:
   - default to 2D (skip slab engine) on `innerWidth ≤ 430` **or** low
     `deviceMemory`/`saveData`, *or* keep slabs but with the mobile slab cap
     (`slabCap ?? {desktop:80, mobile:36}`) and stricter guard steps;
   - cap `setPixelRatio` to 1–1.5 on small devices;
   - blur governor mobile cap stays 2 — verify no blur-in-blur on phone layouts.
4. **UI small-viewport audit** (design page + kit components): overflow at
   320–430px, tap-target sizes, `SafeArea`/`KeyboardAvoidingView` (batch 28)
   actually applied, sticky/`StickyCtaBar` overlap, horizontal scroll traps
   from `Reel`/`MosaicGrid`/tables, viewport `<meta>` + `interactive-widget`
   behavior in `apps/web`.
5. **System optimization pass:** measure and tighten — CSS output size
   (`perf.test.ts` budget), blur-governor scan cost, slab `ensure()` debounce,
   motion/animation cost on low-power (`data-fidelity` low path), lazy-loading
   of `three` stays intact (never static import).
6. **Tests:** add/extend tests covering (a) engine init failure ⇒ fallback
   called, no throw (happy-dom can simulate missing webgl2), (b) mobile cap
   selection (≤430 ⇒ mobile caps), (c) any new small-device UI assertions.

## Tests

- `packages/ui/test/` — engine fail-safe test (no webgl2 ⇒ onFallback, no crash),
  governor mobile cap test (existing `blurGovernor.test.ts`), perf budget test
  (`perf.test.ts`) must stay green or be updated with justification.
- `bun test` full suite green; no regression in contrast/skin/layer-contract suites.

## Done when

- [x] Slab engine cannot crash on a webgl2-less / mobile-class device: guaranteed
  2D fallback, verified by a test (`test/device-policy.test.ts`, 7 cases).
- [x] Explicit, documented small-device policy (caps + pixel ratio + fallback rule)
  implemented (`devicePolicy.ts`) and covered by tests.
- [x] Small-viewport UI audit done — no overflow traps found; engine was the
  culprit (recorded under "Shipped").
- [x] `bun run gate` green (lint → typecheck → test → build; 362/0 tests).
- [x] `PROGRESS.md` status updated; this file's status → ✅.

## Notes / constraints

- Respect the AGENTS.md validator order and UI rules (`mat-*` roles, tokens,
  `focusRing()`), no raw colours.
- `three` must stay a lazy/optional import (never static).
- chrome/overlay are NEVER slabs (architecture invariant).
- Do not regress desktop: mobile-only gating must key off viewport/capability,
  not remove desktop slab behavior.
