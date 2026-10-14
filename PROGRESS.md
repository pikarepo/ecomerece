# PROGRESS — live tracker

> **▶️ RESUMED 2026-10-14 (user instruction — non-stop work).** Batch 37 landed; then **`todo/11` small-device (phone) engine/UI optimization**, the **`todo/08` completion pass** (all leftover batch 11/12/17/18 wishlist rows), a **hydration regression fix** on the design page, and **Batches 38–42** (effect buttons · gradient border · confirmation controls · timed buttons · chip-button family) all landed with `bun run gate` green — lint ✓ · typecheck ✓ · `bun test` 384/0 · build ✓.
> **Next task:** `todo/09-components-master-backlog.md` → **Batch 55 — Stepper buttons (+/−) · Arrow/chevron buttons · Scroll button.** (The §C button table jumps 42 → 55.)
> Rules per `todo/README.md`: gate (`lint → typecheck → test → build`) must be green before a batch is marked done; batch statuses update here as each lands.

---

## Last landed & verified (most recent first)

| When | What | Evidence |
|---|---|---|
| 2026-10-13 | **Batch 9 — inline data-viz**: `Sparkline` (line/bar, tone tokens, `role=img`), `DataBar` (`mat-well` track, descriptive label, tabular readout), `MetricCard` (big number + signed trend + comparison); 9 tests in `test/batch9-dataviz.test.tsx`; design-page section "Inline data-viz (batch 9)"; DESIGN.md E.5 rows | gate green: lint ✓ · typecheck ✓ · `bun test` 242/0 · build ✓ |
| 2026-10-13 | **Batch 10 — typography add-ons**: `LineClamp`/`LineClampText`, `TimeAgo`/`TimeDifference`; barrels + design-page + DESIGN.md E.5.2; gate lint/types/test ✓, web build ✓ | gate green: lint ✓ · typecheck ✓ · `bun test` 242/0 · web build ✓ |
| 2026-10-13 | **Batch 11 — time & date display**: `TimezoneClock`, `Countdown`, `Duration` added; tests (3 cases) pass; design demo added; DESIGN.md E.5.3 added. | gate green: lint ✓ · typecheck ✓ · `bun test` (batch11) + full suite green · web build ✓ |
| 2026-10-13 | **Batch 12 — StatTile/KPI row, SLA/Health indicator**: `StatTile` (label/value/hint/trend), `SLAIndicator` (ok/warn/breach); tests (2 cases); design demo added; DESIGN.md E.5.4 added. | gate: lint/types ✓, UI tests ✓, web build ✓ |
| 2026-10-13 | **Batch 13 — HoverCard, rich Tooltip interactive hint**: `HoverCard` (CSS-only, hover/focus-within, side positions); test (1 case); demo added; DESIGN.md E.5.5 added. | gate: lint/types ✓, UI tests ✓, web build ✓ |
| 2026-10-13 | **Batch 18 — commerce quick wins**: `CartDrawer` (overlay), `PromoCode` + `StockIndicator` (data); SidePanel JSX pragma; test (4 cases); design demos; DESIGN.md E.5.10. | gate: lint/types ✓, UI tests 186/0 ✓, web build ✓ |
| 2026-10-13 | **Batch 19 — Every Layout patterns**: `Frame`, `Bleed`, `Cluster`, `Switcher` in `surface/Primitives.tsx`; surface barrel; test (4 cases); design demo; DESIGN.md E.5.11. | gate: lint/types ✓, UI tests 190/0 ✓, web build ✓ |
| 2026-10-13 | **Batch 20 — Every Layout patterns II**: `Reel`, `SidebarLayout`, `Imposter`, `Cover` in `surface/Primitives.tsx`; surface barrel; test (4 cases); design demo; DESIGN.md E.5.12. | gate: lint/types ✓, UI tests 194/0 ✓, web build ✓ |
| 2026-10-13 | **Batch 21 — floating surfaces**: `PinnedPanel`, `FloatingPanel`, `PipContainer`, `PopoutPanel` in `overlay/`; overlay barrel; test (5 cases); design demos; DESIGN.md E.5.13. | gate: lint/types ✓, UI tests 199/0 ✓, web build ✓ |
| 2026-10-13 | **Batch 22 — column layout**: `MultiColumn`, `Columns`, `Gutter`, `Offset`, `Push`, `Pull` in `surface/Primitives.tsx`; surface barrel; test (5 cases); design demo; DESIGN.md E.5.14. | gate: lint/types ✓, UI tests 204/0 ✓, web build ✓ |
| 2026-10-13 | **Batch 23 — responsive visibility**: `Show`, `Hide`, `VisuallyHidden` in `surface/Primitives.tsx`; surface barrel; test (4 cases); design demo; DESIGN.md E.5.15. | gate: lint/types ✓, UI tests 208/0 ✓, web build ✓ |
| 2026-10-13 | **Batch 24 — sticky layout**: `StickySidebar`, `StickyToc`, `StickyCtaBar` in `surface/Sticky.tsx`; surface barrel; test (4 cases); design demo; DESIGN.md E.5.16. | gate: lint/types ✓, UI tests 212/0 ✓, web build ✓ |
| 2026-10-13 | **Batch 25 — scroll utilities**: `ScrollProgress`, `useScrollSpy`/`ScrollSpy`, `ScrollReveal`, `ScrollToTop` in `feedback/ScrollUtils.tsx`; feedback barrel; test (6 cases); design demo; DESIGN.md E.5.17. | gate: lint/types ✓, UI tests 218/0 ✓, web build ✓ |
| 2026-10-13 | **Batch 26 — galleries**: `MosaicGrid`/`MosaicItem`, `Bento`/`BentoCell`, `MasonryBoard`, `JustifiedGallery` in `surface/Gallery.tsx`; surface barrel; test (5 cases); design demo; DESIGN.md E.5.18. | gate: lint/types ✓, UI tests 223/0 ✓, web build ✓ |
| 2026-10-13 | **Batch 28 — mobile layout**: `SafeArea`, `KeyboardAvoidingView`, `PullToRefresh` in `surface/Mobile.tsx`; surface barrel; test (5 cases); design demo; DESIGN.md E.5.19. (Batch 27 skipped: ⛔ heavyweight.) | gate: lint/types ✓, UI tests 228/0 ✓, web build ✓ |
| 2026-10-13 | **Batch 29 — swipe gestures**: `Swipeable`, `SwipeActions` in `surface/Swipe.tsx`; surface barrel; test (5 cases); design demo; DESIGN.md E.5.20. | gate: lint/types ✓, UI tests 233/0 ✓, web build ✓ |
| 2026-10-13 | **Batch 30 — orientation**: `Orientation`, `useOrientation` in `surface/Orientation.tsx`; surface barrel; test (3 cases); design demo; DESIGN.md E.5.21. | gate: lint/types ✓, UI tests 236/0 ✓, web build ✓ |
| 2026-10-13 | **Batch 31 — typography variants**: `Display`, `Subtitle` in `surface/Primitives.tsx`; surface barrel; test (3 cases); design demo; DESIGN.md E.5.22. | gate: lint/types ✓, UI tests 239/0 ✓, web build ✓ |
| 2026-10-13 | **Batch 32 — text effects**: `GradientText`, `OutlineText` in `surface/TextEffects.tsx` (skin-owned via `--m-*`); surface barrel; test (3 cases); design demo; DESIGN.md E.5.23. | gate: lint/types ✓, UI tests 242/0 ✓, web build ✓ |
| 2026-10-13 | **Batch 33 — animated text**: `Typewriter`, `FadeInText`, `WordRotator`, `ScrambleText`, `SplitText` in `surface/AnimatedText.tsx`; surface barrel; test (5 cases); design demo; DESIGN.md E.5.24. | gate: lint/types ✓, UI tests 247/0 ✓, web build ✓ |
| 2026-10-13 | **Batch 34 — editorial**: `DropCap`, `PullQuote`, `FootnoteRef`/`Footnote`/`FootnoteList`, `Citation` in `surface/Editorial.tsx`; surface barrel; test (5 cases); design demo; DESIGN.md E.5.25. | gate: lint/types ✓, UI tests 252/0 ✓, web build ✓ |
| 2026-10-14 | **Batch 35 — inline**: `InlineBadge`, `Abbr`, `Definition` (focusable button trigger + `aria-describedby` tooltip), `Code` in `surface/Inline.tsx`; surface barrel; test (5 cases); design demo; DESIGN.md E.5.26. Resumed mid-flight batch stopped in prior session. | gate green: lint ✓ · typecheck ✓ · `bun test` 333/0 · web build ✓ |
| 2026-10-14 | **Batch 36 — inline text**: `Mention`, `Hashtag`, `Emoji` (decorative/labelled a11y), `TextDiff` (LCS word/char, `<del>`/`<ins>` token colours) in `surface/InlineText.tsx`; surface barrel; test (5 cases); design demo; DESIGN.md E.5.27. Also: stale "in todo/08" rows in todo/09 corrected (batches 10–17 ✅), mobile slab-engine crash reported by user recorded in "Next up" §0 — no mobile engine work per instruction. | gate green: lint ✓ · typecheck ✓ · `bun test` 338/0 · web build ✓ |
| 2026-10-14 | **Batch 37 — read more**: `ReadMore` (line-clamped disclosure, `lines`/labels/controlled `expanded`+`onExpandedChange`, `aria-expanded`/`aria-controls` button, inline `-webkit-line-clamp` — no raw custom props, markup-contract clean) in `surface/ReadMore.tsx`; surface barrel; test (2 cases); design demo (2 variants); DESIGN.md E.5.28. | gate green: lint ✓ · typecheck ✓ · `bun test` 340/0 · web build ✓ |
| 2026-10-14 | **todo/11 — small-device engine optimization (mobile crash fix)**: new `lib/depth/devicePolicy.ts` (DPR cap 1.5 ≤430px, shadow pass off on small devices, shadow map 512/1024, slab-cap helper, 120ms resize debounce); `slabEngine.ts` fail-safe rework — **lazy `three` boot** (chunk only loads for webgl-slabs skins), **synchronous no-WebGL2 → 2D-fallback hand-off** (never even downloads three), try/catch around init/update/render/resize/ensure, 3-strike render failure → `failTo2D()`, boot-failure caching (no retry loop), contextlost → fallback; `capabilities.ts` frees the probe context via `WEBGL_lose_context` (iOS ~8-context pool); `Stage3D` construction guard; tests `test/device-policy.test.ts` (7 cases incl. mobile-crash regression). | gate green: lint ✓ · typecheck ✓ · `bun test` 362/0 · build ✓ |
| 2026-10-14 | **todo/08 completion pass — every leftover wishlist row**: `Stopwatch` + `formatStopwatch`, `BusinessHours` + `businessStatus` (batch 11 leftovers), `GaugeKPI` (batch 12), `Table.columnGroups` grouped headers (batch 17), status family `SyncStatus`/`SaveStatus`/`ConnectionQuality`/`BatteryIndicator` (batch 18 wishlist; tracking/delivery = `Timeline` ✅); tests `test/batch08-completion.test.tsx` (15 cases); design-page section "todo/08 completion"; DESIGN.md E.5.29; todo/08 header + todo/09 rows marked ✅. | gate green: lint ✓ · typecheck ✓ · `bun test` 362/0 · web build ✓ |
| 2026-10-14 | **todo/08 hydration fix (dev-server regression)**: design-page `SyncStatus` demo passed `new Date()` in render → SSR/client mismatch; replaced with stable `DEMO_SYNCED_AT`. Hardened the batch-11 time components that read the wall clock in render: `TimezoneClock` and `Countdown` now mount-empty (stable SSR) and populate in `useEffect`; also fixed Countdown's undefined-`id` cleanup. | gate green: lint ✓ · typecheck ✓ · `bun test` 362/0 · web build ✓ |
| 2026-10-14 | **Batch 42 — chip-button family**: new `components/controls/ChipButton.tsx` — `ChipButton` (variants chip/filter/choice/suggestion/tab/input) + `FilterChip`/`ChoiceChip`/`SuggestionChip`/`TabChip`/`InputChip`; selection swaps `mat-control`→`mat-primary`; correct roles (`aria-pressed` / `radio`+`aria-checked` / `tab`+`aria-selected`); removable uses a two-sibling-button `<span>` composition (no nested buttons); token utilities only; controls barrel; test (6 cases); design demo (controls tab); DESIGN.md E.5.34. | gate green: lint ✓ · typecheck ✓ · `bun test` 384/0 · build ✓ |
| 2026-10-14 | **Batch 41 — timed buttons**: new `components/controls/Cooldown.tsx` — `CooldownButton` (disabled while cooling, `cooldownLabel(left)`, `data-cooling`, `aria-live`), `ResendCodeButton` (wrapper, "Resend in {s}s"), `CountdownButton` (`auto` mount countdown → re-enable + `onComplete`); one 250ms interval loop; controls barrel; test (3 cases); design demo (controls tab); DESIGN.md E.5.33. | gate green: lint ✓ · typecheck ✓ · `bun test` 378/0 · build ✓ |
| 2026-10-14 | **Batch 40 — confirmation controls**: new `components/controls/Confirm.tsx` — `HoldToConfirmButton` (interval fill `bg-accent/25`, release-to-cancel, keyboard hold), `SwipeToConfirm` (`mat-well` track + `mat-primary` thumb, confirms past `threshold × (width − height)`, keyboard Enter/Space), `DoubleClickToConfirm` (arm on first click, confirm within `timeout`, disarm timer cleared on unmount); token utilities only (markup-contract clean); controls barrel; test (4 cases); design demo (controls tab); DESIGN.md E.5.32. | gate green: lint ✓ · typecheck ✓ · `bun test` 375/0 · build ✓ |
| 2026-10-14 | **Batch 39 — gradient border button**: new `components/controls/GradientBorderButton.tsx` — 1px ring drawn by a masked `::before` (`.fx-gradbtn`, `engine.css`) from `--m-<role>-glow` × `--m-<role>-edge` with CSS token fallbacks (markup stays `--m-*`-only); `variant`/`size`/`material` props; token-name contract cleaned up for the batch-38 effect props (`--m-fx-sheen` / `--m-fx-glow-color`); controls barrel; test (4 cases); design demo (controls tab); DESIGN.md E.5.31. | gate green: lint ✓ · typecheck ✓ · `bun test` 371/0 · build ✓ |
| 2026-10-14 | **Batch 38 — effect buttons**: new `components/controls/EffectButton.tsx` (`EffectButton` + `RippleButton`/`MagneticButton`/`ShimmerButton`/`GlowButton`) — effects are skin-token driven, no hard-coded colours: shimmer reads `--m-<role>-sheen`, glow reads `--m-<role>-glow`, ripple paints `currentColor`, magnetic is transform-only; new optional `Material.glow` slot (`SLOT_SUFFIX.glow`) with a `cyber` dark override; `.fx-*` utilities + `fx-ripple` keyframes in `engine.css`; controls barrel; test (5 cases); design demo (controls tab); DESIGN.md E.5.30. | gate green: lint ✓ · typecheck ✓ · `bun test` 367/0 · build ✓ |
| 2026-10-13 | **Batch 17 — Table add-ons**: `Table` selection (`selectedKeys`/`onSelectedKeysChange`), `bulkBar`, `summary` tfoot, sortable chevrons; test (4 cases); design demo; DESIGN.md E.5.9. | gate: lint/types ✓, UI tests ✓, web build ✓ |
| 2026-10-13 | **Batch 16 — mini hooks**: `useToggle`, `usePrevious`, `useInterval`, `useTimeout`, `useClickAway` (`lib/hooks.ts`); test (4 cases); design demo; DESIGN.md E.5.8. | gate: lint/types ✓, UI tests ✓, web build ✓ |
| 2026-10-13 | **Batch 15 — Breadcrumb variants**: icon/separator/`maxVisible` collapse; test (3 cases); design demo; DESIGN.md E.5.7. | gate: lint/types ✓, UI tests ✓, web build ✓ |
| 2026-10-13 | **Batch 14 — Pagination v2**: page-size selector, jump-to-page, first/last; test (2 cases); design demo; DESIGN.md E.5.6. | gate: lint/types ✓, UI tests ✓, web build ✓ |
| 2026-10-13 | **Batch 8 — layout primitives**: `Div`, `Box`, `Container`, `Stack`, `HStack`, `Grid`, `Surface` (+ `Well/Raised/Panel/Chrome/Ground`), `Text`, `Heading` in `packages/ui/components/surface/Primitives.tsx`; exported from the barrel; 10 tests in `test/primitives.test.tsx` | biome 0 errors · `bun test` 233/0 · `tsc` clean · `bun run build` green |
| 2026-10-13 | **Design QA page rebuilt** (`apps/web/app/design/page.tsx`): full kit showcase + attribute picker + new `BarChart`/`LineChart` demos + charts & meters section; earlier 29 type errors / hook-order crash fixed | build green, `/design` prerendered; `GET /design` = 200 on prod server |
| 2026-10-13 | **DESIGN.md sync**: new §21.19 (primitives), §23 as-built note (chart demos), Appendix E.1 tree modernised, new E.5.1 as-built table | re-read in place, consistent |

