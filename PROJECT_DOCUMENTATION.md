# E-Commerce Monorepo — Comprehensive Architecture & DDD Engineering Guide

Welcome to the definitive architecture and operational documentation for the **E-Commerce Monorepo**. This system is an enterprise-grade, multi-platform e-commerce solution engineered with **Domain-Driven Design (DDD)**, **Clean Architecture / Hexagonal Architecture (Ports & Adapters)**, and **Command-Query Responsibility Segregation (CQRS)**.

This manual documents the active codebase implementation and the architectural philosophy it follows.

---

## Table of Contents

1. [DDD in 2 Minutes — The Core Philosophy](#1-ddd-in-2-minutes--the-core-philosophy)
   - [The Three Core Ideas](#the-three-core-ideas)
   - [The Vending Machine Analogy](#the-vending-machine-analogy)
   - [The Golden Rule of Invariants](#the-golden-rule-of-invariants)
2. [The 4 Layers of Architecture](#2-the-4-layers-of-architecture)
   - [The Restaurant Analogy (Waiter, Manager, Chef, Equipment)](#the-restaurant-analogy)
   - [The 4 Layers Visualized](#the-4-layers-visualized)
   - [The Iron Law of Dependencies](#the-iron-law-of-dependencies)
   - [Implementation Order: Foundation Up (Steps 1–17)](#implementation-order-foundation-up-steps-117)
3. [The Domain Fortress: Aggregates, Value Objects & Events](#3-the-domain-fortress-aggregates-value-objects--events)
   - [The Aggregate Fortress Pattern](#the-aggregate-fortress-pattern)
   - [Value Objects: Self-Validating Smart Wrappers](#value-objects-self-validating-smart-wrappers)
   - [Domain Events Lifecycle](#domain-events-lifecycle)
   - [Complete Catalog of Project Aggregates & Value Objects](#complete-catalog-of-project-aggregates--value-objects)
4. [Cross-Module Decoupling: How Modules Communicate](#4-cross-module-decoupling-how-modules-communicate)
   - [The Spaghetti Problem vs. Central Buses](#the-spaghetti-problem-vs-central-buses)
   - [Pattern 1: QueryBus (Synchronous Decoupled Reads)](#pattern-1-querybus-synchronous-decoupled-reads)
   - [Pattern 2: Anti-Corruption Layer / ACL (Type Isolation)](#pattern-2-anti-corruption-layer--acl-type-isolation)
   - [Pattern 3: Domain Events (Asynchronous Reactive Broadcasts)](#pattern-3-domain-events-asynchronous-reactive-broadcasts)
   - [Pattern 4: CommandBus (Synchronous Decoupled Writes)](#pattern-4-commandbus-synchronous-decoupled-writes)
   - [Preventing Race Conditions: Why Not Events for Inventory Reservation?](#preventing-race-conditions-why-not-events-for-inventory-reservation)
   - [The Three Buses Comparison Table](#the-three-buses-comparison-table)
   - [Architectural Decision Tree](#architectural-decision-tree)
5. [The Persistence Layer & Unit of Work](#5-the-persistence-layer--unit-of-work)
   - [The Translator Pattern: Mappers](#the-translator-pattern-mappers)
   - [The Repository Port Pattern](#the-repository-port-pattern)
   - [Unit of Work with AsyncLocalStorage Transactions](#unit-of-work-with-asynclocalstorage-transactions)
6. [Defensive Middleware & API Gateway (`apps/api`)](#6-defensive-middleware--api-gateway-appsapi)
   - [Request Guards (DoS, Payload Tree & Buffer Defense)](#request-guards-dos-payload-tree--buffer-defense)
   - [Redis Sliding Token Bucket Rate Limiting](#redis-sliding-token-bucket-rate-limiting)
   - [Supabase Identity & Dynamic State Verification](#supabase-identity--dynamic-state-verification)
   - [Complete API Endpoints Catalog](#complete-api-endpoints-catalog)
7. [Frontend Architecture & Multi-Platform SDK](#7-frontend-architecture--multi-platform-sdk)
   - [Headless Client SDK (`packages/frontend`)](#headless-client-sdk-packagesfrontend)
   - [Cross-Platform Adapters (Web & React Native)](#cross-platform-adapters-web--react-native)
   - [Next.js 16 Web Storefront & Backoffice (`apps/web`)](#nextjs-16-web-storefront--backoffice-appsweb)
8. [Developer Cheatsheet: "Which File Do I Touch?"](#8-developer-cheatsheet-which-file-do-i-touch)
9. [Operational & Environment Reference](#9-operational--environment-reference)

---

## 1. DDD in 2 Minutes — The Core Philosophy

### The Three Core Ideas

```mermaid
flowchart LR
    subgraph Problem["1. The Problem ❌"]
        P1["Business rules scatter across controllers, helpers, and DB scripts"]
        P2["Change one line → break ten unrelated features"]
    end

    subgraph Solution["2. The Solution 💡"]
        S1["Objects enforce their OWN rules (Invariants)"]
        S2["The User class decides if a user can be banned — not a controller"]
    end

    subgraph Result["3. The Result 🎯"]
        R1["Every rule lives in exactly one place"]
        R2["Impossible to bypass validation; trivial to test"]
    end

    Problem --> Solution --> Result
```

### The Vending Machine Analogy

Think of a **vending machine**. You cannot pry open the glass door and grab a chocolate bar. You press button `B3`, the machine internally verifies your payment, checks if item `B3` is in stock, drops the item, and dispenses change. 

**The rules live inside the vending machine.** No external bypass is possible.

```
Without DDD (Anemic / Spaghetti):
Controller reads DB document -> Controller checks if paid -> Controller updates DB document
(Anyone can write a new endpoint that forgets to check if paid!)

With DDD (Rich Aggregate):
Controller calls machine.dispense(item, payment)
-> Machine checks invariants internally -> Throws if invalid -> Emits SnackDispensedEvent
(Impossible to ever dispense without payment!)
```

### The Golden Rule of Invariants

> [!IMPORTANT]
> **"An object enforces its own invariants."**
> 
> An invariant is a business rule that must *always* remain true. Every validation guard, every state restriction, and every permission boundary lives inside the Aggregate Root that owns that state. Nothing external can mutate private state directly.

---

## 2. The 4 Layers of Architecture

Every file in the codebase belongs to **exactly one layer**. Each layer communicates only with the layer directly adjacent to it.

### The Restaurant Analogy

```
┌─────────────────────────────────────────────────────────────┐
│ 🌐 WAITER (Presentation Layer - controller.ts)              │
│ Speaks HTTP with customers. Takes orders. Passes IDs down. │
└──────────────────────────────┬──────────────────────────────┘
                               │ passes plain IDs
┌──────────────────────────────▼──────────────────────────────┐
│ ⚙️ MANAGER (Application Layer - app.service.ts)             │
│ Orchestrates the workflow: Load -> Command -> Save -> Event.│
│ Makes ZERO business decisions. It's the project manager.    │
└──────────────────────────────┬──────────────────────────────┘
                               │ calls domain commands
┌──────────────────────────────▼──────────────────────────────┐
│ 🧠 CHEF (Domain Layer - aggregate.ts) ⭐ THE STAR           │
│ Owns ALL recipes and business rules. Knows zero HTTP or DB. │
└──────────────────────────────┬──────────────────────────────┘
                               │ defines ports (contracts)
┌──────────────────────────────▼──────────────────────────────┐
│ 🗄️ EQUIPMENT (Infrastructure Layer - repository.ts, models)  │
│ MongoDB, Redis, Supabase. Translates data. Easily swappable.│
└─────────────────────────────────────────────────────────────┘
```

### The 4 Layers Visualized

```mermaid
flowchart TD
    subgraph Presentation["Layer 1: Presentation (apps/api/modules/*/presentation)"]
        Ctrl["Controllers & Route Handlers"]
        Req["Reads req.params, req.body, req.user"]
    end

    subgraph Application["Layer 2: Application (apps/api/modules/*/application)"]
        AppSvc["Application Services (Workflow Orchestration)"]
        Handlers["Command Handlers & Query Handlers"]
    end

    subgraph Domain["Layer 3: Domain (packages/domain) ⭐ THE STAR"]
        Agg["Aggregate Roots (User, Product, Order)"]
        VO["Value Objects (Id, Money, Email, Dates)"]
        Events["Domain Events (OrderCreated, UserBanned)"]
        Ports["Repository Interfaces (Ports)"]
    end

    subgraph Infrastructure["Layer 4: Infrastructure (apps/api/modules/*/infrastructure)"]
        Repo["Repositories (MongoRepository Implementation)"]
        Models["Mongoose Models & Schemas"]
        Mappers["Mappers (Domain ↔ Mongoose Document)"]
    end

    Presentation -->|passes plain IDs| Application
    Application -->|executes commands| Domain
    Infrastructure -.->|implements| Ports
    Application -->|persists via| Ports
```

### The Iron Law of Dependencies

> [!CAUTION]
> **Domain NEVER imports from Infrastructure.**
> **Infrastructure NEVER imports from Presentation.**
> 
> The Domain package (`packages/domain`) is completely pure TypeScript with **zero** external runtime dependencies. It knows nothing about MongoDB, Hono, HTTP headers, or JSON payloads.

---

### Implementation Order: Foundation Up (Steps 1–17)

When creating a new bounded context or module, **always build from the foundation up**. Never create a file that depends on something you haven't written yet:

```
module-name/
 ├── domain/                        ← STEP 1: Write FIRST (Zero dependencies)
 │    ├── value-objects/*.vo.ts     ← Step 1: Immutable smart wrappers
 │    ├── events/*.event.ts         ← Step 2: Event definitions
 │    ├── ports/i-*.repository.ts   ← Step 3: Pure interface contract
 │    ├── read-models/*.read-model.ts← Step 4: Safe public view shape
 │    └── *.aggregate.ts            ← Step 5: THE FORTRESS (rules + state)
 │
 ├── infrastructure/                ← STEP 2: Write SECOND (Talks to DB)
 │    ├── *.models.ts               ← Step 6: Mongoose schema definition
 │    ├── *.mapper.ts               ← Step 7: Document ↔ Aggregate translator
 │    └── *.repository.ts           ← Step 8: Implements domain port
 │
 ├── application/                   ← STEP 3: Write THIRD (Orchestration)
 │    ├── queries/*.query.ts        ← Step 9: Query DTO data bags
 │    ├── query-handlers/*.ts       ← Step 10: Query execution handlers
 │    ├── commands/*.command.ts     ← Step 11: Command DTO data bags
 │    ├── command-handlers/*.ts     ← Step 12: Command execution handlers
 │    ├── *.internal.service.ts     ← Step 13: Intra-module API
 │    └── *.app.service.ts          ← Step 14: Load -> Command -> Save -> Events
 │
 └── presentation/                  ← STEP 4: Write LAST (HTTP Interface)
      ├── *.messages.ts             ← Step 15: Localized message constants
      ├── *.controller.ts           ← Step 16: HTTP mapping (BaseController)
      ├── *.routes.ts               ← Step 17: Hono route registrations
      └── *.module.ts               ← Step 18: Wire DI container & register buses
```

---

## 3. The Domain Fortress: Aggregates, Value Objects & Events

### The Aggregate Fortress Pattern

The Aggregate is the fortress protecting your domain rules. The internal state is completely private. The only way to interact with an aggregate is through its **Public Commands (the Gates)**:

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                      🏰 THE AGGREGATE FORTRESS                            ║
║                                                                           ║
║  ┌─────────────────────────────────┐   ┌───────────────────────────────┐  ║
║  │ 🔒 PRIVATE STATE & GUARDS       │   │ 🚪 PUBLIC COMMAND GATES       │  ║
║  │                                 │   │                               │  ║
║  │  - _id: Id                      │   │  + ban(actorId, days, reason) │  ║
║  │  - _email: EmailVO              │   │  + block(actorId, reason)     │  ║
║  │  - _ban: BanInfoVO              │   │  + liftBan(actorId)           │  ║
║  │  - _block: BlockInfoVO          │   │  + assignRole(role, actorId)  │  ║
║  │  - _delete: DeleteInfoVO        │   │  + softDelete(actorId)        │  ║
║  │                                 │   │                               │  ║
║  │  Internal Guards:               │   │  Each gate:                   │  ║
║  │  - Cannot ban an Admin          │   │  1. Runs internal guards      │  ║
║  │  - Cannot ban yourself          │   │  2. Mutates private state     │  ║
║  │  - Cannot double-ban active ban │   │  3. Raises Domain Event       │  ║
║  └─────────────────────────────────┘   └───────────────────────────────┘  ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐  ║
║ │ ⚡ EVENT COLLECTION (raise(event) → pullEvents() → clearEvents())│  ║
║  └─────────────────────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

#### The Real-World Aggregate Execution Workflow:

The `AggregateRoot` API is `raise()` (protected), `pullEvents()` (public, drains the queue) and `clearEvents()`. Canonical implementation lives in `home.app.service.ts`:

```typescript
// apps/api/modules/home/application/home.app.service.ts
private async publishEvents(home: HomeAggregate): Promise<void> {
    const events = home.pullEvents();        // 1. Drain accumulated domain events
    if (events.length > 0) {
        await this.eventBus.publish(events); // 2. Push to decoupled listeners
    }
}

async addCategory(data: CreateHomeCategoryDtoType, actorId: string) {
    const home = await this.getHomeAggregate(); // 1. Load aggregate from repository
    home.addCategory(CategoryVO.create({ ... })); // 2. Command — aggregate guards rules + raises `HomeCategoryAddedEvent`
    await this.homeRepo.save(home);              // 3. Save updated state atomically
    await this.publishEvents(home);              // 4. Push accumulated domain events
}
```

---

### ID Generation Rule — Server-Generated IDs Only

**The API must never accept an ID from the client when creating a document.**

- Every `create*` / `add*` command MUST generate the aggregate/document ID server-side with `Id.create()` (random UUID v7). Client-supplied IDs on create paths are an anti-pattern and are forbidden.
- Client-supplied IDs are only allowed when they address an **existing** resource — update, delete, remove, reorder, lookup (e.g. `updateCategory(data.id)`, `removeSlide(data.id)`).
- This applies to the application service layer: the DTOs exposed to the client must never include an `id` field on creation payloads.

```typescript
// ✅ CORRECT — id is generated by the server:
const featureId = Id.create();
home.addFeature(FeatureVO.create({ id: featureId, ... }));

// ❌ FORBIDDEN — never derive the new document's id from client input:
const featureId = data.id ? Id.create(data.id) : Id.create();
```

---

### Value Objects: Self-Validating Smart Wrappers

A Value Object wraps primitive data (strings, numbers, dates) and guarantees **instant, permanent validity**.

```typescript
// ❌ WITHOUT VALUE OBJECT:
const email: string = "not-an-email";
// Valid TypeScript string, but invalid business email! 
// Error explodes only when the mailer crashes hours later.

// ✅ WITH VALUE OBJECT:
const email = EmailVO.create("not-an-email");
// Throws BadRequestError immediately upon creation!
// An invalid email can NEVER exist anywhere in memory.
```

#### Value Objects Implemented in `packages/domain/value-objects`:

| Category | Value Object | Constraints & Invariants |
| :--- | :--- | :--- |
| **Identifiers** | `Id`, `IdentifierVO`, `Slug` | Non-empty, format validation, UUID / ObjectId compatibility, URL slug formatting |
| **Financial & Math** | `Money`, `Quantity`, `Percentage`, `NumberVO` | Non-negative decimals, integer inventory counts, discount limits (0–100%) |
| **Temporal** | `DateVO`, `EffectiveDate`, `ExpirationDate` | Valid dates, `EffectiveDate.today()`, strictly future timestamps for `ExpirationDate` |
| **Contact & Personal**| `EmailVO`, `Name`, `PhoneNo` | RFC email regex, formatted full name strings, E.164 phone numbering |
| **Content & Media** | `Title`, `Description`, `UrlVO`, `ImageVO`, `AltVO`, `ColorVO` | Text length boundaries, valid URL schemas, hex colors, responsive media metadata |
| **Sanctions & State**| `BanInfoVO`, `BlockInfoVO`, `DeleteInfoVO` | Ban tracking (`until`, `remainingDays`), actor attribution, reasons, soft-deletion |
| **Catalog Specs** | `AppearanceVO`, `QueryVO`, `EnumVO`, `EnumCollectionVO` | Visibility toggles (`isPublic`), validated search filters, bounded enumerations, bounded enum collections |
| **Product / Schema** | `StringVO`, `ReasonVO`, `StreetAddressVO` | Generic validated strings, sanction/comment reasons, address line structures |

> [!NOTE]
> `IconVO` (`packages/domain/value-objects/icon.vo.ts`) and `IconSchema` (`packages/shared/dtos/icon-schema.ts`) are **legacy / unused** — they were removed from the `home` module's categories & features and are exported only via barrel `index.ts` files. Safe to delete when cleaning up.

---

### Domain Events Lifecycle

Domain events are defined in the Domain, **raised** by the Aggregate via `this.raise()`, drained with `pullEvents()`, and optionally **pushed** through the singleton `EventBus` (`apps/api/core/infrastructure/buses/in-memory-event-bus.ts`):

```mermaid
sequenceDiagram
    autonumber
    participant Cmd as App Service (Application)
    participant Agg as Aggregate (Domain)
    participant Bus as InMemoryEventBus
    participant H as Handlers (optional)

    Cmd->>Agg: home.addCategory(new CategoryVO(...))
    Agg->>Agg: validates invariants, raises event
    Cmd->>Cmd: await repo.save(home)
    Cmd->>Agg: home.pullEvents()
    Cmd->>Bus: eventBus.publish(events)
    alt handler registered on event.type
        Bus->>H: handler.handle(event)
    end
```

#### Event Catalog by Module

| Module | Aggregate | Events (type strings) | Raise | Publish |
| :--- | :--- | :--- | :--- | :--- |
| `user` | `UserAggregate` | `user.signed-in`, `user.logged-in`, `user.role-assigned`, `user.banned`, `user.ban-lifted`, `user.ban-extended`, `user.ban-shortened`, `user.blocked`, `user.block-lifted`, `user.deleted`, `user.delete-lifted` = **11** | ✅ all 11 | ❌ app service does not publish yet |
| `vendor` | `VendorAggregate` | `vendor.created`, `vendor.verified`, `vendor.rejected`, `vendor.deleted`, `vendor.recovered`, `vendor.image-updated`, `vendor.contact-updated`, `vendor.meta-updated` = **8** | ✅ all 8 | ❌ not published yet |
| `order` | `OrderAggregate` | `order.created`, `order.confirmed`, `order.completed`, `order.cancelled`, `order.refunded`, `order.returnded` *(sic, code typo)* | ⚠️ only `order.created` | ❌ not published yet |
| `home` | `HomeAggregate` | `home.category-*` (4), `home.feature-*` (4), `home.slide-*` (4), `home.promo-*` (3), `home.container-*` (4) = **19** | ✅ all 19 | ✅ `pullEvents()` + `publish()` in `home.app.service.ts` |
| `product` | `ProductAggregate` | `product.created`, `product.pricing-summary-updated`, `product.rating-summary-updated`, `product.recovered`, `product.deleted`, `product.blocked`, `product.unblocked`, `product.made-public`, `product.made-private`, `product.meta-updated`, `product.in-stock-updated`, `product.disclaimer-enabled`, `product.disclaimer-disabled`, `product.disclaimers-added`, `product.disclaimers-removed`, `product.disclaimer-updated`, `product.images-added`, `product.images-removed`, `product.default-image-set`, `product.ingredients-enabled`, `product.ingredients-disabled`, `product.ingredients-added`, `product.ingredients-removed`, `product.ingredients-cleared` = **24** | ✅ all 24 | ❌ not published yet |
| `product-variant` | `ProductVariantAggregate` | `product-variant.created`, `product-variant.meta-updated`, `product-variant.activated`, `product-variant.deactivated`, `product-variant.price-updated`, `product-variant.deleted`, `product-variant.recovered` = **7** | ✅ all 7 | ❌ not published yet |
| `inventory` | `InventoryAggregate` | `inventory.created`, `inventory.reserved`, `inventory.completed`, `inventory.bought`, `inventory.low-stock-threshold-updated`, `inventory.stock-removed`, `inventory.deleted` = **7** | ✅ all 7 | ❌ not published yet |
| `category` | `CategoryAggregate` | `category.created`, `category.meta-updated`, `category.image-updated`, `category.deleted`, `category.recovered`, `category.blocked` = **6** | ✅ all 6 | ❌ not published yet |
| `address` | `AddressAggregate` | `address.created`, `address.updated`, `address.deleted`, `address.recovered`, `address.set-as-default` = **5** | ✅ all 5 | ❌ not published yet |
| `order-items` | `OrderItemsAggregate` | `order-item.created` = **1** | ✅ all 1 | ❌ not published yet |
| `reviews` | `ReviewAggregate` | `review.created`, `review.updated`, `review.vendor-reply-added`, `review.liked`, `review.disliked`, `review.reported`, `review.deleted` = **7** | ✅ all 7 | ❌ not published yet |

Events are raised inside the aggregate command methods, and creation events are raised from the static `create()` factory before the aggregate is returned. The event files live in `packages/domain/modules/<module>/events/` (barrel-exported via `<module>/events/index.ts`, re-exported from `<module>/index.ts`). Home registers **no listeners** — it only creates and pushes events.

> [!NOTE]
> Current publish gap: modules `user`, `vendor`, `order`, `product`, `product-variant`, `inventory`, `category`, `address`, `order-items` and `reviews` raise domain events but their app services **do not yet call `publish()`** — events accumulate in the aggregate and are drained only if the service calls `pullEvents()`. Only `home.app.service.ts` implements the full Load → Command → Save → Publish loop. The `user` module does register one handler (`UserSignedInHandler` on `user.signed-in`).

---

### Complete Catalog of Project Aggregates & Value Objects

Every bounded context maps to exactly one Aggregate Root under `packages/domain/modules/<module>/`, paired with shared value objects in `packages/domain/value-objects/` and module-scoped VOs:

| Module | Aggregate Root | Module-Scoped Value Objects |
| :--- | :--- | :--- |
| `user` | `UserAggregate` | `NameInfoVO`, `RoleInfoVO` |
| `order` | `OrderAggregate` | `OrderItemVO` |
| `order-items` | `OrderItemsAggregate` | `StatusVO` |
| `product` | `ProductAggregate` | `DisclaimerVO`, `IngredientsVO`, `ProductImagesVO` |
| `product-variant` | `ProductVariantAggregate` | — |
| `inventory` | `InventoryAggregate` | — |
| `vendor` | `VendorAggregate` | `ContactInfoVO`, `ImageInfoVO`, `StatsInfoVO`, `VerificationInfoVO` |
| `category` | `CategoryAggregate` | — |
| `address` | `AddressAggregate` | — |
| `home` | `HomeAggregate` | `CategoryVO`, `FeatureVO`, `SlideVO`, `PromoVO`, `ProductContainerVO` |
| `reviews` | `ReviewAggregate` | — |

Shared value objects live in `packages/domain/value-objects/` (see the table above) and are re-exported from `packages/domain/index.ts` under the `@ecomerece/domain` alias.

---

## 4. Cross-Module Decoupling: How Modules Communicate

### The Spaghetti Problem vs. Central Buses

When modules import each other directly, renaming one method causes cascade compilation failures throughout the system:

```
❌ The Spaghetti Problem (Direct Imports):
OrderModule ─── imports ───> InventoryInternalService
VendorModule ── imports ───> UserInternalService
OrderModule ─── imports ───> ProductRepository
Notification ── imports ───> UserModel
(Circular dependencies, tangled tests, fragile deployments)

✅ The Decoupled Solution (Bus Contracts):
OrderModule ─── sends ───> [ CommandBus ] ───> InventoryHandler
VendorModule ── sends ───> [ QueryBus ]   ───> UserHandler
UserModule  ─── emits ───> [ EventBus ]   ───> NotificationListener
(Modules know only tiny, stable contract data bags!)
```

---

### Pattern 1: QueryBus (Synchronous Decoupled Reads)

**The Restaurant Analogy**: You (VendorModule) do not walk into the kitchen to question the Chef (UserInternalService). You write your question on a **ticket** (`GetUserByIdQuery`) and hand it to the **waiter** (`QueryBus`). The waiter brings back the answer (`UserReadModel`). You never touch the kitchen.

```mermaid
sequenceDiagram
    autonumber
    participant Caller as VendorService
    participant Bus as InMemoryQueryBus
    participant Handler as GetUserByIdHandler
    participant Service as UserInternalService

    Caller->>Bus: execute(new GetUserByIdQuery(userId))
    Note over Bus: Matches query class to registered handler
    Bus->>Handler: handle(query)
    Handler->>Service: getById(query.userId)
    Service-->>Handler: UserReadModel
    Handler-->>Bus: UserReadModel
    Bus-->>Caller: UserReadModel
```

**The 4 Files Needed**:
1. **Query Class**: `user/application/queries/get-user-by-id.query.ts` (Tiny data bag; the *only* thing other modules import).
2. **Query Handler**: `user/application/query-handlers/get-user-by-id.handler.ts` (Lives inside User module; calls internal service).
3. **Registration**: `user.module.ts` (`queryBus.register(GetUserByIdQuery, handler)`).
4. **Caller Usage**: `vendor.app.service.ts` (`await queryBus.execute(new GetUserByIdQuery(id))`).

---

### Pattern 2: Anti-Corruption Layer / ACL (Type Isolation)

**The Currency Exchange Analogy**: You travel to France with British Pounds. You visit a **currency exchange booth** (`UserACL`). The booth converts Pounds to Euros so French merchants can process your transaction without understanding British currency.

The ACL lives in the **consumer module's infrastructure**:
```typescript
// vendor/infrastructure/user-acl.ts
export class UserACL {
    constructor(private readonly userQueryBus: InMemoryQueryBus) {}

    async getOwnerView(userId: string): Promise<VendorOwnerView | null> {
        const user = await this.userQueryBus.execute(new GetUserByIdQuery(userId));
        if (!user) return null;
        
        // Translates foreign UserReadModel into local VendorOwnerView
        return {
            ownerId: user.id,
            ownerName: user.name.fullName,
            isVerified: !user.banned && !user.blocked,
        };
    }
}
```

---

### Pattern 3: Domain Events (Asynchronous Reactive Broadcasts)

**The News Broadcast Analogy**: When a news agency publishes a story, it posts the bulletin. It does not call every citizen on the telephone. Interested parties subscribe to the broadcast and react on their own.

```
UserAppService (Publisher)
       │ raises & publishes
       ▼
   EventBus  (type: 'user.deleted')
       ├───► VendorListener: Delete all store listings for user
       ├───► NotificationListener: Send farewell email
       └───► AuditListener: Write record to compliance log
```
*UserAppService imports ZERO files from Vendor, Notification, or Audit.*

---

### Pattern 4: CommandBus (Synchronous Decoupled Writes)

**The CEO Analogy**: The CEO gives an order to the Warehouse Chief: *"Reserve 2 units of SKU-99 right now, and confirm when completed."* The CEO only signs the purchase invoice *after* the warehouse confirms.

```mermaid
sequenceDiagram
    autonumber
    participant Order as OrderAppService
    participant Bus as InMemoryCommandBus
    participant Handler as ReserveInventoryHandler
    participant Inventory as InventoryAggregate

    Order->>Bus: execute(new ReserveInventoryCommand(items, buyerId))
    Bus->>Handler: handle(command)
    Handler->>Inventory: reserve(quantity)
    alt Insufficient Stock
        Inventory-->>Handler: Throws DomainError('Out of stock')
        Handler-->>Bus: Re-throws Error
        Bus-->>Order: Error caught -> ORDER IS NEVER SAVED ❌
    else Stock Available
        Inventory->>Inventory: Stock deducted, reserved incremented
        Handler-->>Bus: Success confirmation
        Bus-->>Order: Success confirmation
        Order->>Order: OrderAggregate.create() -> Save to DB ✅
    end
```

---

### Preventing Race Conditions: Why Not Events for Inventory Reservation?

> [!CAUTION]
> **Why Domain Events CANNOT be used for Inventory Reservation:**
> 
> If you publish an asynchronous `OrderPlacedEvent` and attempt to reserve inventory inside an event listener, you create a fatal race condition:
> 1. Customer A and Customer B both purchase the last available item simultaneously.
> 2. Both orders commit to the database successfully.
> 3. The asynchronous event listener runs for Customer B, discovers 0 stock, and fails.
> 4. **You have oversold inventory.** You now need complex distributed sagas, cancellation refunds, and customer apology emails.
> 
> **With `CommandBus`**: The reservation is synchronous and atomic. Customer A's reservation succeeds; Customer B's reservation throws immediately; Customer B's order is **never created**.

---

### The Three Buses Comparison Table

| Property | 🚌 QueryBus | 🚦 CommandBus | ⚡ EventBus |
| :--- | :--- | :--- | :--- |
| **Primary Intent** | Read data synchronously | Mutate state synchronously | React to state change asynchronously |
| **Execution** | `await queryBus.execute()` | `await commandBus.execute()` | `eventBus.publish()` (Fire & forget) |
| **Return Value** | ReadModel / Data DTO | Confirmation / Result | `void` |
| **Caller Blocks?** | Yes (Needs data immediately) | Yes (Must succeed before commit) | No (Eventual consistency) |
| **Module Coupling** | Decoupled (imports Query DTO) | Decoupled (imports Command DTO) | Zero coupling (Listener registers on type) |
| **Real Example** | `VerifyUserAndGetQuery` | `CreateItemsCommand` | `HomeCategoryAddedEvent`, `UserBannedEvent` |

All three buses are **in-memory singletons** living in `apps/api/core/infrastructure/buses/` (`in-memory-query-bus.ts`, `in-memory-command-bus.ts`, `in-memory-event-bus.ts`). Commands are keyed by `command.constructor.name`; queries by the query class itself; events by their `type` string. They are platform-native and can be swapped for outer adapters (e.g. Kafka/RabbitMQ for the event bus) without touching the domain. The query bus is already used cross-module by the `user` and `order` modules, and the command bus by `order-items`. The event bus has one registered handler today: `UserSignedInHandler` (`user.signed-in`).

---

### Architectural Decision Tree

```
Does Module A need something from Module B?
│
├── Is this a reaction to something that already happened?
│    └── YES ──► Use DOMAIN EVENTS (⚡ EventBus)
│
└── NO (I need action or data RIGHT NOW)
     │
     ├── Do I need to READ data without altering state?
     │    └── YES ──► Use QUERYBUS (🚌 QueryBus)
     │
     └── Do I need to WRITE / RESERVE state atomically?
          └── YES ──► Use COMMANDBUS (🚦 CommandBus)
```

---

## 5. The Persistence Layer & Unit of Work

### The Translator Pattern: Mappers

MongoDB stores flat documents. The Domain uses rich aggregate instances. The **Mapper** (`*.mapper.ts`) translates between these two worlds:

```
 MongoDB Document (Flat)               Domain Aggregate (Rich)
┌────────────────────────┐           ┌────────────────────────┐
│ _id: string            │   toAgg   │ id: Id                 │
│ price: number          ├──────────►│ price: Money           │
│ email: string          │           │ email: EmailVO         │
│ isBanned: boolean      │◄──────────┤ ban: BanInfoVO         │
│ banUntil: Date         │   toDoc   │ delete: DeleteInfoVO   │
└────────────────────────┘           └────────────────────────┘
```

Each mapper exposes the following methods (naming varies by module — `user.mapper.ts` and `home.mapper.ts` are canonical):
- `persistenceToAggregate(doc)` / `aggregateToPersistence(aggregate)`: Core document ↔ aggregate translation.
- Domain- or DTO-specific extras, e.g. `home.mapper.ts` adds `aggregateToReadModel(aggregate)` and `aggregateToResponseDto(aggregate)` for the storefront response.

---

### The Repository Port Pattern

Domain defines the interface contract; Infrastructure implements it (note the codified **PascalCase** method names and that repositories extend the generic `MongoRepository<T>`, which wires transactions via `AsyncLocalStorage` sessions):
```typescript
// packages/domain/modules/user/ports/i-user-repository.ts (THE CONTRACT)
export interface IUserRepository {
    FindById(id: Id): Promise<UserAggregate | null>;
    FindByEmail(email: EmailVO): Promise<UserAggregate | null>;
    FindByIdOrThrow(id: Id): Promise<UserAggregate>;
    FindByIds(id: Id[]): Promise<UserAggregate[]>;
    FindByEmailOrThrow(email: EmailVO): Promise<UserAggregate>;
    Save(user: UserAggregate): Promise<void>;
    Create(add: UserAggregate): Promise<void>;
    Delete(id: Id): Promise<void>;
    Exists(id: Id): Promise<boolean>;
}

// apps/api/modules/user/infrastructure/user.repository.ts (THE IMPLEMENTATION)
export class UserRepository extends MongoRepository<UserPersistence> implements IUserRepository {
    // Implements Mongoose persistence
}
```
*Swapping MongoDB for PostgreSQL requires changing exactly one repository file and one line in `user.module.ts`.*

---

### Unit of Work with AsyncLocalStorage Transactions

MongoDB transactions require active `ClientSession` instances. Our [`UnitOfWork`](file:///home/abdul-ahad/Desktop/hono_backend/apps/api/core/database/unit-of-work.ts) automatically propagates sessions across all repository calls using Node's `AsyncLocalStorage` without leaking session objects into application code:

```typescript
export class UnitOfWork {
    async transaction<T>(callback: () => Promise<T>, retries = 3): Promise<T> {
        return withRetry(async () => {
            const session = await mongoose.startSession();
            try {
                session.startTransaction();
                const result = await transactionContext.run({ session }, callback);
                await session.commitTransaction();
                return result;
            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                await session.endSession();
            }
        }, {
            retries,
            shouldRetry: isTransientTransactionError,
            backoff: (attempt) => Math.min(100 * 2 ** (attempt - 1), 5000),
        });
    }
}
```

---

## 6. Defensive Middleware & API Gateway (`apps/api`)

### Request Guards (DoS, Payload Tree & Buffer Defense)

Before any route handler runs, [`requestguard.middleware.ts`](file:///home/abdul-ahad/Desktop/hono_backend/apps/api/middleware/requestguard.middleware.ts) enforces rigid input constraints:
- **`urlLengthGuard(200)`**: Prevents buffer and regex evaluation exploits on oversized request paths.
- **`queryLengthGuard(100)`**: Disallows long query string attacks.
- **`paramLengthGuard(20)`**: Rejects bloated route parameters.
- **`bodyLimit(1000)`**: Rejects HTTP payloads larger than 1 KB.
- **`jsonDepthGuard(5)`**: Defends against nested JSON recursion exploits that cause stack overflows.
- **`jsonNodesGuard(50)`**: Limits maximum AST node count in incoming JSON payloads.

---

### Redis Sliding Token Bucket Rate Limiting

The rate limiter in [`rateLimiter.ts`](file:///home/abdul-ahad/Desktop/hono_backend/apps/api/middleware/rateLimiter.ts) operates directly on Redis:
- **Bucket Capacity**: 10 tokens.
- **Refill Rate**: 1 token per second.
- **Client Keying**: IP extracted from `cf-connecting-ip` or `x-forwarded-for`.
- **Enforcement**: Throws `TooManyRequestError` (HTTP 429) when exhausted.

---

### Supabase Identity & Dynamic State Verification

The auth pipeline in [`auth.ts`](file:///home/abdul-ahad/Desktop/hono_backend/apps/api/middleware/auth.ts) does not rely solely on cryptographic JWT validity:
1. Verifies Bearer token with Supabase Admin SDK.
2. Retrieves matching MongoDB `User` document.
3. **Verifies Live State**:
   - `user.deleted.deleted` &rarr; Throws `UnauthorizedError('User not found')`
   - `user.block.blocked` &rarr; Throws `ForbiddenError('User blocked')`
   - `user.ban.banned` &rarr; Throws `ForbiddenError('User banned')`

---

### Complete API Endpoints Catalog

```mermaid
graph LR
    API[Hono API Router]
    API --> Users["/users"]
    API --> Products["/product"]
    API --> Variants["/product-variant"]
    API --> Inventory["/product-inventory"]
    API --> Orders["/order"]
    API --> OrderItems["/order-items"]
    API --> Categories["/category"]
    API --> Address["/address"]
    API --> Vendor["/vendor"]
    API --> Home["/home"]
```

All routes are registered in `apps/api/routes/index.ts` and mounted to the Hono app root. Guards reflect the middleware stacked on each route (`authMiddleware`, `adminMiddleware`). Seller scoping (e.g. "own product") is enforced inside controllers/app services, not by a separate middleware — `sellerMiddleware` exists but is not yet wired to any route.

| Domain | Route | Method | Access Guard | Action Description |
| :--- | :--- | :--- | :--- | :--- |
| **Users** | `/users/init` | POST | InitAuth | Initialize MongoDB user record post signup |
| | `/users/me` | GET | Auth | Retrieve authenticated profile |
| | `/users/me/soft` | DELETE | Auth | User self soft-deletion |
| | `/users/:id` | GET | Auth | Fetch user profile by ID |
| | `/users/role` | PATCH | Admin | Assign user role (`customer`, `vendor`, `admin`) |
| | `/users/block` | PATCH | Admin | Impose indefinite account block |
| | `/users/block/lift` | PATCH | Admin | Lift account block |
| | `/users/ban` | PATCH | Admin | Ban user for specified number of days |
| | `/users/ban/extend` | PATCH | Admin | Extend active ban |
| | `/users/ban/short` | PATCH | Admin | Shorten active ban |
| | `/users/ban/lift` | PATCH | Admin | Lift active ban |
| | `/users/recover` | PATCH | Admin | Recover soft-deleted user |
| | `/users/soft` | DELETE | Admin | Admin soft-delete a user |
| **Products** | `/product` | GET | Public | Paginated product search & catalog listing |
| | `/product/:id` | GET | Public | Detailed product view |
| | `/product/my` | POST | Auth | Vendor creates new product catalog item |
| | `/product/my/soft` | DELETE | Auth | Soft-delete product |
| | `/product/my/recover`| PATCH | Auth | Recover soft-deleted product |
| | `/product/state/my/public` | PATCH | Auth | Publish product to storefront |
| | `/product/state/my/private`| PATCH | Auth | Hide product from storefront |
| | `/product/my/meta` | PATCH | Auth | Update title & description |
| | `/product/my/disclaimer/toggle` | PATCH | Auth | Toggle a product disclaimer |
| | `/product/my/disclaimer/add`| PATCH | Auth | Add product disclaimers |
| | `/product/my/disclaimer/remove`| PATCH | Auth | Remove product disclaimers |
| | `/product/my/images/add` | PATCH | Auth | Append media URLs to gallery |
| | `/product/my/images/remove` | PATCH | Auth | Remove a media URL from gallery |
| | `/product/my/images/default`| PATCH | Auth | Set default hero image |
| | `/product/my/ingredients/toggle`| PATCH| Auth | Toggle ingredients list |
| | `/product/my/ingredients/add`| PATCH| Auth | Add product ingredients list |
| | `/product/my/ingredients/remove`| PATCH| Auth | Remove product ingredients |
| | `/product/block` | POST | Admin | Moderation block product |
| | `/product/block/lift` | POST | Admin | Unblock product |
| **Variants** | `/product-variant/:id` | GET | Public | Get all variants for a product ID |
| | `/product-variant/my` | POST | Auth | Create SKU variant (color, size, price) |
| | `/product-variant/my/price`| PATCH | Auth | Update variant pricing |
| | `/product-variant/my/meta` | PATCH | Auth | Update variant metadata |
| | `/product-variant/my/appereance/toggle`| PATCH | Auth | Toggle variant appearance (`appereance` typo in code) |
| | `/product-variant/my/delete/soft`| DELETE | Auth | Soft-delete variant |
| | `/product-variant/recover/:id`| PATCH | Admin | Recover soft-deleted variant |
| **Inventory** | `/product-inventory/:id` | GET | Public | Check stock availability for variant |
| | `/product-inventory/my/create` | POST | Auth | Initialize stock tracking record |
| | `/product-inventory/my/:id/purchase` | PATCH | Auth | Restock inventory replenishment |
| | `/product-inventory/my/:id/threshold` | PATCH | Auth | Configure low-stock notification limit |
| | `/product-inventory/:id/remove` | PATCH | Auth | Remove stock record |
| **Orders** | `/order/create/my` | POST | Auth | Multi-item atomic checkout pipeline |
| **Order Items**| `/order-items` | — | — | Mounted in the router; defines no HTTP routes — only registers the `CreateItemsCommand` handler |
| **Categories**| `/category` | GET | Public | List hierarchical categories |
| | `/category/:id` | GET | Public | Category details |
| | `/category/create` | POST | Admin | Create category |
| | `/category` | DELETE | Admin | Delete category |
| **Address** | `/address/my` | GET | Auth | List delivery addresses |
| | `/address/my` | POST | Auth | Add shipping address |
| | `/address/my/:id/default`| PATCH | Auth | Mark address as default |
| | `/address/my/:id/update` | PATCH | Auth | Update address details |
| | `/address/my/:id/recover`| PATCH | Admin | Recover soft-deleted address |
| | `/address/my/:id` | DELETE | Auth | Soft-delete address |
| **Vendor** | `/vendor/my` | POST | Auth | Register seller storefront |
| | `/vendor/my` | DELETE | Auth | Delete own vendor profile |
| | `/vendor/:id` | GET | Public | Retrieve vendor public profile |
| | `/vendor/soft` | DELETE | Admin | Soft-delete vendor (moderation) |
| | `/vendor/recover` | PATCH | Admin | Recover soft-deleted vendor |
| | `/vendor/verify` | PATCH | Admin | Approve vendor KYC registration |
| | `/vendor/reject` | PATCH | Admin | Reject vendor verification |
| **Home CMS** | `/home` | GET | Public | Fetch storefront layout configuration |
| | `/home/categories` | POST | Admin | Add a category chip to the home layout |
| | `/home/categories` | PATCH | Admin | Update a home category |
| | `/home/categories` | DELETE | Admin | Remove a home category |
| | `/home/categories/reorder` | PATCH | Admin | Reorder category chips |
| | `/home/features` | POST | Admin | Add a feature blob |
| | `/home/features` | PUT | Admin | Replace the entire feature set |
| | `/home/features` | PATCH | Admin | Update a feature blob |
| | `/home/features` | DELETE | Admin | Remove a feature blob |
| | `/home/slides` | POST | Admin | Add hero banner slide |
| | `/home/slides` | PATCH | Admin | Update hero banner slide |
| | `/home/slides` | DELETE | Admin | Remove hero banner slide |
| | `/home/slides/reorder` | PATCH | Admin | Reorder hero slides ranking |
| | `/home/promos` | POST | Admin | Add promo banner |
| | `/home/promos` | PATCH | Admin | Update promo banner |
| | `/home/promos` | DELETE | Admin | Remove promo banner |
| | `/home/containers` | POST | Admin | Add dynamic product showcase shelf |
| | `/home/containers` | PATCH | Admin | Update product showcase shelf |
| | `/home/containers` | DELETE | Admin | Remove product showcase shelf |
| | `/home/containers/reorder` | PATCH | Admin | Reorder showcase shelf layout |

> [!NOTE]
> The **reviews** module (`apps/api/modules/reviews`) has a full 4-layer scaffold + domain aggregate (`ReviewAggregate`), but its controller/routes are **not yet wired** — it exposes no HTTP endpoints and is not mounted in `routes/index.ts`.

---

## 7. Frontend Architecture & Multi-Platform SDK

### Headless Client SDK (`packages/frontend`)

The frontend business logic is decoupled from React UI via `@ecomerece/frontend`:

```
packages/frontend/
 ├── adapters/
 │    ├── auth/               ← Platform conditional exports
 │    │    ├── auth-adapter.interface.ts
 │    │    ├── auth-adapter.web.ts      (Supabase Browser/SSR)
 │    │    └── auth-adapter.native.ts   (AsyncStorage / Keychain)
 │    ├── storage/
 │    │    ├── storage-adapter.interface.ts
 │    │    ├── storage-adapter.web.ts   (LocalStorage)
 │    │    └── storage-adapter.native.ts(AsyncStorage)
 │    └── navigation/         ← Zustand Cross-Platform Stores
 │         ├── shell.store.ts
 │         ├── tabs.store.ts
 │         ├── wizard.store.ts
 │         ├── page meta.store.ts
 │         ├── command palette.store.ts
 │         └── history stack.store.ts
 ├── modules/                 ← TanStack React Query Hooks & Services
 │    ├── user/  product/  order/  inventory/  address/
 │    └── category/  product-variant/  home/  vendor/
 ├── services/                ← supabaseClient, parseModalError, theme
 └── lib/
      ├── http-client.ts      ← Unified fetch wrapper with AppError parsing
      ├── http-error.ts / server-http.ts
      └── query-client.ts     ← React Query cache defaults
```

### Next.js 16 Web Storefront & Backoffice (`apps/web`)

The Next.js 16 application employs the App Router, React 19 Server Components, and **Material UI (MUI)** as the default component library:
- **Public Storefront** (`/client/home`, `/client/product/[id]`): High-performance SSR product discovery.
- **Account Backoffice** (`/account/profile`, `/account/address`): User self-service portal.
- **Admin Dashboard** (`/admin/home`): Dynamic CMS homepage curation.

---

## 8. Developer Cheatsheet: "Which File Do I Touch?"

| Goal / Task | Files to Create or Modify |
| :--- | :--- |
| **Add a new business rule to an existing entity** | 1. Open `packages/domain/modules/<module>/<module>.aggregate.ts`<br>2. Add invariant check inside the target command method.<br>3. Zero other files change! 🎉 |
| **Add a new field to MongoDB document** | 1. `apps/api/modules/<module>/infrastructure/<module>.models.ts` (Mongoose Schema)<br>2. `apps/api/modules/<module>/infrastructure/<module>.mapper.ts` (update `persistenceToAggregate` + `aggregateToPersistence`)<br>3. `packages/domain/modules/<module>/<module>.aggregate.ts` (Add private prop & getter) |
| **Dispatch a new Domain Event (raise + push)** | 1. Create `packages/domain/modules/<module>/events/<name>.event.ts` (implements `IEvent<T>`, stable `type` string)<br>2. In aggregate: call `this.raise(new Event(...))`<br>3. In app service after `save()`: drain with `home.pullEvents()` then `await this.eventBus.publish(events)`<br>4. *(Optional)* Add a listener in `application/event-handlers/<name>.handler.ts` and `eventBus.register('<type>', handler)` in `<module>.module.ts` |
| **Query data from another module** | 1. Create query DTO in target module: `<target>/application/queries/<name>.query.ts`<br>2. Create handler in target module: `<target>/application/query-handlers/<name>.handler.ts`<br>3. Register on `queryBus` in `<target>.module.ts`<br>4. In caller module: call `await queryBus.execute(new Query(...))` |
| **Execute a synchronous write across modules** | 1. Create command DTO in target module: `<target>/application/commands/<name>.command.ts`<br>2. Create handler in target module: `<target>/application/command-handlers/<name>.handler.ts`<br>3. Register on `commandBus` in `<target>.module.ts`<br>4. In caller module: call `await commandBus.execute(new Command(...))` |
| **Swap MongoDB for PostgreSQL / Prisma** | 1. Create new repository class implementing domain port `I<Module>Repository`<br>2. Swap instance in `<module>.module.ts`<br>3. Zero domain, application, or presentation files change! 🎉 |
| **Swap In-Memory EventBus for RabbitMQ / Kafka** | 1. Create class implementing `IEventBus`<br>2. Swap bus instance in `<module>.module.ts` |

---

## 9. Operational & Environment Reference

### Environment Variables

#### Backend (`apps/api/.env`)
```bash
MONGO_URI=mongodb://root:password@127.0.0.1:27017/ecommerce?replicaSet=rs0&authSource=admin
REDIS_URL=redis://localhost:6379                 # consumed by apps/api/lib/redis.ts
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SECRET_KEY=eyJhbGciOi...                # Supabase service-role key (apps/api/lib/supabase.ts)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...    # Clerk publishable key
CLERK_SECRET_KEY=sk_test_...                     # Clerk secret key
GOOGLE_CLIENT_ID=...googleusercontent.com        # Google OAuth
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
JWT_SECRET=super-secret-jwt-key
FRONTEND_URL=http://localhost:3000
```

> [!NOTE]
> The API **port is hardcoded to `8000`** in `apps/api/index.ts` (not env-driven). MongoDB write transactions require the `?replicaSet=rs0` query param. Auth is verified server-side with the **Supabase Admin SDK** (`apps/api/lib/supabase.ts`); Clerk/Google keys are used by the web storefront auth flows.

#### Web Frontend (`apps/web/.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...      # Public anon key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...    # Clerk publishable key
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

### Essential CLI Commands

```bash
# Run API (8000) and Web (3000) in watch mode concurrently
bun run dev

# Run TypeScript compilation check across all workspaces
bun run typecheck

# Lint (Next.js ESLint) & format (Biome)
bun run lint
bun run format

# Run test suite (plain / watch)
bun test
bun run test:watch

# Production Process Management with PM2
pm2 start ecosystem.config.js
```

> [!WARNING]
> `bun run lint:imports` is **broken** — it references the missing script `scripts/check-imports.ts`, so the architectural import-boundary validator is not currently runnable.
Avoid adding unnecessary abstractions or changing the architecture merely to hide the problem. 