# todo/ — UI workflow (divide & conquer)

Every non-trivial UI change is broken into tasks here **before** code is written.
One file per task. `progress.md` (repo root) is the live tracker: `in_progress` /
`completed` / `next`.

## Rules

1. **Test-gate first.** No task is `completed` until `bun run gate` passes — it runs
   `lint → typecheck → test → build` fail-fast (non-zero on failure). `--no-build` skips
   the slow `next build` for local iteration; `bun run lint:fix` writes lint fixes.
   AGENTS.md "Validator order" is the source of truth.
   - Perf impact is asserted by `packages/ui/test/perf.test.ts` for compile-time
     work, and by the static layer-contract test for the runtime cascade.
2. **One task in flight.** `progress.md` keeps exactly one `Current:` task.
   Nothing else starts until it is verified and marked done.
3. **Task file anatomy** (keep small):
   - `Goal` — what ships.
   - `Why` — the user-visible bug / requiremeent it fixes.
   - `Plan` — ordered, testable steps.
   - `Tests` — the exact behavior + perf assertions added/already covering it.
   - `Done when` — acceptance criteria.
4. **New UI / new style fast-path:** copy the checklist in
   `todo/README.md` → `04-new-skin-fast-path.md`. A new component needs
   `mat-<role>` compliance + a design-page row + the layer-contract suite green.

## Files

| File | Task |
|---|---|
| `01-tokens-layer-blocker.md` | Fix: unlayered `tokens.css` beat `@layer skins` (themes broken). **DONE** |
| `02-ui-audit.md` | Deep UI audit backlog (A–E). **ALL DONE** (perf, CSS hygiene, a11y contrast, happy-dom harness, fast-path gate) |
| `03-test-gate.md` | Behavior + perf test stack + the **mechanical gate** (`bun run gate`). **DONE** |
| `04-new-skin-fast-path.md` | Checklist to add a skin/component fast & safely |
| `05-slider-fix.md` | Slider thumb glitches (alignment, end-drift, drag lag). **DONE** |
| `06-palette.md` | Theme colour layer rework (OKLCH slate ramp). **DONE** |
| `07-components.md` | Missing-component buildout (batches 1–3, 20 components). **ALL DONE** |
| `08-more-components.md` | Wishlist buildout, batches 9+ (inline data-viz, typography, KPI, pagination, hooks…). **Batches here are first in line** |
| `09-components-master-backlog.md` | **FULL** component wishlist (categories A–L) as batches 19–136, incl. ✅ rows for kit items already shipped and traced ⛔ deferrals |
| `10-themes-skins-master-backlog.md` | **FULL** themes/skins wishlist as batches 137–192: skin candidates (fast-path, one per session), token/axis features, traced deferrals |
| `11-mobile-small-device-optimization.md` | **Small-device (phone) engine/UI crash + perf optimization** (slab-engine mobile crash, 2D fail-safe, small-viewport audit, system perf). **DONE** (gate green, 2026-10-14) |
| `12-physical-engine.md` | **Physics kernel** for 2D games (DESIGN.md Part VIII §43–§51): rng, fixed timestep, AABB/CCD, motion, distance, spawn, state machine. **DONE** (gate green, 2026-10-17) |
| `13-lane-runner-2d-game.md` | **Lane Runner** — reference 2D car game on the kernel (`/game`, static). **DONE** (gate green, 2026-10-17) |
| `14-perf-and-skin-cache.md` | **Perf enforcement (§28.6) + local skin cache (§38.5) + skin manager UI**. **DONE** (gate green, 2026-10-17) |

## Test stack (packages/ui/test/)

- `skin.test.ts` — validation, inheritance, compile output structure (behavior)
- `theme-layer.test.ts` — cascade-layer contract (regression gate for theme bugs)
- `perf.test.ts` — compile budget, output size, determinism (performance)
- `capabilities.test.ts` — shared cached WebGL2 / backdrop-filter probes
- `contrast.test.ts` — a11y contrast snapshot for every skin (416 fills)
- `useSkin.test.tsx` / `blurGovernor.test.ts` — happy-dom hook behavior (see `test/_dom.ts`)
- `slider.test.tsx` — component DOM behavior (uses `render()` / `fire()` from `_dom.ts`)
- `fast-path.test.ts` — `mat-*` / `--m-*` contract + design-picker completeness (02-E)
- `physics.test.ts` — kernel laws: rng, timestep, AABB/CCD, motion, distance, spawn, FSM (12)
- `skinCache.test.ts` — local skin cache: LRU caps, quota/corrupt tolerance (14)
- `perf-frameMonitor.test.ts` — frame-budget monitor + budget table (14)
- `perf-budget.test.ts` — static anti-pattern guard (non-passive scroll, timer/rAF leaks, stray `getContext`) (14)

Run from repo root: `bun test` (runs every workspace). Single file:
`bun test packages/ui/test/skin.test.ts`.

**Component tests:** the root `tsconfig.json` sets `jsxImportSource: hono/jsx`, so
`bun test` from the repo root compiles any component JSX to Hono nodes React cannot
render. Any `packages/ui` component that a test renders needs
`/** @jsxImportSource react */` as its first line (its real runtime is React). Hooks
in plain `.ts` files are unaffected.