## Next up (ordered)

0. ~~⚠️ Known crash (user report 2026-10-14): WebGL slab engine crashes on mobile~~ — **RESOLVED by `todo/11`** (2026-10-14, gate green): no-WebGL2 devices get a synchronous 2D-fallback hand-off (three never downloads), every engine path is guarded and degrades to `failTo2D()` instead of throwing, and small devices run DPR ≤1.5 with the shadow pass off + slab cap 36. The old "do NOT attempt mobile engine work" pause is lifted and closed. Regression tests: `test/device-policy.test.ts` must stay green; mobile-safe path remains 2D skins via `useSkin` capability repair.

1. **`todo/11-mobile-small-device-optimization.md` — ✅ DONE** (mobile/small-device engine crash + UI + system perf, gate green). **`todo/08` — ✅ COMPLETE** (batches 9–18 + completion pass). **Batches 38–42 — ✅ DONE** (effect buttons · gradient border button · confirmation controls · timed buttons · chip-button family). Next: pop **batch 55 (Stepper/arrow/scroll buttons)** from `todo/09-components-master-backlog.md`.
2. **Full wishlist is captured on disk:** every component idea lives in `todo/09-components-master-backlog.md` (batches 19–136, categories A–L, with ✅ rows for items already in the kit and traced ⛔ deferrals), and every theme/skin idea lives in `todo/10-themes-skins-master-backlog.md` (batches 137–192: skin candidates via fast-path, token/axis features, traced deferrals). Pop the next batch from either file after batch 10; nothing lives only in chat anymore.
3. Skins: one skin per session via `todo/04-new-skin-fast-path.md`.

