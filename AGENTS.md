# AGENTS.md

## Commands

```bash
bun install              # install all workspace deps
bun run dev              # API (8000) + Web (3000) concurrently via --filter
bun run typecheck        # tsc --noEmit across all workspaces
bun run lint             # Next.js ESLint (apps/web)
bun run arch             # architecture boundary scan (scripts/arch-check.ts)
bun run arch             # module/package boundary check (fails on violation)
bun run format           # biome format apps/web + packages
bun test                 # test suite
bun run test:watch       # test suite in watch mode
```

**Validator order:** `bun run lint` → `bun run arch` → `bun run typecheck` → `bun test` → `next build`.
Lint runs the Next.js ESLint config in `apps/web`; formatting is handled by Biome.

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

## Testing

```bash
bun test                    # all tests
bun test <path>             # single file
bun test --watch            # watch mode
```

## Code Style

- **Formatter:** Biome, spaces (indent 2), line width 100, single quotes
- `noExplicitAny` is OFF (allows `any`)
- Aggregates: private state, public command methods, `this.raise()` for events, `this.getEvents()` / `this.clearEvents()` in app service after save
- **ID generation rule:** NEVER accept an ID from the API client when creating any document/aggregate. Always generate it server-side with `Id.create()` (random UUID v7). Client-supplied IDs are only allowed when addressing an existing resource (update/delete/remove/lookup) — never on `create*`/`add*` paths.

## Gotchas

- Bun runs TS directly in dev (`bun run --watch`); no transpile step needed
- MongoDB transactions require a replica set (`?replicaSet=rs0` in connection string)
- Rate limiter keys on `cf-connecting-ip` or `x-forwarded-for` header
- Auth middleware checks live DB state (ban/block/delete) after JWT verification
- `lucide-react` pinned to `0.468.0` and `react`/`react-dom` pinned to `19.3.0` via root `overrides`
- Production: `pm2 start ecosystem.config.js` (fork mode, Bun, port 8000)
