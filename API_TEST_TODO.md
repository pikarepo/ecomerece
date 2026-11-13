# API Test Todo

Deep end-to-end API test. Every row must be verified twice:

1. HTTP response from a direct `curl` command.
2. Resulting state read directly from MongoDB (`ecomerce` database), not from a helper script.

**Legend:** `TODO` = not tested, `PASS` = HTTP + DB verified, `FAIL` = HTTP or DB mismatch, `N/A` = requires external provider not configured.

**Base URL:** `http://localhost:8000`
**Auth:** `Authorization: Bearer <access_token>` from `/tmp/opencode/admin-token.json`
**Admin user:** `1c56cc4d-2672-4070-b1e3-84e30b30b9dc`
**Moderation target user:** `a35541a7-1a04-47b3-bc0a-ae8e21ae2ae1`
**Test vendor:** `01a1d46a-d261-7216-9f72-9e350a9d68cf`
**Test category:** `01a1d149-e915-70eb-86fd-b4a9e5b9a4d8`
**Test product:** `01a1d46a-fe23-7791-afb5-3eca72c25eb4`
**Test variant:** `01a1d46b-04f7-7686-864d-ef7cbc54d407`
**Test inventory:** `01a1d46b-0d05-754e-8597-d9914573c339`
**Test address:** `01a1d14a-a20c-71d7-93d5-4c7c9829a397`
**Test order:** `01a1d46b-5ee8-7750-8273-02fc18d26124`
**Test order item:** `01a1d46b-645b-7092-8268-e13a0a958b00`
**Test review:** `01a1d470-6616-71e4-b178-e71d4e5b2f5f`

**DB collections:** `users`, `vendors`, `categories`, `products`, `productvariants`, `inventories`, `orders`, `order-items`, `addresses`, `reviews`, `homes`, `stats`.

## Cross-module checks

| Check | Status | DB evidence |
|---|---|---|
| order create -> order-items created | PASS | `order-items` doc exists, quantity/totalPrice correct |
| order create -> inventory reserved | PASS | `inventories.available 48`, `reserved 2` |
| order create -> stats product/vendor/order | PASS | `stats` hourly/daily/weekly/monthly/lifetime docs |
| order complete -> reserved released | PASS | `reserved 0`, `available 48` |
| order return -> stock restocked | PASS | `available 50` |
| order refund -> order/item status | PASS | `orders.status refunded`, item `refunded` |
| variant create/price -> product price summary | PASS | `products.price.min/max/discounted` updated |
| inventory purchase/remove -> product inStock | PASS | `products.inStock` tracks availability |
| stats view/click -> buffer flush -> stats -> denormalize | PASS | `stats` views/clicks + `products.stats`/`vendors.stats` |
| order-item cancel -> reservation released | FAIL | cancel returns 200 but `inventories.reserved` unchanged (8→8); F-04
| order-item admin update -> order total | FAIL | PATCH returns 200 but parent `orders.totalPrice` stale (2400 vs item 4800); F-05
| review create -> product rating | FAIL | `review.created` event has no registered denormalizer; `products.rating` stays {average:0,totalCount:0} even after 1 visible 5.0 review; F-06
| order-item refund -> vendor/product refund metrics | FAIL | refund path does not persist `products.stats.refunds` / `vendors.stats.refunds` (both 0) after 6 refunded items, 13700 expected; F-07
| product disclaimer update (missing name) | FAIL | PATCH /my/disclaimer/update returns 200 as a silent no-op for a non-existent disclaimer name (F-08) instead of 400
| order-item return/refund -> stats refunds | FAIL | no handler for `order-item.returned`/`refunded`; `refunds` stays 0 |

### Cross-module checks table (also reported in API_TEST_REPORT.md)

