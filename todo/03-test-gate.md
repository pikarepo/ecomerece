# TASK 03 — UI test-gate: behavior + performance suite

**Status: DONE (reworked this session — the gate is now enforced mechanically)**

## Goal
Every UI change ships only after behavior + performance tests pass. This task now
also carries the **mechanical gate**: a single command that runs the validator order
and exits non-zero on the first failing step, so "green" is a property of the repo
rather than a habit.

## The gate — `bun run gate`

```bash
bun run gate             # lint → typecheck → test → build (fail-fast, non-zero exit)
bun run gate --no-build  # skip the slow `next build` step for local iteration
```

`scripts/gate.ts` runs each step with inherited stdio and **stops at the first
non-zero exit**, printing a timed summary (`✓/✗` per step, `GATE FAILED/PASSED`):

| Step | Command | Scope |
|---|---|---|
| lint | `biome check packages/ui` | the UI surface the workflow owns (read-only) |
| types | `bun run typecheck` | `tsc --noEmit`, every workspace with a `typecheck` script |
| test | `bun test` | behavior + perf + snapshot suite |
| build | `bun run --filter web build` | the app the UI ships into (`next build`) |

Lint is deliberately scoped to `packages/ui`: the rest of the monorepo is **not** yet
biome-clean (`biome check .` ≈ 617 pre-existing errors in `apps/api`/`apps/web`), so a
repo-wide step would be permanently red. `bun run lint:fix` (`biome check packages/ui
--write`) is the write-mode companion.

## Also fixed this session (the gate forced these out)

- **Broken root scripts.** `lint`/`lint:fix`/`format`/`check` all pointed at a
  nonexistent `src` dir; `lint:imports` referenced a missing `scripts/check-imports.ts`.
  Repointed to `packages/ui`; removed the dead `lint:imports`.
- **`next build` env fragility (real bug).** `gate.ts` runs via `bun run`, which injects
  the repo-root `.env` into the process env; the malformed
  `NEXT_PUBLIC_API_URL=localhost:8000` (no scheme) then won over
  `apps/web/.env.local`, so the `/api` rewrite destination was invalid and
  `next build` failed. Fixed in two places: `apps/web/next.config.ts` now normalizes a
  scheme-less `NEXT_PUBLIC_API_URL` to `http://…` (durable), and the root `.env` value
  was corrected (data) — the gate goes green regardless of env.

## Tests written (packages/ui/test/)

| File | What it gates |
|---|---|
| `skin.test.ts` | registry integrity — §41 validation, inheritance, V12 blur budget, V13′ 3D contract, compile output structure |
| `theme-layer.test.ts` | cascade-layer contract (regression gate for the themes-broken blocker) |
| `perf.test.ts` | compile/validate budget, output size, determinism |
| `capabilities.test.ts` | shared cached WebGL2 / backdrop-filter probes |
| `contrast.test.ts` | a11y contrast snapshot for every skin (416 resolved fills) |
| `useSkin.test.tsx` | happy-dom hook behavior (stylesheet race, self-heal, reset) |
| `blurGovernor.test.ts` | happy-dom surface-blur budget + dispose |
| `fast-path.test.ts` | `mat-*` / `--m-*` contract + design-picker completeness (02-E) |
| `_dom.ts` | happy-dom harness (`installDom`/`restoreDom` — Bun shares `globalThis` across workers) |
| `__snapshots__/contrast.test.ts.snap` | 416-fill contrast snapshot |

## Done when
- `bun run gate` (full) exits 0; a deliberately introduced lint error makes it exit 1 and
  **skip** every downstream step. ✔ verified this session.
- Suite: **137 pass / 0 fail + 1 snapshot across 20 files**; lint + typecheck + build green. ✔