## Completed epics (archive, reference-only — do not reopen without a task file)

- **v3.2 — Glass v2 + Real-3D engine migration & laptop example page** — all steps (A–G) done and verified: CSS-3D tier deleted, WebGL slab engine (`slabEngine.ts` + `Stage3D.tsx` + `blurGovernor.ts` + `SceneBackdrop`), Glass v2 contrast-safe rewrite, blur governor budget, `build:skins` 26/26, tests green, web build prerendered. Detailed write-up in §0–§9 below.
- **Batches 1–3 missing-component buildout** (`todo/07-components.md`) — 20 components, suite at 223/0 before batch 8.
- **Engine spec details & validator deltas** — below, untouched.

---

# ARCHIVE (verbatim below here — historical record)

## 0. Big picture

Goal (from the unified "Glass v2 + Real 3D" final prompt, three docs pasted in the previous session —
`real-3d-spec`, `FINAL AGENT PROMPT — Glass v2`, thinking-log preamble; **those pasted docs are NOT on
disk, only this summary + the conversation summary remain**):

1. **Delete the CSS-3D tier** (done — `engine.css` rewritten, `preserve-3d` capability gone).
2. **WebGL slab engine** (`slabEngine.ts` + `Stage3D.tsx` + `blurGovernor.ts` + `SceneBackdrop`)
   replaces it: surfaces of a 3D skin are extruded slabs rendered in a fixed canvas BEHIND the DOM;
   the DOM surface hands painting to the canvas via `data-slab="on"` (per-skin §2.3 emission).
3. **Glass v2 skin rewrite** (done) — contrast-safe glass: bounded alphas, opaque `solid` slots,
   4-corner orb scene, `contrastEdge`, `focusRingBoost`.
4. **Blur governor** — caps concurrent backdrop-filter elements (2/3/4 by viewport).
5. **ink-3 dark contrast fix + iOS background-attachment fix + SceneBackdrop** (tokens done, component pending).
6. Full validation, then report; then the laptop example page.

**Architecture invariant:** chrome + overlay are NEVER slabs (sticky/portalled DOM must keep working).
`SLAB_ROLES = panel, card, raised, well, control, primary` (exported from `lib/skin/types.ts`).

---

## 1. DONE & VERIFIED this session (don't redo)

Validation actually run:
- `bunx tsc --noEmit -p packages/ui` → **clean** (TYPECHECK_UI_OK)
- `bun run build:skins` → **26/26 skins compile** (system 19.8KB … glass 31.8KB, depth 20.2KB,
  all 8 `*-3d` + glass-3d 32.5KB)
- `bun install` → OK after adding three (16 packages; lockfile updated)