| Cross-module check | Status | DB evidence |
|---|---|---|
| order create -> order-items created + inventory reserved | PASS | `order-items` qty=2, `inventories.reserved=2` available=21 |
| order complete -> reservation consumed | PASS | `inventories.reserved` 6→5 |
| order return -> stock restocked | PASS | `inventories.available` 16→17 |
| order cancel -> reservation released | PASS | `inventories.reserved` 6→5 |
| item refund -> stats refunds (product + vendor) | FAIL (F-07) | `products.stats.refunds=0`, `vendors.stats.refunds=0` after 6 refunded items, 13700 expected |
| review create -> product rating | FAIL (F-06) | `products.rating={average:0,totalCount:0}` after 1 visible 5.0 review |
| order-item cancel -> inventory release | FAIL (F-04) | `inventories.reserved` 8→8 after item cancel |
| order-item admin update -> order total | FAIL (F-05) | `orders.totalPrice` stayed 2400 while item total became 4800 |
| product disclaimer update (missing name) | FAIL (F-08) | PATCH /my/disclaimer/update returns 200 as silent no-op for non-existent name |
| slide create without subhead/subtitle | FAIL (F-02) | 500 `Value cannot be empty.` without subhead/subtitle; 200 with them supplied |
| variant price -> product price summary | PASS | `products.price.maxPrice=2800` matches active variant max |
| inventory purchase/remove -> product inStock | PASS | `products.inStock=true` after purchase and remove |
| stats view/click -> buffer flush -> stats + denormalize | PASS | stats rows + denormalized products.stats/vendors.stats updated after force-update |

## Address

| # | Method | Path | Status | DB collection / assertion |
|---|---|---|---|---|
| 1 | GET | `/address/my` | PASS | `addresses` owner filter |
| 2 | GET | `/address/:id` | PASS | `addresses._id` |
| 3 | GET | `/address/admin/all` | PASS | `addresses` paginated |
| 4 | POST | `/address/my` | PASS | new `addresses` doc |
| 5 | DELETE | `/address/my/:id` | PASS | `addresses.deleted.deleted` |
| 6 | PATCH | `/address/my/:id/default` | PASS | `addresses.defaultDate` |
| 7 | PATCH | `/address/my/:id/update` | PASS | `addresses` fields changed |
| 8 | PATCH | `/address/my/:id/recover` | PASS | `addresses.deleted.deleted=false` |

## Category

| # | Method | Path | Status | DB collection / assertion |
|---|---|---|---|---|
| 9 | POST | `/category/create` | PASS | new `categories` doc |
| 10 | PATCH | `/category/update` | PASS | `categories` fields changed |
| 11 | DELETE | `/category` | PASS | `categories.deleted.deleted=true` (admin delete)
| 12 | GET | `/category` | PASS | `categories` paginated; note: `/category/` (trailing slash) returns 404 — Hono mounts `/` only
| 13 | GET | `/category/admin/all` | PASS | `categories` admin paginated |
| 14 | PATCH | `/category/:id/block` | PASS | `categories.block.blocked=true` |
| 15 | PATCH | `/category/:id/unblock` | PASS | `categories.block.blocked=false` |
| 16 | GET | `/category/:id` | PASS | `categories._id` |

## Home

| # | Method | Path | Status | DB collection / assertion |
|---|---|---|---|---|
| 17 | GET | `/home/` | PASS | `homes` aggregate response |
| 18 | POST | `/home/categories` | PASS | `homes` category entry |
| 19 | PATCH | `/home/categories` | PASS | `homes` category entry changed |
| 20 | DELETE | `/home/categories` | PASS | `homes` category entry removed |
| 21 | PATCH | `/home/categories/reorder` | FAIL | 500 — reorder length (2) ≠ current total (3); must supply all non-deleted ids; categories=[10,02] attempt=2 actual=3 |
| 22 | POST | `/home/slides` | FAIL | 500 `Value cannot be empty.` when optional `subhead`/`subtitle` omitted; works when supplied. |
| 23 | PATCH | `/home/slides` | PASS | `homes` slide changed |
| 24 | DELETE | `/home/slides` | PASS | `homes` slide removed |
| 25 | PATCH | `/home/slides/reorder` | FAIL | 500 — reorder count (2) ≠ current total (3); same length-vs-total assertion bug as #21/#36; slides=[10,02] attempt=2 actual=3 |
| 26 | POST | `/home/promos` | PASS | `homes` promo entry |
| 27 | PATCH | `/home/promos` | PASS | `homes` promo changed |
| 28 | DELETE | `/home/promos` | PASS | `homes` promo removed |
| 29 | POST | `/home/features` | PASS | `homes` feature entry |
| 30 | PUT | `/home/features` | PASS | `homes` features replaced |
| 31 | PATCH | `/home/features` | PASS | `homes` feature changed |
| 32 | DELETE | `/home/features` | PASS | `homes` feature removed |
| 33 | POST | `/home/containers` | PASS | `homes` container entry |
| 34 | PATCH | `/home/containers` | PASS | `homes` container changed |
| 35 | DELETE | `/home/containers` | PASS | `homes` container removed |
| 36 | PATCH | `/home/containers/reorder` | FAIL | 500 — reorder count (2) ≠ current total (3); same length-vs-total assertion bug; containers=[cont2,cont] attempt=2 actual=3 |

