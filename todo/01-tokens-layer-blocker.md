# TASK 01 — tokens.css must live in a cascade layer below `skins` (themes broken)

**Status: DONE** (closed in the current session)

## Goal
Make skin variables actually override `tokens.css` defaults so switching skins
changes geometry/motion/shadows/scene — not just material fills.

## Why
"themes totally broken" report. Root cause (verified in the production build):

- `compile.ts` emits every skin inside `@layer skins`.
- `tokens.css` declared its token variables on an **unlayered** `:root`.
- CSS cascade: unlayered normal declarations beat every layered declaration —
  and skin selectors use `:where()` (specificity 0), so they could not out-rank
  `:root` by specificity either.
- Net effect: `--r-*`, `--ease`, `--dur`, `--scene`, `--shadow-*` stayed locked
  to the `system` values; skins looked partially/fully broken.

## Plan
1. Wrap the token blocks in `tokens.css` (light `:root`, auto-dark `@media`,
   explicit-dark `:root[data-theme=dark]`) in `@layer theme`.
2. Declare the explicit layer order in `globals.css`:
   `@layer properties, theme, base, components, utilities, skins;`
   so `skins` is deterministically last even if a skin stylesheet parses first.
3. Rebuild and verify the compiled chunk: token vars inside `@layer theme`,
   `skins` registered last, `system.css` loads after the globals chunk.

## Tests
- `packages/ui/test/theme-layer.test.ts` — regression gate: token vars appear
  inside `@layer theme`; skin output stays in `@layer skins`; `globals.css`
  declares `skins` last.

## Done when
- [x] biome/typecheck clean
- [x] `next build` succeeds
- [x] compiled CSS shows `--scene`/`--r-control` inside `@layer theme`
- [x] compiled head order: globals chunk → `/skins/system.css`
- [x] layer-contract test green