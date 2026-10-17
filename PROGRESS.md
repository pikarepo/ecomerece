# PROGRESS — live tracker

> **▶️ RESUMED 2026-10-15 (user instruction — non-stop work).** Batches 62–70 landed in the prior stretch (selection/slider/inputs/upload/validation/layouts/search-filter extras · security forms). **Batch 71 (floating nav) + Batch 72 (tabs variants) landed 2026-10-15**, each with the full `bun run gate` green. Then **Blue skin landed 2026-10-15** (`skins/blue.ts` + A2 `data-accent="skin"` wiring in `useSkin`/bootstrap). Then **Batch 73 (steppers)** · **Batch 74 (side-nav variants)** · **Batch 75 (bottom nav variants)** · **Batch 76 (footers)** · **Batch 77 (command palette)** · **Batch 78 (share links & history nav)** · **Batch 79 (site-search overlay & voice search)** all landed 2026-10-15 with the full `bun run gate` green; see Last-landed rows. **Batch 80 (table variants) landed 2026-10-16** with `bun run gate` green — §E is complete and §F data display is now open. **Hydration fix landed 2026-10-16**: `components/data/BusinessHours.tsx` no longer reads the live clock during render — the first paint is now a deterministic `CLOSED_STATUS` (identical server/client) and a mount-only effect swaps in the real status, killing the `/design` prerender hydration mismatch (`bg-green-500`/`Open` vs `bg-ink-3`/`Closed`). **Batches 81–87 and 90 landed 2026-10-16** — batch 81 (table power), batch 82 (in-cell marks), batch 83 (people), batch 84 (content cards), batch 85 (commerce cards), batch 86 (work cards + card variants), batch 87 (lists) and batch 90 (documents; rows 88/89 are ⛔ heavyweight) — all with the full `bun run gate` green. **Batch 91 (financial) landed 2026-10-16** with `bun run gate` green. **Batch 92 (media display) landed 2026-10-16** with `bun run gate` green — **§F data display is now complete** (rows 88/89 remain ⛔ heavyweight). **Batch 93 (modal variants) landed 2026-10-16** with `bun run gate` green, opening **§G**. **Batch 94 (popover variants) landed 2026-10-16** with `bun run gate` green. **Batch 95 (toast upgrades) landed 2026-10-16** with `bun run gate` green. **Batch 96 (system banners) landed 2026-10-16** with `bun run gate` green — and the `/design` page was **re-sequenced so batch sections render in strict ascending order (first → last), per user instruction**. **Batch 97 (loading) landed 2026-10-16** with `bun run gate` green. **Batch 98 (state pages) landed 2026-10-16** with `bun run gate` green. **Hydration fix landed 2026-10-16 (user-reported)**: `InfiniteScrollLoader` (batch 97) evaluated `typeof IntersectionObserver !== 'undefined'` during render — SSR painted the button fallback while the client painted the sentinel; support is now detected in a mount-only effect so the first paint is deterministic (cf. the batch-11 BusinessHours fix). **Batch 99 (guidance) landed 2026-10-16** with `bun run gate` green — **§G is now complete** (rows 93–99 all ✅).
> **Next task:** `todo/09-components-master-backlog.md` → **§H charts open with batch 100** (area family: stacked area · step line · spline (LineChart demo exists — promote + variants) · dual-axis · small multiples — engine: ink+accent per §23, SVG-first, happy-dom-testable). §G is complete.
> Per-batch checklist: component file (+`/** @jsxImportSource react */` line 1 — **required for any component file first rendered by `bun test` from the repo root**, cf. `Tabs.tsx`/`Dropdown.tsx` fix in batch 72) → test in `packages/ui/test/` (`_dom.ts` harness, `registerDom`/`render`/`fire`) → barrel export → design-page demo **appended in ascending batch order (user convention: batches run first → last on `/design`; the page was fully re-sequenced in batch 96)** → DESIGN.md `E.5.59+` row → todo/09 row ✅ → `bun run gate` → PROGRESS.md row. Nothing lives only in chat.
> Rules per `todo/README.md`: gate (`lint → typecheck → test → build`) must be green before a batch is marked done; batch statuses update here as each lands.

---

## Last landed & verified (most recent first)

