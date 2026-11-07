# E-Commerce Monorepo — Multi-Platform Commerce Platform

An  multi-vendor e-commerce platform engineered around **Domain-Driven Design (DDD)**, **Hexagonal / Clean Architecture (Ports & Adapters)**, and **Command-Query Responsibility Segregation (CQRS)** — spanning a high-performance Hono API, a Next.js storefront + admin backoffice, and a shared cross-platform client SDK.

> **Full engineering manual:** [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) contains the complete 900-line architecture guide (DDD mental models, the 4-layer model, the Aggregate Fortress pattern, all cross-module decoupling patterns, the persistence & Unit-of-Work design, full API endpoint catalog, and the developer cheatsheet).

---

## Table of Contents

1. [Goals & Vision](#-goals--vision)
2. [Tech Stack](#-tech-stack)
3. [Repository Layout](#-repository-layout)
4. [Architecture Overview](#-architecture-overview)
   - [Infrastructure Topology (Deployment View)](#infrastructure-topology-deployment-view)
   - [API Internal Component Structure](#api-internal-component-structure)
   - [Anatomy of a Single Module (product example)](#anatomy-of-a-single-module-product-example)
   - [Request Lifecycle (full round-trip)](#request-lifecycle-full-round-trip)
   - [Unit-of-Work Transaction Flow](#unit-of-work-transaction-flow)
5. [Domain Model: Aggregates & Events](#-domain-model-aggregates--events)
6. [Cross-Module Communication (CQRS Buses)](#-cross-module-communication-cqrs-buses)
7. [The 4 Layers — The Iron Law of Dependencies](#-the-4-layers--the-iron-law-of-dependencies)
8. [Persistence & Unit of Work](#-persistence--unit-of-work)
9. [API Security & Defensive Middleware](#-api-security--defensive-middleware)
10. [Full API Endpoints](#-full-api-endpoints)
11. [Frontend & Client SDK](#-frontend--client-sdk)
12. [Getting Started](#-getting-started)
13. [Development Commands](#-development-commands)
14. [Adding a New Module (DDD Build Order)](#-adding-a-new-module-ddd-build-order)
15. [Contribution Guidelines](#-contribution-guidelines)
16. [Roadmap & Known Gaps](#-roadmap--known-gaps)

---

## 🎯 Goals & Vision

The platform is being built to deliver a complete, production-grade commerce experience with these core goals:

| Goal | How the codebase achieves it |
| :--- | :--- |
| **Multi-platform reach** | One headless domain + one client SDK (`packages/frontend`) power both a Web storefront (Next.js) and a native mobile app (React Native/Expo placeholder). |
| **Multi-vendor marketplace** | Independent vendor registration with KYC verification workflow (`verify` / `reject`), vendor-scoped product management, and per-vendor order items. |
| **Moderation-first user lifecycle** | Entirely domain-enforced user lifecycle: roles, indefinite block, timed ban with extend/shorten/lift, and soft-delete/recover — each raising its own domain event. |
| **Atomic sales & inventory integrity** | Stock reservation, fulfillment completion, restocking, and low-stock threshold management inside one aggregate; multi-vendor checkout as an atomic transaction via Unit of Work. |
| **Editorial / CMS-driven storefront** | A `HomeDashboard` aggregate and REST surface let admins compose hero slides, promos, category chips, feature blobs, and product shelves with full reordering. |
| **Architectural purity & testability** | Every business rule lives in exactly one place (an Aggregate). Domain is pure TypeScript with zero runtime deps; infrastructure (MongoDB, Redis, Auth) is swappable behind Ports & Adapters. |
| **Security-first API** | Guarded payload/buffer limits, Redis-backed rate limiting, JWT verification plus live user-state checks (block/ban/delete) on every authenticated request. |

---

## 🧰 Tech Stack

| Concern | Technology |
| :--- | :--- |
| Package manager / runtime | **Bun** (v1.4+) |
| Backend | **Hono v4**, TypeScript, port `8000` |
| Database | **MongoDB** (Mongoose 8, replica set for transactions) |
| Cache / rate limiting | **Redis** (sliding token bucket) |
| Identity provider | **Supabase Auth** (Admin SDK) · Clerk + Google OAuth (web storefront) |
| Storefront / admin | **Next.js 16**, React 19, **Material UI (MUI)** (default component library), Zustand, TanStack Query 5 |
| Mobile (placeholder) | **React Native / Expo** |
| Contracts / validation | **Zod v4** schemas + API envelopes in `packages/shared` |
| Quality gates | TypeScript strict checking, Bun test runner, ESLint (web), Biome (format) |

---

## 📦 Repository Layout

Bun-workspaces monorepo — every workspace is an independently versioned package:

| Path | Role |
| :--- | :--- |
| `apps/api` | Modular **Hono v4 API** (Bun). Each module follows the 4-layer DDD scaffold. |
| `apps/web` | **Next.js 16** customer storefront, account portal, and admin backoffice. |
| `apps/mobile` | **React Native / Expo** app placeholder (roadmap). |
| `packages/domain` | Pure TS domain — Aggregates, Value Objects, Domain Events, CQRS Ports. **Zero runtime deps.** The star of the architecture. |
| `packages/shared` | Zod schemas, request DTOs, API envelope contracts shared by all clients. |
| `packages/frontend` | Headless client SDK — cross-platform adapters (`.web` / `.native`), React Query hooks, Zustand stores. |

**Path aliases** (`tsconfig.json`) used across the monorepo:

```
@ecomerece/domain    -> packages/domain/index.ts
@ecomerece/shared    -> packages/shared/index.ts
@ecomerece/frontend  -> packages/frontend/index.ts
```

---

## 🏗️ Architecture Overview

```mermaid
flowchart TB
    subgraph Clients["Clients"]
        Web["apps/web (Next.js 16 + React 19)"]
        Mobile["apps/mobile (React Native / Expo)"]
    end

    subgraph Sdk["Shared Client SDK"]
        FrontendPkg["packages/frontend (adapters, React Query, Zustand)"]
    end

    subgraph Contracts["Contracts"]
        Shared["packages/shared (Zod schemas, DTOs, envelopes)"]
    end

    subgraph Domain["Domain (pure TS, zero deps)"]
        DomainPkg["packages/domain (aggregates, VOs, events, ports)"]
    end

    subgraph Api["API Layer"]
        API["apps/api (Hono v4 + Bun)"]
        Buses["In-memory Command/Query/Event Buses"]
        UoW["Unit of Work & MongoRepository (transactions)"]
    end

    subgraph Infra["Infrastructure"]
        Mongo[("MongoDB (Mongoose 8)")]
        Redis[("Redis (rate limiter)")]
        Supabase["Supabase Auth (Admin SDK)"]
    end

    Web --> FrontendPkg
    Mobile -.-> FrontendPkg
    FrontendPkg --> Shared
    API --> Shared
    API --> Domain
    API --> UoW
    API --> Buses
    UoW --> Mongo
    API --> Redis
    API --> Supabase
```

**The pattern at a glance:** the client calls the API → the API's **Presentation** layer extracts plain IDs → the **Application** layer orchestrates *Load → Command → Save → Events* → the **Domain** aggregate enforces invariants and raises events → a **Port** (repository interface) is implemented by the **Infrastructure** layer that persists to MongoDB inside a Unit-of-Work transaction.

The rest of this section drills into the infrastructure with four detail views: the **[runtime topology](#infrastructure-topology-deployment-view)**, the **[internal component structure](#api-internal-component-structure)**, the **[anatomy of a single module](#anatomy-of-a-single-module-product-example)**, and the **[unit-of-work transaction flow](#unit-of-work-transaction-flow)**.

---

### Infrastructure Topology (Deployment View)

```mermaid
flowchart TB
    subgraph Clients["Clients"]
        Web["apps/web — Next.js 16 (Storefront · Account · Admin)"]
        Mobile["apps/mobile — React Native / Expo (placeholder)"]
        SDK["packages/frontend — Headless SDK (React Query + adapters)"]
    end

    subgraph ApiApp["apps/api — Hono v4 + Bun runtime (port 8000)"]
        Entry["index.ts bootstrap — logger · secureHeaders · cors · requestGuards · dbMiddleware · rateLimiter"]
        Routers["routes/index.ts — 10 mounted routers"]
        Modules["11 module packages — 4-layer DDD scaffolds"]
        Core["core infrastructure — buses · UnitOfWork · MongoRepository · BaseController"]
        Adapters["lib/ — mongo · redis · supabase · clerk · jwt"]
        Entry --> Routers
        Routers --> Modules
        Modules --> Core
        Core --> Adapters
    end

    subgraph SharedContracts["Monorepo Packages"]
        Domain["packages/domain — pure TS (aggregates · VOs · events · ports)"]
        Shared["packages/shared — Zod schemas · DTOs · API envelopes"]
        Domain -.->|"implemented by"| Modules
        Shared -.->|"validates"| Routers
    end

    subgraph DataServices["Data & Identity Services"]
        Mongo[("MongoDB — replica set (transactions)")]
        Redis[("Redis — rate limiting")]
        Supabase["Supabase Auth — Admin SDK (JWT verify)"]
        Clerk["Clerk / Google OAuth — web storefront login"]
    end

    Web --> SDK
    Mobile -.-> SDK
    Web -->|"HTTP / JSON envelopes"| ApiApp
    Mobile -.->|"HTTP / JSON envelopes"| ApiApp
    SDK -->|"HTTP / JSON envelopes"| ApiApp
    Adapters --> Mongo
    Adapters --> Redis
    Adapters --> Supabase
    Adapters --> Clerk
```

---

### API Internal Component Structure

Depicts how a single `apps/api` process is wired from bootstrap to persistence:

```mermaid
flowchart TB
    subgraph Bootstrap["apps/api/index.ts — edge bootstrap"]
        Hono["Hono app"]
        Pipeline["Global middleware pipeline (applied in order)"]
        Err["registerErrorHandler — centralized error mapping"]
    end

    subgraph Middleware["middleware/ — pipeline order"]
        M1["logger (hono)"]
        M2["secureHeaders — CSP · X-Frame-Options: DENY · nosniff"]
        M3["cors — localhost:3000, credentials"]
        M4["requestguards — url(200) · query(100) · param(20) · body(1KB) · jsonDepth(5) · jsonNodes(50)"]
        M5["dbMiddleware — shared Mongo connection"]
        M6["rateLimiter — Redis sliding token bucket (10 burst / 1 per sec)"]
        M7["Auth guards — auth · admin · initAuth · seller (per-route)"]
    end

    subgraph Routers["routes/index.ts — 10 mounted routers"]
        R1["/users · /product · /product-variant"]
        R2["/product-inventory · /order · /order-items"]
        R3["/category · /address · /vendor · /home"]
    end

    subgraph ModuleLayers["Every module = 4 layers"]
        P["presentation — messages · controller (BaseController) · routes · module.ts"]
        A["application — query/command DTOs + handlers · internel.service · app.service"]
        D["domain (packages/domain) — aggregate · VOs · events · ports"]
        I["infrastructure — Mongoose model · mapper · repository"]
    end

    subgraph CoreInfra["core/ — shared infrastructure"]
        Bus["Buses — InMemoryCommandBus · InMemoryQueryBus · InMemoryEventBus"]
        Uow["UnitOfWork — AsyncLocalStorage session propagation + transient retry"]
        Repo["BaseRepository · MongoRepository (session-aware CRUD)"]
        Ctrl["BaseController — typed responses / error binding"]
    end

    subgraph ExternalAdapters["lib/ — swappable adapters"]
        L1["mongo · redis"]
        L2["supabase · clerkClient"]
        L3["jwt · getBearerToken · sanitizeObj · toSlug"]
    end

    Hono --> Pipeline
    Pipeline --> Routers
    Routers --> P
    P --> A
    A --> D
    I -.->|"implements domain ports"| D
    A --> Uow
    I --> Repo
    P --> Ctrl
    A --> Bus
    Bus --> CoreInfra
    Repo --> L1
    Hono --> Err
```

---

### Anatomy of a Single Module (product example)

Every bounded context mirrors this exact skeleton (referenced paths are real); the same shape exists for `user`, `vendor`, `inventory`, `category`, `address`, `home`, `order`, `order-items`, `product-variant`, and `reviews`:

```mermaid
flowchart TB
    subgraph Http["HTTP boundary"]
        Routes["presentation/product.routes.ts — PATCH /product/my/price"]
        Controller["presentation/product.controller.ts — extends BaseController"]
    end

    subgraph AppLayer["application/"]
        AppSvc["product.app.service.ts — Load → Command → Save → Events"]
        Internel["product.internel.service.ts — intra-module API"]
        Cmd["commands/update-price.command.ts + command-handlers/update-price.command-handler.ts"]
        Queries["queries/verify-product-and-get.query.ts + query-handlers/"]
    end

    subgraph DomainLayer["domain — packages/domain/modules/product/"]
        Agg["product.aggregate.ts — ProductAggregate → updatePrice() raises ProductVariantPriceUpdatedEvent"]
        Evts["events/ — 24 event classes"]
        Port["ports/i-product-repository.ts"]
        Read["read-models/product.read-model.ts"]
    end

    subgraph InfraLayer["infrastructure/"]
        Model["product.model.ts — Mongoose schema"]
        Mapper["product.mapper.ts — doc ↔ aggregate (4 methods)"]
        Repo["product.repository.ts — implements IProductRepository"]
    end

    subgraph Wiring["product.module.ts — DI composition"]
        Wire["new ProductRepository() → new InternelService(repo) → new AppService(queryBus, repo) → new Controller(...)"]
        Reg["registers handlers on queryBus / commandBus"]
    end

    Routes --> Controller
    Controller --> AppSvc
    AppSvc --> Agg
    AppSvc --> Internel
    Internel --> Cmd
    Internel --> Queries
    Agg --> Evts
    Repo -.->|implements| Port
    Mapper --> Agg
    Repo --> Mapper
    Repo --> Model
    Wire --> Repo
    Wire --> AppSvc
    Wire --> Reg
    Agg -.->|read model| Read
```

---

### Request Lifecycle (full round-trip)

What happens to an authenticated `PATCH /product/my/price` call, end to end:

```mermaid
sequenceDiagram
    autonumber
    participant C as Client (browser / SDK)
    participant P as Middleware pipeline
    participant RT as Router (routes/index.ts)
    participant CT as Controller (presentation)
    participant AS as App Service (application)
    participant AGG as ProductAggregate (domain)
    participant U as UnitOfWork (AsyncLocalStorage)
    participant R as ProductRepository (infrastructure)
    participant M as MongoDB (replica set)
    participant B as EventBus

    C->>P: PATCH /product/my/price (Bearer JWT)
    P->>P: requestGuards — bounds URL/query/params/body/JSON
    P->>P: rateLimiter — Redis token bucket
    P->>P: auth — verify JWT (Supabase) + live state check
    P->>RT: forward with verified user context
    RT->>CT: route to product controller
    CT->>CT: parse & validate DTO (Zod)
    CT->>AS: appService.updatePrice(...)

    activate U
    AS->>U: uow.transaction(async () => {...})
    U->>U: start MongoDB session + AsyncLocalStorage context
    AS->>R: repository.FindByIdOrThrow(variantId)  (session-aware)
    R->>M: findOne on session
    R-->>AS: variant aggregate (rehydrated)
    AS->>AGG: variant.updatePrice(price, discounted, actor)
    AGG->>AGG: enforce price invariants + raise ProductVariantPriceUpdatedEvent
    AS->>R: repository.Update(id, payload)  (session-aware)
    R->>M: findByIdAndUpdate on same session
    AS->>U: uow.transaction resolves → commitTransaction (atomic)
    deactivate U

    AS->>B: variant.pullEvents() → eventBus.publish(events)
    B-->>CT: (handlers run — none registered for this type yet)
    CT-->>C: 200 { data, message, success: true } envelope
```

---

### Unit-of-Work Transaction Flow

Why a multi-write operation (e.g. multi-vendor checkout) is still atomic: every repository inherits the session propagated through `AsyncLocalStorage`, so reads, writes and commits share one MongoDB transaction.

```mermaid
sequenceDiagram
    autonumber
    participant S as App Service
    participant U as UnitOfWork
    participant TX as AsyncLocalStorage (transactionContext)
    participant R1 as OrderItemsRepository
    participant R2 as OrderRepository
    participant MO as MongoDB (transaction)

    S->>U: uow.transaction(callback, retries=3)
    alt No active session yet (new transaction)
        U->>MO: mongoose.startSession()
        U->>MO: session.startTransaction()
        U->>TX: transactionContext.run({ session }, callback)
        TX->>R1: getCurrentSession() -> session
        R1->>MO: inserts on session
        TX->>R2: getCurrentSession() -> same session
        R2->>MO: update on session
        TX-->>U: callback resolves
        U->>MO: commitTransaction
    else Already inside a transaction (nested call)
        U-->>S: run callback directly (reuse outer session)
    end
    Note over U, MO: TransientTransactionError → exponential backoff retry (100ms → 5s cap)
```

---

## 🧩 Domain Model: Aggregates & Events

All business logic lives in self-contained aggregates under `packages/domain/modules/<module>`. Each aggregate owns its private state and the invariants that protect it.

| Bounded Context | Aggregate | Domain responsibilities |
| :--- | :--- | :--- |
| `user` | `UserAggregate` | Roles, block, timed bans (extend/shorten/lift), soft delete/recover, login/sign-in. |
| `vendor` | `VendorAggregate` | Vendor profile, owner verification, KYC verify/reject, delete/recover. |
| `product` | `ProductAggregate` | Gallery, ingredients, disclaimers, pricing summary, ratings, public/private appearance, in-stock flag. |
| `product-variant` | `ProductVariantAggregate` | SKU-level title, pricing, active state, soft delete/recover. |
| `inventory` | `InventoryAggregate` | Atomic reserve/complete, restock, low-stock threshold, stock removal. |
| `order` | `OrderAggregate` | Multi-vendor checkout, idempotency-key protection, atomic creation. |
| `order-items` | `OrderItemsAggregate` | Order line item snapshot (quantity, price, vendor, status). |
| `category` | `CategoryAggregate` | Catalog hierarchy, image/meta updates, block, soft delete/recover. |
| `address` | `AddressAggregate` | Delivery addresses, default-address toggle, soft delete/recover. |
| `home` | `HomeAggregate` | CMS layout: slides, promos, feature blobs, category chips, product shelves + reordering. |
| `reviews` | `ReviewAggregate` | Ratings, likes/dislikes, reports, vendor reply, soft delete. *(scaffold — not yet exposed over HTTP)* |

**Value Objects (30+):** every scalar is a self-validating, immutable wrapper — `Id`, `Money`, `Quantity`, `EffectiveDate`, `ExpirationDate`, `DateVO`, `EmailVO`, `PhoneNumber`, `UrlVO`, `FullAddressVO`, `BanInfoVO`, `BlockInfoVO`, `DeleteInfoVO`, `AppearanceVO`, `ColorVO`, `Title`, `Description`, `Slug`, `Reason`, and more.

**Domain Events (100+):** one event class per mutation, named `<module>.<change>` (e.g. `user.banned`, `product.created`, `inventory.reserved`, `home.slide-added`). Events are **raised** inside the aggregate (`this.raise(...)`), **drained** with `pullEvents()`, and **pushed** through the `EventBus`. The full per-module catalog lives in the project documentation.

> **Design rule — ID generation:** IDs are never accepted from API clients on create paths. Document/aggregate IDs are always generated server-side with `Id.create()` (UUID v7). Client-supplied IDs are only used to address an existing resource (update/delete/recover/lookup).

---

## 🚌 Cross-Module Communication (CQRS Buses)

Modules never import each other directly. All inter-module calls go through one of three in-memory buses (implementations in `apps/api/core/infrastructure/buses/`):

| Bus | When to use | Example |
| :--- | :--- | :--- |
| **QueryBus** | Synchronous cross-module **reads** | Getting a vendor's contact info from another module's read model |
| **CommandBus** | Synchronous cross-module **writes** | `CreateItemsCommand` registered by the order-items module |
| **EventBus** | Asynchronous reactive **broadcast** | `user.signed-in` → `UserSignedInHandler` |

Dependency rule across modules: communication happens via bus contracts (small, stable data bags), never via direct class imports — so renaming a method in one module can never cascade-compile-fail another.

---

## 🧱 The 4 Layers — The Iron Law of Dependencies

Every module inside `apps/api/modules/<module>/` mirrors the domain module and is split into exactly four layers:

```
<module>/
 ├── domain/          packages/domain/modules/<module>/   ← Aggregates, VOs, events, ports, read models
 ├── infrastructure/  models.ts · mapper.ts · repository.ts
 ├── application/     query DTOs + handlers · command DTOs + handlers · internal.service · app.service
 └── presentation/    messages.ts · controller.ts · routes.ts · <module>.module.ts
```

> **Iron Law:** Domain never imports Infrastructure. Infrastructure never imports Presentation. The Domain package has **zero** external runtime dependencies — it knows nothing about MongoDB, Hono, or HTTP.

The Application layer never makes business decisions; it only orchestrates *Load → Command → Save → Publish Events*.

---

## 🗄️ Persistence & Unit of Work

- **Mappers** (`infrastructure/*.mapper.ts`) translate between Mongoose documents and aggregates (4 methods: `toDocument`, `toUpdatePayload`, `fromDocument`, `fromDocuments`).
- **Repositories** implement domain-defined **ports** (`I<Module>Repository`), keeping persistence swappable (swap MongoDB for Postgres by writing a new repository class — zero domain changes).
- **Unit of Work** uses `AsyncLocalStorage` to propagate a shared MongoDB session across repositories, giving multi-document operations the same ACID transaction as a single write, with transient-error retries.

---

## 🛡️ API Security & Defensive Middleware

| Guard | Mechanism |
| :--- | :--- |
| Request guards | Max URL 200ch, query 100ch, param 20ch, body 1 KB, JSON depth 5, JSON AST nodes 50 — defends DoS / buffer / parser-exploit vectors. |
| Rate limiting | Distributed sliding **token bucket** on Redis (10-token burst, 1 token/s refill), keyed on `cf-connecting-ip` / `x-forwarded-for`. |
| Auth pipeline | JWT verified via Supabase Admin SDK **then** live MongoDB user state checked — deleted → 401, blocked → 403, banned → 403. |
| Transactions | Every multi-write operation runs in a Unit-of-Work MongoDB transaction. |
| Server-generated IDs | Create endpoints never trust client-supplied IDs (UUID v7 via `Id.create()`). |

---

## 🧾 Full API Endpoints

All routes are mounted from `apps/api/routes/index.ts` under the following routers:

```
/product   /product-variant   /product-inventory   /order   /order-items
/category   /address   /users   /vendor   /home
```

The **complete endpoint catalog** (method × path × access guard × action) is tabulated in the project documentation — covering user moderation, product & variant management, inventory ops, multi-vendor checkout, category management, address book, vendor KYC, and the full Home CMS surface.

---

## 💻 Frontend & Client SDK

- **`packages/frontend`** is a headless SDK decoupled from any UI framework: cross-platform auth/storage **adapters** (`.web.ts` / `.native.ts`) selected via conditional exports, TanStack React Query hooks per domain module, Zustand navigation stores, and a unified HTTP client with typed error envelopes. The same SDK powers Web and Mobile.
- **`apps/web`** (Next.js 16 App Router, React 19 Server Components, Material UI / MUI as the default component library):
  - **Storefront** `/client/home`, `/client/product/[id]` — SSR product discovery.
  - **Account portal** `/account/profile`, `/account/address` — profile stats, danger zone, address management.
  - **Admin dashboard** `/admin/home` — drag-and-drop CMS curation of the home layout.

---

## 🚀 Getting Started

### Prerequisites

- **Bun** v1.4+
- **MongoDB** running as a replica set (transactions require `?replicaSet=rs0`)
- **Redis** server running
- **Supabase** project (service-role + anon keys); optional Clerk/Google OAuth keys for web login

### Environment

**Backend** (`apps/api/.env`):

```bash
MONGO_URI=mongodb://root:password@127.0.0.1:27017/ecommerce?replicaSet=rs0&authSource=admin
REDIS_URL=redis://localhost:6379
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SECRET_KEY=eyJhbGciOi...            # Supabase service-role key
JWT_SECRET=super-secret-jwt-key
FRONTEND_URL=http://localhost:3000
```

**Web** (`apps/web/.env.local`):

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...   # optional
CLERK_SECRET_KEY=sk_test_...                     # optional
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
FRONTEND_URL=http://localhost:3000
```

### Install & run

```bash
bun install        # install every workspace dependency
bun run dev        # API (:8000) + Web (:3000) concurrently
```

### Quality gates (run in this order)

```bash
bun run lint      # Next.js ESLint (apps/web)
bun run typecheck # strict TS across all workspaces
bun test          # test suite (currently 9 passing home-module tests)
```

---

## 🔨 Development Commands

| Command | Purpose |
| :--- | :--- |
| `bun run dev` | Run API + Web concurrently in watch mode |
| `bun run build` | Build the API workspace |
| `bun run typecheck` | `tsc --noEmit` across all workspaces |
| `bun test` / `bun run test:watch` | Run the test suite (plain / watch) |
| `bun run lint` / `bun run format` | Next.js ESLint (web) & Biome format |
| `pm2 start ecosystem.config.js` | Production process manager (Bun, fork mode, port 8000) |

---

## 🧪 Adding a New Module (DDD Build Order)

Build **bottom-up** — never create a file that depends on something you haven't written:

1. `packages/domain/modules/<name>/` — VOs → events → ports (interfaces) → read models → **aggregate** (invariants + raises).
2. `apps/api/modules/<name>/infrastructure/` — Mongoose model → mapper (4 methods) → repository implementing the port.
3. `apps/api/modules/<name>/application/` — query/command DTOs → handlers → internal service → **app service** (`Load → Command → Save → Publish Events`).
4. `apps/api/modules/<name>/presentation/` — messages → controller (`BaseController`) → routes → `<name>.module.ts` (DI wiring + bus registration).
5. Register the router in `apps/api/routes/index.ts`.

**Domain-first discipline:** rules go in the aggregate; the app service orchestrates; buses decouple; infrastructure adapts.

---

## 🤝 Contribution Guidelines

1. **Respect the Iron Law** — domain purity, 4-layer boundaries, bus-based cross-module communication.
2. **Enforce IDs server-side** — `Id.create()` on every create/add path.
3. **Every mutation raises a domain event** — raise inside the aggregate, drain + publish from the app service.
4. **Never ship a create endpoint that accepts a client-supplied document ID.**
5. **Ran the quality gates:** `lint` → `typecheck` → `test` before opening a PR.
6. When touching messages files, keep user-facing strings clean and correct — identifiers may intentionally keep historical typos, but visible messages never should.

---

## 🛣️ Roadmap & Known Gaps

| Item | Status |
| :--- | :--- |
| `reviews` module HTTP surface | Scaffolded (aggregate + 7 events) — **no routes yet**, not mounted in `routes/index.ts`. |
| Event publishing | Only `home` drains + publishes. All other modules **raise** events but app services don't call `publish()` yet. |
| `order` lifecycle events | `confirm`/`complete`/`cancel`/`refund`/`return` events defined but only `order.created` is raised. |
| `sellerMiddleware` | Exists but not yet wired to any route (vendor scoping enforced in app services/controllers today). |
| `bun run lint:imports` | **Broken** — references missing `scripts/check-imports.ts`; the import-boundary validator needs reviving. |
| Biome lint scripts | Currently broken repo-wide by a `biome.json` schema/CLI version mismatch (2.3.8 vs 2.5.12). |
| Mobile app | Placeholder; real navigation + storefront flows pending. |
| Distributed event bus | In-memory EventBus is swappable behind `IEventBus` (Kafka/RabbitMQ) — not yet implemented. |

---

## 📘 Documentation

- **Architecture & engineering manual:** [`PROJECT_DOCUMENTATION.md`](./PROJECT_DOCUMENTATION.md) — the definitive reference for how every pattern in this system works and why.
- **Agent/contributor brief:** [`AGENTS.md`](./AGENTS.md) — commands, conventions, and gotchas for automated tooling.