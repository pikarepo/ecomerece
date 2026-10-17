# AGENTS.md

## Commands

```bash
bun install              # install all workspace deps
bun run dev              # API (8000) + Web (3000) concurrently via --filter
bun run gate             # FULL gate (lint → typecheck → test → build), fails fast
bun run gate --no-build  # same minus `next build` (fast local iteration)
bun run typecheck        # tsc --noEmit across all workspaces
bun run lint             # biome check packages/ui
bun run lint:fix         # biome check packages/ui --write
bun run format           # biome format packages/ui --write
bun run check            # biome check packages/ui
bun test                 # test suite
bun run test:watch       # test suite in watch mode
```

**Validator order:** `lint:fix` → `typecheck` → `test` → `next build`. All four are wired
into `bun run gate` (read-only lint; step fails fast, non-zero exit). Lint scope is
`packages/ui` — the UI surface the workflow owns; `apps/api`/`apps/web` are not yet
biome-clean and stay out of the gate.

## Architecture

DDD + CQRS + Hexagonal (Ports & Adapters). Full spec in `PROJECT_DOCUMENTATION.md`.

**Monorepo workspaces (Bun):**

| Workspace | Role |
|---|---|
| `apps/api` | Hono v4 API (Bun runtime), modules follow 4-layer DDD |
| `apps/web` | Next.js 16 storefront + admin |
| `apps/mobile` | React Native placeholder |
| `packages/domain` | Pure TS aggregates, VOs, events, ports (zero runtime deps) |
| `packages/shared` | Zod schemas, DTOs, API envelopes |
| `packages/frontend` | Cross-platform headless SDK (React Query, Zustand, platform adapters) |

**Path aliases** (root `tsconfig.json`):
- `@ecomerece/domain` -> `packages/domain/index.ts`
- `@ecomerece/shared` -> `packages/shared/index.ts`
- `@ecomerece/frontend` -> `packages/frontend/index.ts`

## Adding a New Module

Build bottom-up, exactly this order:

1. `packages/domain/modules/<name>/` - VOs, events, ports (interface), read models, aggregate
2. `apps/api/modules/<name>/infrastructure/` - Mongoose model, mapper (4 methods: `toDocument`, `toUpdatePayload`, `fromDocument`, `fromDocuments`), repository impl
3. `apps/api/modules/<name>/application/` - Queries/commands DTOs, handlers, internal service, app service (orchestrates: load -> command -> save -> events)
4. `apps/api/modules/<name>/presentation/` - messages, controller (extends `BaseController`), routes, `*.module.ts` (DI wiring, bus registration)
5. Register new routes in `apps/api/routes/index.ts`

**Dependency rule:** Domain never imports Infrastructure. Infrastructure never imports Presentation. Cross-module communication uses QueryBus, CommandBus, or EventBus (registered in each module's `*.module.ts`).

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
- **Component Documentation rule:** Whenever any new UI component, control, pattern, or module is created, modified, or extended in `packages/ui` (or frontend workspaces), you MUST update `components.md` at the repo root immediately with its file path, exported components/types, and description. Keep `components.md` strictly synchronized as the source of truth for all built UI elements.

## Gotchas

- Bun runs TS directly in dev (`bun run --watch`); no transpile step needed
- MongoDB transactions require a replica set (`?replicaSet=rs0` in connection string)
- Rate limiter keys on `cf-connecting-ip` or `x-forwarded-for` header
- Auth middleware checks live DB state (ban/block/delete) after JWT verification
- `lucide-react` pinned to `0.468.0` and `react`/`react-dom` pinned to `19.2.8` via root `overrides`
- `packages/ui` component files rendered by tests need `/** @jsxImportSource react */` as line 1: the root `tsconfig.json` sets `jsxImportSource: hono/jsx`, so `bun test` from the repo root otherwise compiles component JSX to Hono nodes React can't render. Hooks in plain `.ts` are unaffected.
- React 19's `onChange` does NOT fire under happy-dom synthetic events (only `onInput` does) — assert value changes via props/geometry instead.
- Production: `pm2 start ecosystem.config.js` (fork mode, Bun, port 8000)