| When | What | Evidence |
|---|---|---|
| 2026-10-16 | **Batch 99 — guidance** (§G, closes the section): new `feedback/Guidance.tsx` over `Popover`/`Modal`/`Button`/`Progress`/`ProgressDots` — **`InlineHelp`** (“?” affordance or custom label, click-popover explanation) · **`HelpPanel`** (right-edge `Modal` drawer: intro + `HelpPanelItem[]` links/descriptions + footer) · **`ProductTour`** (Portal scrim + ringed **spotlight** measured from each step's `target` selector, re-measured on resize, centred card when target-less; “Step X of N”, Back/Next→Finish, Skip, clickable `ProgressDots`, controlled `step`+`onStepChange` or internal, **Escape → `onSkip`**) · **`ChecklistWidget`**/`GuidanceChecklistItem` (N-of-M count + `Progress` bar, `aria-pressed` toggle rows, line-through, per-item links, `onToggle` + `onDone` on completion) · **`TipsCarousel`**/`GuidanceTip` (live-region card, “Tip N of M”, wrap prev/next + dots) · **`FeatureAnnouncement`** (What's-new anchor + NEW chip → card with description, `media` slot, CTA + “Got it” `onDismiss`) · **`ChangelogPopup`** (version chips, `Latest` tag, bullet items, view-all link) · **`OnboardingModal`** (welcome `Modal`: brand, feature bullets, Skip/`onStart`); new/beta tags remain ✅ `Badge`. **User-reported hydration fix**: `InfiniteScrollLoader` (batch 97) now detects `IntersectionObserver` support in a mount-only effect — SSR and first client render both paint the deterministic button fallback, sentinel upgrades post-mount (documented in E.5.83). Test `test/batch99-guidance.test.tsx` (12 cases incl. spotlight measurement + controlled-tour lock); feedback-barrel exports (8 components + types; `ChecklistItem` name collision with batch 87 caught by typecheck → renamed `GuidanceChecklistItem`); design demo (`Batch99GuidanceDemos`, feedback tab, **directly after batch 98 per the order convention**); DESIGN.md E.5.83; todo/09 row 99 ✅. | gate green: lint ✓ · typecheck ✓ · `bun test` 837/0 · web build ✓ (`/design` prerendered, `Guidance (batch 99)` present, order still `ORDER_OK`) — one demo `useState` union-inference type error fixed at the cause before the final run |
| 2026-10-16 | **Batch 98 — state pages** (§G): new `feedback/StatePages.tsx` (line-1 pragma) over a private **`StatePageShell`** (centred column mirroring `EmptyState` metrics; mono eyebrow → `size-16` tone circle (`neutral/success/warning/danger` → `bg-*-10`) → title → ≤42ch copy → `mid` slot → action row). **`OfflineState`** (WifiOff + sync note + `onRetry`/extra action — distinct from in-view `ErrorState`, which stays untouched) · **`ErrorPage`**/`StatePageErrorCode`/**`ERROR_PAGE_COPY`** for **400·403·404·500·503** (mono eyebrow label + oversized `text-6xl` code with `sr-only — <label>`, tone-mapped icons 400/403/503 warning · 404 neutral · 500 danger, overridable copy, `onRetry` convenience, `primaryAction`/`secondaryAction` slots, mono `details` box; kit 404 mirrors Next's `not-found`) · **`UnderConstructionPage`** (Construction icon, ETA, decorative aria-hidden indeterminate `Progress`) · **`ExpiredLinkPage`** (`Link2Off`, `expiresAt`, `onResend` + `homeHref`) · **`ThankYouPage`** (success PartyPopper, mono `reference` chip, actions) · **`VerificationPendingPage`** (MailCheck, copy embeds `maskedEmail`, spam `hint`, `onResend`, decorative bar). Test `test/batch98-state-pages.test.tsx` (11 cases; icon sanity asserted function-or-object — lucide icons are `memo(forwardRef)`, an assumption corrected at the cause); feedback-barrel exports (6 components + props types, `StatePageErrorCode`, `ERROR_PAGE_COPY`); design demo (`Batch98StatePageDemos`, feedback tab, **directly after batch 97 per the order convention**); DESIGN.md E.5.82; todo/09 row 98 ✅. | gate green: lint ✓ · typecheck ✓ · `bun test` 825/0 · web build ✓ (`/design` prerendered, `State pages (batch 98)` present, order still `ORDER_OK`) |
| 2026-10-16 | **Batch 97 — loading** (§G): `data/Spinner.tsx` + **`SpinnerVariant` `ring\|dots\|bars\|pulse\|orbit`** (default `ring` = baseline `Loader2`; staggered `animate-pulse` dots (3×150ms) / bars (4 heights × 120ms) / single pulse disc / orbit = `animate-spin` wrapper + offset dot; `role="status"` + sr-only label intact; **JSX pragma added**). `data/Progress.tsx` + **`ProgressVariant` `linear\|circular\|stepped\|indeterminate\|buffer`** (+ `steps`/`buffer`/`showValue`/`label`; linear baseline preserved + `aria-label`/`data-variant`): circular = 2-circle SVG dash sweep with `stroke-{tone}` + centre % (hide via `showValue`), stepped = N pills with `aria-valuenow`/`max` = filled/total (0-edge tested), indeterminate = new **`.fx-indeterminate` keyframe in `styles/engine.css`** (250% translate for a 40%-wide bar; `prefers-reduced-motion` → static bar) and **no `aria-valuenow`** (AT says busy, not a fake value), buffer = soft `bg-tone/30` loaded fill under the solid fill. New `data/LoadingVariants.tsx`: **`InfiniteScrollLoader`** (trailing sentinel — distinct from batch-87 `InfiniteList`; `data-state` loading/idle/sentinel/end; `IntersectionObserver` guarded → **Load-more-button fallback**, paused while loading, disconnected on cleanup), **`RouteProgressBar`** (mounted `fixed top-0 z-toast h-0.5`, `scale-x-0↔100`, `aria-hidden` when idle), **`SplashScreen`** (`fixed inset-0`: brand/title/description/spinner/status, controlled `open`; nested `Spinner` owns the live region). Test `test/batch97-loading.test.tsx` (17 cases); data-barrel exports (`SpinnerVariant`/`ProgressVariant`/three components + props); design demo (`Batch97LoadingDemos`, feedback tab, **rendered directly after batch 96 per the order convention**); DESIGN.md E.5.81; todo/09 row 97 ✅. Source `</div>` whitespace glue from the batch-96 reorder seam also repaired. | gate green: lint ✓ · typecheck ✓ · `bun test` 814/0 · web build ✓ (`/design` prerendered, `Loading (batch 97)` present, order still `ORDER_OK`) |
| 2026-10-16 | **Batch 96 — system banners** (§G): new `feedback/SystemBanners.tsx` (line-1 JSX pragma) over `Button`/`Switch`/`Modal` + Banner's tinted-rule tones, visibility controlled via `open`. **`AnnouncementBanner`** (in-flow status strip, `aria-label` region semantics via `<section>`, link + labelled dismiss) · **`PromoBanner`** (accent card: `badge` slot, headline/description, ghost secondary + primary/accent-link CTA, absolute dismiss) · **`CookieConsentBanner`** (bottom-fixed `z-chrome` + safe-area; decide step Reject/Manage/Accept ⇄ manage step four `Switch` categories with Necessary locked → `onSave(prefs)` `CookiePreferences`) · **`GdprConsentModal`** (`Modal scrollable` + `ConsentPurpose[]`; required locked, **optional purposes default OFF** (pre-ticked consent is invalid), footer Reject·Save·Accept, `onSave(Record<string,bool>)`, init-on-mount) · **`PromptModal`/`PromptKind`** install\|update\|permission families (icon well + per-kind default copy/labels, all overridable; confirm doesn't self-close) · **`SessionTimeoutWarning` + `formatCountdown`** (`s`/`m:ss`, ≤10s `data-urgent` danger state, Escape/backdrop = **Stay** never sign-out, optional danger Sign out). Also fixed: **`controls/Switch.tsx` was missing the JSX pragma** (compiled to Hono nodes under root `bun test`). **User instruction applied: `/design` re-sequenced — all batch sections now render strictly ascending first→last** (one-off TS-AST script: container JSX children split into contiguous chunks, keyed by `batch N` from titles/component names/comments, non-batch chunks anchored to the nearest preceding batch; multiset-preserving; verified ascending `9→96` in source and in the prerendered `design.html`). Test `test/batch96-system-banners.test.tsx` (13 cases); design demo (`Batch96SystemBannerDemos`, feedback tab, visible in `all`); DESIGN.md E.5.80; todo/09 row 96 ✅. | gate green: lint ✓ · typecheck ✓ · `bun test` 797/0 · web build ✓ (`/design` prerendered, order verified) |
| 2026-10-16 | **Batch 95 — toast upgrades** (§G): baseline `feedback/Toast.tsx` gains additive capabilities with existing `push({ message, tone, durationMs, action })` call sites untouched (root `ToastProvider` keeps its look). **Positions** — `ToastPosition` (`top\|bottom` × `left\|center\|right`) as a provider prop **and** per-toast `position` override; one `fixed z-toast` region per position in use (`data-toast-region`/`data-position`), mobile stays a full-width `left-4 right-4` strip, `sm:` tightens to a corner, safe-area insets per edge. **Loading toast** — `loading: true` swaps the tone dot for a spinning `LoaderCircle` and defaults to **sticky**: `durationMs ≤ 0` now means no auto-dismiss timer (previously `0` fired instantly); explicit value still wins. **`promise(pending, labels, opts?)`** on `useToast()` — sticky loading card that settles to `success`/`danger` (labels may be functions of the settled value/error), re-arms the default 4s, **rethrows** the original error. **Grouped** — `group` collapses same-key pushes into one card (latest message/tone wins, `+N` badge with `sr-only` text, timer re-arms) backed by a synchronous `toastsRef` mirror via a single `commit()` writer; §21.12 three-toast cap still applies. **Progress toast** — `progress` (clamped by new **`clampProgress`**) renders a `role="progressbar"` bar (`aria-valuenow`) + mono `%` label; **`push` now returns the id**, context gains **`update(id, patch)`** (a `durationMs` in the patch re-arms; `progress: undefined` drops the bar) and **`dismiss(id)`**; required `/** @jsxImportSource react */` pragma added. Test `test/batch95-toast-upgrades.test.tsx` (14 cases); design demo (`Batch95ToastDemos`, feedback tab, visible in the `all` view); DESIGN.md E.5.79; todo/09 row 95 ✅. | gate green: lint ✓ · typecheck ✓ · `bun test` 784/0 · web build ✓ (`/design` prerendered, demo confirmed) |
| 2026-10-16 | **Batch 94 — popover variants** (§G): baseline `overlay/Popover.tsx` gains additive props — **`triggerOn` `click\|hover\|focus`** (click keeps the toggle; hover opens on wrapper enter/leave — the panel is a DOM child so no gap timer; focus opens on React `focus`/`focusin`, closes when `relatedTarget` leaves the wrapper; Escape + outside-click keep working in every mode) and **`arrow`** (rotated `size-2.5 mat-overlay` square hugging the panel edge: `-top-1`/`-bottom-1` × `left-5`/`right-5`/centred by `align`) + the required JSX pragma. Wrapper `noStaticElementInteractions` suppressed with justification (same pattern as Modal's backdrop; handlers only open/close). New `overlay/PopoverVariants.tsx` — **`MegaDropdown`** (`MegaMenuColumn[]` static 1–4 `grid-cols-*` over `min-w-[420px]`, `MegaMenuItem` `href`→anchor / else `onSelect` button, optional bordered footer, hover-triggered) and **`QuickViewPanel`** (peek card: title/subtitle/`media` slot/description + 2-up `<dl>` meta + `actions`, arrow on by default, `w-72`, hover-triggered — interactive, distinct from CSS-only `HoverCard`/click `Dropdown`/modal `SidePanel`). Both compose the extended `Popover`. Test `test/batch94-popover-variants.test.tsx` (7 cases, incl. baseline click regression + hover/focus via `mouseover`/`focusin` synthesis); design demo (`Batch94PopoverVariantDemos`, overlay tab, visible in the `all` view); DESIGN.md E.5.78; todo/09 row 94 ✅. | gate green: lint ✓ · typecheck ✓ · `bun test` 770/0 · web build ✓ (`/design` prerendered) |
| 2026-10-16 | **Batch 93 — modal variants** (§G opens): baseline `overlay/Modal.tsx` gains additive props — **`size` `xl\|fullscreen`** (`max-w-4xl` / `h-full w-full max-w-none`), **`scrollable`** (flex column: pinned header/footer + `overflow-y-auto` body), **`side="left\|right"`** (edge-anchored, backdrop `justify-start\|end`, `data-side`), and stacking gates **`trapFocus`**/**`closeOnEscape`** (set `false` on the lower modal so Tab/Escape stay with the top one); plus the required `/** @jsxImportSource react */` pragma. **Real defect fixed in `lib/useOverlay.ts`**: the focus trap never installed through `Portal` (mount-gated → effect first ran on a `null` container and `[open, trapFocus]` deps never re-ran) — container now tracked with `useState` under the same `containerRef` name (all consumers only attach it as `ref`), trap effect depends on it, new `closeOnEscape` option (default true) added; restores the §21.9 trap contract for Modal/SidePanel/BottomSheet/ConfirmDialog/SiteSearch. New `overlay/ModalVariants.tsx` — **`WizardDialog`** (stepped dialog over `Modal` + batch-73 `ProgressDots` with `aria-current="step"`, "Step X of N", Back/Next with ends disabled, Next→`finishLabel` on last step, controlled/uncontrolled, `onFinish` for the owner to close) + pure **`clampStep`**; step type `ModalWizardStep` (form barrel already owns `WizardStep`). Test `test/batch93-modal-variants.test.tsx` (11 cases, incl. stacked Escape isolation + focus-trap behaviour); design demo (`Batch93ModalVariantDemos`, overlay tab); DESIGN.md E.5.77; todo/09 row 93 ✅. | gate green: lint ✓ · typecheck ✓ · `bun test` 763/0 · web build ✓ (`/design` prerendered) |
| 2026-10-16 | **Batch 92 — media display** (§F, closes the section): new `components/data/MediaDisplay.tsx` — pure `fmtTime` (`m:ss`) + a private `Art` artwork helper (`<img>` alt/lazy → `aria-hidden` icon fallback per surface) + seven surfaces. **`ThumbnailGrid`** (`<ul>` aspect-video tiles, `columns` 2/3/4/6 map or responsive default, `aria-pressed` buttons, `ring-2 ring-accent` selected, duration chip, accent now-playing glyph + `sr-only`) · **`PosterCard`** (`<figure>` `aspect-[2/3]` + `bg-ink/60` scrim `text-white` caption, `Badge` slot, optional `aria-label="Play <title>"` button) · **`PlaylistRow`** (composable row: art + accent title while playing + duration + `aria-pressed` like + play/pause with flipping label) · **`PodcastRow`** (show · date + optional `progress` 0–1 → `role="progressbar"` + `%` readout + download/play) · **`NowPlayingBar`** (reuses batch-57 `MediaControls` transport + private `SeekSlider`: `role="slider"`/`tabIndex`/`aria-valuetext` `1:12 of 3:20`, click-seek guarded, ←/→ ±5s, Home/End) · **`LyricsView`** (`mat-well` scroll `<section>`; active line = accent rail + `font-medium` **and** `aria-current`, optional per-line buttons, `sr-only` timestamps) · **`QueuePanel`** (`<ol>` + "N tracks" header + Clear; current `aria-current` + accent tint, title button `onSelect`, `Move <t> up/down` with ends disabled, `Remove`, empty state; controls are siblings — no nested buttons). Complements `PlaylistList` (batch 87 list) rather than duplicating. Test `test/batch92-media-display.test.tsx` (13, keyboard-seek via synthesized `keydown`); design demo (`Batch92MediaDisplayDemos`, data tab); DESIGN.md E.5.76; todo/09 row 92 ✅. | gate green: lint ✓ · typecheck ✓ · `bun test` 752/0 · web build ✓ (`/design` prerendered) |
| 2026-10-16 | **Batch 91 — financial** (§F): new `components/data/Financial.tsx` — pure signed `formatMoney` (locale-stable `Intl.NumberFormat`) + ten surfaces. **`PriceChangeBadge`** (`directionOf` → `bg-success/12` \| `bg-danger/12` \| neutral `bg-ink/8`, lucide `TrendingUp\|TrendingDown\|Minus`, `upIsGood`, `sr-only` direction so never colour-only) · **`PriceTicker`** (`PriceQuote` card reusing the existing `Sparkline`, tone from change sign) · **`TickerTape`** (`<ul aria-label="Market ticker">`, percent spans `role="img"`) · **`OrderBook`** (bids/asks depth bars `bg-success/15`\|`bg-danger/15`, `size/max` width) · **`DepthChart`** (cumulative bid/ask `<polygon>`+`<polyline>` areas, `vectorEffect="non-scaling-stroke"`, `role="img"` figure) · **`PortfolioBreakdown`** (segmented tone bar + legend swatch/percent/`formatMoney` per `Holding`) · **`TransactionList`** (`ArrowDownRight`/`ArrowUpRight` in/out rows, signed amount, Pending) · **`BalanceCard`** (`mat-primary text-accent-ink` hero + Available/Pending `<dl>` + optional Plus action) · **`InvoiceReceipt`** (line-item `<table>` + Subtotal/Tax/Total from `taxRate`) · **`BudgetBar`** (`role="progressbar"` clamped `aria-valuenow`, success → warning ≥80% → danger, "left"/"Over budget by"). Also fixed the lint-flagged bare-span `aria-label` → `role="img"`. Test `test/batch91-financial.test.tsx` (12); design demo (`Batch91FinancialDemos`, data tab); DESIGN.md E.5.75; todo/09 row 91 ✅. | gate green: lint ✓ · typecheck ✓ · `bun test` 739/0 · web build ✓ (`/design` prerendered) |
| 2026-10-16 | **Batch 90 — documents** (§F): new `components/data/Documents.tsx` over a private compact `ToolButton` (`size-8`; `IconButton` is fixed `h-11`). **`DocumentPreview`** (`<section>` viewer: filename, bounded prev/next page, zoom, download, fullscreen + `3/4` page sheet) · **`DocumentThumbnails`** (`<ul>` page rail, `aria-current` active) · **`AnnotationPins`** (numbered pins by `x`/`y` percent + linked note `<ol>`) · **`VersionHistory`** (`<ol>` timeline + `Current` badge + Download/Restore) · **`DiffView`** (side-by-side line diff, status derived from `left`/`right` — `bg-success/12`/`bg-danger/12`/`bg-warning/12`) · **`ReaderMode`** (`role="progressbar"` reading bar + A-/A+ size steps `ReaderSize` → `text-sm/base/lg/xl`, `max-w-prose`) · **`TocPanel`** (card TOC reusing `TocItem`, collapsible header). Complements existing `StickyToc` (rail TOC ✅) and `TextDiff` (inline ✅) rather than duplicating. Test `test/batch90-documents.test.tsx` (10, required-children rendered as JSX for `noChildrenProp`); design demo (`Batch90DocumentDemos`, data tab); DESIGN.md E.5.74; todo/09 row 90 ✅. | gate green: lint ✓ · typecheck ✓ · `bun test` 727/0 · web build ✓ (`/design` prerendered) |
| 2026-10-16 | **Batch 87 — lists** (§F): new `components/list/Lists.tsx` — thirteen list/feed patterns over a shared row shell (`<ul>` root, `mat-card` framed, `focusRing()` on interactive rows). **`ChatList`** (avatar + snippet + time + unread badge + active row) · **`ContactList`** (avatar + subtitle + `mailto:` link) · **`NotificationList`** (leading `LucideIcon` + unread `role="img"` dot) · **`ChecklistList`** (native `sr-only` checkbox + strike-through when done) · **`TodoList`** (`TodoPriority` → `Badge` + `aria-pressed` toggle + due + `onAdd`) · **`PlaylistList`** (index column swaps to a playing `Music` glyph) · **`SearchResults`** (local `Highlight` wraps query matches in `<mark>`) · **`StickyHeaderList`** (pinned `sticky top-0 bg-surface-2` group `<h4>`s) · **`AlphabetIndexList`** (group by first letter + `nav[aria-label="Jump to letter"]` anchor rail) · **`SwipeList`** (`bg-canvas` row over Complete/Delete action layer) · **`ReorderableList`** (`GripVertical` + `Move <label> up/down`, ends disabled, `onReorder(next)`) · **`InfiniteList`** (`ReactNode[]` + `hasMore`/`loading`/`onLoadMore`) · **`NestedList`** (recursive `aria-expanded` expanders). Pragmas added to `list/GroupedList.tsx` + `list/ListHeader.tsx`. Fixed stray unused imports/exports + `bg-card`→`bg-canvas` (undefined `bg-ground`/`bg-card` are no-op utilities). Test `test/batch87-lists.test.tsx` (15, real `MouseEvent` helper for checkbox onChange); design demo (`Batch87ListDemos`, data tab); DESIGN.md E.5.73; todo/09 row 87 ✅. | gate green: lint ✓ · typecheck ✓ · `bun test` 717/0 · web build ✓ (`/design` prerendered) |
| 2026-10-16 | **Batch 86 — work cards & card variants** (§F): two new `data` files. `WorkCards.tsx` — thirteen cards over a private `Shell` + `Meta`/`Dot` heads, reusing `Avatar`/`Rating`/`Badge`/`Chip`/`IconTile`/`Progress`/`Button`. **`ContactCard`** (mailto/tel links + Email/Call) · **`BusinessCard`** (rating/reviews + address/phone/website + Directions) · **`TeamMemberCard`** (`<ul>` socials) · **`ReviewCard`** (verified + rating + Helpful) · **`NotificationCard`** (tone `IconTile` + unread `role="img"` dot + Mark read/Dismiss) · **`TaskCard`** (`aria-pressed` toggle + priority `Badge` + assignee `Avatar` + due + `Chip` tags) · **`ProjectCard`** (`Progress` + `AvatarGroup` + `doneCount/taskCount`) · **`FileCard`** (kind→icon map + download) · **`FolderCard`** (item count + shared) · **`AppCard`** (rating + Install/Open) · **`IntegrationCard`** (Connect/Disconnect) · **`FeatureCard`** · **`MetricAlertCard`** (status→icon/tone + `TrendArrow` + threshold + View). `CardVariants.tsx` — **`HorizontalCard`** · **`OverlayImageCard`** (text over `bg-ink/60` scrim) · **`HoverRevealCard`** (group-hover/focus-within reveal) · **`FlipCard`** (3D `rotateY` + `aria-hidden` face + flip button) · **`ExpandableCard`** (`aria-expanded`/`aria-controls` + `hidden`) · **`SelectableCard`** (native `sr-only` checkbox) · **`DraggableCard`** (`draggable` + grip) · **`StackedCards`** (`<ul>` deck + `+N`). Pragmas added to `data/Skeleton.tsx` + `surface/IconTile.tsx`. Tests `test/batch86-work-cards.test.tsx` (15) + `test/batch86-card-variants.test.tsx` (12); design demo (`Batch86WorkCardDemos`, data tab); DESIGN.md E.5.72; todo/09 row 86 ✅. | gate green: lint ✓ · typecheck ✓ · `bun test` 702/0 · web build ✓ (`/design` prerendered) |
| 2026-10-16 | **Batch 85 — commerce cards** (§F): new `data/CommerceCards.tsx` — eight commerce cards + helpers. Pure **`formatPrice`** (locale-stable `Intl.NumberFormat` currency) and **`maskCardNumber`** (keeps last four, `•••• •••• •••• 4242`). Shared private `Shell`/`Cover`/`Meta`/`Dot`/`CardTitle`/`PriceRow` (price + struck-through original + computed `-N%` badge). **`ProductCard`** (cover badge · wishlist `Heart` button · `Rating`+reviews · price/original/discount · `StockIndicator` · add-to-cart) · **`PropertyCard`**/**`ListingCard`** (`/month` interval · `MapPin` address · beds/baths/area) · **`HotelCard`** (guest-score chip · `role="img"` star row · amenity icon map · "/ night") · **`FlightCard`** (airline · from→to times · duration/`Direct`·`N stops` · price + Select) · **`TicketCard`** (event stub + dashed stub with `Notch` · price · mono code) · **`CouponCard`** (dashed border · big discount · code badge · expires · Copy) · **`GiftCard`** (`1.586:1` material card · brand · formatted balance · code) · **`CreditCardVisual`** (`role="group"` label · masked mono number · holder/expiry · `tone` material role). Card visuals use skin material roles (`mat-primary text-accent-ink`/`mat-raised`/`mat-panel`) — no raw theme tokens/gradients. Test `test/batch85-commerce-cards.test.tsx` (19 cases); design demo (`Batch85CommerceCardDemos`, data tab); DESIGN.md E.5.71; todo/09 row 85 ✅. | gate green: lint ✓ · typecheck ✓ · `bun test` 675/0 · web build ✓ (`/design` prerendered) |
| 2026-10-16 | **Batch 84 — content cards** (§F): new `data/ContentCards.tsx` — eight content cards over a shared private `Shell` (root `<a>` when `href` else `<article>`), `Cover` (aspect video/wide/square/poster, lazy zoom image + `ImageOff` placeholder), `PlayOverlay` (real play `<button>` when `onPlay` & no href, else decorative), `DurationBadge`, `Meta`/`Dot`, `TagRow`. **`ArticleCard`** (category badge + excerpt + byline) · **`BlogCard`** (author row + tags + read time) · **`NewsCard`** (section kicker + source) · **`VideoCard`** (duration badge + play + channel/views) · **`AlbumCard`**/**`MusicCard`** (square cover + artist/year/tracks) · **`PodcastCard`** (inline cover + show/episode/duration) · **`MovieCard`** (2:3 poster + rating + genres) · **`RecipeCard`** (cookTime/servings/difficulty + rating). Also added the missing `/** @jsxImportSource react */` pragma to `surface/Badge.tsx` (needed now that tests render it). Test `test/batch84-content-cards.test.tsx` (12 cases); design demo (`Batch84ContentCardDemos`, data tab); DESIGN.md E.5.70; todo/09 row 84 ✅. | gate green: lint ✓ · typecheck ✓ · `bun test` 656/0 · web build ✓ (`/design` prerendered) |
| 2026-10-16 | **Batch 83 — people** (§F): `surface/Avatar.tsx` gains `status` (presence dot: `online`→`bg-success`/`away`→`bg-warning`/`busy`→`bg-danger`/`offline`→`bg-ink-3`, `ring-2 ring-surface-1`, appended to the accessible name so presence is never colour-only) and a `badge` overlay (top-right); §21.18 now applied (initials fallback `bg-surface-4 text-ink-2` + `border border-line/10`); `getInitials` exported. New `surface/People.tsx`: **`AvatarGroup`** (overlapping avatars, `-space-x-2`, `+N` chip beyond `max`, `total` override) · **`TeamStack`** (`<ul>` avatar+name+role columns, `+N` tile, `showNames`) · **`NameRole`** (avatar + name + muted role, `href`/`trailing`/`stacked`) · **`Byline`** (avatar + `prefix` + author(`href`) + role + date joined by `·`). Test `test/batch83-people.test.tsx` (16 cases); design demo (`Batch83PeopleDemos`, data tab); DESIGN.md §21.18 amended + E.5.69; todo/09 row 83 ✅. | gate green: lint ✓ · typecheck ✓ · `bun test` 644/0 · web build ✓ (`/design` prerendered) |
| 2026-10-16 | **Batch 82 — in-cell marks** (§F): three new `components/data` primitives. **`Bullet`** (bullet graph) — `value`/`target?`/`ranges?`/`max?`/`tone`/`showValue?`; qualitative bands (`bg-line/10\|20\|30`), tone-filled measure, `bg-ink` target tick, `role="img"` label combining value/target/bands. **`HeatCell`** — intensity-mapped cell (`value`/`min`/`max`/`ramp` = `accent\|success\|warning\|danger\|diverging`/`format?`/`children?`); background is a **role class + opacity bucket** (`heatClass` → `bg-success/40` etc.) so it satisfies the 02-E §1 markup contract (no raw theme tokens); `diverging` maps sign→green/red with intensity `|value|/maxAbs`; pure `heatIntensity`/`heatClass` exported. **`IconIndicators`** — `StatusLights` traffic-light triplet (only the active light coloured, so never colour-only; `size`/`orientation`) and `TrendArrow` (`direction`/`value?`/`percent?`/`upIsGood?`/`tone?`; lucide `TrendingUp\|TrendingDown\|Minus`; pure `formatDelta` exported). Test `test/batch82-incell.test.tsx` (17 cases); design demo (`Batch82InCellDemos`, data tab); DESIGN.md E.5.68; todo/09 row 82 ✅. | gate green: lint ✓ · typecheck ✓ · `bun test` 628/0 · web build ✓ (`/design` prerendered) |
| 2026-10-16 | **Batch 81 — table power** (§F): `components/data/Table.tsx` adds six interactive capabilities, all additive. **Merged cells** — a column may carry `colSpan`/`rowSpan`, applied to its header + body + `tfoot` cells. **Frozen columns** — `frozen: 'left' \| 'right'` pins with `sticky` + `z-raised`; offsets accumulate from `width`/`frozenOffset`, body cells get opaque `bg-surface-1`. **Resizable** — `resizable` + `onResize(key, width)` renders a `role="separator"` handle per header (pointer-drag, clamped to 48px, width stamped on cells). **Reorderable** — `reorderable` + `onReorder(from, to)`; `<tr>` draggable (own `dragIndex` state, no `DataTransfer`) plus a keyboard grip (↑/↓). **Multi-sort** — `multiSort`/`sorts`/`onSortsChange` (`TableSort[]`); plain click cycles `asc → desc → removed`, Shift-click toggles a clause, active columns show a rank chip; pure `cycleSort` exported. **Editable** — `editable` + `onCellEdit(rowKey, columnKey, value)`; body cells swap to a text input (seeded from `column.editValue` or a string cell), commit on Enter / discard on Escape; per-column opt-out `editable: false`. Control columns now render reorder → expand → select. `TableSort` exported from the data barrel; test `test/batch81-table-power.test.tsx` (15 cases, incl. `MouseEvent` shift-click + pointer-drag synthesis + `cycleSort` units); design demo (`Batch81TablePowerDemos`, data tab); DESIGN.md E.5.67; todo/09 row 105 ✅. Batch-17/80 tests remain green. | gate green: lint ✓ · typecheck ✓ · `bun test` 611/0 · web build ✓ (`/design` prerendered) |
| 2026-10-16 | **Batch 80 — table variants** (§F data display opens): `components/data/Table.tsx` gains additive variant props. **Presentation** — `striped` (zebra body rows, skipped on selected rows via explicit index parity so detail rows don't offset it), `bordered` (rule between every column + hairline border), `borderless` (flush: no card chrome/dividers/outer border; wins over `bordered`/`cardRows`), `hoverable` (row tint without `onRowClick`), `cardRows` (`border-separate` + `border-spacing-y-2`, cells `bg-surface-2` with rounded ends); `responsive="stack"` reflows below `md` (`table` → `block md:table`, header `hidden md:table-header-group`, rows `block … md:table-row`, cells `flex … md:table-cell` with the column's `stackLabel` — falling back to a string `header`, then `key` — as a `md:hidden` label, controls hidden on mobile). `compact` density already shipped. **Expansion** adds one leading toggle column for two models: `renderDetail(row)` (master-detail, renders a full-width detail `<tr>` under an expanded row) and `getSubRows(row)` (nested/tree, flattens the visible tree depth-first and indents each descendant's toggle cell by `depth × 16px`); controlled (`expandedKeys` + `onExpandedKeysChange`) or uncontrolled (`defaultExpandedKeys`), toggle sets `aria-expanded` and stops click propagation so it never triggers `onRowClick`, leaves render a spacer. Data barrel exports `TableResponsive`; test `test/batch80-table-variants.test.tsx` (15 cases); design demo (`Batch80TableVariantsDemos`, data tab); DESIGN.md E.5.66 (plus §21.16 + the AVOID list amended: zebra striping is now opt-in via `striped`, not forbidden outright); todo/09 row 104 ✅. Batch-17 table tests remain green (purely additive). Theme tokens only, no `--m-*` in markup. | gate green: lint ✓ · typecheck ✓ · `bun test` 596/0 · web build ✓ (`/design` prerendered) |
| 2026-10-15 | **Batch 79 — site-search overlay & voice search**: two new files. `components/navigation/SiteSearch.tsx` — top-anchored `role="dialog"` panel mirroring `Modal` (`Portal` + `useOverlay` for body scroll lock, focus trap, focus restore and Escape) with `CommandMenu`'s listbox model: `Search` icon + `role="combobox"` field (`aria-expanded`/`aria-controls`/`aria-activedescendant`) + voice button + close ✕, a `role="listbox"` of grouped `role="option"` rows, and a footer of `Kbd` hints (↑↓ Navigate · ↵ Search · Esc Close) + optional `footer` slot. Query controlled (`value`/`onValueChange`) or internal (`defaultValue`); while empty the `trending` sections render (falling back to `sections` when none given), else `sections` filter case-insensitively over `label` + `keywords`; ↑/↓ cycle the active row (wrapping, resetting on query change), ↵ runs the active row (`onSelect` + `onClose`) or submits the trimmed query via `onSubmit`; scrim (`role="presentation"`) closes too; keyboard via `onKeyDownCapture` (happy-dom drops bubble-phase keydown on inputs). `components/navigation/VoiceSearch.tsx` — `useSpeechRecognition({ lang, continuous, interimResults, onResult, onError })` headless controller over the platform Web Speech API (`SpeechRecognition`/`webkitSpeechRecognition`, self-contained local types so no `lib.dom` dependency): `supported` detected in an effect (SSR renders unsupported), `start()` bails when unsupported/already listening, the handle is abandoned on `end`/`error` (restarting a finished handle throws), interim/final transcripts reported trimmed with `isFinal`; `VoiceSearchButton` wraps it in an `IconButton` (mic-off + disabled when unsupported, `aria-pressed` + pulsing red mic while listening) and `SiteSearch` embeds it (sets the query from each transcript, optional `submitOnVoice` auto-submit). Navigation barrel; tests `test/batch79-site-search.test.tsx` (12) + `test/batch79-voice-search.test.tsx` (10); design demo (`Batch79SiteSearchDemos`, layout tab); DESIGN.md E.5.65; todo/09 row 97 ✅. Theme tokens only, no `--m-*` in markup. | gate green: lint ✓ · typecheck ✓ · `bun test` 581/0 · web build ✓ (`/design` prerendered) |
| 2026-10-15 | **Batch 78 — share links & history nav**: two new files. `components/navigation/ShareLinks.tsx` — **`PermalinkCopier`** (copies `value`, else `url`/current location with optional `#anchor`, flips to `Check` + `copiedLabel` for `resetDelay` ms, reports text via `onCopied`) and **`ShareLink`** (prefers `navigator.share` unless `copyOnly`; a dismissed sheet (`AbortError`) aborts silently and never copies behind the user's back; else copies and reports `'share' \| 'clipboard' \| 'unavailable'` via `onShare`); shared best-effort `writeToClipboard` helper (insecure/denied leaves the button unchanged) + `useCopiedFlag` reset timer. `components/navigation/HistoryNav.tsx` — **`HistoryDropdown`** (split `mat-control`: back arrow `onBack`, disabled when omitted + chevron toggling a recent-entries menu reusing `Dropdown` with `triggerRef` + `useClickAway` + Escape, mirroring `OverflowTabs`; entries `{ id, label, hint?, icon?, href?, onSelect? }` truncated to `max` (default 8); chevron disables when empty; controlled `open`/`onOpenChange` or internal `defaultOpen`; selection calls `onSelect` then `onNavigate`) and **`RecentlyViewed`** (`<section>` + `<h3>` + optional `Clear` button, `<ul>` in `rail` (horizontal scroll) or `list` layout, `mat-control` rows with thumbnail/clock icon + label + `hint`; `href` rows render `Link`, else a button; empty → `null`). Navigation barrel; tests `test/batch78-share-links.test.tsx` (9 cases) + `test/batch78-history-nav.test.tsx` (12 cases); design demo (`Batch78ShareHistoryDemos`, layout tab); DESIGN.md E.5.64; todo/09 row 96 ✅. `packages/ui` stays store-free — frontend history stack (`useHistoryStackStore`) feeds props. Theme tokens only, no `--m-*` in markup. | gate green: lint ✓ · typecheck ✓ · `bun test` 559/0 · web build ✓ (`/design` prerendered) |
| 2026-10-15 | **Batch 77 — command palette**: new `components/navigation/CommandMenu.tsx` — `Portal` → `role="dialog"` `aria-modal` panel over a `bg-canvas/60` scrim; search field is `role="combobox"` (`aria-expanded`/`aria-controls`/`aria-activedescendant`) driving a `role="listbox"` of `role="option"` rows (`aria-selected` on the active row, `aria-keyshortcuts` normalised from `shortcut`: `⌘`/`⌥`/`⇧`/`⌃` → Meta/Alt/Shift/Control). Content model `CommandItem` (`id`/`label`/`icon`/`hint`/`shortcut`/`keywords`/`disabled`/`closeOnSelect`/`onSelect`) + `CommandGroup`; render order **quick actions (pinned) → recent searches → groups** (recents only while the query is empty; `closeOnSelect:false` keeps it open for "Clear recent searches"); filtering matches label + keywords and drops empty groups; ↑/↓ cycle (wrapping), ↵ runs the active row or submits the trimmed query via `onSubmitQuery`, Escape/outside-pointer dismiss via `useClickAway`; footer keyboard hints (↑↓ Navigate · ↵ Select · Esc Close) as `Kbd` chips + optional `footer` slot, per-item `shortcut` as trailing `Kbd` chips; controlled (`value`/`onValueChange`) or internal (`defaultValue`) query — `packages/ui` stays store-free (recents are props; baseline state lives in `packages/frontend` `useCommandPaletteStore`). Keyboard handling uses `onKeyDownCapture` (harness finding: React's bubble-phase keydown is dropped for `input`/`textarea` targets under happy-dom; capture fires — identical in a real browser). Navigation barrel; test `test/batch77-command-menu.test.tsx` (11 cases); design demo (`Batch77CommandMenuDemos`, layout tab); DESIGN.md E.5.63; todo/09 row 95 ✅. Theme tokens only, `mat-overlay` surface, no `--m-*` in markup. | gate green: lint ✓ · typecheck ✓ · `bun test` 538/0 · web build ✓ (`/design` prerendered) |
| 2026-10-15 | **Batch 76 — footers**: new `components/navigation/Footer.tsx` — shared `FooterLink`/`FooterColumn`/`SocialLink` model; **`SocialBar`** (labelled `<nav>` of round `mat-control` icon links, each `target="_blank" rel="noopener noreferrer"` + `aria-label`/`title`; `size` sm/md), **`MegaFooter`** (`mat-ground` sitemap: brand + newsletter beside up to four `<ul>` link columns, `h6` titles, bottom bar with social + legal copy + legal links in a `Container`), **`FatFooter`** (brand-forward: oversized `text-4xl`→`text-5xl` wordmark + tagline + social on the left, compact columns right, legal rule), **`StickyFooter`** (`sticky bottom-0 z-chrome` `mat-chrome` action bar, safe-area padding; flex content + `actions` slot + optional labelled dismiss ✕ via `onDismiss`); external `FooterLink`s get `target`/`rel` through `Link`; navigation barrel; test `test/batch76-footers.test.tsx` (6 cases); design demo (`Batch76FooterDemos`, layout tab); DESIGN.md E.5.62; todo/09 row 94 ✅. Theme tokens only, `mat-*` semantics, no `--m-*` in markup; distinct from `BottomTabBar`/`FloatingBottomNav` (tab nav). | gate green: lint ✓ · typecheck ✓ · `bun test` 527/0 · web build ✓ (`/design` prerendered) |
| 2026-10-15 | **Batch 75 — bottom nav variants**: new `components/navigation/BottomNavVariants.tsx` — shared `BottomNavAction` (`icon`/`label`/`onClick`/`badge`) + `FabPosition`; **`BottomTabBarFAB`** (full-width `mat-chrome` bottom bar + raised centre FAB; tabs keep `aria-current="page"` + danger badges; FAB interrupts the row at `fabPosition` — `center` splits evenly, `start`/`end` first/last; `raised` lifts it above the bar), **`FloatingBottomNav`** (centred `mat-chrome` pill hovering above the bottom edge, not full-width; `labels` toggles icon+text ↔ icon-only with `title`/`aria-label`; optional FAB floats above the pill centre); navigation barrel; test `test/batch75-bottom-nav-variants.test.tsx` (7 cases); design demo (`Batch75BottomNavDemos`, layout tab); DESIGN.md E.5.61; todo/09 row 93 ✅. Both default to `fixed`; `className="static …"` gives a contained preview. Theme tokens only, `mat-*` semantics, no `--m-*` in markup; distinct from `BottomTabBar` (plain), `Dock` (macOS hover-lift) and `IconRail`. | gate green: lint ✓ · typecheck ✓ · `bun test` 521/0 · web build ✓ (`/design` prerendered) |
| 2026-10-15 | **Batch 74 — side-nav variants**: new `components/navigation/SideNavVariants.tsx` — shared `NavLeaf`/`NavGroup`/`NavItem` model (`isGroup` = `Array.isArray(children)`); **`MultiLevelSidebar`** (nested `<nav><ul><li>`; group rows toggle with `aria-expanded`/`aria-controls` → nested `<ul aria-label>`, leaves navigate with `aria-current="page"` — groups never do; path to `value` auto-opens via `ancestorsOf`/`withActivePath`; controlled (`expanded`+`onExpandedChange`) or uncontrolled (`defaultExpanded`); depth-scaled indent), **`MiniSidebar`** (collapses 15rem ↔ 72px icon rail; bottom toggle `aria-expanded`; collapsed rows keep accessible name via `aria-label` + native `title`, labels/badges hidden), **`AccordionNav`** (`<nav><ul><li>` disclosures; groups `aria-expanded`/`aria-controls`, leaves `aria-current="page"`; `allowMultiple` single-open default; `defaultOpen`/`open`+`onOpenChange`); navigation barrel; test `test/batch74-side-nav-variants.test.tsx` (8 cases); design demo (`Batch74SideNavDemos`, layout tab); DESIGN.md E.5.60; todo/09 row 92 ✅. Theme tokens only, `mat-*` semantics, no `--m-*` in markup; distinct from `Sidebar` (flat) and `list/Accordion` (generic content). | gate green: lint ✓ · typecheck ✓ · `bun test` 514/0 · web build ✓ (`/design` prerendered) |
| 2026-10-15 | **Design-page / hydration fixes** (user report: hydration error + always-on "unsaved changes" prompt). **Root causes:** (1) **batch 71** `RadialMenu` (`navigation/FloatingNav.tsx`) computed item offsets with raw `Math.cos/sin` — server (Bun/Node) and browser (V8) JS engines disagree in the last float bits, so SSR `transform: translate(-48px, -83.1384px)` vs client `translate(-48.00000000000002px, -83.1384387633061px)` → React hydration mismatch; fixed by rounding to 3dp (`Math.round(…*1000)/1000`) — `GaugeKPI` was already safe via `.toFixed(2)`. (2) The 62–69 finishing-pass demo rendered `<UnsavedChangesBar when …>` with a bare `when` (= permanently true), pinning "You have unsaved changes." on `/design` and arming `beforeunload` globally → every exit/refresh showed the browser leave prompt; replaced with a real demo dirty flag (`unsavedDemo`) toggled by a "Make form dirty / Clear dirty" button, bar `onSave`/`onDiscard` reset it. | gate green: lint ✓ · typecheck ✓ · `bun test` 506/0 · web build ✓ (`/design` prerendered) |
| 2026-10-15 | **Batch 73 — steppers**: new `components/navigation/Stepper.tsx` — `ProgressDots` (carousel-style page dots; active dot stretches into a pill; interactive mode = buttons with `aria-label`, static mode = `role="img"` spans, both `aria-current="step"`), `Stepper` (numbered steps, horizontal or vertical; complete steps show ✓ in an accent circle, current is ringed + `aria-current="step"`, `errorAt` renders a `!` danger circle; connectors fill accent behind progress; clickable via `onChange` — only completed/current steps respond, `disabled` stays inert; vertical rail uses exact 15px centre), `TimelineStepper` (vertical rail, `ring-surface-1` status markers, right-aligned timestamps, clickable titles, disabled titles render as plain text), pure `stepStatus(i, value, errorAt)` helper; navigation barrel; test `test/batch73-steppers.test.tsx` (7 cases); design demo (`Batch73StepperDemos`, layout tab); DESIGN.md E.5.59; todo/09 row 89 ✅. Theme tokens only, `mat-*` semantics, no `--m-*` in markup; distinct from `StepperSlider` (numeric ±) and `Timeline` (display-only). | gate green: lint ✓ · typecheck ✓ · `bun test` 506/0 · web build ✓ |
| 2026-10-15 | **Blue skin**: new `skins/blue.ts` — gadget-blue decor `#00A0E9` (chrome top rule, sheens, glows) + AA-safe interactive accent `#0077C8` (light) / `#00A0E9`+`#1A2530` ink (dark) via A2 `accentHint`; bell-yellow `#FFD100` + nose-red `#E60012` tints/tones; pill controls 999, card 24 / sheet 36, stroke 2; 220ms back-out ease (.96); Nunito UI + Fredoka display (Google Fonts swap); blue-tinted `shadows`, `scene` #F0F7FD/#0B1118, 4D-pocket inset wells; card sheen = blue radial highlight. Registered Expressive in `skins/index.ts` (picker entry flows to `/design` automatically). **Also fixed a real defect: `accentHint` (A2) was compiled but NEVER applied** — `useSkin.setSkin`/`system reset` and `bootstrap.ts` now set/remove `data-accent="skin"` (self-heal on re-select), unlocking accentHints on 7 existing skins too. Contrast snapshot extended (+16 rows, all ≥4.5:1 — verified additive-only diff before update). Docs: DESIGN.md §39 row, todo/10 Done section. | skin tests ✓ (validator §41 clean) · theme-layer ✓ · useSkin 10/10 ✓ · `build:skins` 27 ✓ · `bun test` 498/0 |
| 2026-10-15 | **Batch 72 — tabs variants**: new `components/navigation/TabsVariants.tsx` — `StickyTabs` (sticky `mat-chrome` bar + `offset`), `ClosableTabs` (two-sibling close button; `editable` double-click rename — Enter commits `onRename`, Escape cancels, ref-callback focus to keep biome `noAutofocus` clean), `DraggableTabs` (HTML5 drag-drop + `Alt+Arrow` keyboard reorder, `onReorder(from,to)`, internal order synced with item churn), `OverflowTabs` (tail past `maxVisible` → `Dropdown` “More” menu `aria-haspopup`/`expanded`, active always inline, `useClickAway`/Escape close), `DocumentTabs` (`chrome` browser/document/workspace — traffic lights · plain strip · icon chips, raised `rounded-t-control` active tab, close badge); navigation barrel; test `test/batch72-tabs-variants.test.tsx` (9 cases); design demo (layout tab); DESIGN.md E.5.58; todo/09 row 72 ✅. **Also fixed:** added the `/** @jsxImportSource react */` pragma to `navigation/Tabs.tsx` + `overlay/Dropdown.tsx` — first time these were rendered by root `bun test` (without it they compile to Hono nodes → “Objects are not valid as a React child”). | gate green: lint ✓ · typecheck ✓ · `bun test` 497/0 · web build ✓ |
| 2026-10-15 | **Batch 71 — floating nav**: new `components/navigation/FloatingNav.tsx` — `Dock` (edge top/bottom pill, hover-lift, `aria-current`), `RadialMenu` (centre toggle, top-half-circle spread, hidden+`tabIndex=-1` while closed), `Hamburger` (bar→✕ morph), `OffCanvas` (Portal drawer, Escape/scrim close), `FullscreenMenu` (Portal modal dialog, staggered reveal via **new `.fx-menu-item` keyframe utility in `engine.css`** — kit has no `tailwindcss-animate`, so `animate-in` classes were replaced); navigation barrel; test `test/batch71-floating-nav.test.tsx` (5 cases); design demo (layout tab); DESIGN.md E.5.57; todo/09 row 71 ✅. | gate green: lint ✓ · typecheck ✓ · `bun test` 488/0 · web build ✓ (`/design` prerendered) |
| 2026-10-15 | **Batch 70 — security forms**: new `components/form/SecurityForms.tsx` — `TwoFactorSetup` (QR slot + manual Base32 key + OTP verify, idle/verifying/verified/error), `RecoveryCodes` (mask/reveal/copy-all/regenerate), `PasskeyPrompt` (continue + use-password), `Honeypot` (sr-only trap, gate on empty); form barrel; test `test/batch70-security-forms.test.tsx` (9 cases); design demo; DESIGN.md E.5.56. | lint ✓ · `tsc -p apps/web` ✓ · batch tests 9/9 |
| 2026-10-15 | **Batches 62–69 landed & verified (finishing pass)**: prior session had written the components+tests; this pass fixed lint (`fieldset` a11y semantics in `FilterBuilder`/`FormLayouts`, unused vars, traced suppressions on `PasteImageZone`), added design-page demos (`Batches62To69Demos` on `/design`), DESIGN.md rows E.5.49–E.5.55 (test counts corrected), and marked todo/09 rows 66–69 ✅. | gate green: lint ✓ · typecheck ✓ (incl. `tsc -p apps/web`) · `bun test` 474/0 · web build ✓ (`/design` prerendered) |
| 2026-10-14 | **Batch 48 — template/layout/theme pickers**: new `components/form/TemplatePickers.tsx` — `TemplatePicker` (cards), `LayoutPicker` (toolbar, `aria-pressed`), `ThemePicker` (swatch rows); cron+recurrence deferred (⛔ own-task); form barrel; test (3 cases); design demo; DESIGN.md E.5.48. | gate green |
| 2026-10-14 | **Batch 47 — pickers II**: new `components/form/AdvancedPickers.tsx` — `EmojiPicker` (categories+grid), `FontPicker` (live preview), `IconPicker` (lucide map+search), `GradientPicker`, `ShadowPicker`; form barrel; test (5 cases); design demo; DESIGN.md E.5.47. | gate green |
| 2026-10-14 | **Batch 46 — pickers I**: new `components/form/Pickers.tsx` — shared `Picker` (combobox+listbox, searchable) backing `UnitPicker`/`CurrencyPicker`/`TimezonePicker`, plus `AvatarPicker` (hidden file input, initial fallback, pick/remove); form barrel; test (5 cases); design demo; DESIGN.md E.5.46. | gate green |
| 2026-10-14 | **Batch 45 — pattern/format inputs**: new `components/form/PatternInputs.tsx` — card number/expiry/CVC (+ brand detection), `CardInput`, IBAN (mod-97), SSN (optional mask), postal code, coordinates; pure helpers exported; fields bind `onChange`+`onInput` (happy-dom); form barrel; test (6 cases); design demo; DESIGN.md E.5.45. | gate green |
| 2026-10-14 | **Batch 44 — smart inputs**: new `components/form/SmartInputs.tsx` — `EmailInput` (domain suggestions), `UrlInput` (https on blur), `UsernameInput` (debounced async check), `PasswordStrength` (meter+rules), `PasswordInput`; form barrel; test (5 cases); design demo; DESIGN.md E.5.44. | gate green |
| 2026-10-14 | **Batch 43 — TextField variants**: new `components/form/TextField.tsx` — `outlined/filled/underlined/borderless/inset`, sizes, `floating` label, leading/trailing/badge slots, counter (`showCount`+`maxLength`), hint/error/tooltip with `aria-describedby`/`role=alert`; form barrel; test (4 cases); design demo; DESIGN.md E.5.43. | gate green: lint ✓ · typecheck ✓ · `bun test` 409/0 · build ✓ |
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
| 2026-10-14 | **Batch 61 — provider/wallet/store buttons**: new `components/controls/ProviderButtons.tsx` — `SignInButton` (apple/google/github/microsoft/facebook/x), `WalletButton` (apple-pay/google-pay/paypal), `AppStoreBadge`, `QrDownload`; lucide brand marks; controls barrel; test (4 cases); design demo; DESIGN.md E.5.42. | gate green: lint ✓ · typecheck ✓ · `bun test` 409/0 · build ✓ |
| 2026-10-14 | **Batch 60 — handles**: new `components/controls/Handles.tsx` — `DragHandle`, `GripDots`, `GripButton`, `ResizeHandle` (edge + `onResize` + `data-resize-edge`), `PullHandle`; controls barrel; test (3 cases); design demo; DESIGN.md E.5.41. | gate green |
| 2026-10-14 | **Batch 59 — contextual toolbars**: new `components/navigation/FloatingToolbar.tsx` — `FloatingToolbar` (fixed overlay, x/y/placement), `BubbleMenu` (mousedown preventDefault), `InlineToolbar`; navigation barrel; test (3 cases); design demo; DESIGN.md E.5.40. | gate green |
| 2026-10-14 | **Batch 58 — call controls**: new `components/controls/CallControls.tsx` — `MicButton`/`CameraButton`/`ScreenShareButton`/`EndCallButton` + `CallControls`; controls barrel; test (3 cases); design demo; DESIGN.md E.5.39. | gate green |
| 2026-10-14 | **Batch 57 — viewport & media controls**: new `components/controls/ViewportControls.tsx` (`ZoomControls`/`PanPad`/`RotateControl`) + `MediaControls.tsx` (`MediaControls`/`PlayPauseButton`); controls barrel; tests (5 cases); design demo; DESIGN.md E.5.37/E.5.38. | gate green |
| 2026-10-14 | **Batch 56 — window buttons**: new `components/controls/WindowButtons.tsx` — `ExpandCollapseButton`/`FullscreenButton`/`WindowControls` (glyph + traffic); controls barrel; test (4 cases); design demo; DESIGN.md E.5.36. | gate green |
| 2026-10-14 | **Batch 55 — nav buttons**: new `components/controls/NavButtons.tsx` — `ArrowButton`/`StepperButtons`/`ScrollButton`; controls barrel; test (3 cases); design demo; DESIGN.md E.5.35. | gate green: lint ✓ · typecheck ✓ · `bun test` 409/0 · build ✓ |
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

1. **`todo/11-mobile-small-device-optimization.md` — ✅ DONE** (mobile/small-device engine crash + UI + system perf, gate green). **`todo/08` — ✅ COMPLETE** (batches 9–18 + completion pass). **Batches 38–61 — ✅ DONE** (effect buttons · gradient border · confirmation controls · timed buttons · chip-button family · nav/window/viewport/media/call controls · contextual toolbars · handles · provider/wallet/store buttons). **Batches 43–48 — ✅ DONE** (TextField variants · smart inputs · pattern/card/IBAN/SSN inputs · pickers I/II/III). **Batches 62–79 — ✅ DONE** (selection extras · slider extras · chip/token/email inputs · upload queue/camera/paste · validation parts · form layouts · search & filter · security forms · floating nav · tabs variants · steppers · side-nav variants · bottom nav variants · footers · command palette · share links & history nav · site-search overlay · voice search) — **§E navigation complete**. **Batch 80 (table variants) ✅ DONE** (striped · bordered · hoverable · borderless · cardRows · responsive stack · nested/tree · master-detail), **Batch 81 (table power) ✅ DONE** (editable cells · frozen columns · resizable columns · reorderable rows · multi-sort · merged cells), **Batch 82 (in-cell marks) ✅ DONE** (Bullet · heat cell · traffic-light & trend indicators), **Batch 83 (people) ✅ DONE** (avatar status/badge · avatar group +N · team stack · name+role · byline) and **Batch 84 (content cards) ✅ DONE** (article · blog · news · video · music/album · podcast · movie · recipe) and **Batch 85 (commerce cards) ✅ DONE** (product · property/listing · hotel · flight · ticket · coupon · gift card · credit-card visual) and **Batch 86 (work cards + card variants) ✅ DONE** (contact · business · team member · review · notification · task · project · file · folder · app · integration · feature · metric alert · flip/expandable/draggable/selectable/horizontal/overlay-image/hover-reveal/stacked) and **Batch 87 (lists) ✅ DONE** (chat · contact · notification · checklist · todo · playlist · search results · sticky-header · alphabet index · swipe · reorderable · infinite · nested) and **Batch 90 (documents) ✅ DONE** (preview · thumbnails · annotation pins · version history · diff view · reader mode · TOC panel) — all with the full `bun run gate` green; **§F data display is open**. Next: pop the next feasible `todo/09-components-master-backlog.md` §F row (row 88 structure diagrams / 89 geospatial are ⛔ heavyweight; row 91 financial or 92 media display next).
> **Next task:** `todo/09-components-master-backlog.md` → continue **§F data display**. Batch 88 (structure diagrams) and 89 (geospatial) are ⛔ heavyweight; **batch 90 (documents) landed 2026-10-16**; next feasible: **batch 91 (financial: ticker/quote · price-change badge · order book · depth chart · portfolio breakdown · transaction list · balance card · invoice/receipt · budget bar)** or **batch 92 (media display)**.
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


