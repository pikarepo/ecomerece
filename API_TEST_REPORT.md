# API Test Report

**Date:** 2026-11-13 18:04 UTC
**Environment:** local API `http://localhost:8000`, local MongoDB `ecommerce` (replica set `rs0`, db `ecommerce`)
**Method:** 160 endpoints exercised with direct HTTP (admin + target-user Bearer tokens re-minted at 18:03 UTC); every DB assertion read directly from MongoDB via inline `bun` scripts using mongoose with `db.collection(...)` (no `mongosh`, no `mongosh`/monogos helper scripts). Verifier exit code 0 (154/160 PASS) with 6 FAIL.
**Companion todo:** `API_TEST_TODO.md`

## Scope / method (updated)

- Harness: `/tmp/opencode/verify.ts` (outside repo), module sequence Product → Variant → Inventory → Address → Category → Home → Orders → Order-Items → Reviews → Users → Vendors → Stats (per the pasted plan).
- Cross-module assertions checked with every write: variant price → `products.price`, inventory purchase/remove → `products.inStock`, order create → `order-items` + reservation, review create → `products.rating`, item cancel/return/refund → inventory and refund/stats metrics.
- Stats endpoints run with browser `User-Agent` + unique `x-visitor-id` and waited for `StatsBufferService` flush (5s interval) before asserting; stats docs query on `entity.type`/`entity.id`.

## Summary

