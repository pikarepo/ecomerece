# TASK 02 — Deep UI audit backlog

**Status: BACKLOG** (proposed tasks; pick one per session, move it to `Current:` in progress.md)

Goal: a systematic, testable audit so new UI/styles can be added fast. Each item
is small; every one ends with the standard bar (`lint:fix` → `typecheck` → `test`).

## A. Kill remaining perf hot-spots in the skin/depth runtime — DONE
- ✅ `useSkin.ts` — no-op re-select path guarded (link swap only for different skin).
- ✅ `blurGovernor.ts` — only queries roles that blur; root observer on skin/fidelity/theme.
- ✅ `slabEngine.ts` — cached WebGL2 probe, 1024² shadow map, idle pointer early-out.
- ✅ Confirm no `<canvas>.getContext` is minted during render anywhere (search
  `getContext(` in `packages/ui` + `apps/web/app`) → consolidated into
  `lib/skin/capabilities.ts`; one probe app-wide.

## B. CSS / cascade hygiene — DONE
- Sweep every `@layer`/unlayered block; the layer-order test must keep passing.
- Find dead/legacy vars: `--glass` (marked legacy), `--max-w-prose` vs Tailwind's
  built-in `65ch`, duplicate rules.
- Confirm reduced-motion / `prefers-reduced-transparency` / `prefers-contrast` blocks
  still compile into skins (they must sit INSIDE `@layer skins`).
  → **Verdict + fixes:** `--glass` KEPT (the `glass` skin fills read `rgb(var(--glass)/…)`;
  only the unused `@theme --color-glass` utility alias was removed). `--max-w-prose` does
  not exist — `max-w-prose` (3× on `/laptops`) resolves through `--container-prose: 68ch`.
  Removed dead @theme tokens `--ease-spring`, `--transition-duration-instant`,
  `--transition-duration-slow` (0 refs repo-wide). No duplicate source rules; multi-block
  `@layer components|utilities` in engine.css merge legally (left). Generated skins confirm
  `prefers-reduced-transparency` / `prefers-contrast` / `prefers-color-scheme` sit inside the
  single `@layer skins { … }` wrapper; the tokens.css reduced-motion guard is unlayered by
  design (must beat layers). Layer-order + skin + contrast tests still green.

## C. a11y + contrast audit (DESIGN.md §3.2 / V2–V5 rules) — DONE
- The validator already checks fills; audit real markup (design page) for
  non-`mat-*` surfaces + focus-ring coverage (`focusRing()`).
- ✅ Add a test snapshotting `contrast()` outputs for every skin's light/dark
  text-bearing fills (pure TS, no DOM needed).
  → `packages/ui/test/contrast.test.ts` (416-fill Bun snapshot + hard AA
  assertions incl. palette/`--k-*` fills the human validator can't resolve).

## D. Headless UI test harness (enables hook/behaviour tests) — DONE
- Add `happy-dom` (or `jsdom`) as a dev dep of `@ecomerece/ui`.
- Then write behaviour tests for `useSkin` (swap token, stale-link cleanup,
  no-op re-select) and `blurGovernor` (role blur caching, early-out) without a browser.
  → `devDeps` happy-dom@21.0.1 + react/react-dom@19.2.8; shared `test/_dom.ts` harness
  (restores leaked DOM globals in `afterAll` — Bun shares `globalThis` across test workers);
  `test/useSkin.test.tsx` (9) + `test/blurGovernor.test.ts` (4). Suite 118 → 131, all green.

## E. New-style fast path (aka "build any application / many components quickly") — DONE
- Enforce the 4-layer DDD rule is NOT relevant to UI; instead keep `mat-*` role
  contract + skin-variable indirection (see `04-new-skin-fast-path.md`).
- Provide a `design` page row for every new skin/component (it already exists —
  keep it as the visual regression surface).
  → Verified: components + design page read NO raw theme tokens; the `/design` picker
  auto-enumerates every registry skin (grouped Everyday · Expressive · Dimensional).
  Encoded the contract as `test/fast-path.test.ts` (6): registry group/swatch completeness
  (per group), 3D notes WebGL, static markup scan (raw-token ban; allows `--m-*`,
  `--press-scale`, `--scene`, `--tw-*`), and `mat-*` role-name validation. Suite 131 → 137.

## Done when
- Every checked item has a matching test or explicit manual-verification note.