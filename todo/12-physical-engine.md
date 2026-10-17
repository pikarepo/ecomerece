# TASK 12 — Physics kernel: physical laws for building 2D games on the engine

**Status: ✅ DONE (2026-10-17) — `bun run gate` green: lint ✓ · typecheck ✓ · `bun test` green · build ✓.**

## Shipped (this task)

- **`packages/ui/lib/physics/`** (new, 8 files, pure TS, zero deps, no DOM):
  - `types.ts` — `Vec2` / `Aabb` / `Body` / `SweepHit` value types + vector ops
  - `rng.ts` — `mulberry32` seeded RNG + `randRange` / `randInt` / `pickRandom`
    (**the kernel never calls `Math.random`** — every random draw is injected)
  - `timestep.ts` — fixed-timestep clock: `accumulate(accumulator, frameDt)`
    (60 Hz `FIXED_DT`, `MAX_FRAME_DT=0.25` stall clamp, `MAX_STEPS_PER_FRAME=8`
    spiral guard) + `interpolationAlpha` for smooth rendering between steps
  - `aabb.ts` — `overlaps` (edge-exclusive), `circleOverlaps` (pickups),
    `sweep` (relative-motion CCD — a fast body cannot tunnel between ticks),
    `expand`, `findOverlaps` (O(n²) pair scan, right-sized for ≤20 entities)
  - `motion.ts` — `integrate` (p+v·dt), `approach` (lane snap), `rampSpeed`
    (distance-driven difficulty), `clamp`
  - `distance.ts` — `createOdometer` (Σ v·dt → score / tier / HUD) +
    `difficultyTier`
  - `spawn.ts` — `createSpawner` timer traffic: interval shrinks with distance
    (floored at `minInterval`), ±jitter from the seeded RNG, `pickLane` never
    repeats the previous lane
  - `stateMachine.ts` — guarded FSM (`send` on an illegal event is a no-op);
    `createGameFsm()` pre-wires `menu → playing → paused → gameover`
  - `index.ts` — barrel; exported via the **`@ecomerece/ui/physics`** subpath
    (deliberately NOT in the `'use client'` barrel — server tools can import it)
- **`packages/ui/test/physics.test.ts`** — 30 cases, tick-by-tick: RNG
  determinism, accumulator/spiral-guard, sweep tunneling catch, approach/ramp
  boundaries, odometer Σ v·dt, spawn interval floor + lane avoidance, FSM
  illegal-event no-ops, and a **seeded full-run dodger replay** (same seed ⇒
  identical spawn log / distance / crash state; different seeds diverge).
- **DESIGN.md v3.1** — new **Part VIII — Physics kernel (§43–§51)**: scope and
  the determinism contract, fixed-timestep clock, collision laws, motion and
  lanes, distance/scoring, spawning, state machine, canvas + skin integration
  (canvas reads the `Skin` palette — skins reskin the game), testing
  discipline. TOC + Appendix E.1 package shape updated.

## Goal

Give the design engine the missing half: the **physical laws** a 2D game
needs (time, collision, distance, spawning, game state) as a pure-TS kernel,
so a car dodger / endless runner can be built on the engine without any
third-party physics dependency (no matter.js — respects the kit's
dependency-free rule) and with full determinism.

## Why

The engine owned the *look* (skins, tokens, materials, blur governor, WebGL
slabs) but had **zero** game physics — no collision, no velocity, no
distance, no spawning (verified: no AABB/spawn/hitbox code anywhere in the
monorepo). Every 2D game would have re-implemented the same ~400 lines with
non-deterministic `Math.random`/`Date.now` sprinkled through, untestable and
unreplayable.

## Design decisions

1. **Kernel, not engine** — no rAF loop, no rendering, no input. The game
   owns those (the slab engine's rAF pattern is the precedent, §40).
2. **Determinism contract** — injected `Rng` + fixed timestep; same discipline
   as the hydration fixes (first paint / replay = pure function of inputs).
   A bug report "crashed at 812 m" becomes a seed in CI.
3. **Arcade, not sim** — Euler integration, lane-snap motion, AABB + swept
   CCD. No friction, mass, torque or joints: a retro dodger resolves a hit by
   ending the run, not by bouncing.
4. **Subpath export** (`@ecomerece/ui/physics`) — keeps the pure kernel out
   of the `'use client'` React barrel.

## Files

```
packages/ui/
  lib/physics/        NEW  types · rng · timestep · aabb · motion · distance · spawn · stateMachine · index
  test/physics.test.ts NEW 30 cases incl. seeded full-run replay
  package.json        exports "./physics"
DESIGN.md             Part VIII (§43–§51), TOC, Appendix E.1
```

## Tests

- `packages/ui/test/physics.test.ts` (30 cases):
  - rng: same seed ⇒ identical sequence; helpers bounded; empty-pick throws
  - timestep: 120 Hz input ⇒ 30 steps/0.5 s; stall clamp; spiral guard sheds
    backlog (`acc < FIXED_DT` after 100 × 0.25 s frames); NaN/negative ignored
  - collision: edge-exclusive overlap; circle closest-point; **tunneling body
    (one 4000 px/s step) caught by `sweep` at `t ∈ (0,1)`**; `t=0` when
    already overlapping; pair scan
  - motion: integration; approach lands exactly; ramp linear→hold; clamp
  - distance: odometer Σ v·dt over 60 fixed steps; tiers
  - spawn: interval floor; lane never repeats (300 draws); two seeded spawners
    produce identical lane logs; reset restores base interval
  - fsm: canonical menu→…→menu path; illegal events no-op + notify nothing;
    custom tables; unsubscribe
  - integration: seeded mini-dodger, 3600 ticks — identical runs per seed,
    diverging across seeds, monotonic distance

## Done when

- [x] biome lint clean (`packages/ui`)
- [x] `bun run typecheck` clean
- [x] `bun test` green (30 new cases, suite still 0 fail)
- [x] `next build` succeeds (no app surface touched; subpath is side-effect-free)
- [x] DESIGN.md Part VIII merged, TOC + Appendix E.1 updated
- [x] kernel imports zero deps / zero DOM (enforced by plain `bun test` run)

## Follow-ups (not in this task)

- ~~A reference 2D canvas game consuming the kernel~~ — **landed as
  `todo/13-lane-runner-2d-game.md`** (`apps/web/app/game`): canvas loop + input
  + skin-palette reading + kit chrome.
- Optional `renderInterpolated(state, alpha)` helpers if a second consumer
  needs them (per the promote-on-second-consumer rule).