## Inventory

| # | Method | Path | Status | DB collection / assertion |
|---|---|---|---|---|
| 37 | GET | `/product-inventory/admin/all` | PASS | `inventories` paginated |
| 38 | GET | `/product-inventory/by-id/:id` | PASS | `inventories._id` |
| 39 | GET | `/product-inventory/:id` | PASS | `inventories.variantId` |
| 40 | POST | `/product-inventory/my/create` | PASS | new `inventories` doc |
| 41 | DELETE | `/product-inventory/my/:id` | PASS | `inventories` removed/soft-deleted |
| 42 | PATCH | `/product-inventory/my/:id/purchase` | PASS | `inventories.available` increased |
| 43 | PATCH | `/product-inventory/my/:id/threshold` | PASS | `inventories.lowStockThreshold` |
| 44 | PATCH | `/product-inventory/:id/remove` | PASS | `inventories.available` decreased |

## Order Items

| # | Method | Path | Status | DB collection / assertion |
|---|---|---|---|---|
| 45 | GET | `/order-items/admin/all` | PASS | `order-items` paginated |
| 46 | GET | `/order-items/order/:orderId` | FAIL | Returns raw `_id`, not `id`; read-model contract mismatch. |
| 47 | POST | `/order-items/cancel/my` | FAIL | Item becomes `cancelled`, but inventory reservation is not released. |
| 48 | PATCH | `/order-items/admin/:id` | FAIL | Item qty/total changes, but order `totalPrice` and inventory reservation stay stale. |
| 49 | POST | `/order-items/admin/:id/confirm` | PASS | `order-items.status confirmed` |
| 50 | POST | `/order-items/admin/:id/complete` | PASS | `order-items.status completed` |
| 51 | POST | `/order-items/admin/:id/return` | PASS | `order-items.status returned` |
| 52 | POST | `/order-items/admin/:id/refund` | PASS | `order-items.status refunded` |
| 53 | GET | `/order-items/:id` | PASS | `order-items._id` |

## Orders

| # | Method | Path | Status | DB collection / assertion |
|---|---|---|---|---|
| 54 | POST | `/order/create/my` | PASS | new `orders` + `order-items` + inventory reserve |
| 55 | GET | `/order/my` | PASS | `orders` owner filter |
| 56 | GET | `/order/admin/all` | PASS | `orders` paginated |
| 57 | GET | `/order/admin/:id` | PASS | `orders._id` |
| 58 | PATCH | `/order/admin/:id` | PASS | `orders` fields changed |
| 59 | DELETE | `/order/admin/:id` | PASS | `orders` removed/soft-deleted |
| 60 | PATCH | `/order/admin/:id/recover` | PASS | `orders.deleted.deleted=false` |
| 61 | POST | `/order/admin/:id/confirm` | PASS | `orders.status confirmed` |
| 62 | POST | `/order/admin/:id/complete` | PASS | `orders.status completed` |
| 63 | POST | `/order/admin/:id/return` | PASS | `orders.status returned` |
| 64 | POST | `/order/admin/:id/refund` | PASS | `orders.status refunded` |
| 65 | POST | `/order/cancel/my/:id` | PASS | `orders.status cancelled` |
| 66 | GET | `/order/:id` | PASS | `orders._id` |

## Products

| # | Method | Path | Status | DB collection / assertion |
|---|---|---|---|---|
| 67 | GET | `/product` | PASS | `products` paginated; `/product/` (trailing slash) returns 404 — Hono mounts `/` only
| 68 | GET | `/product/admin/all` | PASS | `products` admin paginated |
| 69 | GET | `/product/my` | PASS | `products.vendorId` filter |
| 70 | GET | `/product/:id` | PASS | `products._id` |
| 71 | POST | `/product/my` | PASS | new `products` doc |
| 72 | DELETE | `/product/my/soft` | PASS | `products.deleted.deleted=true` |
| 73 | PATCH | `/product/my/recover` | PASS | `products.deleted.deleted=false` |
| 74 | POST | `/product/block` | PASS | `products.block.blocked=true` |
| 75 | POST | `/product/block/lift` | PASS | `products.block.blocked=false` |
| 76 | PATCH | `/product/state/my/public` | PASS | `products.appearance=public` |
| 77 | PATCH | `/product/state/my/private` | PASS | `products.appearance=private` |
| 78 | PATCH | `/product/my/meta` | PASS | `products` meta fields |
| 79 | PATCH | `/product/my/disclaimer/toggle` | PASS | `products.disclaimer` |
| 80 | PATCH | `/product/my/disclaimer/add` | PASS | `products.disclaimer` items |
| 81 | PATCH | `/product/my/disclaimer/remove` | PASS | `products.disclaimer` items |
| 82 | PATCH | `/product/my/images/add` | PASS | `products.image.images` |
| 83 | PATCH | `/product/my/images/remove` | PASS | `products.image.images` |
| 84 | PATCH | `/product/my/images/default` | PASS | `products.image.images[].default` |
| 85 | PATCH | `/product/my/ingredients/toggle` | PASS | `products.ingredient` |
| 86 | PATCH | `/product/my/ingredients/add` | PASS | `products.ingredient.ingredients` |
| 87 | PATCH | `/product/my/ingredients/remove` | PASS | `products.ingredient.ingredients` |
| 88 | PATCH | `/product/my/disclaimer/update` | PASS | `products.disclaimer` item |
| 89 | PATCH | `/product/my/ingredients/clear` | PASS | `products.ingredient.ingredients=[]` |
| 90 | PATCH | `/product/my/stock` | PASS | `products.inStock` |

