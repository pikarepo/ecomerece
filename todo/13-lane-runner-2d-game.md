# TASK 13 — Lane Runner: reference 2D car game on the physics kernel

**Status: ✅ DONE (2026-10-17) — `bun run gate` green: lint ✓ · typecheck ✓ · `bun test` 874/0 · build ✓ (`/game` prerendered).**

## Goal
Ship the first consumer of the physics kernel (todo/12, DESIGN.md Part VIII) —
a playable 2D car dodger that proves the laws work end-to-end and shows the
canvas + skin integration (§50): the kit reskins the chrome, the canvas
re-reads the compiled `--*` vars, the seed replays a run.

## Shipped

- **`apps/web/app/game/page.tsx`** — server shell (metadata + back link), renders
  the client game. Static route (`○ /game`).
- **`apps/web/components/game/DriveGame.tsx`** (`'use client'`) — the game:
  - Canvas 2D rAF loop over `accumulate`/`FIXED_DT` (wall clock enters exactly
    once as `frameDt`); render interpolates with `interpolationAlpha`.
  - Sim in refs only: `createSpawner(3)` traffic, `createOdometer` distance/score,
    `rampSpeed` difficulty, coins (`circleOverlaps`, tier multiplier), **`sweep`
    CCD** kill detection (no tunneling), `mulberry32` seeded per run.
  - `createGameFsm()` drives menu → playing → paused → gameover; illegal events
    no-op; auto-pause on window blur; Escape pause.
  - Input: ←/→ · A/D · Space (contextual start/pause/retry) · Esc · R · tap
    left/right half of the canvas · kit `Button` row for touch.
  - `?seed=N` replays an exact run (shown on the game-over card).
  - localStorage best score, read mount-only (deterministic first paint).
  - Palette read from `getComputedStyle` on mount + on `data-skin`/`data-theme`
    mutation + `prefers-color-scheme` change → **skins reskin the game**.
  - DPR cap 1.5 on small viewports (mirrors §40 / todo-11 policy).
- **`apps/web/components/game/palette.ts`** (+ `palette.test.ts`, 7 cases) —
  injected-token palette reader, `parseTriplet`, `tripletToRgba`, `dprCap`,
  `loadBest`, `formatScore`, `seedFromSearch`.
- **`apps/web/app/page.tsx`** — storefront links to `/game`.

## Files
```
apps/web/
  app/game/page.tsx                 NEW  server shell + metadata
  app/page.tsx                      storefront → /game link
  components/game/DriveGame.tsx     NEW  canvas loop + chrome
  components/game/palette.ts        NEW  pure helpers (injected token reader)
  components/game/palette.test.ts   NEW  7 cases
```

## Tests
- `palette.test.ts` (7): triplet parse/format + fallbacks, injected palette
  reader, DPR policy boundaries, localStorage garbage, score grouping,
  `?seed` precedence. Full suite 874/0.

## Done when
- [x] `bun run gate` green (lint · typecheck · `bun test` 874/0 · web build)
- [x] `/game` prerenders (static) — deterministic first paint
- [x] kernel imports resolve via `@ecomerece/ui/physics` in the Next build
- [x] skins/theme switches repaint the canvas palette (MutationObserver)
- [x] no `Math.random`/`Date.now` in the sim (RNG injected; clock via frameDt)

## Follow-ups (not in this task)
- High-score table / leaderboard (API module) if the game becomes a product.
- Sprite art + sound (currently vector canvas + no audio).
- Promote any second-consumer helper into the kernel per the promote-on-second rule.
