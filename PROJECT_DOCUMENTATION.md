# Ecomerece — System Documentation

This document describes the codebase as it actually behaves, written by reading the source
(2026-11-08). Every path, route, event name and environment variable below was verified in the
repository. Where the code and older docs disagree, the code wins; the differences are listed in
[§22 Known gaps and inconsistencies](#22-known-gaps-and-inconsistencies).

**Companion playbook:** [`docs/architecture-guide.html`](./docs/architecture-guide.html) is a
step-by-step, single-file HTML course (open it in a browser) for building a module from scratch in
this style, including the cross-module chapter. This document describes the system as it is; the
playbook teaches how to extend it.

`ecomerece` is a multi-vendor marketplace with three surfaces in one Next.js app:

| Surface | Path prefix | Audience | Auth |
|---|---|---|---|
| Storefront | `/`, `/products`, `/categories`, `/vendors`, `/reviews` | anonymous visitors | none |
| Buyer account | `/account/**` | signed-in customers | Supabase session |
| Admin / seller dashboard | `/dashboard/**` | admins (and vendors, partially) | Supabase session + API role checks |

The backend is a Hono API on Bun, MongoDB for business data, Redis for rate limiting and runtime
settings, Supabase for identity, Cloudinary for image hosting.

---

## Table of contents

1. [What the system does](#1-what-the-system-does)
2. [Repository map](#2-repository-map)
3. [Stack](#3-stack)
4. [Running the project](#4-running-the-project)
5. [API bootstrap and request pipeline](#5-api-bootstrap-and-request-pipeline)
6. [Response and error contract](#6-response-and-error-contract)
7. [Authentication and authorization](#7-authentication-and-authorization)
8. [Architecture: DDD + CQRS + hexagonal](#8-architecture-ddd--cqrs--hexagonal)
9. [Domain model catalog](#9-domain-model-catalog)
10. [Domain events](#10-domain-events)
11. [Buses and cross-module communication](#11-buses-and-cross-module-communication)
12. [Persistence layer](#12-persistence-layer)
13. [API module reference](#13-api-module-reference)
14. [HTTP endpoint catalog](#14-http-endpoint-catalog)
15. [Stats subsystem](#15-stats-subsystem)
16. [packages/shared](#16-packagesshared)
17. [packages/frontend (headless SDK)](#17-packagesfrontend-headless-sdk)
18. [apps/web](#18-appsweb)
19. [Seed scripts](#19-seed-scripts)
20. [Testing](#20-testing)
21. [Configuration reference](#21-configuration-reference)
22. [Known gaps and inconsistencies](#22-known-gaps-and-inconsistencies)
23. [Where do I change X?](#23-where-do-i-change-x)
24. [Maintaining this document](#24-maintaining-this-document)

---

## 1. What the system does

A customer browses products (optionally filtered by category or vendor), opens a product page,
reads reviews and adds items to a cart. Placing an order goes through `POST /order/create/my`,
which reserves stock through the inventory module, creates order items through the order-items
module, and records a stats event. Vendors list products and variants, manage stock, see their
sales stats, and can force-refresh their own stats (rate limited by a quota in Redis). Admins
moderate users (ban/block), verify or reject vendors, block products, edit the home page layout and
inspect the stats pipeline.

Soft-delete and moderation state exist on most aggregates: `deleted` (usually with `deletedBy`,
`deletedAt`, `reason`) and `block`/`ban` for products and users. Most “delete” endpoints are soft
deletes followed by a matching recover endpoint; repository helpers also expose hard
`deleteOne`/`deleteMany`, used by seed scripts and admin moderation code paths.

---

## 2. Repository map

Bun workspaces monorepo:

```
.
├── apps
│   ├── api                 Hono v4 API on Bun (port 8000)
│   ├── mobile              placeholder — contains no source files
│   └── web                 Next.js 16 App Router storefront + admin (MUI)
├── packages
│   ├── domain              aggregates, value objects, events, ports, read models
│   ├── contracts           the only cross-module surface: query interfaces, ports, actor types
│   ├── shared              Zod schemas, DTO types, read models, stats types
│   └── frontend            headless SDK: HTTP client, React Query hooks, Zustand stores
├── AGENTS.md               contributor instructions
├── PROJECT_DOCUMENTATION.md this file
├── README.md               older, partly stale overview (see §22)
├── biome.json              formatter config (2 spaces, 100 cols, single quotes)
├── ecosystem.config.js     pm2 config for production (fork mode, bun, port 8000)
├── package.json            workspace scripts, overrides (react 19.3.0, lucide-react 0.468.0)
└── tsconfig.json           project references + path aliases
```

Path aliases (root `tsconfig.json`):

| Alias | Target |
|---|---|
| `@ecomerece/domain` | `packages/domain/index.ts` |
| `@ecomerece/contracts` | `packages/contracts/index.ts` |
| `@ecomerece/shared` | `packages/shared/index.ts` |
| `@ecomerece/frontend` | `packages/frontend/index.ts` |

---

## 3. Stack

| Concern | Choice |
|---|---|
| Runtime / package manager | Bun (runs TypeScript directly, `bun run --watch` in dev) |
| HTTP API | Hono v4 |
| Database | MongoDB via Mongoose 8 (transactions need a replica set) |
| Cache / counters / settings | Redis (`redis` v6 client, `REDIS_URL`) |
| Identity | Supabase (`@supabase/supabase-js`) — JWT verification + Google OAuth |
| Validation | Zod 4 (`packages/shared`) |
| Web | Next.js 16 App Router, React 19.3, Material UI 9 |
| Client data layer | TanStack React Query 5 + Zustand 5 |
| Images | Cloudinary (server upload, `IMAGE_STORAGE_PROVIDER`) |
| Formatting | Biome |
| Linting | Next.js ESLint config, `apps/web` only |
| Tests | `bun:test` (78 tests across 13 files) |

---

## 4. Running the project

```bash
bun install              # install workspace deps
bun run dev              # API on :8000 and web on :3000 concurrently
bun run typecheck        # tsc --noEmit in api + web
bun run lint             # Next.js ESLint (apps/web only)
bun run format           # biome format apps/web packages (write)
bun test                 # bun:test suite
bun run test:watch       # watch mode
bun run build            # build api (bun build) then next build
```

Validator order used by this repo: `bun run lint` → `bun run typecheck` → `bun test` →
`next build`.

**Ports and proxying.** The API always listens on `8000` (`apps/api/index.ts`, `port: 8000`,
hardcoded). Next dev runs on `3000`. The browser never calls the API directly in development:
`apps/web/next.config.ts` rewrites `/api/:path*` to
`API_PROXY_TARGET || NEXT_PUBLIC_API_URL || http://localhost:8000` with `:path*` preserved. The SDK
HTTP client defaults its base URL to `NEXT_PUBLIC_API_URL || '/api'`, so same-origin `/api/...`
requests are proxied by Next.

**Production.** `pm2 start ecosystem.config.js` runs `bun apps/api/index.ts` in fork mode
(port 8000). The web app is a normal `next build` / `next start` deployment. CORS is configured
from `CORS_ORIGIN` (comma separated list), so a separately hosted web app must be listed there if
it calls the API cross-origin.

**Background work started by the API process** (no separate worker):
`StatsBufferService.startBackgroundFlushing(5000)` and
`ProductStatsSyncScheduler.start(60_000)`. SIGTERM/SIGINT stop the scheduler and flush the stats
buffer before exit.

---

## 5. API bootstrap and request pipeline

`apps/api/index.ts` builds the Hono app from `apps/api/app.ts`, then adds middleware in this exact
order:

```ts
app.use(logger());
app.use('*', secureHeaders({
  contentSecurityPolicy: { defaultSrc: ["'self'"], scriptSrc: ["'self'"] },
  xFrameOptions: 'DENY', xContentTypeOptions: 'nosniff', referrerPolicy: 'no-referrer',
}));
app.use('*', cors({
  origin: corsOrigins, credentials: true,
  allowMethods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowHeaders: ['Content-Type','Authorization'],
}));
app.use('*', ...requestGuards({
  maxUrlLength: 200, maxQueryLength: 200, maxParamLength: 20,
  maxBodyBytes: 7_000_000, maxJsonDepth: 5, maxJsonNodes: 50,
}));
app.use('*', rateLimiter);
app.use('*', dbMiddleware);
app.options('*', (c) => c.text(''));   // CORS preflight
app.route('/', routes);
registerErrorHandler(app);             // onError + notFound
```

| Middleware | File | Behaviour |
|---|---|---|
| `logger` | hono/logger | one line per request |
| `secureHeaders` | hono/secure-headers | CSP (default/script/style `self`, img allows `data:`/`blob:`/https), `X-Frame-Options: DENY`, nosniff, no-referrer |
| `cors` | hono/cors | origin list from `CORS_ORIGIN`, credentials enabled, methods `GET/POST/PUT/PATCH/DELETE/OPTIONS`, headers `Content-Type`/`Authorization` |
| `requestGuards` | `middleware/requestguard.middleware.ts` | rejects long URL/query/param with `414 URI_TOO_LONG` / `QUERY_TOO_LONG` / `PARAM_TOO_LONG`, bodies over the byte cap with `413 PAYLOAD_TOO_LARGE`, and JSON deeper than 5 levels or > 50 nodes with `413 JSON_TOO_DEEP` / `JSON_TOO_LARGE`; all use the standard error envelope |
| `rateLimiter` | `middleware/rateLimiter.ts` | Redis sliding-window Lua script, keyed on `cf-connecting-ip` → first `x-forwarded-for` hop → `unknown`; defaults 60 requests / 60 s, overridable with `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` |
| `dbMiddleware` | `middleware/db.middleware.ts` | connects Mongoose once per process; requests fail with a 503 envelope if MongoDB is unavailable |

**Health check.** `GET /health` is registered in `app.ts` *before* the middleware above, so it
bypasses logging, rate limiting, guards and the database check (verified against Hono's
registration-order semantics). It returns `{ success: true, message: 'OK' }`. Use it for liveness
probes; use `GET /stats/_health` for stats pipeline depth.

**Route mounting.** `apps/api/index.ts` calls `createApplication()` from
`apps/api/composition-root.ts` once, then `createRoutes(application)` mounts twelve prefixes and hands
each route factory the controller the composition root already built:

```ts
/product  /product-variant  /review  /product-inventory  /order  /order-items
/category /address          /users   /vendor             /home   /stats
```

Route modules no longer construct anything: they only receive a controller (or, for `order-items`,
nothing) and declare HTTP handlers. `/order-items` exposes no endpoints — the module is internal and
its writer is injected into the order module as `IOrderItemsWriter`.

**Shutdown.** SIGTERM/SIGINT: `statsBufferService.shutdown()` (final flush), then
`productStatsSyncScheduler.stop()`, then `process.exit(0)`. There is no explicit Mongo/Redis
disconnect; whatever the clients flush on exit is best-effort.

---

## 6. Response and error contract

Every response is JSON. Success is `{ success: true, data }` (201/202 use the same shape; 204 is an
empty body). List endpoints usually return their page object *inside* `data`, so the wire shape is
`{ success: true, data: { data: [...], meta: { ... } } }` — the SDK unwraps one level and hands the
page object to the hook.

Error (from `registerErrorHandler`, `apps/api/errors/error-handler.ts`):

```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "…", "issues": [] } }
```

`code`/`message` live inside `error`; `issues` (array of `{ field, message }`) and `stack` are
optional. Handled cases, in order:

| Thrown | Status | `error.code` |
|---|---|---|
| `ZodError` | 400 | `VALIDATION_ERROR` (+ mapped `issues`) |
| `AppError` subclass (`BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, …) | `sanitizeStatus(err.status)` | the error's `code` |
| Mongo duplicate key `11000` | 409 | `CONFLICT` (message names the duplicated field) |
| Mongoose `ValidationError` | 400 | `VALIDATION_ERROR` |
| Mongoose `CastError` | 400 | `INVALID_ID` |
| anything else | 500 | `INTERNAL_ERROR`; `message`/`stack` only when `NODE_ENV !== 'production'` |
| unmatched route (`notFound`) | 404 | `NOT_FOUND` |

`sanitizeStatus` keeps only `101` or `200–599`; anything else becomes 500.

Controllers extend `BaseController` (`apps/api/core/controller/base.controller.ts`), which owns the
envelope helpers `ok`, `created`, `accepted`, `noContent`, `paginated`, `redirect`, `badRequest`,
`unauthorized`, `forbidden`, `notFound`, `conflict`, `unprocessable`, plus a strict `PaginationMeta`
type (`page`, `limit`, `total`, `totalPages`, `hasNextPage`, `hasPrevPage` — offset pagination only;
see §12.3).

The web SDK (`packages/frontend/lib/http-client.ts`) sends `Authorization: Bearer <token>` when the
auth adapter has one, maps failures to `HttpError(status, code, message, issues)`, returns `null` for
204/205 and tolerates empty bodies. Note it branches on a **top-level** `payload.meta` and unwraps
`payload.data`; since the API nests `meta` inside `data`, hooks receive `{ data, meta }` and index
accordingly.

---

## 7. Authentication and authorization

Identity is Supabase; **all** authorization decisions about the user (banned, blocked, deleted,
role) are re-checked against MongoDB on every request.

### 7.1 Token verification

`middleware/auth.ts`:

1. Reads the `Authorization: Bearer <token>` header, rejects with 401 if missing.
2. Calls Supabase admin `auth.getUser(token)` using `SUPABASE_URL` + `SUPABASE_SECRET_KEY`.
3. Loads the user snapshot through `IAuthUserLookup` (implemented by
   `modules/user/infrastructure/user-auth-lookup.adapter.ts`, wired in the composition root with
   `configureAuthUserLookup`), so auth middleware never imports another module's Mongoose model.
4. Rejects if not found or soft-deleted (401), if `block.blocked` (403) or `ban.banned` (403).
5. Sets context: `user` (the snapshot), `userId` (string `_id`), `email`, `role`.

Controllers receive that snapshot typed as `AuthActor` (from `@ecomerece/contracts`) and use
`actor._id` as the actor id.

`middleware/init-auth.ts` is a lighter variant for `POST /users/init`: it verifies the token and
sets `email` + `userId` only (the user row may not exist yet).

`middleware/admin.ts` requires `c.get('role') === 'admin'`, else 403. Compose as
`auth, admin` — order matters.

`middleware/seller.ts` exists but reads `c.get('profile')`, a variable nothing sets. It is not
mounted anywhere; do not use it as-is.

### 7.2 Guard matrix

| Guard chain | Meaning |
|---|---|
| *(none)* | public |
| `auth` | any signed-in, non-blocked, non-banned, non-deleted user |
| `initAuth` | valid Supabase token, user row not required |
| `auth, admin` | role must be `admin` |
| `statsAccessGuard('throw')` / `statsAccessGuard('mask')` | entity-level stats access (see §15.6) |
| `statsViewGuard` | write-path bot/dedupe/rate filtering (see §15.5) |

Roles come from the user document: `customer`, `vendor`, `admin`. `POST /users/role` is the only
place that assigns them (admin only), and vendor lifecycle events also promote/demote
automatically (§11.3).

### 7.3 Web-side auth

`packages/frontend/adapters/auth/auth-adapter.web.ts` wraps `supabase-js`
(`signInWithOAuth` with Google → `/auth/callback`, `signOut`, session listener). `apps/web`'s
`AuthProvider` keeps `{ token, profile, me }`, loads the profile with `useGetMe`, and exposes
`refresh()`, `signIn()`, `signOut()`. `RequireAuth` redirects unauthenticated users to
`/auth?next=…`; `SiteHeader` shows the dashboard link for `admin` and `vendor` roles. The web app
does **not** enforce admin role on `/dashboard` pages — only the API does (see §22).

---

## 8. Architecture: DDD + CQRS + hexagonal

> For a guided, example-driven version of this section — including a 12-step build of a synthetic
> module and the cross-module decision table — see
> [`docs/architecture-guide.html`](./docs/architecture-guide.html).

### 8.1 Layers

Per module (workspace bottom-up):

```
packages/domain/modules/<name>/       aggregate, value objects, events, ports, read models (pure)
packages/contracts/modules/<name>/    typed query interfaces and cross-module ports
apps/api/modules/<name>/
  infrastructure/                     Mongoose model + mapper + repository implementation
  application/                        DTO types, internal service, app service
                                      (load → mutate → save → publish events)
  presentation/                       messages, controller (extends BaseController), routes
  <name>.module.ts                    module factory: builds the graph, registers handlers
```

Cross-module reads go through typed query interfaces declared in `packages/contracts` and
implemented by the owner module's adapter; events go through `IEventBus`; other cross-module actions
use ports declared in `packages/contracts`. A module never imports another module's infrastructure,
application or presentation. There is no `CommandBus` or `QueryBus`.

**Dependency reality check.** `packages/domain` no longer imports `apps/api`: `AppError` and friends
live in `packages/domain/errors/app-error.ts` and `apps/api/errors/app-error.ts` just re-exports them.
The domain package still imports five files' worth of *types* from `@ecomerece/shared`
(`StatEvent`, `Metrics` in the stats helpers and the vendor read model/port, all `import type`), and
`packages/domain/package.json` still declares `@ecomerece/shared` as a dependency. See §22.

`bun run arch` (`scripts/arch-check.ts`, zero dependencies) enforces these rules: no cross-module
internal imports, no domain → apps/api imports, no middleware → module imports, and no `export … from`
re-export laundering. It exits non-zero on the first violation.

### 8.2 Aggregate pattern

`packages/domain/core/aggregate-root.ts` provides `raise(event)` plus `pullEvents()`/
`clearEvents()`. Aggregates are constructed through `static create(...)` (new id) or
`static rehydrate(...)` (from persistence), keep private state with getters, and expose intention
methods (`makePublic`, `block`, `reserve`, `verify`, …). ID generation is always server-side:
`Id.create()` produces a UUID v7; `Id.create(value)` rehydrates an existing id, and ids are
validated to 5–40 characters. Never accept an id from the client on a create path.

### 8.3 Application service pattern

Each app service takes dependencies (repositories, buses, mappers) via constructor, and each use case
does:

1. load aggregate(s) with `FindByIdOrThrow` / `FindBy…`,
2. call a domain method (which raises events),
3. `Save` / `Create`,
4. publish `aggregate.pullEvents()` on the injected `eventBus`,
5. return a message object built from `presentation/messages`.

Every module (`address`, `category`, `home`, `inventory`, `order`, `order-items`, `product`,
`product-variant`, `reviews`, `user`, `vendor`) publishes events this way. The one exception is
`OrderApplicationService.createMyOrder`: it runs inside `UnitOfWork.transaction` and publishes the
item + order events **after** the transaction resolves, so consumers never see events for a write
that rolled back (covered by `order-create-commit.test.ts`).

### 8.4 Module wiring

Each `<name>.module.ts` exports a factory that takes a deps object and returns the module's
controller plus anything other modules need (an adapter, a projector, a scheduler, a stats-access
port). The factory is where the graph is built — repository → mapper → internal service → app
service → controller — and where event handlers are registered
(`eventBus.register('order-item.created', handler)`) and query adapters are constructed.

`apps/api/composition-root.ts` is the **single composition root**. `createApplication()` creates one
`InMemoryEventBus`, the `UnitOfWork`, and the image-storage adapter, then calls every module factory
in dependency order and returns `{ buses, unitOfWork, modules }`. Provider query adapters are built
before the consumers that receive them; order-items is split into an eager core and application
phase to keep the order ↔ order-items wiring acyclic. Nothing
is wired as an import side effect, so a module factory can be instantiated in isolation by passing
fakes for its deps. Cross-module adapters (auth lookup, stats access, stats view guard) are
configured here too, via the middleware `configure*` functions.

### 8.5 Code comment conventions

Comments explain intent, not mechanics. If a good name or type already says what the code does, a
comment adds nothing and will drift out of date.

Use:

- `/** ... */` on exported classes, ports, public app-service methods, and non-obvious types — the
  contract a caller needs to know.
- `// ...` inside a method for *why*: invariants, ordering constraints, cross-module side effects,
  workarounds, and failure modes.
- Name the invariant or consequence directly ("publish after commit so consumers never see
  rolled-back orders") instead of narrating the line ("publish events").
- Mark side effects and ordering: "raises `order.created`", "reserved stock is held until expiry",
  "checked inside the transaction to close the race".
- Keep the comment next to the code it explains. When the code changes, update or delete the comment
  in the same change.

Avoid:

- Restating types or assignments (`// set the id`, `// loop over items`).
- Commented-out code and stale `TODO`/`FIXME` blocks — track work in the issue tracker instead.
- Decorative banners and section dividers; use small private methods instead.
- Comments that duplicate this document; link to the relevant section instead.

```ts
// Bad: narrates the syntax.
// create the order
const order = OrderAggregate.create({ ... });

// Good: explains a decision the type system cannot express.
// Total is derived from reserved lines only, never from unreserved stock.
const order = OrderAggregate.create({
  totalPrice: Money.create(orderItems.reduce((sum, i) => sum + i.quantity.value * i.price, 0)),
  ...
});
```

`OrderApplicationService.createMyOrder` in
`apps/api/modules/order/application/order.app.service.ts` is the reference example: the class JSDoc
states the cross-module flow, the method JSDoc lists the steps, and inline comments only cover
transaction and event-ordering rules.

### 8.6 Engineering standards for large TypeScript changes

These rules adapt the "How to Write and Maintain Large TypeScript Code" playbook to this repo. They
are the standard for new and changed code. Existing deviations are tracked in §22 and are not a
reason to copy them.

**Priority order:** correctness → clarity → simplicity → consistency → small changes → honesty.
Never trade maintainability for fewer lines.

**Operating protocol**

1. Discover — read the target file completely, then its imports, tests, callers, contract
   interfaces, and 2–3 existing examples of the same pattern. Note side effects (DB writes, events,
   cross-module calls) before editing.
2. Plan — for anything larger than one function, list steps that each compile and could be merged
   alone. Order: types/contracts → pure logic → persistence → orchestration → wiring → tests.
3. Implement — prefer targeted edits. Write the top-level workflow as named steps, then fill each
   step. Do not rewrite a large file in one shot.
4. Verify — run the relevant tests, then `bun run typecheck` and `bun run arch`. `bun run lint`
   covers `apps/web` only; format API files with Biome explicitly.
5. Report — use the change-description format at the end of this section.

**Layers and dependencies**

| Layer | Owns | Must not |
|---|---|---|
| Route | URL + middleware | contain business logic |
| Controller | parse request, call ONE app-service method, shape response | rules, repositories |
| Application service | use-case orchestration: load → domain → save → publish | ORM/query details, domain rules |
| Domain (aggregates, VOs) | invariants and state transitions | infrastructure imports, I/O |
| Internal service | logic shared by 2+ use cases in one module | become a dumping ground |
| Repository | persistence and query details | contain business decisions |

Dependencies point inward. ORM types (`FilterQuery`, `*Persistence`, Mongoose schemas) belong in
`infrastructure/`, not in `application/`. Modules communicate only through `packages/contracts`.
No circular dependencies.

**File and function shape**

- One reason to change per file. Soft limits: ~300 lines for a service, ~200 for a
  controller/repository (excluding type-only blocks). Past the limit, look for a second
  responsibility; do not split by line count alone.
- Functions: 10–30 lines, review over 40. Max 3 parameters or one named object. Max 2 nesting
  levels; use guard clauses and keep the happy path left-aligned.
- No boolean flag parameters that switch behavior; write two functions instead.
- No mutating parameters. One return shape per function. Keep pure decisions separate from I/O.
- Within a file: imports → constants → local types → public class/function → private helpers in the
  order they are called.
- Extract a helper only when 2+ flows need it, it is a distinct responsibility, or it can be tested
  independently. Do not extract one-use trivial helpers.

**Naming and types**

- Name business intent (`reserveInventory`, `verifyProductOwnership`), never `processData`,
  `handle`, `data`, `util`. Booleans use `is/has/can/should`; units appear in names (`timeoutMs`).
- Maps are named by key (`variantById`); collections are plural. Spell names correctly; report
  existing typos instead of copying them.
- `strict` is on. Do not add `any`, `!`, `@ts-ignore`, or `@ts-expect-error` in new code. Isolate an
  unavoidable cast in one parse function with a comment.
- Use value objects for ids and money; do not pass raw `string`/`number` for domain concepts that
  can be confused. Derive types instead of duplicating them.

**Errors, transactions, events**

- Domain error classes with meaningful messages; expected business outcomes returned as typed
  results. Never swallow errors; preserve `cause` when rethrowing.
- Do not change error classes, HTTP statuses, or messages as a side effect of a refactor.
- The application service owns the transaction boundary. Domain events stay buffered on the
  aggregate; publish only after the transaction commits, never inside the callback.

**Comments**

- Explain why (invariant, ordering, trade-off), not what. Public methods get a short JSDoc stating
  purpose, rules, and transaction/event guarantees. No banners, no commented-out code, no stale
  TODOs (use a tracked issue). §8.5 is the detailed convention.

**Hard stops — ask before doing**

- Changing a public API, DB schema, event payload, or error contract.
- Deleting or weakening tests.
- Adding a dependency, layer, base class, or wrapper.
- Touching files outside the requested scope.

**Project-specific deviations (existing code wins until migrated)**

1. `biome.json` keeps `noExplicitAny` off, and `BaseService` uses `any`. Do not copy that into new
   code; new code should be `any`-free.
2. `bun run lint` runs Next.js ESLint for `apps/web` only. API/domain correctness is covered by
   `bun run typecheck`, `bun run arch`, and Biome formatting; there is no API ESLint config.
3. `bun run format` formats `apps/web` and `packages` only. Format API files with
   `bunx biome format --write apps/api/modules/<name>/...`.
4. Root `tsconfig.json` enables `strict` but not `noUncheckedIndexedAccess` or
   `exactOptionalPropertyTypes`. Enabling them is a repo-wide change, not a drive-by edit.
5. The complexity/max-lines ESLint rules from the generic playbook are not installed; enforce the
   limits in review until tooling is added.

**Change report format**

```
Summary: one or two sentences.
Changes: problem -> fix, one line each.
Files touched: list.
Needs decision: behavior-changing findings NOT applied.
Follow-ups: unrelated issues noticed.
Checks: typecheck / lint / tests -> pass | fail | not run (reason).
Assumptions: anything you guessed.
```

---

## 9. Domain model catalog

`packages/domain` contains 11 aggregates (stats has none by design), 30 value objects, 110 event
classes and 12 port interfaces.

| Module area | Aggregate | Notable state | Port(s) | Read models |
|---|---|---|---|---|
| address | `AddressAggregate` | ownerId, street/city/state/postal/country, default flag, delete info | `IAddressRepository` | address read models |
| category | `CategoryAggregate` | name, slug, description, image, delete info | `ICategoryRepository` | category read models |
| home | `HomeAggregate` | slides, promos, categories, features, containers (ordered), version | `IHomeRepository` | home layout |
| image-storage | — (only port + errors) | — | `IImageStorage` | upload result |
| inventory | `InventoryAggregate` | variantId, productId, vendorId, quantity, reserved, available, threshold | `IInventoryRepository` | inventory read model |
| order | `OrderAggregate` | buyerId, totalPrice, full address, idempotent key, version | `IOrderRepository` | order read models |
| order-items | `OrderItemAggregate` | orderId, product/variant/vendor ids, quantity, price, status | `IOrderItemRepository` | order item read models |
| product | `ProductAggregate` | vendor/category ids, name, description, price, images, default image, disclaimers, ingredients, inStock, block, delete info, rating/pricing summaries | `IProductRepository` | product read models |
| product-variant | `ProductVariantAggregate` | productId, vendorId, name, price, appearance, delete info | `IProductVariantRepository` | variant read models |
| reviews | `ReviewAggregate` | product/author/order ids, rating, title, comment, images, likes, dislikes, reports, vendor reply, verified purchase | `IReviewRepository` | review read models |
| stats | — (behavior lives in `FanOut.ts`, `StatKey.ts`, `TimeWindows.ts`) | — | — (repository is infrastructure-only) | stat read models in `packages/shared` |
| user | `UserAggregate` | name, email, image, role, ban, block, delete info, version | `IUserRepository` | user read models |
| vendor | `VendorAggregate` | ownerId, name, description, contact, image, verification, stats info, delete info | `IVendorRepository` | vendor read models |

Value objects (`packages/domain/value-objects`): `alt`, `appearance`, `ban-info`, `block-info`,
`color`, `date`, `delete-info`, `description`, `effective-date`, `email`, `enum`,
`enum-collection`, `expiration-date`, `icon`, `identifier`, `id`, `image`, `money`, `name`,
`number`, `percentage`, `phone-no`, `quantity`, `query`, `reason`, `slug`, `street-address`,
`string`, `title`, `url`. Module-local VOs add domain specifics: `Disclaimer`, `Ingredients`,
`ProductImages`, `StatsInfo`, `VerificationInfo`, `Status` (order items).

Shared helpers in `packages/domain` worth knowing:

| File | Purpose |
|---|---|
| `aggregate-root.ts` | event raising/pulling |
| `modules/stats/StatKey.ts` (`buildMongoFilter`) | builds the stat-slot identity filter from an event (used by both upsert flavours) |
| `modules/stats/TimeWindows.ts` | UTC window computation per aggregation |
| `modules/stats/FanOut.ts` | `expandToStatEvents` — one tracked action → hourly/daily/weekly/monthly/lifetime events |
| `modules/stats/StatKey.ts` | canonical slot key used by the buffer |

---

## 10. Domain events

116 event classes live in `packages/domain/modules/<module>/events/`. Every event is
`{ type, payload, occurredOn }` (`IEvent`); the type is a string constant on the class and carries
the module name as prefix. Full list as declared:

| Module | Event types |
|---|---|
| address (5) | `address.created`, `address.deleted`, `address.recovered`, `address.set-as-default`, `address.updated` |
| category (7) | `category.blocked`, `category.created`, `category.deleted`, `category.image-updated`, `category.meta-updated`, `category.recovered`, `category.unblocked` |
| home (19) | `home.slides-reordered`, `home.categories-reordered`, `home.containers-reordered`, `home.{slide,category,promo,feature,container}-{added,removed,updated}`, `home.features-set` |
| inventory (7) | `inventory.bought`, `inventory.completed`, `inventory.created`, `inventory.deleted`, `inventory.low-stock-threshold-updated`, `inventory.reserved`, `inventory.stock-removed` |
| order (9) | `order.cancelled`, `order.completed`, `order.confirmed`, `order.created`, `order.deleted`, `order.recovered`, `order.refunded`, `order.returned`, `order.updated` |
| order-items (7) | `order-item.cancelled`, `order-item.completed`, `order-item.confirmed`, `order-item.created`, `order-item.refunded`, `order-item.returned`, `order-item.updated` |
| product (24) | `product.blocked`, `product.created`, `product.default-image-set`, `product.deleted`, `product.disclaimer-{disabled,enabled,updated}`, `product.disclaimers-{added,removed}`, `product.images-{added,removed}`, `product.ingredients-{added,cleared,disabled,enabled,removed}`, `product.in-stock-updated`, `product.made-private`, `product.made-public`, `product.meta-updated`, `product.pricing-summary-updated`, `product.rating-summary-updated`, `product.recovered`, `product.unblocked` |
| product-variant (7) | `product-variant.activated`, `product-variant.created`, `product-variant.deactivated`, `product-variant.deleted`, `product-variant.meta-updated`, `product-variant.price-updated`, `product-variant.recovered` |
| reviews (9) | `review.blocked`, `review.created`, `review.deleted`, `review.disliked`, `review.liked`, `review.reported`, `review.unblocked`, `review.updated`, `review.vendor-reply-added` |
| stats (2) | `stats.product-denormalization-requested`, `stats.vendor-force-refresh-requested` |
| user (11) | `user.ban-extended`, `user.ban-lifted`, `user.banned`, `user.ban-shortened`, `user.blocked`, `user.block-lifted`, `user.deleted`, `user.delete-lifted`, `user.logged-in`, `user.role-assigned`, `user.signed-in` |
| vendor (9) | `vendor.contact-updated`, `vendor.created`, `vendor.deleted`, `vendor.image-updated`, `vendor.meta-updated`, `vendor.recovered`, `vendor.rejected`, `vendor.stats-refresh-toggled`, `vendor.verified` |
| vendor (9) | `vendor.contact-updated`, `vendor.created`, `vendor.deleted`, `vendor.image-updated`, `vendor.meta-updated`, `vendor.recovered`, `vendor.rejected`, `vendor.stats-refresh-toggled`, `vendor.verified` |

Notes:

- Not every declared event is raised yet. Example: `OrderAggregate` only raises `order.created`; the
  cancel/confirm/complete/refund/return events are declared but have no producing method.
  `OrderItemsAggregate` is complete: `create`, `confirm`, `complete`, `cancel`, `returnItem`,
  `refund` and `update` each raise the matching event. The order-items cancel/update service
  methods return those events to the caller for post-commit publishing.
- `order.returnded` is misspelled in the source (and in its class). Renaming it is a breaking change
  for any handler fan-out; keep it until handlers are migrated.
- Events whose handlers do not exist are dropped silently by the event bus (no handler → `continue`).

---

## 11. Buses and cross-module communication

There are exactly three ways one module reaches another, and every one of them is wired in
`apps/api/composition-root.ts`. A module never imports another module's files — `bun run arch`
fails the build if it does.

```
consumer module                 packages/contracts                 provider module
───────────────                 ──────────────────                 ───────────────
order                     contracts/modules/address/…               address
   │                                 │                                  │
   │ 1. addressQueries.ensureActiveById(...)                           │
   ├────────────────────────► IAddressQueries ───────────────────────► adapter → internal service → repo
   │                                 │                                  │
   │ 2. reservation.reserve(...)     │                                  │
   ├───────────────────────► IInventoryReservation ───────────────────► adapter → aggregate
   │                                 │                                  │
   │ 3. transaction commits ─────────┴──────────────────────────────────┘
   │ 4. eventBus.publish([...events]) (after commit)
   └──────────────────────────────► EventBus ─────────► stats / user handlers
```

| Need | Channel | Keyed by | Implemented by | Wired where |
|---|---|---|---|---|
| Read another module's data | typed query interface from `contracts`, called on an injected adapter | the injected object | provider's `infrastructure/*-query.adapter.ts` | `createApplication()` passes `provider.queries` into the consumer factory |
| Perform an action owned by another module | port interface from `contracts`, called on an injected adapter | the injected object | provider's `infrastructure/*.adapter.ts` | `createApplication()` passes `provider.xxx` into the consumer factory |
| React to something that happened | event `type` string on `EventBus` | the string; many handlers per type | consumer's event handler | consumer factory `eventBus.register(...)` |
| Guard / middleware needs | port configured at startup | the configured function/object | provider adapter | `configureAuthUserLookup()`, `configureStatsAccess()`, `configureStatsViewGuard()` |

All cross-module calls are direct in-process calls: there is no `CommandBus` and no `QueryBus`, so a
missing dependency is a TypeScript error at the module factory instead of a runtime
"no handler registered".

### 11.1 Contracts

The only bus left is the event bus.

| Bus | File (domain) | Implementation | Keying |
|---|---|---|---|
| Event | `packages/domain/events/event-bus.interface.ts` | `.../in-memory-event-bus.ts` | event `type` string, many handlers per type |

Behaviour worth knowing:

- The event bus is constructed once in `createApplication()` and handed to module factories as part
  of their deps object; there are no module-level bus singletons and no registration by import side
  effect.
- Cross-module reads are interfaces in `packages/contracts/modules/<module>/index.ts`
  (`IUserQueries`, `IAddressQueries`, `ICategoryQueries`, `IProductQueries`,
  `IProductVariantQueries`, `IVendorQueries`, `IOrderQueries`, `IOrderItemsQueries`). The owner
  module implements each interface with an adapter that delegates to its internal service.
- The composition root builds providers before consumers, so every adapter is a real object by the
  time it is injected. The `order` ↔ `order-items` cycle is broken by splitting order-items into an
  eager **core** (repository, internal service, writer, read port) and an **application** phase
  (controller/use cases that need `IOrderQueries`). No lazy providers are used.
- `EventBus.publish` accepts one event or an array. Handlers run with `Promise.allSettled`, so one
  failing handler no longer blocks the others; each rejection is logged with the event type. Unknown
  event types are ignored, and handlers are stored in a `Set`, so duplicate registration is a no-op.

### 11.2 Providers and ports (source of truth)

| Module | Query adapter | Contract interface |
|---|---|---|
| `user` | `user-query.adapter.ts` | `IUserQueries` |
| `address` | `address-query.adapter.ts` | `IAddressQueries` |
| `category` | `category-query.adapter.ts` | `ICategoryQueries` |
| `product` | `product-query.adapter.ts` | `IProductQueries` |
| `product-variant` | `product-variant-query.adapter.ts` | `IProductVariantQueries` |
| `vendor` | `vendor-query.adapter.ts` | `IVendorQueries` |
| `order` | `order-query.adapter.ts` | `IOrderQueries` |
| `order-items` | `order-items-query.adapter.ts` | `IOrderItemsQueries` |

Event registrations live in the consumer factories: `user` registers the vendor lifecycle handlers,
and `stats` registers `order-item.created` plus the product/vendor denormalization handlers.

#### Cross-module ports

All eight ports live in `packages/contracts/modules/*/index.ts`, are implemented by the **owner**
module's infrastructure, and are passed in through the consumer's deps:

| Port | Owner (contract file) | Adapter | Injected into | Purpose |
|---|---|---|---|---|
| `IInventoryReservation` | inventory | `inventory/infrastructure/inventory-reservation.adapter.ts` | order | reserve stock inside the caller's unit of work; returns per-variant results |
| `IOrderItemsWriter` | order-items | `order-items/infrastructure/order-items-writer.adapter.ts` | order | write order lines and return their `order-item.created` events |
| `IProductPricingUpdater` | product | `product/infrastructure/product-pricing.adapter.ts` | product-variant | recompute the product's pricing summary after a variant price change |
| `IProductStatsProjector` | product | `product/infrastructure/product-stats-projector.adapter.ts` | stats | enumerate products / category pairs and apply denormalized metrics |
| `IVendorStatsProjector` | vendor | `vendor/infrastructure/vendor-stats-projector.adapter.ts` | stats | vendor roll-ups and force-refresh lookups |
| `IStatsAccessPort` | stats | `ProductStatsAccessAdapter#getProductVendorId` + `VendorStatsAccessAdapter#getVendorIdByOwnerId`, composed in the root | `statsAccessGuard` | owner/admin check for stats reads |
| `IEntityExistsPort` | stats | `ProductStatsAccessAdapter` (product), `CategoryStatsAccessAdapter` (category) | `statsViewGuard` | silently ignore views for unknown entities |
| `IAuthUserLookup` | user | `user/infrastructure/user-auth-lookup.adapter.ts` | `middleware/auth.ts` | live ban/block/delete/role snapshot for every request |

Two of these are *composed* rather than injected as a single class: `IStatsAccessPort` is an object
literal built in `createApplication()` from the product-side and vendor-side adapters, and
`IEntityExistsPort` is satisfied by whichever module's stats-access adapter the guard is configured
with. The `AuthActor` / `AuthUserSnapshot` types travel with `IAuthUserLookup` so controllers and
middleware agree on the actor shape.

### 11.3 Flows that cross module boundaries

**Create a product** (`POST /product/my`)

1. `ProductApplicationService` resolves the caller's vendor via `IVendorQueries.getByUserId`.
2. It validates the category with `ICategoryQueries.verifyAndGet`.
3. Uploads images through `IImageStorage` (Cloudinary adapter).
4. Saves the aggregate and publishes `product.created`.

**Change a variant price** (`PATCH /product-variant/my/price`)

1. Variant aggregate raises `product-variant.price-updated` and is saved.
2. The service calls the injected `IProductPricingUpdater` port
   (`ProductPricingAdapter` → product module) instead of dispatching a command.
3. `ProductInternelService` recalcs the product's pricing summary and raises
   `product.pricing-summary-updated`.

**Place an order** (`POST /order/create/my`)
| PATCH | `/vendor/verify` | Admin | verify (promotes owner to vendor role) |
| PATCH | `/vendor/reject` | Admin | reject (demotes owner) |


1. Inside `UnitOfWork.transaction`: `EnsureUniqueImpodentKey`, then the service calls
   `IAddressQueries.ensureActiveById`, `IProductVariantQueries.verifyAndGet`,
   `IProductQueries.verifyAndGet`, and reserves stock through `IInventoryReservation`.
2. The order aggregate is created/saved and the lines are written through `IOrderItemsWriter`
   (order-items module), which returns the `order-item.created` events.
3. The transaction commits; only then does the service publish the item + order events on the event
   bus (`order.created`). A rolled-back transaction publishes nothing.

| PATCH | `/vendor/verify` | Admin | verify (promotes owner to vendor role) |
| PATCH | `/vendor/reject` | Admin | reject (demotes owner) |

**Vendor lifecycle changes a user's role**

`vendor.verified` → `VendorVerifiedHandler` → `UserInternalService.promoteToVendor(ownerId)`;
`vendor.rejected` and `vendor.deleted` → `demoteToCustomer(ownerId)`. The user module therefore
never imports the vendor module.

**Stats fan-in**: `order-item.created` is the only business event wired to stats. Product view /
click and page / category views are tracked directly by HTTP endpoints, not by domain events.

---

## 12. Persistence layer

### 12.1 Database plumbing

- `apps/api/middleware/db.middleware.ts` connects Mongoose once per process and short-circuits
  with a 503 envelope when the connection is unusable
| PATCH | `/vendor/verify` | Admin | verify (promotes owner to vendor role) |
| PATCH | `/vendor/reject` | Admin | reject (demotes owner) |
.
- `apps/api/core/repository/base.repository.ts` declares the repository contract;
  `apps/api/core/repository/mongo.repository.ts` implements generic helpers:
  `create`, `find`, `findOne`, `findById`, `findByIdAndUpdate`, `findOneAndUpdate`, `updateOne`,
  `updateMany`, `deleteOne`, `deleteMany`, `findByIdAndDelete`, `count`, `exists`, `paginate`,
  `paginateByCursor`, `upsert`, `bulkWrite`, `bulkCreate`.
- Module repositories extend that base and add aggregate-aware methods (`FindByIdOrThrow`,
  `FindByOwnerId`, `FindByVariantIds`, `Save`, `SaveMany`, `Create`), which map through the module
  mapper before touching Mongoose.
- Transactions: `apps/api/core/database/transaction-context.ts` stores the Mongo session in
  `AsyncLocalStorage`; `UnitOfWork.transaction(callback)` opens a session, calls `startTransaction`,
  runs the callback inside the context, commits, and 
| PATCH | `/vendor/verify` | Admin | verify (promotes owner to vendor role) |
| PATCH | `/vendor/reject` | Admin | reject (demotes owner) |
aborts on error. It retries up to 3 times only
  on `TransientTransactionError`, with exponential backoff (100 ms → 5 s). Nested calls reuse the
  ambient session. `MongoRepository` reads `getCurrentSession()` and attaches it to every read/write,
  so any repository used inside the callback joins the transaction. `OrderApplicationService`
  `createMyOrder` is the only transactional use case today (order + order-items + inventory writes).

### 12.2 Models and mappers

One Mongoose model per module, named `<Module>Model` (`UserModel`, `ProductModel`,
`ProductVariantModel`, `InventoryModel`, `OrderModel`, `OrderItemModel`, `CategoryModel`,
`AddressModel`, `VendorModel`, `HomeModel`, `ReviewModel`, `StatsModel`), living in each
`infrastructure/` folder. Documents mirror the aggregate shape (`_id` string, nested `deleted`,
`ban`, `block`, `version`, timestamps) rather than the aggregate's private field names.

Mappers expose **`persistenceToAggregate`** and **`aggregateToPersistence`**, plus module-specific
helpers such as `aggregateToReadModel`, `aggregateToResponseReadModel` and
`fromDocuments`/`toUpdatePayload`. (Root `AGENTS.md` still describes `toDocument` / `fromDocument`;
those names do not exist.)

### 12.3 Pagination shapes

Two conventions are in use, both returned inside `data` as `{ data: [...], meta: {...} }`:

| Style | Where | Shape |
|---|---|---|
| Cursor | most lists (`my`, `admin/all`, products, stats paginated) | `nextCursor`, `prevCursor`, `hasMore`; cursors are base64url of `{ v, id }` (stats, products) or the last `_id` |
| Offset | a few admin lists | `page`, `limit`, `total`, `totalPages`, `hasNextPage`, `hasPrevPage` |

Cursor encoding/decoding lives in each module repository (`parseCursor` / `encodeCursor`), not in a
shared helper. `BaseController.paginated()` exists for the offset shape but no controller calls it
today. Client code must tolerate partially filled `meta`; the web `useCursorPagination` hook assumes
cursor fields, while admin tables that use offset meta read `page`/`totalPages`.

---

## 13. API module reference

Every module follows the same folder layout and wiring described in §8.4; below is what is specific
to each.

### 13.1 address

| PATCH | `/vendor/verify` | Admin | verify (promotes owner to vendor role) |
| PATCH | `/vendor/reject` | Admin | reject (demotes owner) |

- Owns buyer shipping addresses. `AddressAggregate` keeps owner id, five address VOs, a default
  flag and delete info.
- Rules: a user may hold at most **four** addresses (checked in `createMyAddress`); edits require
  ownership (`canEditAddress`); deleting uses a placeholder reason (`"Address deletion not hold
  reason"`) and is a soft delete; `recover` is admin-only.
- Consumers: the order module queries `EnsureActiveAddressGetByIdQuery` before creating an order.

### 13.2 category

- Admin-managed taxonomy: create, update, soft delete, list (public + admin), get by id.
- Images go through `IImageStorage`; the app service uploads before saving and publishes
  `category.created` / `category.image-updated` / `category.meta-updated` / `category.deleted` /
  `category.blocked` / `category.recovered`.
- `VerifyCategoryAndGetQuery` is used by products to 
| PATCH | `/vendor/verify` | Admin | verify (promotes owner to vendor role) |
| PATCH | `/vendor/reject` | Admin | reject (demotes owner) |
validate their category id.

### 13.3 home

- One document holds the whole storefront home layout: ordered `slides`, `promos`, `categories`,
  `features`, and `containers` (shelves of products).
- Admin endpoints add/update/remove each collection; slides, categories and containers have
  `/reorder` endpoints, and `PUT /home/features` replaces the whole feature set (`PATCH` updates one).
- `HomeAggregate` raises granular events (`home.slide-added`, …) and bumps `version`.
- The storefront reads it with `useGetHomeLayout()`; the dashboard edits it with the same hooks plus
  mutations.

### 13.4 image-storage

- No HTTP routes and no aggregate: a port (`IImageStorage`) plus a Cloudinary adapter and domain
  error types. `createImageStorageModule()` is instantiated by category, vendor and product modules.
- Controlled by `IMAGE_STORAGE_PROVIDER` and the `CLOUDINARY_*` variables. Uploads return the URL
  stored on the aggregate.

### 13.5 inventory

- One document per variant (`variantId`, `productId`, `vendorId`), tracking quantity, reserved,
  available and a low-stock threshold.
- Vendor endpoints: create stock (`POST /product-inventory/my/create`), buy more stock
  (`…/my/:id/purchase`), change threshold (`…/my/:id/threshold`), remove stock (`…/:id/remove`).
- The order-facing reservation path is the `IInventoryReservation` port (`InventoryReservationAdapter`
  in `infrastructure/`), not a command bus. It loads by variant ids, filters deleted rows, calls
  `aggregate.reserve(quantity, actorId)` and saves the batch.
- `VerifyInventoriesItemsGetQuery` lives in `packages/contracts/modules/inventory` and the module's
  query file re-exports it; the handler returns `VerifyInventoriesItemsResult`
  (`validIds`, `notFoundIds`, `deletedIds`, `availableStockIds`, `buyableIds`, read models).
- ⚠️ The reservation loop indexes the filtered `buyableInventories` array with the position from the
  *input* array (`inventoryItems[i]`) — if a line is missing or deleted, quantities can be applied
  to the wrong variant. See §22.

### 13.6 order

- `OrderAggregate` stores buyer, total price, the full shipping address snapshot, an idempotent key,
  version and delete info; creation is the only state transition implemented.
- `createOrder` runs the cross-module verification + reservation + item-creation pipeline from §11.3
  inside `UnitOfWork.transaction`, saves, and publishes `order.created` only after the commit.
- Buyers read their own orders with cursor pagination; admins read all orders.

### 13.7 order-items

- No routes. Exists to own line items and expose them through two contracts:
  `GetOrderItemByIdQuery` and the `IOrderItemsWriter` port (`OrderItemsWriterAdapter`), whose `create`
  writes every line inside the caller's unit of work and returns the `order-item.created` events
  (the order module publishes them post-commit; stats consumes them).
- The module itself does not open transactions — the order use case does (§12.1).

### 13.8 product

- The richest aggregate: vendor/category, name/description/price, image gallery + default image,
  disclaimers, ingredients, in-stock flag, visibility (public/private), moderation block, delete
  info, plus `ratingSummary` and `pricingSummary` maintained by events and commands.
- Vendor surface: create, edit meta, toggle disclaimers, add/remove images, set default image,
  add/remove ingredients, toggle ingredients, make public/private, soft delete, recover.
- Admin surface: list all (including deleted/blocked), block, unblock.
- Public surface: paginated listing and single product.
- A price change reaches this module through the `IProductPricingUpdater` port
  (`ProductPricingAdapter`), which recomputes the pricing summary.

### 13.9 product-variant

- Variant of a product owned by the same vendor: name, price, appearance (color), delete info.
- Endpoints: create under a product, update price, update meta, toggle appearance/activation, soft
  delete, admin recover, admin list. A price change triggers the product pricing-summary update.
- The file names in this module consistently misspell “variant” (`product-varaint.routes.ts`,
  `createProductVaraintModule`); imports work because they use the same typo.

### 13.10 reviews

- `ReviewAggregate` stores product/author/order ids, author snapshot (name, avatar), rating, title,
  comment, images, likes/dislikes, report count + reasons, vendor reply and verified-purchase flag.
- Wired endpoints are read + create only: list (paginated), list by product, get by id, create my
  review, admin list. Like/dislike/report/vendor-reply/update/delete exist on the aggregate and emit
  events, but no HTTP route calls them.
- `createReview` marks the review verified when the supplied `orderId` is an active order owned by
  the caller (`EnsureActiveOrderGetByIdQuery`).

### 13.11 stats

See §15 for the full subsystem. This module is the exception to the layering rules: the controller
uses `StatsQueryService` + `StatsRepository` (+ `StatsModel` for entity lookups) instead of an
aggregate and app service.

### 13.12 user

- Mirrors Supabase identities into MongoDB. `POST /users/init` (guarded by `initAuth`) creates the
  row from the token + profile; `GET /users/me` returns the current user.
- Admin moderation: block/unblock, ban (short/long), extend ban, lift ban, soft delete, recover,
  assign role.
- Self service: `DELETE /users/me/soft`.
- Internal: `promoteToVendor` / `demoteToCustomer` driven by vendor events.
- Role values: `customer`, `vendor`, `admin`.

### 13.13 vendor

- Store profile: owner id, name, description, contact, image, verification state, stats settings,
  delete info.
- Vendor surface: create my vendor, read my vendor, update meta/contact/image, toggle stats refresh,
  soft delete.
- Admin surface: verify, reject, recover, soft delete, list all.
- Public surface: paginated list and vendor page.
- Verification/rejection events drive user role changes (§11.3).

---

## 14. HTTP endpoint catalog

Access column: **Public** (no guard), **Auth** (`auth`), **Admin** (`auth, admin`), **Init**
(`initAuth`), **View** (`statsViewGuard`), **Access:mask / Access:throw** (`statsAccessGuard`).
All paths below are the effective paths after mounting; `:param` denotes a path parameter.

### Product — `/product` (21)

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/product` | Public | paginated catalogue (filter by category/vendor/search) |
| GET | `/product/admin/all` | Admin | paginated including blocked/deleted |
| GET | `/product/my` | Auth | the caller's vendor products |
| GET | `/product/:id` | Public | single product |
| POST | `/product/my` | Auth | create product (uploads images) |
| DELETE | `/product/my/soft` | Auth | soft delete |
| PATCH | `/product/my/recover` | Auth | recover own product |
| POST | `/product/block` | Admin | block product |
| POST | `/product/block/lift` | Admin | unblock product |
| PATCH | `/product/state/my/public` | Auth | make public |
| PATCH | `/product/state/my/private` | Auth | make private |
| PATCH | `/product/my/meta` | Auth | name/description/category/price |
| PATCH | `/product/my/disclaimer/toggle` | Auth | enable/disable disclaimers |
| PATCH | `/product/my/disclaimer/add` | Auth | add disclaimers |
| PATCH | `/product/my/disclaimer/remove` | Auth | remove disclaimers |
| PATCH | `/product/my/images/add` | Auth | add gallery images |
| PATCH | `/product/my/images/remove` | Auth | remove gallery images |
| PATCH | `/product/my/images/default` | Auth | set default image |
| PATCH | `/product/my/ingredients/toggle` | Auth | enable/disable ingredients |
| PATCH | `/product/my/ingredients/add` | Auth | add ingredients |
| PATCH | `/product/my/ingredients/remove` | Auth | remove ingredients |

### Product variant — `/product-variant` (8)

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/product-variant/:id` | Public | single variant |
| GET | `/product-variant/admin/all` | Admin | paginated variants |
| POST | `/product-variant/my` | Auth | create variant under a product |
| PATCH | `/product-variant/my/price` | Auth | change price (cascades pricing summary) |
| PATCH | `/product-variant/my/meta` | Auth | name/meta update |
| PATCH | `/product-variant/my/appereance/toggle` | Auth | toggle appearance *(path typo is in source)* |
| DELETE | `/product-variant/my/delete/soft` | Auth | soft delete |
| PATCH | `/product-variant/recover/:id` | Admin | recover variant |

### Inventory — `/product-inventory` (6)

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/product-inventory/admin/all` | Admin | paginated inventory |
| GET | `/product-inventory/:id` | Public | inventory by id |
| POST | `/product-inventory/my/create` | Auth | create stock row for a variant |
| PATCH | `/product-inventory/my/:id/purchase` | Auth | buy/add stock |
| PATCH | `/product-inventory/my/:id/threshold` | Auth | set low-stock threshold |
| PATCH | `/product-inventory/:id/remove` | Auth | remove stock |

### Order — `/order` (3)

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/order/create/my` | Auth | full checkout pipeline |
| GET | `/order/my` | Auth | caller's orders (cursor paginated) |
| GET | `/order/admin/all` | Admin | all orders |

`/order-items` mounts no routes — it is an internal module (query + writer port). The empty router is
still mounted in `routes/index.ts`; see §22.

### Category — `/category` (6)

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/category` | Public | list categories |
| GET | `/category/admin/all` | Admin | paginated categories |
| GET | `/category/:id` | Public | single category |
| POST | `/category/create` | Admin | create (image upload) |
| PATCH | `/category/update` | Admin | update |
| DELETE | `/category` | Admin | soft delete (id in body/query) |

### Address — `/address` (7)

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/address/my` | Auth | caller's addresses |
| GET | `/address/admin/all` | Admin | paginated addresses |
| POST | `/address/my` | Auth | create (max 4 per user) |
| PATCH | `/address/my/:id/update` | Auth | update |
| PATCH | `/address/my/:id/default` | Auth | set default |
| DELETE | `/address/my/:id` | Auth | soft delete |
| PATCH | `/address/my/:id/recover` | Admin | recover |

### Users — `/users` (15)

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/users/init` | Init | create/lookup Mongo 
| PATCH | `/vendor/verify` | Admin | verify (promotes owner to vendor role) |
| PATCH | `/vendor/reject` | Admin | reject (demotes owner) |
user from Supabase identity |
| GET | `/users/me` | Auth | current user |
| DELETE | `/users/me/soft` | Auth | delete own account |
| GET | `/users` | Auth | paginated users |
| GET | `/users/admin/all` | Admin | paginated users (admin view) |
| GET | `/users/:id` | Auth | single user |
| DELETE | `/users/soft` | Admin | soft delete user |
| PATCH | `/users/block` | Admin | block |
| PATCH | `/users/block/lift` | Admin | unblock |
| PATCH | `/users/ban` | Admin | ban |
| PATCH | `/users/ban/short` | Admin | short ban |
| PATCH | `/users/ban/extend` | Admin | extend ban |
| PATCH | `/users/ban/lift` | Admin | lift ban |
| PATCH | `/users/role` | Admin | assign role |
| PATCH | `/users/recover` | Admin | recover deleted user |

### Vendor — `/vendor` (14)

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/vendor` | Public | list vendors |
| PATCH | `/vendor/verify` | Admin | verify (promotes owner to vendor role) |
| PATCH | `/vendor/reject` | Admin | reject (demotes owner) |

| GET | `/vendor/admin/all` | Admin | paginated vendors |
| GET | `/vendor/:id` | Public | vendor page |
| POST | `/vendor/my` | Auth | create my vendor |
| GET | `/vendor/my` | Auth | my vendor |
| PATCH | `/vendor/my/meta` | Auth | name/description |
| PATCH | `/vendor/my/contact` | Auth | contact info |
| PATCH | `/vendor/my/image` | Auth | image upload |
| PATCH | `/vendor/my/stats-refresh` | Auth | toggle stats auto-refresh |
| DELETE | `/vendor/my` | Auth | soft delete my vendor |
| DELETE | `/vendor/soft` | Admin | soft delete any vendor |
| PATCH | `/vendor/recover` | Admin | recover |
| PATCH | `/vendor/verify` | Admin | verify (promotes owner to vendor role) |
| PATCH | `/vendor/reject` | Admin | reject (demotes owner) |

### Home — `/home` (20, all Admin except the read)

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/home` | Public | full home layout |
| POST / PATCH / DELETE | `/home/categories` | Admin | add / update / remove a home category |
| PATCH | `/home/categories/reorder` | Admin | reorder |
| POST / PATCH / DELETE | `/home/slides` | Admin | slides |
| PATCH | `/home/slides/reorder` | Admin | reorder |
| POST / PATCH / DELETE | `/home/promos` | Admin | promos |
| POST / PUT / PATCH / DELETE | `/home/features` | Admin | add / set-all / update / remove features |
| POST / PATCH / DELETE | `/home/containers` | Admin | product shelves |
| PATCH | `/home/containers/reorder` | Admin | reorder shelves |

### Reviews — `/review` (5)

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/review` | Public | paginated reviews |
| GET | `/review/product/:id` | Public | reviews for a product |
| GET | `/review/:id` | Public | single review |
| POST | `/review/my` | Auth | create review (verified-purchase check) |
| GET | `/review/admin/all` | Admin | paginated reviews for moderation |

### Stats — `/stats` (19)

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/stats/products/:productId/view` | View | record product view |
| POST | `/stats/products/:productId/click` | Public | record product click |
| POST | `/stats/categories/:categoryId/view` | View | record category view |
| POST | `/stats/pages/:pageKey/view` | View | record page view |
| GET | `/stats/settings` | Admin | read sync settings |
| PATCH | `/stats/settings` | Admin | update sync settings |
| POST | `/stats/denormalize` | Admin | request product/category/vendor denormalization |
| GET | `/stats/:entityType/aggregate/timeseries` | Admin | aggregated series across entities |
| GET | `/stats/:entityType/aggregate` | Admin | aggregated totals across entities |
| GET | `/stats/:entityType/paginated` | Auth | paginated stat rows by metric |
| GET | `/stats/product/:entityId/overview` | Auth + Access:throw | product overview (owner check) |
| GET | `/stats/category/:entityId/overview` | Admin | category overview |
| GET | `/stats/vendor/:entityId/overview` | Auth + Access:mask | vendor overview |
| GET | `/stats/vendor/force-update/usage` | Auth | remaining force-refresh quota |
| POST | `/stats/vendor/force-update` | Auth | force-refresh own vendor stats |
| GET | `/stats/:entityType/:entityId/lifetime` | Access:mask (no auth) | lifetime totals |
| GET | `/stats/:entityType/:entityId/timeseries` | Access:mask (no auth) | series for one entity |
| GET | `/stats/:entityType/top` | Public | leaderboard by metric |
| GET | `/stats/_health` | Public | buffer depth / pipeline health |

Route order matters: `/stats/vendor/force-update/usage`, `/stats/product|category|vendor/:entityId/overview`
and `/stats/_health` are registered so the literal segments win before the generic
`/:entityType/...` patterns.

### Misc

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/health` | Public | liveness, bypasses all middleware (§5) |

---

## 15. Stats subsystem

Stats are stored as **pre-aggregated slots**: one document per
`(entity.type, entity.id, aggregation, dimensions…)` with a metrics object.

### 15.1 Vocabulary (`packages/shared/types/StatTypes.ts`)

| Concept | Values |
|---|---|
| Entity types | `product`, `category`, `vendor`, `user`, `order`, `coupon`, `page` |
| Aggregation | `hourly`, `daily`, `weekly`, `monthly`, `lifetime` |
| Metrics (`METRIC_FIELDS`) | `views`, `clicks`, `purchases`, `revenue`, `quantity`, `addToCart`, `wishlist`, `refunds`, `refundAmount` |
| Dimensions | `date`, `hour`, `week`, `month`, `country`, `platform`, `source` |

`StatsModel` has a unique compound index `uniq_stat_slot` over the slot identity, which is what makes
upserts idempotent.

### 15.2 Write path

1. An HTTP endpoint (`/view`, `/click`) or the `order-item.created` handler calls the tracking
   facade with `{ entity, metric(s), dimensions }`.
2. `expandToStatEvents` (`packages/domain/modules/stats/FanOut.ts`) fans one action into up to five
   events — hourly, daily, weekly, monthly and lifetime — computing UTC windows with `TimeWindows`.
3. `StatKey.buildMongoFilter` derives the slot identity used by both the buffer and the repository.

So a single view increments five documents; a purchase increments `purchases`, `revenue` and
`quantity` on each level.

### 15.3 Buffer

`StatsBufferService`:

- accumulates events in memory keyed by slot (`StatKey`), summed;
- flushes every **5 s** (`startBackgroundFlushing(5000)` in `index.ts`) or early at **50 000**
  pending slots;
- swaps the map before writing, calls `StatsRepository.bulkUpsert` (`$inc` per metric,
  `$setOnInsert` for identity, `ordered: false`), and re-queues the batch if the write fails;
- on `SIGTERM`/`SIGINT` the process flushes before disconnecting;
- exposes `pendingCount` for `GET /stats/_health`.

`bulkUpsert` **increments**; `bulkSet` **overwrites** the whole metric set (used by denormalization so
replays never double count).

### 15.4 Read paths

| Need | Method |
|---|---|
| one slot | `getEntityStats(type, id, aggregation, filter)` |
| series | `getTimeSeries(...)` on `dimensions.date` (hourly/daily) or `dimensions.week` / `.month`, ascending |
| leaderboard | `getTopEntities(type, aggregation, metric, limit)` sorting `metrics.<metric>` desc |
| paginated table | `getPaginatedByMetric(...)` with a base64url cursor of `{v, id}` and a tie-break on `entity.id` |

### 15.5 `statsViewGuard` (write endpoints)

Applied to product/category/page `view` routes (not to clicks). It exists to keep bot traffic and
refresh loops out of the counters:

- known bot user-agents → silently ignored;
- entity existence check (unknown id → ignored);
- per-visitor dedupe per entity per day via Redis keys;
- rate caps: 1 000 events / identity / hour, 20 000 / entity / hour, 200 000 / entity / day;
- ignored requests still get a success response so clients cannot probe the filter.

### 15.6 `statsAccessGuard` (read endpoints)

Two modes, passed at mount time:

| Mode | Used by | Behaviour |
|---|---|---|
| `throw` | product overview | 403 unless the caller owns the vendor/product or is admin |
| `mask` | vendor overview, lifetime, timeseries | serves the row but zeroes financial metrics (revenue/refund amounts) for non-owners |

The `mask` routes are mounted without `authMiddleware`: an anonymous caller gets the masked view,
an authenticated owner gets the full one. Masking is why `GET /stats/vendor/:id/overview` can be
called by any authenticated user without leaking revenue; the same is not true of the
paginated/aggregate/top endpoints (§22).

### 15.7 Denormalization pipeline￼
 ZeroGPT
Products
Pricing
API
FAQ
￼✨ Remove Background
Popular
en
￼Get Started
Register
Login


`POST /stats/denormalize` (admin) publishes `stats.product-denormalization-requested`; three
handlers run in registration order:

1. `ProductStatsDenormalizationHandler` — recomputes product slots from source collections and
   `bulkSet`s them.
2. `CategoryStatsDenormalizationHandler` — rolls product stats up to categories.
3. `VendorStatsDenormalizationHandler` — rolls product stats up to vendors.
￼
 ZeroGPT
Products
Pricing
API
FAQ
￼✨ Remove Background
Popular
en
￼Get Started
Register
Login

All three handlers run **concurrently** (`Promise.allSettled`), and a failure in one is logged without
blocking the others. The trade-off is that (2) and ￼
 ZeroGPT
Products
Pricing
API
FAQ
￼✨ Remove Background
Popular
en
￼Get Started
Register
Login
(3) can read product stats while (1) is still
writing them; a rerun or the next scheduled refresh reconciles it (see §22).

### 15.8 Scheduler, settings and quota

- `StatsSyncSettingsService` stores settings in Redis; defaults: refresh interval **6 h**, staleness
  **24 h**, vendor force-refresh quota **5**.
- `ProductStatsSyncScheduler.start(60_000)` ticks every minute, finds vendors due for refresh
  (interval/staleness), and runs the same vendor refresh path.
- `VendorForceRefreshQuotaService` enforces the per-vendor daily quota for
  `POST /stats/vendor/force-update`; `GET /stats/vendor/force-update/usage` reports what is left.
- Settings are admin-editable through `GET|PATCH /stats/settings` and surfaced in the dashboard
  `SyncSettingsPanel`.

---

## 16. packages/shared

Pure TypeScript + Zod, no runtime dependencies other than `zod ^4`. Barrel: `export * from './dtos'`, `'./request-dtos'`, `'./types'`.

| Folder | Contents |
|---|---|
| `dtos/` | primitive Zod schemas reused by request DTOs: `id-schema`, `name-schema`, `email-schema`, `money-schema`, `rating-schema`, `image-schema`, `phone-schema`, `url-schema`, `boolean-schema`, … (plus a leftover `clerk-id-schema.ts` from the pre-Supabase era) |
| `request-dtos/<module>/` | request body/query schemas and inferred DTO types per module (address, category, home, inventory, order, product, product-variant, review, stats, user, vendor) |
| `types/StatTypes.ts` | `EntityType`, `AggregationLevel`, `MetricName`, `METRIC_FIELDS`, `Metrics`, `StatEvent`, `emptyMetrics()` |
| `types/api-response.types.ts` | success/error envelope types |
| `types/responses-read-models/` | response read models for address, category, home, inventory, order, order-items, product, product-variant, review, user, vendor |
| `types/cloudnary-image.type.ts` | Cloudinary upload result type (typo in filename) |
| `types/disclaimer-type.ts` | disclaimer shapes |

Controllers validate with these schemas; the web forms reuse them via `zodResolver`, so a rule change
in `packages/shared` changes both sides at once.

---

## 17. packages/frontend (headless SDK)

Framework-agnostic client shared by web (and intended for mobile). Subpath exports (`package.json`):

| Import | Contents |
|---|---|
| `@ecomerece/frontend` | root barrel |
| `/auth` | `auth-adapter.web.ts` (Supabase) / `.native.ts`, chosen by the `react-native` export condition |
| `/storage` | `storage-adapter.web.ts` (localStorage with an availability probe) / `.native.ts` |
| `/theme` | Zustand dark-mode store, persists through the storage adapter |
| `/app-settings` | app settings store |
| `/error` | `parseModalError` helper |
| `/supabase` | Supabase client factory |
| `/user`, `/home`, `/category`, `/product`, `/vendor`, `/order`, `/review`, `/inventory`, `/product-variant`, `/address`, `/stats` | per-module hooks + services |

Each module folder has a `*.service.ts` (plain fetch functions using `http`) and a
`use*.ts`/hooks file with React Query `useQuery`/`useMutation` wrappers. Hook counts as of this
writing: product 23, home 20, user 17, vendor 15, stats 15, address 8, product-variant 8, category 7,
inventory 6, review 5, order 3 — 127 total.

`lib/http-client.ts`:

- base URL `NEXT_PUBLIC_API_URL || '/api'`;
- calls `authAdapter.ensureReady()` then attaches the Supabase access token;
- sets `Content-Type` only when a body exists;
- 204/205 → `null`; empty non-OK → `HttpError`; unparseable JSON → `INVALID_JSON`;
- non-2xx or `success:false` → `HttpError` built from `error.code/message/issues`;
- `payload.meta` present → returns `{ data, meta }`, else `payload.data ?? payload`.

Other lib files: `http-error.ts` (error class, 976 bytes) and an **empty** `server-http.ts`
(0 bytes) that is safe to delete or implement.

Navigation (`adapters/navigation/`) is a set of Zustand stores — shell, tabs, wizard, page meta,
command palette, history stack — re-exported from one index so the split stays internal.
`services/` also holds the Supabase client and theme/settings stores. There is no SDK-level
pagination hook; the web app ships `useCursorPagination` itself.

---

## 18. apps/web

Next.js 16 App Router, Material UI 9, all data through `@ecomerece/frontend`. Every page component
is a client component (`'use client'`) — there is no server-side data fetching; the only server code
is layout/metadata.

### 18.1 Routes (27 pages)

| Route | Surface | Data |
|---|---|---|
| `/` | storefront | `useGetHomeLayout`, product hooks |
| `/products`, `/products/[id]` | storefront | product list / detail + reviews |
| `/categories`, `/categories/[id]` | storefront | categories + filtered products |
| `/vendors`, `/vendors/[id]` | storefront | vendors + their products |
| `/reviews`, `/reviews/[id]` | storefront | review list / detail |
| `/auth`, `/auth/callback` | auth | Supabase OAuth start / code exchange → `POST /users/init` |
| `/account` | buyer | profile, addresses, theme, delete-account |
| `/account/orders`, `/account/orders/new` | buyer | order list / checkout |
| `/account/products` | vendor | my products + variants |
| `/account/vendor` | vendor | store profile, verification state, stats panel |
| `/dashboard` | admin | home layout editor (overview, slides, promos, categories, features, shelves, raw JSON) |
| `/dashboard/orders`, `/products`, `/categories`, `/inventory`, `/variants`, `/vendors`, `/users`, `/addresses`, `/reviews` | admin | moderation tables |
| `/dashboard/stats` | admin | leaderboards, series, sync settings, denormalize button |

### 18.2 Shell and providers

- `app/layout.tsx` mounts `Providers` (MUI theme + CssBaseline + React Query + `AuthProvider`), then
  `PageShell`/`SiteHeader`.
- `app/components/require-auth.tsx` redirects unauthenticated users to `/auth?next=<path>`; used by
  every `/account/**` and `/dashboard/**` page.
- `app/components/page-shell.tsx`, `site-header.tsx`, `dashboard-nav.tsx`, `query-state.tsx`,
  `cursor-pager.tsx` provide layout/loading/error/paging primitives.
- Conventions: dialogs are controlled by a single state object and **remounted with `key`** when the
  target row changes (fixes stale MUI form state); forms validate with the shared Zod schemas;
  mutations invalidate the relevant query keys; long tables use cursor pagination, admin tables use
  server-side page/pageSize where the endpoint supports it.
- Dynamic routes that need `useSearchParams` are wrapped in `<Suspense>` at the page boundary
  (`/auth`, `/account/orders/new`, product filters), otherwise `next build` fails prerendering.

Role handling: `SiteHeader` shows the dashboard entry for `admin`/`vendor`, but no page checks the
role before rendering dashboard UI. Unauthorized mutations fail at the API with 403.

---

## 19. Seed scripts

Run with Bun from the repo root, e.g. `bun run apps/api/scripts/seed-all.ts`. They connect to the
same `MONGO_URI` and need Cloudinary credentials for image uploads.

| Script | What it does |
|---|---|
| `seed-all.ts` | end-to-end demo dataset: categories → vendors/users → products + variants + inventory → home layout |
| `seed-base-data.ts` | reference data only (categories, baseline users) |
| `seed-home-layout.ts` | home page slides/promos/features/containers |
| `seed-test-data.ts` | small fixture set for manual testing |

They are idempotent-ish by clearing or upserting known collections; read each script before running
against a database you care about, and never point them at production.

---

## 20. Testing

`bun test` runs 19 test files (115 tests at the last verified run on 2026-11-14, all passing) using
`bun:test`. They concentrate on pure domain behaviour (value objects, aggregates,
`FanOut`/`TimeWindows` stat expansion, image-storage errors, stats denormalization handlers) plus the
order post-commit event ordering, order ↔ inventory transitions, item retries, reservation reason
mapping, and order-item update/restore matching
(`apps/api/modules/{order,order-items,inventory}/application/__tests__/`). There is no HTTP
integration harness or test database (the order transaction smoke needs a MongoDB replica set).

```bash
bun test                         # all
bun test packages/domain         # one area
bun test apps/api/modules/stats  # one module path
bun test --watch
```

Because buses are created by `createApplication()` in `apps/api/composition-root.ts`, an integration
test can instantiate the whole graph (passing stub env vars) or call a single module factory with
fake deps; importing routes is no longer needed to register handlers.

---

## 21. Configuration reference

### 21.1 API environment

| Variable | Used by | Default / notes |
|---|---|---|
| `MONGO_URI` | `dbMiddleware` | required; use `?replicaSet=rs0` if you need transactions |
| `REDIS_URL` | rate limiter, stats settings, quota | required at runtime |
| `SUPABASE_URL` | auth middleware | required |
| `SUPABASE_SECRET_KEY` | auth middleware (admin `getUser`) | service-role key, server only |
| `JWT_SECRET` | present in env checks | legacy from the pre-Supabase auth; not used for request verification |
| `CORS_ORIGIN` | CORS | comma-separated; default `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | rate limiter | default `60000` |
| `RATE_LIMIT_MAX` | rate limiter | default `60` |
| `IMAGE_STORAGE_PROVIDER` | image-storage module | selects Cloudinary adapter |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary adapter | required for uploads |
| `CLOUDINARY_SECURE`, `CLOUDINARY_FOLDER` | Cloudinary adapter | optional behaviour/folder |
| `NODE_ENV` | error handler | `production` hides messages/stacks |

There is no `.env.example` in the repo; document new variables here and in the deploy config.

### 21.2 Web environment

| Variable | Used by | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | SDK base URL + Next rewrite | `/api` (same origin) |
| `API_PROXY_TARGET` | `next.config.ts` rewrite target | falls back to `NEXT_PUBLIC_API_URL` then `http://localhost:8000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase client | required |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase client | required |

### 21.3 Ports

API `8000` (hardcoded in `index.ts`), web dev `3000`, pm2 fork mode for production.

---

## 22. Known gaps and inconsistencies

These are real issues observed in the code, not TODOs invented for this document.

**Architecture**

1. `packages/domain` still declares `@ecomerece/shared` as a package dependency and imports types from
   it in five files (`StatEvent`, `Metrics` in `modules/stats/FanOut.ts`, `metrics.ts`, `StatKey.ts`,
   the vendor read model and `IVendorRepository`). The imports are `import type` and erased at
   compile time, so `bun run arch` allows them, but the package.json coupling remains.
2. Stats bypasses the DDD layering (controller → `StatsQueryService`/`StatsRepository`/`StatsModel`,
   no domain aggregate or port), and `stats.module.ts` still injects `connectDB` into its handlers
   instead of a storage port.
3. `routes/index.ts` mounts `/order-items`, but the module is internal and the router is empty — a
   dead mount with no endpoints.
4. There is no transactional outbox (P8 deferred): order events are published after the commit, so a
   crash between `commitTransaction` and `eventBus.publish` loses them.
5. `InMemoryEventBus` runs handlers for one event concurrently (`Promise.allSettled`). The three
   `stats.product-denormalization-requested` handlers no longer have a defined order, so category and
   vendor roll-ups can read product stats mid-refresh.
6. The order transaction has unit-test coverage for publish ordering, but no runtime smoke against a
   real replica set was run in this environment.

**Behaviour / security**

7. `GET /stats/:entityType/top` is **public** and returns raw `revenue`/`refundAmount` metrics;
   `GET /stats/:entityType/paginated` requires only a login. Only `vendor/overview`, `lifetime` and
   `timeseries` mask financial metrics.
8. `GET /users` is available to any authenticated user and returns paginated user documents.
9. The web dashboard renders for any signed-in user; role enforcement is API-only.
10. `middleware/seller.ts` reads `c.get('profile')`, which nothing sets, and is not mounted.
11. `POST /stats/products/:id/click` has no bot/dedupe guard, unlike `/view`.
12. The inventory reservation loop pairs requested quantities with a *filtered* inventory array by
    index (`inventoryItems[i]` over `buyableInventories`); a missing/deleted line can apply the wrong
    quantity to the wrong variant.

**Incomplete features**

13. Review like/dislike/report/vendor-reply/update/delete exist on the aggregate and emit events but
    have no HTTP route.
14. `OrderAggregate` only raises `order.created`; cancel/confirm/complete/refund/return methods and
    events are unused, and `order.returnded` is misspelled.
15. `apps/mobile` contains no files.
16. `packages/frontend/lib/server-http.ts` is empty (0 bytes).
17. Seed scripts and home layout assume image storage credentials are present.

**Naming / housekeeping**

18. The root `README.md` describes an older state of the system (including a “900-line” doc and
    claims about unwired reviews/stats). This file supersedes it.
19. Product `my/...` routes are registered without a leading slash; Hono normalises them when mounted
    under `/product`, but do not copy that style.
20. Persistent typos in API surface and filenames: `product-varaint.routes.ts`,
    `/product-variant/my/appereance/toggle`, `cloudnary-image.type.ts`, `order.returnded`,
    `user.logged-in` vs `user.signed-in`, and the placeholder address deletion reason. The inventory
    module also has `InventoryReposityory`, `InventoryInternalServcie`, `getInventoryByVarientId`,
    and `inventoryReaponseReadModel`; they are harmless but spread across presentation, application,
    and infrastructure, so rename them in a dedicated change.
21. `apps/api/dist/` exists as a local build artifact; do not edit or review it as source.

**Standards audit (2026-11-14, all API and package modules)**

Safe corrections applied under §8.6:

Order / order-items / inventory:
- Removed the non-null assertion in `inventory.internal.service.ts` (`transitionReserved` now carries
  the matching line with its inventory).
- Replaced the four-level nested ternary in `reserveInventories` with
  `reservationFailureReason(...)`.
- Extracted `summarizeInventories(...)` so `verifyInventoriesItemsGet` and `reserveInventories` share
  one id-set calculation instead of duplicating it.
- Replaced `.find(...)` inside `.map(...)` in `order-item.internal.ts` (`updateOrderItems`,
  `restoreOrderItemFailures`) with `Map` lookups, and reused the contract `OrderItemInput` type.
- Removed decorative section banners from `order.app.service.ts` (§8.5).
- Added tests for reservation reason mapping and order-item update/restore/create matching.

Repo-wide pass (`apps/api` and `packages/domain`; `packages/frontend`, `packages/contracts`, and
`packages/shared` are intentionally untouched):
- Applied Biome safe fixes across the in-scope module directories: formatting, import order, and
  unused imports/variables.
- Cleared the remaining `bunx biome check` diagnostics: unused imports/params, non-null assertions,
  optional-chain findings, shadowed `valueOf`, `==`, side-effect `.map` calls, and a missing local
  type (`let price` in product-variant).
- Removed `as any` casts on search filters in product, product-variant, and user; the Mongoose
  filter types accept the `$regex`/`$options` shape directly.
- Typed Cloudinary JSON response bodies and narrowed the abort `catch` from `any`.
- Removed decorative section banners from `home` (aggregate, app service, controller, model) and
  `cloudinary.adapter.ts`.
- Home's persistence mapper now returns `HomePersistence`; the plain subdocument payload is cast
  once through `unknown` because Mongoose types the arrays as `DocumentArray`.
- Replaced env-var non-null assertions with explicit checks in `apps/api/lib/jwt.ts` and
  `apps/api/lib/supabase.ts` (a missing secret now fails loudly instead of encoding the string
  `"undefined"`).
- Removed the `stack.pop()!` assertion in `requestguard.middleware.ts`, used `Number.isNaN`, and
  split the `??=` assignment in `BaseService.groupBy`.
- `bunx biome check apps/api` and `packages/domain` are clean; 115 tests pass; typecheck reports
  only the pre-existing `apps/api/index.ts:16` error.

Not applied — needs a decision:

- ORM types still leak into application services (`FilterQuery` and `*Persistence` imports):
  `address.app.service.ts:152`, `category.app.service.ts:197,221`,
  `inventory.app.service.ts:202`, `order.app.service.ts:519,526`,
  `order-item.app.service.ts:101`, `product.app.service.ts:522,548,582`,
  `product-variant.app.service.ts:234`, `review.app.service.ts:67,91`,
  `user.app.service.ts:217,239`, `vendor.app.service.ts:245,279`. `UserPersistence` is also the
  actor type across `user.app.service.ts`. Moving these behind repository-facing filter types
  changes repository contracts, so it is a separate architectural change.
- Files over the soft limits: `order.app.service.ts` (~755), `product.app.service.ts` (~606),
  `home.app.service.ts` (~479), `vendor.app.service.ts` (~392),
  `cloudinary.adapter.ts` (~494), `product.aggregate.ts` (~477),
  `product.repository.ts` (~270), `order-item.repository.ts` (~227). Splitting them by
  responsibility is behavior-risky and needs a per-module plan.
- `data: any` remains in domain ports: `category/ports/i-category.ports.ts`,
  `reviews/ports/i-reviews-repository.ts`, `product/ports/i-product-repository.ts`,
  `vendor/ports/i-vendor-repository.ts`. Typing them is a contract change.
- `cloudinary.adapter.ts` still pushes `err as any` into `BatchItemResult.error`, whose declared
  type is `ImageStorageError`; the batch runner cannot know a provider error's concrete class, so
  this needs a contract decision (generic error wrapper vs widened result type).
- Frontend `useAddressManager.ts` keeps `any` on the callback/mutation payload and `err`; fixing it
  needs a typed overload for the mutation union.
- Identifier typos are spread across public DTOs, routes, and ports (`ProductVaraintMessages`,
  `toggleVariantApperaaracneDto`, `upadteMyVariantMetaDto`, `InventoryReposityory`,
  `InventoryInternalServcie`, `getInventoryByVarientId`, `inventoryReaponseReadModel`,
  `desclaimerItem`, `category.read-modle.ts`, `CategoryMessags`). Renaming them changes published
  names, so they are listed rather than renamed silently.

**Tooling**

- The `arch` script in `package.json` points at `scripts/arch-check.ts`, but that file is not in the
  tree, so `bun run arch` currently fails with "Module not found". Restore the checker or remove the
  command from `AGENTS.md` and `README.md`; until then, treat architecture boundaries as
  review-enforced.
- `bun run typecheck` fails on the pre-existing `apps/api/index.ts:16` (`CORS_ORIGIN` possibly
  `undefined`), unrelated to the order/inventory modules.

---

## 23. Where do I change X?

| Goal | Files |
|---|---|
| Add a rule to a business concept | `packages/domain/modules/<m>/<m>.aggregate.ts` (+ event if other modules care) |
| Add a field to a product / vendor / user | aggregate + `infrastructure/<m>.mapper.ts` + Mongoose model + `request-dtos` + web form |
| Add an endpoint | controller method → route file → `request-dtos` schema → SDK service/hook → page |
| Add a cross-module read | define the Query class in `packages/contracts/modules/<owner>` + re-export it from the owner's `application/queries` + register its handler in the owner module factory; consumers import it from `@ecomerece/contracts` |
| Add a cross-module write/port | define the port interface in `packages/contracts/modules/<owner>` + implement an adapter in the owner's `infrastructure/` + expose it from the owner module factory + inject it via `createApplication()` |
| Make another module react to a change | raise an event in the aggregate + `eventBus.register('<type>', handler)` in the consumer module factory |
| Add a stat metric | `packages/shared/types/StatTypes.ts` (`METRIC_FIELDS`, `Metrics`, `emptyMetrics`) + producers |
| Change stats refresh cadence | defaults in `StatsSyncSettingsService` + `ProductStatsSyncScheduler` + dashboard `SyncSettingsPanel` |
| Tune rate limiting / body limits | `apps/api/index.ts` (`requestGuards`, `rateLimiter`), `middleware/rateLimiter.ts` |
| Add a dashboard screen | `apps/web/app/dashboard/<name>/page.tsx` + nav entry in `components/dashboard-nav.tsx` |
| Change the home page | `apps/api/modules/home/**` (write) + `apps/web/app/page.tsx` (read) |

---

## 24. Maintaining this document

- Treat `PROJECT_DOCUMENTATION.md` as the source of truth over `README.md` and `AGENTS.md` when
  they disagree; fix the older files rather than duplicating caveats here.
- When adding a module, update §9 (catalog), §10 (events), §11.2 (registrations), §14 (endpoints),
  §22 if you introduce a deviation, and §23 if the workflow changes.
- The endpoint catalog is generated by reading `apps/api/modules/*/presentation/*.ts`; re-check it
  whenever routes are added, because there is no OpenAPI generation in this repo.
- If you change a pattern that the playbook teaches (contract query shape, port wiring, module
  factory, composition root), update `docs/architecture-guide.html` in the same change — it is the
  onboarding path, so a stale sample there costs more than a stale paragraph here.
- When you change a flow, update the *why* comments in the owning app service in the same change; a
  comment that restates code is worse than none. Conventions are in §8.5.
- Keep §8.6 and the Engineering Standards section in `AGENTS.md` in sync. This document is
  authoritative; the agent file is the condensed, always-loaded version.
- Verified against the tree on 2026-11-14: 13 API modules, 12 Mongoose models, 124 mounted routes +
  `/health`, 11 aggregates, 30 value objects, 110 event classes, 14 contract queries, 8 contract
  ports, 127 SDK hooks, 27 web pages, 19 test files (115 tests).