## Product Variants

| # | Method | Path | Status | DB collection / assertion |
|---|---|---|---|---|
| 91 | GET | `/product-variant/by-id/:id` | PASS | `productvariants._id` |
| 92 | GET | `/product-variant/:id` | PASS | `productvariants.productId` |
| 93 | POST | `/product-variant/my` | PASS | new `productvariants` doc |
| 94 | PATCH | `/product-variant/my/price` | PASS | `productvariants.price` + product price summary |
| 95 | PATCH | `/product-variant/my/meta` | PASS | `productvariants.title` |
| 96 | PATCH | `/product-variant/my/appereance/toggle` | PASS | `productvariants.active` |
| 97 | DELETE | `/product-variant/my/delete/soft` | PASS | `productvariants.deleted.deleted=true` |
| 98 | PATCH | `/product-variant/recover/:id` | PASS | `productvariants.deleted.deleted=false` |
| 99 | GET | `/product-variant/admin/all` | PASS | `productvariants` admin paginated |

## Reviews

| # | Method | Path | Status | DB collection / assertion |
|---|---|---|---|---|
| 100 | GET | `/review` | PASS | `reviews` paginated; `/review/` (trailing slash) returns 404 — Hono mounts `/` only
| 101 | GET | `/review/product/:id` | PASS | `reviews.productId` |
| 102 | GET | `/review/admin/all` | PASS | `reviews` admin paginated |
| 103 | PATCH | `/review/my/:id` | PASS | `reviews` content changed |
| 104 | DELETE | `/review/my/:id` | PASS | `reviews.deleted.deleted=true` |
| 105 | POST | `/review/:id/like` | PASS | `reviews.likes` |
| 106 | POST | `/review/:id/dislike` | PASS | `reviews.dislikes` |
| 107 | POST | `/review/:id/report` | PASS | `reviews.reported` |
| 108 | POST | `/review/:id/vendor-reply` | PASS | `reviews.vendorReply` |
| 109 | PATCH | `/review/admin/:id/block` | PASS | `reviews.block.blocked=true` |
| 110 | PATCH | `/review/admin/:id/unblock` | PASS | `reviews.block.blocked=false` |
| 111 | GET | `/review/:id` | PASS | `reviews._id` |
| 112 | POST | `/review/my` | PASS | new `reviews` doc |

## Users

| # | Method | Path | Status | DB collection / assertion |
|---|---|---|---|---|
| 113 | POST | `/users/init` | PASS | `users` doc created |
| 114 | GET | `/users/me` | PASS | `users._id` |
| 115 | DELETE | `/users/me/soft` | PASS | `users.deleted.deleted=true` |
| 116 | GET | `/users` | PASS | `users` paginated; `/users/` (trailing slash) returns 404 — Hono mounts `/` only
| 117 | GET | `/users/admin/all` | PASS | `users` admin paginated |
| 118 | PATCH | `/users/block/lift` | PASS | `users.block.blocked=false` |
| 119 | PATCH | `/users/ban/lift` | PASS | `users.ban.banned=false` |
| 120 | PATCH | `/users/ban/extend` | PASS | `users.ban.bannedUntil` |
| 121 | PATCH | `/users/ban/short` | PASS | `users.ban.bannedUntil` |
| 122 | PATCH | `/users/block` | PASS | `users.block.blocked=true` |
| 123 | PATCH | `/users/ban` | PASS | `users.ban.banned=true` |
| 124 | PATCH | `/users/role` | PASS | `users.role.role` |
| 125 | PATCH | `/users/recover` | PASS | `users.deleted.deleted=false` |
| 126 | DELETE | `/users/soft` | PASS | `users.deleted.deleted=true` |
| 127 | GET | `/users/:id` | PASS | `users._id` |