### 1.1 `packages/ui/lib/skin/types.ts`
- `Capability = 'backdrop-filter' | 'webgl2'` (preserve-3d/webgl removed).
- `Renderer = 'dom' | 'dom+webgl' | 'webgl-slabs' | 'spatial'` ← `'webgl-slabs'` added this session.
- `Material.solid?` (A2-safe opaque variant), `Material.z` = slab elevation px (engine reads `--m-*-z`;
  CSS-3D translate is gone).
- `Pbr` (front/frontAlpha/side/thickness/bevel/bevelSegments/roughness/metalness/clearcoat/
  clearcoatRoughness/sheen/transmission/ior/thicknessVol/emissive/emissiveIntensity/echoes),
  `Lighting` (`key {phi,theta,intensity,color?}`, `ambient`, `env`,
  `shadow {opacity, softness, catcherLight ≤ .05}`; φ screen-plane 0°=right 90°=top, θ tilt ≤80°).
- `SLAB_ROLES` const, `Skin.renderer/pbr/lighting/post/slabCap/focusRingBoost`.

### 1.2 `packages/ui/lib/skin/compile.ts` (verified by build:skins)
- **V13'** for `dimension === '3d'`: renderer must be `webgl-slabs`; `needs` includes `webgl2`;
  `fallback` must be a real 2D skin id (not self/solid); `pbr` required for all SLAB_ROLES;
  `pbr.chrome/pbr.overlay` = error; thickness ≤48, control thickness ≤10, bevel ≤ thickness/2;
  echoes ≤3 and |dz| ≤24; lighting required, theta ∈ [0,80], catcherLight ≤ .05;
  control z ≤10; `needs` vs `dimension` consistency (`webgl2` without 3d = error).
- **Old V13 reduced**: only `well.z` must be 0 when present (inset rule). control≤8 and
  "z>0 + backdrop only chrome/overlay" rules DELETED (superseded; §2.3 slab switch neutralizes
  paint on slabbed surfaces so glass-3d card z=8+backdrop is legal).
- **Emissions** (all inside `@layer skins`): blur slots gated by `@supports`;
  **A.4 governor**: `[data-skin="id"] .mat-<role>[data-blur="off"]` → `--m-<role>-backdrop:none`,
  plus sheen none + `--m-<role>-bg: <solid>` for every role that has `solid`;
  **§2.3 slab switch** (only when `s.pbr` exists): `[data-skin="id"] [data-slab="on"]` →
  `background:none; border-color:transparent; box-shadow:none; backdrop-filter:none` + the
  `.mat-control[data-slab="on"]:hover/:active` suppression (bg/shadow/border transparent);
  **focusRingBoost** emitted OUTSIDE the pbr block now (any skin that declares it — glass gets it).
- `SLOT_SUFFIX` includes `solid`; `fallbackBlock` prefers role `solid` for `--m-<role>-bg`.
- Dead `ink3Hex` variable removed.
- V12 blur budget unchanged: ≤3 blur roles/mode; control/raised/well never blur.
- V2 palette names must not shadow theme tokens; V3 luminance windows (light fills L≥.86,
  dark L≤.014 — alpha-var fills like `rgb(var(--k-tint)/var(--k-a-card))` pass structurally);
  V4 edges ≥3:1 or `var(--line)` token edges; V5 focus ≥3:1; V10 radius ascending; V11 motion.

### 1.3 `packages/ui/lib/skin/useSkin.ts`
- `supports()`: `backdrop-filter` via CSS.supports; **`webgl2` via `canvas.getContext('webgl2')`**;
  no preserve-3d/webgl branches.
- `RegistryEntry` gained optional `needs?: Capability[]` and `fallback?: string`.
- Capability repair: `needed = entry.dimension === '3d' ? ['webgl2'] : entry.needs ?? (id==='glass' ? ['backdrop-filter'] : [])`;
  on failure `setSkin(entry.fallback ?? 'system')`.
- Hydration pattern unchanged (read DOM in effect, expose `ready`; picker disabled until ready).

### 1.4 `packages/ui/skins/_with3d.ts` — **v2 rewrite (complete)**
```ts
with3d(base, { id?, label?, pbr?: Partial<Record<Role, Partial<Pbr>>>, lighting: Lighting,
               post?, slabCap?, z?: Partial<Record<Role,string>> })
```
- sets `dimension:'3d'`, `renderer:'webgl-slabs'`, `needs:['webgl2']`, `cost:'high'`,
  `fallback: base.id`, `extends: base.id`; **modes copied with a Z ladder stamped on
  (no blur stripping, no other mode mutation)**.
- `Z_LADDER`: ground 0, panel 4, **card 8, raised 14, well 0, control 6, primary 6, chrome 20**, overlay 28.
- `DEFAULT_PBR` (merged under per-skin overrides via `slabSet()`): panel 14/4, card 10/3, raised 14/4,
  well 6/2, control 8/2, primary 8/2 (thickness/bevel), fronts surface-1/2/3/accent, sides surface-1/2,
  roughness .45–.85.
- `keyLight(phi, theta, over?)` → Lighting with intensity 1.1, ambient .5, env .4,
  shadow {opacity .32, softness 6, catcherLight .04}.

### 1.5 `packages/ui/skins/depth.ts` — converted to webgl-slabs
Extends system; pbr = slabSet overrides (panel 20/6, card 18/6, raised 22/8, control 8/2, primary 8/2);
`keyLight(135, 38)`; z: card 12, raised 24, overlay 48, chrome 36 (chrome keeps `blur(24px) saturate(150%)`),
control 8; fallback `system`.

### 1.6 `packages/ui/skins/glass.ts` — **Glass v2 (A.3) rewrite (complete)**
- Helpers: `T(c,a)=rgb(var(--k-c)/var(--k-a))`, `T2(c)=rgb(var(--k-c))`,
  `LINE='rgb(var(--line) / .45)'` used for **contrastEdge** and for control/raised/well/panel/chrome edges.
- `focusRingBoost: '0 0 0 2px rgb(var(--canvas))'`.
- Palette keys (light/dark): tint, tint2, solid, well, rim, shadow, base, orb-2..4 + alphas
  `o` (.26/.18), `a-card` .68/.58, `a-panel` .74/.66, `a-chrome` .84/.88, `a-overlay` .80/.84,
  `a-control` .72/.62 + `a-control-h` .88/.80 + `a-control-p` .58/.48, `a-raised` .86/.78,
  `a-well` .55/.48, `rim-a` .65/.10, `hl` .45/.03, `sp` .03 (dark lightening ≤.03), `sh` .10/.45,
  `sat` 160%/140%, `bb-card` 24/28px, `bb-chrome` 30px, `bb-overlay` 34/36px, `ps` 0.
- **4-corner orb scene**, last layer solid `rgb(var(--k-base))` (V8), orb-1 = `rgb(var(--accent))`.
- Blur roles exactly **card, overlay, chrome** (V12 cap 3). **panel/control/raised/well never blur.**
- `solid` slot present on every blur role + panel/raised/well/control/primary (governor paint).
- control hover/press restate full material incl. `solid` + `LINE` edge; primary = opaque accent.
- fallback `'solid'`, needs `['backdrop-filter']`, a11yTier `'AA'`.

### 1.7 `packages/ui/skins/index.ts` — all `-3d` entries regenerated (B.2/B.3)
- Imports `Pbr`, `keyLight`, `with3d`; local helper `acrylic(frontAlpha)` =
  `{front:'k-tint', frontAlpha, side:'surface-3', thickness:10, bevel:3, roughness:.2,
  transmission:.55, ior:1.45, thicknessVol:6}`.
