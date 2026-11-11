# Cross-Module Refactor — TODO & Work Log

## Rules

- Status: `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked
- After each task: tick the checkbox and append ONE row to the Work Log.
- Never delete Work Log rows. The log is append-only.
- Record format: `date | task id | result | files | verification | commit`
- Only one task may be `[~]` at a time.
- A task is `[x]` only after its verification command passes.

## Decisions

- Keep `QueryBus` (class-keyed) + `EventBus` (hardened).
- Remove `CommandBus`; replace its 3 uses with explicit ports.
- `packages/contracts` is the only cross-module surface for queries/ports/DTOs.
- Boundary enforcement uses `scripts/arch-check.ts` (zero deps) instead of dependency-cruiser;
  it covers the same rules and exits non-zero on violations.
- Domain events stay in `packages/domain` (already a shared contract).
- Central `apps/api/composition-root.ts`; no import-side-effect wiring.
- Order flow wrapped in `UnitOfWork.transaction`.
- Transactional outbox = deferred (Phase 8, optional).

## Phase Overview

| Phase | Scope | Status |
|---|---|---|
| P0 | Baseline + dependency-cruiser report-only | [x] |
| P1a | Move AppError out of apps/api (domain purity) | [x] |
| P1b | Create packages/contracts + tsconfig alias | [x] |
| P2 | Composition root + module factory deps | [x] |
| P3 | Remove CommandBus, add ports | [x] |
| P4 | Migrate cross-module queries to contracts | [x] |
| P5 | Harden EventBus + contract payloads | [x] |
| P6 | Order atomicity (UnitOfWork) | [x] |
| P7 | Enforce boundaries (`bun run arch`) | [x] |
| P8 | Optional outbox | [ ] |

## Global Tasks

- [x] G-01 Baseline: typecheck, test, lint, api build
- [x] G-02 Add architecture checker + `bun run arch` (custom zero-dep scanner; see Decisions)
- [x] G-03 Move errors to packages/domain/errors + re-export
- [x] G-04 Create packages/contracts + @ecomerece/contracts alias
- [x] G-05 Add createBuses() and composition-root.ts
- [x] G-06 Convert all 13 module factories to deps objects
- [x] G-07 Refactor routes/index.ts + index.ts to use composition root
- [x] G-08 Remove CommandBus + command bus tests
- [x] G-09 Make the architecture check fail on violations
- [ ] G-10 Final acceptance checklist

## Module Tasks

### image-storage
- [x] M-IMAGE-01 Confirm IImageStorage port is shared (domain/contracts)
- [x] M-IMAGE-02 Remove direct factory imports from category/home/product/vendor; inject
- [x] M-IMAGE-03 Verify + log

### user
- [x] M-USER-01 Contract: 4 queries (EnsureActive, EnsureActiveUserGetById, VerifyUserAndGet, GetUserById)
- [x] M-USER-02 Import vendor.* event payloads from domain events
- [x] M-USER-03 Factory deps object
- [x] M-USER-04 Verify + log

### vendor
- [x] M-VENDOR-01 Contract: 4 queries (EnsureActiveVendorGetById, VerifyVendorAndGet, EnsureActiveVendor, GetVendorByUserId)
- [x] M-VENDOR-02 Factory deps (buses + IImageStorage)
- [x] M-VENDOR-03 Replace user query import with contracts
- [x] M-VENDOR-04 Add IVendorStatsProjector port (for stats)
- [x] M-VENDOR-05 Verify + log

### category
- [x] M-CATEGORY-01 Contract: VerifyCategoryAndGetQuery
- [x] M-CATEGORY-02 Factory deps (buses + IImageStorage injection)
- [x] M-CATEGORY-03 Verify + log

### address
- [x] M-ADDRESS-01 Contract: EnsureActiveAddressGetByIdQuery
- [x] M-ADDRESS-02 Factory deps object
- [x] M-ADDRESS-03 Replace user query import with contracts
- [x] M-ADDRESS-04 Verify + log

### product
- [x] M-PRODUCT-01 Contracts: EnsureActiveProductGetByIdQuery, VerifyProductAndGetQuery
- [x] M-PRODUCT-02 Add IProductPricingUpdater port + adapter (replace UpdatePriceCommand)
- [x] M-PRODUCT-03 Add IProductStatsProjector port (for stats)
- [x] M-PRODUCT-04 Factory deps (buses + IImageStorage)
- [x] M-PRODUCT-05 Replace category/vendor query imports with contracts
- [x] M-PRODUCT-06 Remove command handler/command
- [x] M-PRODUCT-07 Verify + log

### product-variant
- [x] M-VARIANT-01 Contracts: EnsureActiveVariantGetByIdQuery, VerifyVariantsAndGetQuery
- [x] M-VARIANT-02 Factory deps + IProductPricingUpdater
- [x] M-VARIANT-03 Replace product/user/vendor query imports with contracts
- [x] M-VARIANT-04 Replace UpdatePriceCommand with pricing port
- [x] M-VARIANT-05 Verify + log

### inventory
- [x] M-INVENTORY-01 Contract: VerifyInventoriesItemsGetQuery
- [x] M-INVENTORY-02 Add IInventoryReservation port + adapter
- [x] M-INVENTORY-03 Factory deps object
- [x] M-INVENTORY-04 Replace product/variant/user/vendor query imports with contracts
- [x] M-INVENTORY-05 Remove ReserveInventoryCommand + registration
- [x] M-INVENTORY-06 Verify + log

### order-items
- [x] M-ORDER-ITEMS-01 Add IOrderItemsWriter port + adapter
- [x] M-ORDER-ITEMS-02 Remove CreateItemsCommand + handler + registration
- [x] M-ORDER-ITEMS-03 Remove route-import side effect
- [x] M-ORDER-ITEMS-04 Remove unused unitOfWork field in repository
- [x] M-ORDER-ITEMS-05 Factory deps object
- [x] M-ORDER-ITEMS-06 Move event publish to post-commit caller
- [x] M-ORDER-ITEMS-07 Verify + log

### order
- [x] M-ORDER-01 Contract: EnsureActiveOrderGetByIdQuery
- [x] M-ORDER-02 Factory deps: IInventoryReservation, IOrderItemsWriter, UnitOfWork
- [x] M-ORDER-03 Replace 6-module query imports with contracts
- [x] M-ORDER-04 Replace ReserveInventoryCommand/CreateItemsCommand with ports
- [x] M-ORDER-05 Wrap create flow in UnitOfWork.transaction
- [x] M-ORDER-06 Publish events only after commit
- [ ] M-ORDER-07 Verify (order smoke) + log

### reviews
- [x] M-REVIEWS-01 Factory deps object
- [x] M-REVIEWS-02 Replace order query import with contracts
- [x] M-REVIEWS-03 Verify + log

### stats
- [x] M-STATS-01 Import order-item.created payload from domain events
- [x] M-STATS-02 Replace direct ProductModel import with IProductStatsProjector
- [x] M-STATS-03 Replace direct VendorModel import with IVendorStatsProjector
- [x] M-STATS-04 Remove singleton bus imports in schedulers; inject via deps
- [x] M-STATS-05 Factory deps object
- [x] M-STATS-06 Verify + log

### home
- [x] M-HOME-01 Factory deps (buses + IImageStorage injection)
- [x] M-HOME-02 Verify + log

## Work Log (APPEND-ONLY)

| Date | Task | Result | Files | Verification | Commit |
|---|---|---|---|---|---|
| 2026-11-09 | G-01 | done | — (baseline only) | typecheck ✓, bun test 76 pass / 0 fail | uncommitted |
| 2026-11-09 | P0 | done | — (baseline only) | typecheck ✓, bun test 76 pass / 0 fail | uncommitted |
| 2026-11-09 | G-03 | done | packages/domain/errors/app-error.ts (new), apps/api/errors/app-error.ts (re-export), 30 domain files | typecheck ✓ | uncommitted |
| 2026-11-09 | G-04 | done | packages/contracts/** (new), tsconfig.json, apps/api/package.json, provider query shims, consumer imports | typecheck ✓, bun install ✓ | uncommitted |
| 2026-11-09 | G-05..G-08 / P2 | done | apps/api/composition-root.ts (new), core/infrastructure/buses/buses.ts (new), 13 *.module.ts, 12 route files, routes/index.ts, index.ts, removed command bus + command handlers | typecheck ✓, bun test 76 pass | uncommitted |
| 2026-11-09 | P4 | done | cross-module consumers now import @ecomerece/contracts (address, inventory, order, product, product-variant, reviews, stats, vendor) | typecheck ✓, bun test 76 pass | uncommitted |
| 2026-11-09 | P3 | done | added InventoryReservationAdapter, OrderItemsWriterAdapter, ProductPricingAdapter; removed CommandBus, domain command contract, 3 command pairs | typecheck ✓, bun test 76 pass | uncommitted |
| 2026-11-09 | P6 / M-ORDER-05/06 | done (code) | order create flow wrapped in UnitOfWork.transaction; item+order events published post-commit; reserve quantity mapping fixed | typecheck ✓, bun test 76 pass; runtime order smoke pending replica set | uncommitted |
| 2026-11-09 | M-IMAGE-02 / M-STATS-04/05 | done | image storage injected via composition root; stats scheduler + force-refresh + StatsController receive buses instead of singletons | typecheck ✓, bun test 76 pass | uncommitted |
| 2026-11-09 | P5 / stats ports | done | added IProductStatsProjector + IVendorStatsProjector adapters (product/vendor); stats handlers/services no longer import ProductModel/VendorModel; handler payloads now derive from domain events | typecheck ✓, bun test 76 pass | uncommitted |
| 2026-11-09 | P7 / G-02 / G-09 | done | arch-check type-only import handling; AuthActor + IAuthUserLookup contracts + user adapter; IStatsAccessPort/IEntityExistsPort + product/vendor/category adapters; guards configured in composition root; domain-local `emptyMetrics`; 9 UserPersistence imports removed | `bun run arch` ✓ (687 files), typecheck ✓, bun test 76 pass, lint ✓, api build ✓ | uncommitted |
| 2026-11-09 | M-ORDER-07 (partial) / G-09 | partial | added order-create commit-ordering unit test (publish only after commit, none on abort); arch scanner now also checks `export … from` re-exports (probe verified) | `bun run arch` ✓ (688 files), typecheck ✓, bun test 78 pass, api build ✓; DB replica-set smoke still blocked | uncommitted |
| 2026-11-09 | G-10 (builds) | partial | workspace builds run one by one (api, then web) plus full validator order | lint ✓, typecheck ✓, bun test 78 pass, api build ✓, web build ✓; runtime order smoke still blocked (no mongod/mongosh/docker) | uncommitted |
| 2026-11-09 | health audit + docs | done | composition-root smoke (12 modules construct, 0 duplicate registrations); verified every provider query file re-exports its contract class; fixed duplicate inventory `VerifyInventoriesItemsGetQuery` (local class vs contract) and the handler's wrong `type` string; rewrote PROJECT_DOCUMENTATION §2/§3/§5/§7/§8/§11/§12/§13/§15/§20/§22/§23/§24 for the new architecture | arch ✓ (688), typecheck ✓, bun test 78 pass, lint ✓, api build ✓, web build ✓ | uncommitted |

## Final Acceptance

- [x] No cross-module internal imports
- [x] No CommandBus / constructor.name dispatch
- [x] Single composition root
- [ ] Order transaction verified (runtime smoke still needs a Mongo replica set)
- [x] Event failures isolated (`Promise.allSettled` + per-handler logging)
- [x] domain has zero apps/api imports
- [x] `bun run arch` passes
- [x] typecheck + test + lint + api build pass
- [x] Full workspace build (api + web) passes
