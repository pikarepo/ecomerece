# TASK 04 — Fast path: add a new skin or component (checklist)

Use when introducing a new style/skin or a reusable component. Keep it mechanical.

## New skin
1. `packages/ui/skins/<name>.ts` — `Skin` object; extend `system`, override
   `geometry` / `motion` / `modes` / `scene` / `palette` / `a11yTier`.
2. Register in `packages/ui/skins/index.ts` (swatch, group, note).
3. Run `bun run build:skins` → one `<name>.css` in `apps/web/public/skins/`
   (only `system.css` is loaded by default; others load on demand).
4. Behavior gate: `bun test packages/ui/test/skin.test.ts` (validator runs
   every skin; a violating skin FAILS the build — §41).
5. Layer gate: `bun test packages/ui/test/theme-layer.test.ts` (skin output MUST
   stay inside `@layer skins` — unlayered skin vars would silently win and are a bug).
6. Visual: add a picker entry on `/design`; verify light + dark + `data-fidelity`.
7. Gate: `bun run lint:fix` → `bun run typecheck` → `bun test` → `next build`.

## New component
1. Name a ROLE (`mat-panel|card|raised|overlay|chrome|well|control|primary`);
   never read a raw token (`--canvas`, `--surface-*`) — use `var(--m-<role>-*)`
   or `bg-<role>`-style utilities so skins keep working.
2. Respect the layer order: Tailwind utilities only, or your rule goes in
   `engine.css` inside `@layer components` — never unlayered.
3. Add a row to `/design` (the visual + perf surface).
4. Behavior: if it adds state/events, write a unit test (pure helpers first).
5. Gate: same as above; perf test if it touches a scroll/animation hot path.