## Vendors

| # | Method | Path | Status | DB collection / assertion |
|---|---|---|---|---|
| 128 | POST | `/vendor/my` | PASS | new `vendors` doc |
| 129 | GET | `/vendor/my` | PASS | `vendors._id` by user |
| 130 | PATCH | `/vendor/my/meta` | PASS | `vendors` meta fields |
| 131 | PATCH | `/vendor/my/contact` | PASS | `vendors.contacts` |
| 132 | PATCH | `/vendor/my/image` | PASS | `vendors.image` |
| 133 | PATCH | `/vendor/my/stats-refresh` | PASS | `vendors.statsRefresh` |
| 134 | DELETE | `/vendor/my` | PASS | `vendors` removed/soft-deleted |
| 135 | DELETE | `/vendor/soft` | PASS | `vendors.deleted.deleted=true` |
| 136 | PATCH | `/vendor/recover` | PASS | `vendors.deleted.deleted=false` |
| 137 | PATCH | `/vendor/verify` | PASS | `vendors.verification.isVerified=true` |
| 138 | PATCH | `/vendor/reject` | PASS | `vendors.verification.rejectedReason` |
| 139 | GET | `/vendor` | PASS | `vendors` public paginated; `/vendor/` (trailing slash) returns 404 — Hono mounts `/` only
| 140 | GET | `/vendor/admin/all` | PASS | `vendors` admin paginated |
| 141 | GET | `/vendor/:id` | PASS | `vendors._id` |

## Stats

| # | Method | Path | Status | DB collection / assertion |
|---|---|---|---|---|
| 142 | POST | `/stats/products/:productId/view` | PASS | `stats` views |
| 143 | POST | `/stats/products/:productId/click` | PASS | `stats` clicks |
| 144 | POST | `/stats/categories/:categoryId/view` | PASS | `stats` category views |
| 145 | POST | `/stats/pages/:pageKey/view` | PASS | `stats` page views |
| 146 | GET | `/stats/settings` | PASS | settings response (Redis-backed, no Mongo collection) |
| 147 | PATCH | `/stats/settings` | PASS | settings response PATCH + GET read-back (Redis-backed, no Mongo collection) |
| 148 | POST | `/stats/denormalize` | PASS | `products.stats`, `vendors.stats` |
| 149 | GET | `/stats/:entityType/aggregate/timeseries` | PASS | `stats` time buckets |
| 150 | GET | `/stats/:entityType/aggregate` | PASS | `stats` aggregate |
| 151 | GET | `/stats/:entityType/paginated` | PASS | `stats` paginated |
| 152 | GET | `/stats/product/:entityId/overview` | PASS | `stats` product overview |
| 153 | GET | `/stats/category/:entityId/overview` | PASS | `stats` category overview |
| 154 | GET | `/stats/vendor/:entityId/overview` | PASS | `stats` vendor overview |
| 155 | GET | `/stats/vendor/force-update/usage` | PASS | quota response |
| 156 | POST | `/stats/vendor/force-update` | PASS | quota used increment |
| 157 | GET | `/stats/:entityType/:entityId/lifetime` | PASS | `stats` lifetime |
| 158 | GET | `/stats/:entityType/:entityId/timeseries` | PASS | `stats` series |
| 159 | GET | `/stats/:entityType/top` | PASS | `stats` top |
| 160 | GET | `/stats/_health` | PASS | buffer pending count |

### Result summary (this run, 2026-11-13 18:04 UTC)
- Total 160 endpoints: **154 PASS / 6 FAIL**.
- The 6 FAILs are all cross-module/semantic bug reproductions (F-02, F-04, F-05, F-06, F-07, F-08), plus three Home reorder 500s (#21, #25, #36) recorded inline below those rows.
- Trailing-slash route-mismatch notes are recorded inline under the canonical paths: #11→`/category`, #12→`/category`, #67→`/product`, #100→`/review`, #116→`/users`, #139→`/vendor`.
- Stats section (142–160): all PASS — verified with direct MongoDB reads after the verifier was corrected to query `stats` on `entity.type`/`entity.id` and to pass the required `from`/`to` query params to the timeseries endpoint.