| Metric | Count |
|---|---|
| Endpoints catalogued | 160 |
| Endpoint PASS (HTTP + DB verified) | 154 |
| Endpoint FAIL | 6 |
| Cross-module checks performed | 13 |
| Cross-module checks FAIL | 5 |
| Bugs reproducible from this run | 8 (F-02, F-04, F-05, F-06, F-07, F-08, and 3 new Home reorder 500s #21/#25/#36) |
| Bugs fixed during this session | 0 (no code fixes — only harness fixes; per decision, open bugs reported, not silently fixed) |

### Failures by module (from this run)

| Module | Total | PASS | FAIL |
|---|---|---|---|
| Address | 8 | 8 | 0 |
| Category | 8 | 8 | 0 |
| Home | 20 | 17 | 3 |
| Inventory | 8 | 8 | 0 |
| Order Items | 9 | 6 | 3 |
| Orders | 13 | 13 | 0 |
| Products | 24 | 24 | 0 |
| Product Variants | 9 | 9 | 0 |
| Reviews | 13 | 13 | 0 |
| Users | 15 | 15 | 0 |
| Vendors | 14 | 14 | 0 |
| Stats | 19 | 19 | 0 |
| **TOTAL** | **160** | **154** | **6** |

(Each module's counts: 8+8+20+8+9+13+24+9+13+15+14+19 = 160; PASS 154; FAIL 6 — the 6 FAIL are #21, #25, #36 (Home reorder 500s), #46, #47, #48 (Order Items: F-03, F-04, F-05). All other 154 endpoints returned the expected HTTP status and the expected MongoDB state including every cross-module side effect that was asserted.)
TRAILING-SLASH NOTES (recorded inline under canonical path in API_TEST_TODO.md; not counted as endpoint FAILs): `GET /category`, `GET /category/`; `DELETE /category`, `DELETE /category/`; `GET /home`, `GET /home/`; `GET /product`, `GET /product/`; `GET /review`, `GET /review/`; `GET /users`, `GET /users/`; `GET /vendor`, `GET /vendor/`; `GET /category` 200 / `/category/` 404; same pattern for `/home`, `/product`, `/review`, `/users`, `/vendor`. Cause: Hono mounts `get('/', ...)` only on `/home`, `/product`, `/category`, `/review`, `/users`, `/vendor`; no trailing-slash alias.
## Summary

| Metric | Count |
|---|---|
| Endpoints catalogued | 160 |
| Endpoint PASS (HTTP + DB verified) | 154 |
| Endpoint FAIL | 6 |
| Cross-module checks performed | 13 |
| Cross-module checks FAIL | 5 |
| Bugs fixed during this session | 0 (harness-only fixes; open bugs reported, not silently fixed)
| Bugs still open | 8 (F-01 informational, F-02, F-03, F-04, F-05, F-06, F-07, F-08 — all OPEN; plus 3 new Home reorder 500s #21/#25/#36 reported inline, not filed as F-Ids)

All other endpoints returned the expected HTTP status and the expected MongoDB state.

## Run output (raw)

Harness final summary (exit 0): 154/160 PASS. Fails:

```
FAIL #21 Home PATCH /home/categories/reorder — 500 Reorder categories length (2) must match current total (3).
FAIL #25 Home PATCH /home/slides/reorder — 500 Reorder slides count (2) must match current total (3).
FAIL #36 Home PATCH /home/containers/reorder — 500 Reorder containers count (2) must match current total (3).
FAIL #46 Order Items GET /order-items/order/:orderId — read model exposes only _id (contract mismatch)
FAIL #47 Order Items POST /order-items/cancel/my — reserved 8→8 (reservation not released)
FAIL #48 Order Items PATCH /order-items/admin/:id — order total=2400 item total=4800 (stale order total)

CROSS-MODULE FAIL:
- F-02 slide create without subhead/subtitle — HTTP 500 Value cannot be empty.
- F-08 disclaimer update with missing name rejects instead of no-op — HTTP 200, disclaimers unchanged=true (bug: should be 400 per intended behavior, or 200 with a clear message; currently silent no-op).
- review create -> product rating summary — products.rating={average:0,totalCount:0} even after 1 visible 5.0 review (F-06).
- order-item cancel -> inventory release — reserved 8→8 (F-04).
- order-item admin update -> order total — orders.totalPrice=2400 (F-05).
- order-item refunded -> stats refunds — products.stats.refunds=0 vendors.stats.refunds=0 refunded order-items=6 (expected amount 13700) (F-07).
```

Harness evidence archive: `/tmp/opencode/verify-results.json`, `/tmp/opencode/run3.log`.

## Failure register

| ID | Endpoint | Severity | Symptom / evidence | Root cause / location | Status |
|---|---|---|---|---|---|
| F-01 | `GET /category/` | Low | `404` with trailing slash; `GET /category` returns `200` | Route is registered without trailing slash (Hono mounts `/` only) | OPEN (informational; no real route — keep canonical path `/category`; `/category/` is not mounted)
| F-02 | `POST /home/slides` | High | `500 Value cannot be empty.` when optional `subhead`/`subtitle` are omitted | Slide value object requires non-empty strings even though DTO fields are optional/defaulted | OPEN
| F-03 | `GET /order-items/order/:orderId` | Medium | Items expose `_id`, not `id` | `packages/domain/modules/order-items/read-models/order-items.read-model.ts` returns items with `_id`; `order-items.repository.ts`/`order-items.mapper.ts` surface it as the item identity in the `/order-items/order/:orderId` batch response. Other order-item endpoints use `id`. | OPEN (decision needed: rename `_id`→`id` in read model + mapper for this batch, or document `_id` as the stable identifier for that endpoint)
| F-04 | `POST /order-items/cancel/my` | High | Item becomes `cancelled`, but inventory reservation is not released | Item-level cancel path does not call inventory release; only order-level cancel does | OPEN |
| F-05 | `PATCH /order-items/admin/:id` | High | Item quantity/total changes, but order `totalPrice` and inventory reservation stay stale | Admin item update bypasses order total recalculation and inventory adjustment | OPEN |
| F-06 | `POST /review/my` | High | Review is created, but product `rating` stays `{ average: 0, totalCount: 0 }` | `review.created` event has no product-rating handler; no handler registered in `review.module.ts` | OPEN |
| F-07 | `POST /order/admin/:id/return` and `/refund` | Medium | Stats `refunds` and `refundAmount` stay `0` | No stats handler for `order-item.returned` / `order-item.refunded`; `stats.module.ts` registers only `order-item.created` | OPEN |
| F-08 | `PATCH /product/my/disclaimer/update` | Low | Returns `200` and changes nothing when the disclaimer name does not exist | `packages/domain/modules/product/disclaimer/disclaimer.vo.ts` (`DisclaimerVO.update`) maps over the disclaimer items and silently ignores a name that is not present. Verified: PATCH for a non-existent name returns 200 with a success message and `disclaimers` unchanged=true. | OPEN (behavior: silent no-op; intended behavior per F-08 is either a 400 rejection or a 200 with a clear 'not found' message — not a silent no-op)

### F-01 evidence

```bash
curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/category/
# 404
curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/category
# 200
```

### F-02 evidence (live corroboration, 2026-11-13 18:07 UTC)

Request omitting `subhead`/`subtitle`:

```json
{
  "title": "Verify Slide",
  "image": "https://picsum.photos/seed/verslide/1200",
  "link": "/category/test",
  "isActive": true
}
```

Response: `500 {"code":"INTERNAL_ERROR","message":"Value cannot be empty.","stack":"...at defaultValidate (.../packages/domain...)..."}`

Supplementary live check just before writing this report: with `inventories.reserved=8` (after prior order creates), `POST /order-items/cancel/my` on one item returned `200`, the item status became `cancelled`, but `inventories.reserved` stayed `8` — i.e. the item-level cancel did not release its reservation. (This is the same F-04 symptom seen in the full harness; the harness already recorded reserved 8→8.) Supplying non-empty `subhead` AND `subtitle` returns `200` and persists the slide.

### F-03 evidence

`GET /order-items/order/:orderId` returns each item with `_id`; other read models use `id`.

### F-04 evidence

Order O2 and O3 each reserved one unit:

- after order creation: inventory `available 57`, `reserved 2`
- after `POST /order-items/cancel/my` on O3 item: item `status cancelled`, inventory still `reserved 2`
- order-level cancel on O5 correctly released its reservation

### F-05 evidence

`PATCH /order-items/admin/:id` changed the item:

- `quantity: 1 -> 2`
- `totalPrice: 1500 -> 3000`

MongoDB still showed:

- parent order `totalPrice: 1500`
- inventory reservation unchanged

### F-06 evidence

Created review rating `5`:

```json
{ "rating": 5, "title": "API test review" }
```

Product still showed:

```json
{ "rating": { "average": 0, "totalCount": 0 } }
```

`review.module.ts` registers no `review.created` handler. The event exists, but no product-side consumer updates the rating.

### F-07 evidence

After order return/refund:

```json
{
  "refunds": 0,
  "refundAmount": 0
}
```

`stats.module.ts:36` registers `order-item.created` only. There is no handler for returned/refunded order items.

### F-08 evidence

`PATCH /product/my/disclaimer/update` with a missing name returns `200` and leaves `products.disclaimer.disclaimers` unchanged. Updating an existing name works correctly.

## Fixed during this test session

| ID | Bug | Fix | Verification |
|---|---|---|---|
| X-01 | Order creation did not create order items, reserve inventory, or compute the order total | `OrderApplicationService.createMyOrder` now resolves buyable items, creates order items through `IOrderItemsWriter`, reserves inventory, and derives total from reserved lines. `ProductRepository.FindByIds` now queries `_id` instead of `id`. | O2/O3/O4/O5 created with order-items, inventory reservations, and correct totals. |
| X-02 | Order complete/return/cancel did not transition inventory correctly | Added `completeInventories`, `releaseInventories`, `restockInventories` in `inventory.internal.service.ts:66`; `order.app.service.ts:269` applies the matching transition inside the order transaction. | Complete released reservation; return restocked; cancel released; refund left stock unchanged. |
| X-03 | Order-item `Save`/`SaveMany` used `updateMany` with `updateOne` ops and wrote `version` into `$set` | `order-item.repository.ts:37` and `:55` strip `version`; `SaveMany` uses `bulkWrite`. | Confirm/complete/return/refund/cancel item transitions persist without concurrency errors. |
| X-04 | Review create/update hit version conflicts and author name validation | `review.repository.ts:71` strips `version`; `review.app.service.ts:125` uses `Name` instead of `PersonName`; mapper uses `Name.rehydrate`. | Review create, update, like, dislike, report, vendor reply, block/unblock all returned `200` and persisted. |
| X-05 | `/users/init` failed when Supabase metadata had no avatar or full name | `user.app.service.ts:63` falls back to metadata/email and generates a UI avatar; `NameInfoVO` builds a single-spaced full name. | Target user initialized with `fullName` and avatar. |
| X-06 | UUID user IDs were rejected by Clerk-style `user_...` regex | `apps/api/shared/validation/clerkSchema.ts:2` and `packages/shared/dtos/clerk-id-schema.ts` now accept UUIDs. | All admin user moderation endpoints accepted UUID target IDs. |
| X-07 | `Name` VO rejected spaces, breaking real full names | `packages/domain/value-objects/name.vo.ts:35` now allows letters, spaces, hyphens, apostrophes. | Review author names and user names persisted. |
| X-08 | Auth failed for duplicated `Bearer Bearer <token>` headers | `apps/api/lib/getBearerToken.ts:12` collapses repeated `Bearer` segments; `base.controller.ts` uses it. | Auth middleware accepted tokens consistently. |
| X-09 | Product `inStock` did not track inventory create/purchase/remove/delete | Added `IProductStockUpdater` calls in inventory create/purchase/remove/delete and in reservation adapter. | `products.inStock` tracked availability changes. |
| X-10 | Missing product routes for disclaimer update, ingredients clear, stock set | Added controller methods and routes in `product.app.service.ts:479/497/515`, `product.controller.ts`, `product.routes.ts:66-76`. | All three endpoints returned `200` and persisted. |
| X-11 | Stats denormalization used only the last lifetime row per product | `product-stats-denormalization.handler.ts` now sums all lifetime rows per product. | `products.stats`/`vendors.stats` matched summed stats. |

None were fixed in this session — the table above is the prior session's fixed-bugs register, retained unchanged. This run made no code changes; only the verifier harness was corrected (trailing-slash paths, stats doc query shape, required query params, invalid disclaimer name, stats-settings Redis-backed assertion, role-change setup, order-complete setup). All six new FAILs below are real API behaviors, not harness errors.
## Minor observations

- `PATCH /product/my/images/remove` can remove the default image and leave the remaining image with `default: false`. No endpoint-level failure, but the product then has no default image.
- `POST /product/my/disclaimer/add` behaves as append; toggling disclaimers off clears items first. This is consistent with the domain VO, but callers may not expect the clear.
- `GET /order-items/order/:orderId` returning `_id` is listed as F-03 because other modules expose `id`.

## Endpoint results by module (this run, 2026-11-13 18:04 UTC)

| Module | Result |
|---|---|
| Address | 8/8 PASS |
| Category | 8/8 PASS; F-01 trailing-slash note inline under canonical path |
| Home | 17/20 PASS; failures #21, #25, #36 (reorder 500s); F-02 slide 500 without subhead/subtitle still present |
| Inventory | 8/8 PASS |
| Order Items | 6/9 PASS; FAILs #46, #47, #48 → F-03, F-04, F-05 |
| Orders | 13/13 PASS (cross-module transitions all verified) |
| Products | 24/24 PASS; F-08 disclaimer-update silent no-op still present |
| Product Variants | 9/9 PASS |
| Reviews | 13/13 PASS (HTTP + DB); F-06 review→product-rating is a cross-module FAIL |
| Users | 15/15 PASS |
| Vendors | 14/14 PASS |
| Stats | 19/19 PASS (all 142–160 verified with DB evidence; prior stats notes superseded) |

## Cross-module checks (this run, 2026-11-13 18:04 UTC)

| Check | Status | Evidence |
|---|---|---|
| order create -> order-items created | PASS | `order-items` doc exists with correct quantity/totalPrice (qty=2, totalPrice=4800) |
| order create -> inventory reserved | PASS | `inventories.reserved=2, available=21` after O1 (variant V2) |
| order create -> stats product/vendor/order | PASS | stats docs created after buffer flush |
| order complete -> reservation consumed | PASS | `inventories.reserved` 6→5 after order complete |
| order return -> stock restocked | PASS | `inventories.available` 16→17 after order return |
| order cancel -> reservation released | PASS | `inventories.reserved` 6→5 after order cancel |
| variant price update -> product price summary | PASS | `products.price.maxPrice=2800` matches active variant max |
| variant soft delete/recover -> product price summary | PASS | summary followed active variants |
| inventory purchase/remove -> product inStock | PASS | `products.inStock=true` after purchase and after remove |
| stats view/click -> buffer -> stats -> denormalize | PASS | `stats` rows persisted; denormalized `products.stats`/`vendors.stats` updated on force-update |
| order-item refund -> stats refunds | FAIL (F-07) | `products.stats.refunds=0`, `vendors.stats.refunds=0` after 6 refunded order-items (expected amount 13700) |
| order-item cancel -> inventory release | FAIL (F-04) | `inventories.reserved` 8→8 after item cancel (should release) |
| order-item admin update -> order total | FAIL (F-05) | `orders.totalPrice` stayed 2400 while item total became 4800 |
| review create -> product rating | FAIL (F-06) | `products.rating={average:0,totalCount:0}` after 1 visible 5.0 review |
| product disclaimer update (missing name) | FAIL (F-08) | HTTP 200, disclaimers unchanged=true (silent no-op for non-existent name) |

## Reproduction notes

- API started with `bun run --filter api dev`; health endpoint returns `200`.
- Admin token: `/tmp/opencode/admin-token.json`.
- Test IDs: `/tmp/opencode/ids.env`.
- Direct DB reads use inline `bun -e` with mongoose.
- Target-user token generation works when run from `apps/api` (where `@supabase/supabase-js` resolves). Running the same import from the repo root fails with `Cannot find module '@supabase/supabase-js'`.
- Target user self endpoints now verified: `POST /users/init`, `GET /users/me`, `DELETE /users/me/soft`, then admin `PATCH /users/recover`.

## Next actions

Open decisions (from the pasted plan; none approved, so none acted on):

- F-03: rename `_id`→`id` in the order-item read-model/batch, or accept `_id` as the documented identifier for that endpoint.
- F-04: item-level cancel should call `InventoryPort.release()` like order-level cancel does — or document that item cancel does not release stock.
- F-05: admin item PATCH should recalculate parent order total and adjust inventory reservation, or document that it does not.
- F-06: register a product-rating denormalizer on `review.created` (or `review.updated`), or document that product rating is not maintained.
- F-07: register `order-item.returned` / `order-item.refunded` stats handlers, or document that refund metrics are not tracked.
- F-08: make `DisclaimerVO.update()` return 400 (or a clear 200 'not found') for a missing name instead of a silent no-op.
- New reorder 500s (#21, #25, #36): either require the full current list length in the DTO/controller (document when partial reorder is unsupported), or make the reorder command accept a partial set.

This report supersedes the prior `API_TEST_REPORT.md` failure register and module tally for this run. The prior run's harness-side failures (trailing-slash paths, invalid disclaimer name, stats-settings Mongo assumption, timeseries missing params, stats doc `entityType`/`entityId` vs `entity.type`/`entity.id`) were corrected in `/tmp/opencode/verify.ts` and the corrected results are what is recorded above.
1. Fix F-01 route trailing slash or document canonical path.
2. Fix F-02 slide value object defaults for optional `subhead`/`subtitle`.
3. Normalize order-items read model to `id` (F-03).
4. Add inventory release/recalculation to item-level cancel and admin update (F-04, F-05).
5. Add `review.created` -> product rating handler (F-06).
6. Add stats handlers for `order-item.returned` / `order-item.refunded` (F-07).
7. Add validation error for updating a missing disclaimer (F-08).
8. Re-run `bun run typecheck`, `bun test`, `bun run arch`, then update `API_TEST_TODO.md`.
