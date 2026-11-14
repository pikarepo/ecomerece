# AGENTS.md

## Commands

```bash
bun install              # install all workspace deps
bun run dev              # API (8000) + Web (3000) concurrently via --filter
bun run typecheck        # tsc --noEmit across all workspaces
bun run lint             # Next.js ESLint (apps/web only)
bun run arch             # module/package boundary check (fails on violation)
bun run format           # biome format apps/web + packages (NOT apps/api)
bun test                 # test suite
bun run test:watch       # test suite in watch mode
```

**Validator order:** `bun run lint` → `bun run arch` → `bun run typecheck` → `bun test` → `next build`.
Lint runs the Next.js ESLint config in `apps/web`; formatting is handled by Biome.
`bun run format` does not cover `apps/api` — format API files explicitly with
`bunx biome format --write apps/api/modules/<name>/...`.

## Architecture

DDD + CQRS + Hexagonal (Ports & Adapters). Full spec in `PROJECT_DOCUMENTATION.md`.

**Monorepo workspaces (Bun):**

| Workspace | Role |
|---|---|
| `apps/api` | Hono v4 API (Bun runtime), modules follow 4-layer DDD |
| `apps/web` | Next.js 16 storefront + admin (Material UI / MUI default) |
| `apps/mobile` | React Native placeholder |
| `packages/domain` | Pure TS aggregates, VOs, events, ports (zero runtime deps) |
| `packages/shared` | Zod schemas, DTOs, API envelopes |
| `packages/frontend` | Cross-platform headless SDK (React Query, Zustand, platform adapters) |

**Web UI:** Material UI (MUI) is the default component library. There is no custom
skin engine, design system, or in-house UI kit in this repo.

**Path aliases** (root `tsconfig.json`):
- `@ecomerece/domain` -> `packages/domain/index.ts`
- `@ecomerece/contracts` -> `packages/contracts/index.ts`
- `@ecomerece/shared` -> `packages/shared/index.ts`
- `@ecomerece/frontend` -> `packages/frontend/index.ts`

## Adding a New Module

Build bottom-up, exactly this order:

1. `packages/domain/modules/<name>/` - VOs, events, ports (interface), read models, aggregate
2. `apps/api/modules/<name>/infrastructure/` - Mongoose model, mapper (`aggregateToPersistence`, `persistenceToAggregate`, `aggregateToReadModel`, `persistenceToReadModel`), repository impl
3. `apps/api/modules/<name>/application/` - Queries/commands DTOs, handlers, internal service, app service (orchestrates: load -> command -> save -> events)
4. `apps/api/modules/<name>/presentation/` - messages, controller (extends `BaseController`), routes, `*.module.ts` (factory: DI wiring + bus registration; invoked only by `apps/api/composition-root.ts`)
5. Register new routes in `apps/api/routes/index.ts`

**Dependency rule:** Domain never imports Infrastructure. Infrastructure never imports Presentation. Modules never import each other's application/presentation/infrastructure code: cross-module reads use contract queries on the QueryBus, cross-module writes use contract ports injected in `apps/api/composition-root.ts`, and reactions use EventBus events. `packages/contracts` is the only cross-module surface.

## Engineering Standards

The full, project-adapted standard is in `PROJECT_DOCUMENTATION.md` §8.6. Summary:

**Priority:** correctness → clarity → simplicity → consistency → small changes → honesty.

**Before editing:** read the target file, its imports, tests, and callers; find 2–3
existing examples and copy their pattern. If a design-changing point is ambiguous,
ask one focused question; otherwise state the assumption and proceed.

**Layers:** Route maps URL + middleware. Controller parses and calls ONE app-service
method. Application service orchestrates (`load → domain method → save → publish`).
Domain enforces invariants and does no I/O. Repository owns persistence details.
Internal service only holds logic shared by 2+ use cases.

**Size and shape:** one reason to change per file. Soft limits: ~300 lines for a
service, ~200 for a controller/repository (excluding types). Functions 10–30 lines
(review >40), max 3 parameters or one named object, max 2 nesting levels with guard
clauses. No boolean parameters that switch behavior, no mutating parameters.

**Naming:** business intent (`reserveInventory`, not `processData`). Booleans
`is/has/can/should`. Units in names (`timeoutMs`). Maps by key (`variantById`).
Spell names correctly; report existing typos rather than silently copying them.

**Types:** `strict` is on. Do not add `any`, `!`, `@ts-ignore`, or `@ts-expect-error`
in new code. Prefer value objects for ids and money. Derive types (`Pick`,
`ReturnType`, `z.infer`) instead of duplicating them.

**Errors:** domain error classes; expected business outcomes returned as typed
results. Never swallow errors. Do not change existing error classes, statuses, or
messages while refactoring.

**Transactions and events:** transaction boundaries live in the app service. Domain
events stay buffered on the aggregate and are published only after commit. Never
publish from inside a transaction callback.

**Tests:** every important rule gets success, failure, and edge-case coverage. Test
behavior, not private methods. Never weaken a test to make a change pass.

**Comments:** explain why (invariant, ordering, trade-off), not what. No decorative
section banners or commented-out code. Update the comment in the same change.

**Hard stops (ask first):** changing a public API, DB schema, event payload, or
error contract; deleting tests; adding a dependency or layer; touching files outside
the requested scope.

**Verification:** run the relevant tests, then `bun run typecheck` and `bun run arch`.
`bun run lint` covers `apps/web` only. Report anything not run, and list
behavior-changing findings under "Needs decision" instead of applying them.

**Known deviations from the generic standard (existing code wins until changed):**
- Biome has `noExplicitAny` off and `BaseService` uses `any`; keep new code free of
  `any` anyway.
- `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` are not enabled.
- The ESLint complexity/max-lines rules from the generic guide are not installed.

## Testing

```bash
bun test                    # all tests
bun test <path>             # single file
bun test --watch            # watch mode
```

## Code Style

- **Formatter:** Biome, spaces (indent 2), line width 100, single quotes
- `noExplicitAny` is OFF (allows `any`)
- Aggregates: private state, public command methods, `this.raise()` for events, `this.pullEvents()` / `this.clearEvents()` in app service after save
- **Comments:** explain why, not what; no decorative dividers, no commented-out code
- **ID generation rule:** NEVER accept an ID from the API client when creating any document/aggregate. Always generate it server-side with `Id.create()` (random UUID v7). Client-supplied IDs are only allowed when addressing an existing resource (update/delete/remove/lookup) — never on `create*`/`add*` paths.

## Gotchas

- `bun run arch` currently fails: `package.json` points at `scripts/arch-check.ts`, which is missing
  from the tree. Restore the script or enforce boundaries in review until it is fixed.
- `bun run typecheck` has a pre-existing failure at `apps/api/index.ts:16` (`CORS_ORIGIN` possibly
  `undefined`); it is unrelated to feature work, so report it instead of silently fixing it.
- Bun runs TS directly in dev (`bun run --watch`); no transpile step needed
- MongoDB transactions require a replica set (`?replicaSet=rs0` in connection string)
- Rate limiter keys on `cf-connecting-ip` or `x-forwarded-for` header
- Auth middleware checks live DB state (ban/block/delete) after JWT verification
- `lucide-react` pinned to `0.468.0` and `react`/`react-dom` pinned to `19.3.0` via root `overrides`
- Production: `pm2 start ecosystem.config.js` (fork mode, Bun, port 8000)