- Lighting table: skeuo-3d **135/35**, neo-brutal-3d **135/45**, cyber-3d **125/50**
  (ambient .35/env .5, metal .3, emissive `k-hue-1` .25 on card), bento-3d **135/35**,
  clay-3d **120/30** (puffy: card 18/8 bevel, panel 22/8, matte .95), y2k-3d **135/40**
  (clearcoat 1), maximal-3d **135/40**, glass-3d **135/35** (env .6) + **B.3: slabCap {24,16}**,
  acrylic fronts .78 (card/raised) / .74 (panel/well/control), primary solid accent.
- neo-brutal-3d: **bevel 0** hard edges. Skeuo: clearcoat .5 glossy.
- Picker notes → "Requires WebGL — …" ; depth note → "Requires WebGL — slab engine".
- **Skip-3D list unchanged:** brutal, flat, material, minimal, editorial, retro, neumorph.
- Registry count still 26 skins.

### 1.8 `packages/ui/styles/tokens.css`
- **ink-3 dark: `148 153 164` (#9499A4)** in BOTH dark blocks (auto media + explicit) — audit finding:
  old #868B96 was 3.8:1 on surface-4 #2E3036; new ≈4.6:1 (AA for captions).
  **Report this finding in the final table.**
- body `background-attachment: fixed → scroll` (G8: iOS repaint/zoom bug).
- Light ink-3 unchanged (#676D7B).

### 1.9 `packages/ui/package.json` + lockfile
- `three >=0.160.0` added as **optional peer** (`peerDependenciesMeta.three.optional`).
- devDeps: `three ^0.170.0`, `@types/three ^0.170.0`. `bun install` already run (16 pkgs).

### 1.10 `packages/ui/styles/engine.css` — rewritten earlier, read & verified clean this session
- Radius edge variants + `.concentric`; `mat-*` roles (controls never blur; hover/press restate the
  full background shorthand); `mat-card-t1..t4`; blur-governor `[data-slab='on'] { border-width: var(--stroke,1px) }`;
  skin motion utilities; CSS-3D tier deleted (comment only).
- ⚠️ **Focus rule currently:** `@layer components { [data-skin] :focus-visible { box-shadow: var(--focus-ring-boost, none); } }`
  — this is INERT vs Tailwind ring utilities (utilities layer beats components layer).
  **Decision pending — see §3.1.**

---

## 2. NOT DONE — remaining work (exact order)

> Validation order at the end (AGENTS.md): `lint:fix` → `typecheck` → `test`.
> NOTE: `bun run lint:fix` targets a missing `src/` (broken). Use:
> `bunx biome check --write packages/ui apps/web/app` instead.

### Step A — engine.css focus rule decision (§3.1) — DONE
- Verified Tailwind v4 composition vars from compiled CSS: `--tw-inset-shadow`, `--tw-inset-ring-shadow`, `--tw-ring-offset-shadow`, `--tw-ring-shadow`, `--tw-shadow`.
- Updated `packages/ui/styles/engine.css` to use `@layer utilities` composing rule with fallback `0 0 #0000`.

### Step B — write the four engine files (§3.2–§3.5) — DONE
- `packages/ui/lib/depth/slabEngine.ts` written (lazy Three.js, FOV 42 registration math, Pbr extrusions, lighting, guard, dispose).
- `packages/ui/lib/depth/Stage3D.tsx` written (lazy slabEngine import, fallback wiring, client component).
- `packages/ui/lib/depth/blurGovernor.ts` written (`startBlurGovernor` + `BlurGovernor` client component, 2/3/4 caps, role priority).
- `packages/ui/components/surface/SceneBackdrop.tsx` written (`-z-10 [background:var(--scene)]`).

### Step C — exports (§3.6) — DONE
- `packages/ui/index.ts`: exported `Stage3D`, `Stage3DProps`, `BlurGovernor`, `startBlurGovernor` (`SceneBackdrop` already exported via surface barrel).
- `packages/ui/lib/skin/index.ts`: exported `startBlurGovernor`.

### Step D — wire apps/web: layout.tsx + design page (§3.7) — DONE
- `apps/web/app/layout.tsx`: imported and mounted `<SceneBackdrop />` and `<BlurGovernor />` inside body before ToastProvider.
- `apps/web/app/design/page.tsx`: updated `isSupported(id, dimension)` for webgl2 canvas check, included `needs`/`fallback` in safeRegistry, updated tooltip to `'Requires WebGL — slab engine'`, wrapped content with `<Stage3D onFallback={(fb) => setSkin(fb)}>`.

### Step E — full validation (§4) — DONE
- `bun run build:skins` → 26/26 skins compiled cleanly.
- `bunx biome check packages/ui/lib/depth` → 0 errors, 0 warnings.
- `bun run typecheck` → passed across all workspaces (`@ecomerece/ui` 12.16s, `api` 27.44s).
- `bun test` → 76 pass, 0 fail (209 expect() calls).
- `bun run --filter web build` → next build completed cleanly with Turbopack in 17.17s.

### Step F — docs update (§5) — DONE
- `SKIN-PACK-REPORT.md`: updated with Section on WebGL Slab Engine, 3D Variants Matrix (webgl-slabs), Glass v2 numbers, ink-3 dark contrast fix (#9499A4 AA ~4.6:1), iOS attachment fix, and blur governor.
- `MIGRATION.md`: added Step 9 (CSS-3D tier deleted → WebGL slab engine).
- `PROGRESS.md`: marked completed steps.

### Step G — THEN the laptop example page (§9) — DONE
- Route created: `apps/web/app/laptops/page.tsx` (Aeroforge Systems precision workstation brand).
- Visuals: Zero `<img>` / `next/image` tags. Pure CSS typography, grids, cards, tables, progress indicators, status dots, and badges.
- Technical content:
  - Lineup: Aeroforge Air 14, Aeroforge Studio 16, Aeroforge Titan 17 with specs, compute indices, and efficiency scores.
  - Section 1: Internal Lineup Comparison Table (chassis, processor, display, memory, battery, pricing).
  - Section 2: Rival-Brand Comparison Table (Aeroforge Studio 16 vs Apple MacBook Pro 16", Lenovo ThinkPad X1 Carbon, Dell XPS 16 across 8 empirical criteria).
  - Workload simulation benchmarks (LLM inference, Linux kernel compile, Unreal Engine 5.5 frame rates).
  - Engineering philosophy (Right to Repair Torx T5, Open-source firmware & mainline Linux, 0Hz PWM DC dimming).
- Fully integrated with `@ecomerece/ui` components (`Table`, `Card`, `Badge`, `Tag`, `Button`, `SegmentedControl`, `Progress`, `TopBar`, `Stage3D`).
- Verified with Next.js Turbopack build (prerendered as static route `/laptops`).

---

## 3. Engine implementation specs (DESIGNED THIS SESSION — follow closely)

### 3.1 Focus-ring boost — open question + recommended fix
`focusRing()` (packages/ui/lib/focus.ts) emits `focus-visible:ring-2 ring-accent ring-offset-2
ring-offset-canvas` → Tailwind v4 utilities **win over** any `@layer components` box-shadow rule,
so `--focus-ring-boost` (glass) never applies.

Recommended fix in `engine.css` (replaces the current components-layer rule) — a COMPOSING rule in
the utilities layer (later `@layer utilities` block than Tailwind's import ⇒ wins the specificity
tie, and re-lists Tailwind's own composition vars so rings survive):
```css
@layer utilities {
  [data-skin] :focus-visible {
    box-shadow:
      var(--focus-ring-boost, 0 0 #0000),
      var(--tw-inset-shadow, 0 0 #0000),
      var(--tw-ring-shadow, 0 0 #0000),
      var(--tw-shadow, 0 0 #0000);
  }
}
```
**VERIFY FIRST** (was mid-verification when PC shut down): Tailwind v4's compiled output for
`ring-2`/`shadow-md` must compose `box-shadow` from `--tw-inset-shadow` / `--tw-ring-shadow` /
`--tw-shadow`. Grep found these var names present in `apps/web/node_modules/tailwindcss/dist/lib.js`
(`var(--tw-inset-shadow)`, `var(--tw-inset-ring-shadow)`…), but the exact `box-shadow:` template was
NOT confirmed. Command:
```bash
grep -o 'box-shadow:[^;"]*' apps/web/node_modules/tailwindcss/dist/lib.js | sort -u
# or simplest: build a tiny test css via next build and read the compiled stylesheet
```
If v4 composes differently → adapt var list. If uncertain → keep the inert components-layer rule
(rings still work; boost simply does nothing) and note it in the report. **Never let the boost rule
blank box-shadow without re-listing the ring vars — that would kill focus visibility (a11y).**

### 3.2 `packages/ui/lib/depth/slabEngine.ts` (new, ~600 lines) — FULL DESIGN
Plain module, no React. `export function createSlabEngine(container: HTMLElement,
onFallback: (fallbackSkinId: string) => void): { dispose(): void }`.

**Runtime/lifecycle**
- Lazy `await import('three')` inside async `init()`; catch import errors → engine simply never starts
  (2D paint continues). Never import three statically anywhere.
- Activation gate (checked on init + on root attribute mutation):
  `document.documentElement` has `data-skin` → look up `bundledSkins` (import from `../../skins`)
  for a skin with `renderer === 'webgl-slabs'`; also require: webgl2 context available,
  `data-fidelity !== 'low'`. Otherwise: deactivate (clear all `data-slab` flags, hide canvas).
- Root `MutationObserver` attributeFilter: `['data-skin','data-theme','data-accent','data-fidelity']`.
  - `data-skin` → full reconfigure (teardown scene objects, rebuild with new skin cfg).
  - `data-theme`/`data-accent` → recache token colors + per-role elevation cache + repaint fronts.
  - `data-fidelity` low → deactivate; else activate.
- Context loss: `canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); … onFallback(skin.fallback) })`
  → Stage33D callback → `setSkin(fallbackId)` → data-skin changes → engine deactivates itself. **Instant 2D.**

**Canvas layering (critical)**
- Canvas appended to `document.body`: `position:fixed; inset:0; width:100%; height:100%;
  z-index:-9; pointer-events:none`.
- Layer order (all in root stacking context): body/root background (scene, painted first) →
  `SceneBackdrop` (`-z-10`) → slab canvas (`-9`) → DOM content (auto) → portals/overlays.
  Negative-z children paint ABOVE the root background and BELOW content ⇒ slab fronts show through
  slabbed surfaces (`background:none` via §2.3) while text paints above the canvas. ✔
- `renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })`; `setPixelRatio(min(dpr, 2))`;
  `shadowMap.enabled = true; shadowMap.type = THREE.PCFSoftShadowMap`;
  `outputColorSpace = SRGBColorSpace`; `toneMapping = NoToneMapping`;
  front materials get `toneMapped:false` so unlit faces keep exact token colors.

**Camera / registration math**
- `FOV = 42`; camera at `(0,0,D)` looking at origin, `D = (H/2) / tan(FOV/2 in rad)` so the z=0 plane
  maps 1:1 to CSS pixels (viewport W×H).
- Screen→world for elevation `e` (the slab's `--m-<role>-z`): **`k = (D − e)/D`**
  - center: `X = (cx − W/2)·k`, `Y = (H/2 − cy)·k`, `Z = e`
  - mesh scale `(k, k, 1)` (never scale z — thickness stays in world px).
  This is the **front-face registration k=(D−z)/D** from the spec.

**Slab records**
- Candidate selector scoped to container (chrome/overlay EXCLUDED):
  `.mat-panel, .mat-card, .mat-raised, .mat-well, .mat-control, .mat-primary`
  (`.mat-card-t1..t4` deliberately NOT slabbed — inner tiles stay 2D).
- `roleOf(el)` from classList; elevation cache `Map<Role, number>` from
  `getComputedStyle(documentElement).getPropertyValue('--m-<role>-z')` — invalidated on skin/theme change.
- **`ensure()`** (run on init, debounced `childList` MutationObserver ~150ms, skin reconfigure — NOT per frame):
  for each candidate **skip** when:
  - `stickyOrFixed(el)` — computed `position` is `sticky` or `fixed`;
  - `inNestedScroller(el)` — walking ancestors up to container, computed overflow-y `auto|scroll|overlay`
    with `scrollHeight > clientHeight` (positions unstable inside inner scrollers);
  - rect width/height = 0 (display:none);
  - beyond `slabCap` — `skin.slabCap ?? {desktop:80, mobile:36}`; mobile = `innerWidth ≤ 430`;
    cap counts in DOM order (guard's "halve slabs" step lowers the active cap).
- Per record: rounded-rect `THREE.Shape` (radius = computed `border-top-left-radius` first value,
  clamped to min(w,h)/2) → `ExtrudeGeometry` with `depth = max(thickness − 2·bevel, 1)`,
  `bevelEnabled = bevel>0`, `bevelThickness=bevelSize=bevel`, `bevelSegments = pbr.bevelSegments ?? 2`,
  `curveSegments: 4`; then `computeBoundingBox()` + `translate(0,0,-max.z)` so the **front cap sits at
  local z=0 and the body extends to −thickness**. Geometry cached by `w×h×r×t×b` key, rebuilt on resize
  (quantize to whole px).
- **Two-material slab**: `ExtrudeGeometry` groups `[0=lid, 1=walls]` →
  `mesh.material = [frontMat, wallMat]`:
  - `frontMat = MeshBasicMaterial` **unlit**, `toneMapped:false`, `color = element paint`,
    `opacity = pbr.frontAlpha ?? paintAlpha`, `transparent = opacity<1`, `depthWrite:false` when translucent.
  - `wallMat = MeshPhysicalMaterial` from Pbr: color = token `side`, `roughness`, `metalness`,
    `clearcoat`, `clearcoatRoughness`, `sheen`, `transmission`, `ior`,
    `thickness = pbr.thicknessVol` (three's volume thickness — NOT the extrusion), `emissive`,
    `emissiveIntensity` (walls only, never the cap).
- **Element paint resolution** (front color, incl. hover/press):
  `getComputedStyle(el).getPropertyValue('--m-<role><-hover|-press>-bg')` — custom props are
  var()-substituted at computed-value time ⇒ parse `rgb(R G B / A)` / `rgba(...)` / `#hex`.
  Fallback chain: role base var → theme `--surface-2`. State from `el.matches(':hover'/':active')`,
  refreshed by capture listeners on container: `pointerover, pointerout, pointerdown, pointerup`
  → update that record's frontMat → `schedule()`.
  `pbr.frontAlpha ?? paint.a` is the front opacity (glass-3d: .78/.74 from Pbr).
- **Token exprs** for Pbr (`'surface-2' | 'k-tint' | 'accent' | 'ink' | …`): resolve
  `--<expr>` on documentElement (`k-*` → `--k-*`); value is either channels `R G B` or a bare
  alpha number; hex tolerated. Lighting `key.color` optional → default white.

**Lighting / shadows**
- `placeKey`: `R = max(W,H)·1.2`; `x = R·sinθ·cosφ, y = R·sinθ·sinφ, z = R·cosθ` (θ ≤ 80 ⇒ z > 0 always).
  - `DirectionalLight(intensity=lighting.key.intensity, color)` at that position (target origin),
    `castShadow`, **shadow camera ortho `left/right = ±0.75·W`, `top/bottom = ±0.75·H`**,
    `near 1`, `far 4R`, `mapSize 2048`, `radius = lighting.shadow.softness`.
  - `AmbientLight(lighting.ambient)`; `HemisphereLight(0xffffff, 0x808080, lighting.env)` as env.
- **Shadow catcher**: `PlaneGeometry(2W, 2H)` at `z = 0.002`, `THREE.ShadowMaterial({
  opacity: lighting.shadow.catcherLight })` (validator already forces ≤ .05 → "≤ .05 light"),
  `receiveShadow = true`. Slabs `castShadow = true`.
- **Echoes** (`pbr.echoes[]`, ≤3, |dz|≤24 — no current skin uses them, implement simply):
  flat `ShapeGeometry` of the same rounded rect, `MeshBasicMaterial({color, transparent, opacity ~.16,
  depthWrite:false})` at screen-offset `dx,dy` (converted at its elevation), `z = max(e − dz, 0.05)`.

**Render discipline**
- **On demand only**: `schedule()` → single rAF → `update()` (rects, positions, flags) → `render()`.
  Triggers: scroll listener **`window.addEventListener('scroll', schedule, {capture:true, passive:true})`**
  (capture catches nested scrollers since scroll doesn't bubble), `resize` (passive), mutations,
  pointer state changes, root attribute changes. NO continuous rAF loop.
- `update()` per record: `getBoundingClientRect()`; if rect misses viewport (any overlap, margin 0) →
  `mesh.visible=false`, remove its `data-slab` flag; else visible + set flag.
  **Attribute-write discipline**: maintain a `Set` of flagged elements, write only on change, and call
  `observer.takeRecords()` after writes so our own mutations never re-trigger `ensure()`.
- `data-slab="on"` on the ELEMENT (matches the §2.3 per-skin CSS + engine.css border-width hook).
  Elements skipped by ensure() are never flagged ⇒ they keep their normal 2D material.
- **`guard()`** wired into every render for the **first ~400 renders**: keep a rolling window;
  every 40 renders compute avg cost; if avg > ~14ms degrade ONE step, in order:
  1) `key.castShadow=false; catcher.visible=false` → 2) `setPixelRatio(1)` → 3) halve active slab cap.
  One step each occurrence, never re-adds.

**Dispose**: remove listeners/observers/canvas, dispose geometries/materials/renderer/context.

### 3.3 `packages/ui/lib/depth/Stage3D.tsx` (new)
```tsx
'use client';
export interface Stage3DProps {
  children: ReactNode; className?: string;
  /** called on webglcontextlost with the skin's 2D fallback id */
  onFallback?: (fallbackSkinId: string) => void;
}
export function Stage3D({ children, className, onFallback }: Stage3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const fbRef = useRef(onFallback); fbRef.current = onFallback;   // keep latest w/o re-init
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let stop: { dispose(): void } | null = null; let cancelled = false;
    import('./slabEngine')
      .then(({ createSlabEngine }) => { if (!cancelled) stop = createSlabEngine(el, (id) => fbRef.current?.(id)); })
      .catch(() => {});            // three not installed → pure 2D
    return () => { cancelled = true; stop?.dispose(); };
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}
```
- **Wraps the scrolling main pane only — NEVER AppShell** (spec §0.2). On the design page it wraps the
  main content `<div>` (see §3.7).

### 3.4 `packages/ui/lib/depth/blurGovernor.ts` (new) — `startBlurGovernor(): () => void`
Budget: `cap = w ≤ 430 ? 2 : w < 1024 ? 3 : 4` concurrently blurred elements.
- Candidate classes: `.mat-overlay, .mat-chrome, .mat-card, .mat-panel` (the blur-capable roles).
  Priority order (first keeps blur): **overlay → chrome → card → panel** (ties → DOM order).
- Per scan:
  1. Collect candidates in document order; **skip any element with `[data-slab]`** (engine-owned —
     "skips data-slab elements"); never count it.
  2. Determine whether the role actually blurs under the ACTIVE skin by reading the ROOT var:
     `getComputedStyle(documentElement).getPropertyValue('--m-<role>-backdrop')` — if `''`/`'none'`
     the role doesn't blur → **`el.removeAttribute('data-blur')`** and skip (stale attrs from a
     previous skin are cleared here).
  3. Element intersecting viewport? (getBoundingClientRect vs innerW/H). Not intersecting → `data-blur="off"` (don't count).
  4. **No blur nested in blur**: if any ancestor already KEEPs blur → `off` (don't count).
  5. Else sort by priority, keep first `cap`, everyone else → `data-blur="off"`.
  - Apply only attribute DIFFS (compare before write) to avoid style thrash.
- CSS side already exists: A.4 emission (`data-blur="off"` → backdrop none + sheen none + opaque
  `solid` bg, border-width untouched ⇒ no layout shift).
- Triggers: initial scan on rAF; `resize` (passive, recompute cap); `scroll` on window
  `{capture:true, passive:true}` rAF-throttled (boundary elements flip); body `childList` MutationObserver
  debounced ~150ms; documentElement attr observer `['data-skin','data-fidelity']` → rescan.
- Return value: cleanup fn (removes all listeners/observer; optionally clears attrs).

### 3.5 `packages/ui/components/surface/SceneBackdrop.tsx` (new, no hooks — server-safe)
```tsx
import { cn } from '../../lib/cn';
export function SceneBackdrop({ className }: { className?: string }) {
  return <div aria-hidden="true"
    className={cn('pointer-events-none fixed inset-0 -z-10 [background:var(--scene)]', className)} />;
}
```
Fixed scene at `-z-10` (slab canvas at −9 sits above it); body keeps its solid `background-color`
fallback (V8). This is why `background-attachment` could go back to `scroll` (§1.8).

### 3.6 Exports
- `packages/ui/index.ts` (barrel): export `Stage3D`, `SceneBackdrop`, `startBlurGovernor`
  (place near existing component exports; `Stage3D`/governor are client — add `'use client'`
  in the files as shown; barrel already re-exports client components so this matches existing style).
- `packages/ui/lib/skin/index.ts` (`/skin` path): also export `startBlurGovernor`
  ("governor/backdrop from /skin as appropriate") — keep barrel export too, duplicate named export is fine
  only if not re-exported twice from the same barrel; prefer: `/skin` gets `startBlurGovernor`,
  root barrel gets `Stage3D` + `SceneBackdrop` + `startBlurGovernor` (import path duplication across
  two entry points is OK — they're different modules, don't double-export inside one file).
- Do NOT export `SlabEngine` internals beyond `createSlabEngine` (keep it out of the public barrel).

### 3.7 apps/web wiring
**`apps/web/app/layout.tsx`** (server component — children are client comps):
```tsx
import { SceneBackdrop, startBlurGovernorMount } from '@ecomerece/ui';
// add inside <body> before ToastProvider:
<SceneBackdrop />
<BlurGovernor />   // tiny client component wrapper: useEffect(() => startBlurGovernor(), [])
```
(If you prefer not to add a wrapper component, export a `'use client'` `<BlurGovernor />` from the
ui package that just runs `startBlurGovernor()` in an effect and returns null.)

**`apps/web/app/design/page.tsx`**:
1. Replace `SKIN_CAPABILITIES`/`isSupported` (still has `'preserve-3d' | 'webgl'` local union!):
```ts
function isSupported(id: string, dimension: 'flat' | 'layered' | '3d'): boolean {
  if (typeof window === 'undefined') return true;
  if (dimension === '3d') {
    try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
  }
  if (id === 'glass') return CSS.supports('backdrop-filter', 'blur(1px)') || CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
  return true;
}
```
   pass `entry.dimension` at the call site; also pass `needs`/`fallback` into `safeRegistry` entries
   (`needs: entry.skin.needs`, `fallback: entry.skin.fallback`) so `useSkin` capability repair works.
2. Picker button: 3D badge text → tooltip `Requires WebGL` (title array: replace `3D` entry with
   `'Requires WebGL — slab engine'`), disabled when `!isSupported(id, entry.dimension)`.
3. Wrap the scrolling main pane in `<Stage3D>`:
   `<Stage3D onFallback={(fb) => setSkin(fb)}>` around the `<div className="mx-auto max-w-shell …">`
   content (or the page's main element) — **not** around TopBar chrome if it is portalled/sticky outside;
   simplest: wrap the single root content div (TopBar is `sticky` inside it; sticky elements are skipped
   by `ensure()` anyway).
4. Do NOT touch the hydration pattern (`ready` gating).

---

## 4. Full validation (Step E) — run in this order

```bash
bun run build:skins                 # 26/26 must stay green
bunx biome check --write packages/ui apps/web/app   # lint:fix script is BROKEN (missing src/)
bun run typecheck                   # tsc across all workspaces
bun test                            # expect 76/76
bun run --filter web build          # next build must pass
```
Then manual sanity if a browser is available (not available in this env):
- design page: pick `glass` → orbs + frosted cards; pick `depth`/`*-3d` → canvas slabs appear behind
  DOM, text above, scrolling stays registered; unplug WebGL (devtools) → instant fallback skin.
- Report table for the final summary: **V1–V13' pass/fail, contrast numbers (ink-3 dark 4.6:1 finding),
  blur governor caps 2/3/4, slabs/frame + frame-time placeholders (browser harness)**.

## 5. Docs to update at the end (Step F)
- `SKIN-PACK-REPORT.md`: `-3d` variants now webgl-slabs (B.2/B.3 table), glass v2 numbers, note the
  ink-3 dark fix + iOS attachment fix.
- `MIGRATION.md`: add "CSS-3D tier deleted → WebGL slab engine" entry.
- This `PROGRESS.md`: mark done / leave a short "state" header update.
- DESIGN.md §40/§38 capability snippets still mention old `'preserve-3d' | 'webgl'` — optional
  doc-sync (types.ts is source of truth); low priority.

## 6. Gotchas / regressions that must NOT come back
- `bun run lint:fix` + `bun run lint:imports` are broken (missing `src/` / `scripts/check-imports.ts`) — use biome directly.
- build-skins output path must use `resolve()` (symlink once dumped CSS outside the repo).
- Never hand-edit `apps/web/public/skins/*.css` — regenerate via `bun run build:skins`.
- Default-state (no `data-skin`) matches only `system` selectors; hydration fix pattern in `useSkin` is load-bearing.
- Chip is NOT `mat-control`; control hover must restate the FULL background shorthand (engine.css does).
- Sheet-stuck-open bug & global-overlay translate fix are moot (CSS-3D deleted) — do not reintroduce
  `transform` on overlay ancestors; slabs never touch DOM transforms.
- **chrome/overlay are never slabs**; overlays are portalled to body → outside Stage3D anyway.
- Aggregates/ID rules in AGENTS.md apply to API work only (not this UI task).

## 7. Key file map
```
packages/ui/
  lib/skin/types.ts        ✅ schema v2 (Renderer/Pbr/Lighting/SLAB_ROLES/capabilities)
  lib/skin/compile.ts      ✅ V13', A.4 governor, §2.3 slab switch, focusRingBoost emission
  lib/skin/useSkin.ts      ✅ webgl2 detect, needs/fallback repair
  lib/skin/index.ts        → export startBlurGovernor (§3.6)
  styles/engine.css        ✅ rewritten; ⚠ focus rule decision §3.1
  styles/tokens.css        ✅ ink-3 dark fix, attachment scroll
  skins/_with3d.ts         ✅ v2 (Z_LADDER, DEFAULT_PBR, slabSet, keyLight)
  skins/depth.ts           ✅ webgl-slabs
  skins/glass.ts           ✅ Glass v2
  skins/index.ts           ✅ 9 regenerated 3D entries
  lib/depth/slabEngine.ts  ❌ WRITE (§3.2)
  lib/depth/Stage3D.tsx    ❌ WRITE (§3.3)
  lib/depth/blurGovernor.ts❌ WRITE (§3.4)
  components/surface/SceneBackdrop.tsx ❌ WRITE (§3.5)
  index.ts                 ❌ exports (§3.6)
apps/web/app/layout.tsx    ❌ mount SceneBackdrop + BlurGovernor (§3.7)
apps/web/app/design/page.tsx ❌ isSupported webgl2, badge, Stage3D wrap (§3.7)
```
(❌ = not started; everything else ✅ and verified by tsc + build:skins)

## 8. Open micro-tasks / notes
- `useSkin` import of `Capability` may now be type-only-unused — check `bunx tsc` output if lint flags.
- `three` types: `@types/three@0.170` installed; `three` resolves via workspace hoisting for apps/web.
- If `@types/three` mismatches the installed three version → align both to ^0.170.
- Governor must not set `data-blur="off"` on roles that don't blur under the active skin (A.4 emission
  also covers `solid` roles → stale flags would swap in opaque paint wrongly).

## 9. AFTER the engine fix — laptop example page (user's deferred request, do NOT start earlier)
- Route: `apps/web/app/laptops/page.tsx` (content-only laptop-brand homepage).
- Requirements from user: **no images**, all visuals in CSS (typography, charts/tables, gradients OK),
  content-rich; sections: own-model comparison table (our lineup vs each other) AND rival-brand
  comparison table; uses `@ecomerece/ui` components + the skin engine (mat-* roles, no literal colors).
- Follow existing page conventions (App Shell/spacing from DESIGN.md; no images means no <img>/next/image).
- Validate with the same pipeline + `bun run --filter web build`.

