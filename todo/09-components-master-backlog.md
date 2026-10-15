# TASK 09 — Master component backlog (the FULL wishlist, categories A–L)

**Purpose:** capture every item from the pasted "Even More Components,
Sub-components, Themes & Skins" wishlist so nothing lives only in chat.
Execution order: `todo/08` batches 9–18 first (they curate the highest-value
items), then pop batches from here top-down. Each batch = small (3–8 items) and
follows the TASK 07/08 rules: `mat-*` + tokens only, barrel export, one test
file per item, design-page row, DESIGN.md E.5 row, `bun run gate` green, then
status updates here + in `PROGRESS.md`.

Status legend: ✅ already in kit (where) · 🔄 in flight · ⬜ backlog · ⛔ deferred (traceable reason).

## A — Additional layout & primitives

| Batch | Items | Status |
|---|---|---|
| 19 | Frame · Bleed · Cluster · Switcher (Every Layout patterns) | ✅ batch 19 |
| 20 | Reel (horizontal scroll rail) · Sidebar-with-content · Imposter · Cover | ✅ batch 20 |
| 21 | Fixed/pinned panel · Floating panel · Pop-out window · Picture-in-picture container | ✅ batch 21 |
| 22 | Multi-column text · Column layout · Gutter · Offset/Push/Pull | ✅ batch 22 |
| 23 | Hide/Show on breakpoint helper · Visually-hidden-but-focusable | ✅ batch 23 |
| 24 | Sticky sidebar · Sticky table of contents · Sticky CTA bar | ✅ batch 24 |
| 25 | Scroll progress bar · Scroll spy · Scroll-triggered reveal · Scroll to top | ✅ batch 25 |
| 26 | Mosaic grid · Bento layout · Pinterest-style board · Justified gallery | ✅ batch 26 |
| 27 | Zoom/Pan canvas · Infinite canvas · Whiteboard surface | ⛔ heavyweight (canvas engine, own multi-session task if ever needed) |
| 28 | Safe-area wrapper (notch) · Keyboard-avoiding view · Pull-to-refresh container | ✅ batch 28 |
| 29 | Swipeable container · Swipe actions (list-row swipe) | ✅ batch 29 |
| 30 | Orientation wrapper (portrait/landscape) | ✅ batch 30 |

Note: `Div`/`Box`/`Container`/`Stack`/`HStack`/`Grid`/`Surface` already shipped (batch 8) and underpin these.

## B — Additional typography & text

| Batch | Items | Status |
|---|---|---|
| 10 (todo/08) | Eyebrow/Overline · Lead paragraph · Line clamp · Text highlight | ✅ batch 10 |
| 31 | Display text · Subtitle (typography variants) | ✅ batch 31 |
| 32 | Gradient text · Outline text | ✅ batch 32 (skin-owned via `--m-*`) |
| 33 | Animated text: typewriter · fade-in · word rotator · scramble · split-text | ✅ batch 33 |
| 34 | Drop cap · Pull quote · Footnote/Endnote · Citation | ✅ batch 34 |
| 35 | Abbreviation (abbr) · Definition tooltip · Inline code (exists as `Kbd`-adjacent) · Inline badge | ✅ batch 35 |
| 36 | Mention/hashtag text · Emoji text · Text diff | ✅ batch 36 |
| 37 | Read more / Show more (disclosure) | ✅ batch 37 |
| — | Prose/article container · Auto table of contents · Rich text renderer · HTML sanitizer renderer · RTL wrapper | ⬜ (fold into §30 batch ordering when reached) |

## C — Additional buttons & interaction

| Batch | Items | Status |
|---|---|---|
| 38 | Ripple effect · Magnetic button · Shimmer button · Glow button | ✅ batch 38 (skin-emissive variants via `--m-<role>-sheen`/`-glow`) |
| 39 | Gradient border button | ✅ batch 39 (`--m-<role>-glow`×`-edge` masked ring, token fallbacks) |
| 40 | Hold-to-confirm button · Swipe-to-confirm slider · Double-click-to-confirm | ✅ batch 40 (`components/controls/Confirm.tsx`) |
| 41 | Countdown button · Cooldown button · Resend-code button | ✅ batch 41 (`components/controls/Cooldown.tsx`) |
| 42 | Chip-button family: tab/chip/tag/filter/suggestion/input/choice chip variants | ✅ batch 42 (`components/controls/ChipButton.tsx`) |
| 55 | Stepper buttons (+/-) · Arrow/chevron buttons · Scroll button | ✅ batch 55 (`components/controls/NavButtons.tsx`) |
| 56 | Expand/Collapse button · Fullscreen toggle · Window controls (minimize/maximize/close) | ✅ batch 56 (`components/controls/WindowButtons.tsx`) |
| 57 | Zoom in/out/reset · Pan · Rotate controls · Media controls (play/pause/stop/next/prev/shuffle/repeat) | ✅ batch 57 (`ViewportControls.tsx` + `MediaControls.tsx`) |
| 58 | Call controls (mic mute, camera toggle, screen share) | ✅ batch 58 (`components/controls/CallControls.tsx`) |
| 59 | Floating toolbar · Bubble menu (text-selection) · Inline toolbar | ✅ batch 59 (`components/navigation/FloatingToolbar.tsx`) |
| 60 | Pull handle · Drag handle · Resize handle · Grip | ✅ batch 60 (`components/controls/Handles.tsx`) |
| 61 | Sign-in with (Apple/Google/GitHub/Microsoft/Facebook) · Wallet buttons (Apple Pay/Google Pay/PayPal) · App-store badges · QR download | ✅ batch 61 (`components/controls/ProviderButtons.tsx`) |

## D — Additional forms & validation

| Batch | Items | Status |
|---|---|---|
| 43 | Input variants: filled/outlined/underlined/borderless/floating/inset/with-icon/with-badge/with-counter/with-tooltip | ✅ batch 43 (`components/form/TextField.tsx`) |
| 44 | Smart inputs: email+domain suggestions · URL input · username checker · password strength meter (bar + rules) | ✅ batch 44 (`components/form/SmartInputs.tsx`) |
| 45 | Card input (number, expiry, CVC, brand icon) · IBAN · SSN/tax ID · postal code · coordinates | ✅ batch 45 (`components/form/PatternInputs.tsx`) |
| 46 | Pickers I (light): unit picker · currency picker · timezone picker · avatar picker | ✅ batch 46 (`components/form/Pickers.tsx`) |
| 47 | Pickers II (medium): emoji picker · font picker · icon picker · gradient/shadow picker | ✅ batch 47 (`components/form/AdvancedPickers.tsx`) |
| 48 | Pickers III (heavy): cron · recurrence · template/layout/theme pickers | ✅ template/layout/theme (batch 48, `components/form/TemplatePickers.tsx`); ⛔ cron+recurrence own-task |
| 62 | Selection extras: tile select · image select grid · swatch select · toggle chips · NPS scale · Likert · thumbs (Rating ✅, tri-state checkbox ✅ via `indeterminate`) | ✅ batch 62 (`components/form/SelectionExtras.tsx`) |
| 63 | Slider extras: marks · tooltip · vertical · range histogram · stepper slider (Slider ✅, Range dual-thumb ✅) | ✅ batch 63 (`components/controls/SliderExtras.tsx`) |
| 64 | Text editing: tag input · token input · email-chips input | ✅ batch 64 (`components/form/ChipInputs.tsx`) |
| 65 | Editors: mention/hashtag editor · slash-command editor · block editor · WYSIWYG toolbar + inline markdown preview · find & replace | ⛔ heavyweight editors (each its own task) |
| 66 | Upload upgrades: multi-file progress (FileUpload `multiple` ✅ — add per-file progress) · folder DnD · paste image · camera · chunked/resumable · queue · thumbnails · video trimmer | ✅ batch 66 (`components/form/UploadExtras.tsx`: per-file queue · camera · paste/drop zone; chunked/resumable + trimmer ⛔ own-task; folder DnD folds into `FileUpload`) |
| 67 | Validation parts: async-validation spinner · dirty/touched indicator · unsaved-changes prompt · error focus-first-field · validation summary (inline error/field hint/success/warning/counter/required ✅ exist via Field) | ✅ batch 67 (`components/form/Validation.tsx`) |
| 68 | Form layouts: stepper form · tabbed form · one-question-at-a-time · survey/builder · conditional fields · field arrays | ✅ batch 68 (`components/form/FormLayouts.tsx`; builder ⛔ own-task) |
| 69 | Search & filter: faceted filters · filter-chips bar · saved filters · sort dropdown · range (price/date) · color/rating filters · active-filter summary · clear-all | ✅ batch 69 (`components/data/FilterBuilder.tsx`; filter-chips bar pairs with `FilterChip` batch 42, color/rating filters pair with batch 62) |
| 70 | Security forms: 2FA setup (QR+code) · recovery codes · passkey prompt · CAPTCHA-free honeypot (CAPTCHA widget ⛔ third-party) | ✅ batch 70 (`components/form/SecurityForms.tsx`; QR image itself is a backend concern) |

## E — Additional navigation

| Batch | Items | Status |
|---|---|---|
| 71 | Floating nav / macOS dock · radial/pie menu · hamburger · off-canvas · fullscreen overlay menu | ✅ batch 71 (`components/navigation/FloatingNav.tsx`; `.fx-menu-item` reveal utility in `engine.css`) |
| 72 | Tabs variants: sticky · underline (E.6 #7 skin variant) · pill (✅ shipped) · closable/editable · draggable · overflow (OverflowTabs as a prop/derivative) · browser/document/workspace tabs | ✅ batch 72 (`components/navigation/TabsVariants.tsx`; underline/pill = base `Tabs` per skin) |
| 73 | Steppers: page-dots/progress dots (✅ Carousel dots) · numbered steps · vertical stepper · clickable stepper · timeline stepper | ⬜ |
| 14 (todo/08) | Pagination v2: first/last · page-size selector · jump-to-page · total count | ✅ batch 14 |
| 15 (todo/08) | Breadcrumb variants: collapsed-to-dropdown · with icons | ✅ batch 15 |
| 74 | Multi-level sidebar · icon-only/mini sidebar (✅ IconRail) · accordion nav | ⬜ |
| 75 | Bottom tab bar with FAB · floating bottom nav (BottomTabBar ✅) | ⬜ |
| 76 | Footers: mega · fat · sticky · social bar | ⬜ |
| 77 | Command-palette upgrades: groups (CommandMenu ✅ baseline) · recent searches · quick actions · keyboard hints | ⬜ |
| 78 | Permalink/anchor copier · share-link copier · back/history dropdown · recently viewed | ⬜ |
| 79 | Site-search overlay · voice search | ⬜/⛔ voice = platform API |

## F — Data display

| Batch | Items | Status |
|---|---|---|
| 17 (todo/08) | Table v2: row selection + bulk bar · summary row · grouped headers | ✅ batch 17 (all shipped — `columnGroups` landed in the todo/08 completion pass) |
| 80 | Table variants: striped · bordered · hoverable · compact (✅ density) · borderless · responsive stack (✅ density="responsive"?) · card-rows · nested/tree table · master-detail | ⬜ mostly variants |
| 81 | Table power: editable cells · frozen columns · resizable columns · reorderable rows · multi-sort · merged cells | ⬜ (multi-session) |
| **9 (todo/08)** | In-cell data-viz: Sparkline ✅ · DataBar ✅ · MetricCard ✅ | ✅ batch 9 |
| 82 | In-cell remaining: Bullet · heat cell · icon indicators (traffic-light/arrows) | ⬜ |
| 12 (todo/08) | KPI family: scorecard · gauge KPI · SLA/health indicator | ✅ batch 12 (all shipped — `GaugeKPI` landed in the todo/08 completion pass) |
| 11 (todo/08) | Time & date display: TimeAgo · timezone clock · countdown · duration · stopwatch · business hours | ✅ batch 11 (all shipped — stopwatch + business hours landed in the todo/08 completion pass) |
| 83 | People: Avatar status/badge/initials (✅ initials) · avatar group +N overflow · name+role block · author byline · team stack | ⬜ |
| 84 | Cards I (content): Article · Blog · News · Video · Music/Album · Podcast · Movie · Recipe | ⬜ |
| 85 | Cards II (commerce): Product · Property/Listing · Hotel · Flight · Ticket · Coupon · Gift card · Credit-card visual | ⬜ (commerce-core — high priority) |
| 86 | Cards III (work): Contact · Business · Team member · Review · Notification · Task · Project · File · Folder · App · Integration · Feature · Metric Alert · Empty/Skeleton card (✅ SkeletonCard) · Flip/Expandable/Draggable/Selectable/Horizontal/Overlay-image/Hover-reveal/Stacked | ⬜ |
| 87 | Lists: chat · contact · notification · checklist · todo · playlist/queue · search results (GroupedList ✅) · sticky-header grouped · alphabet index A–Z · swipe list (batch 29 dependency) · reorderable · infinite · nested | ⬜ |
| 88 | Structure diagrams: hierarchy · dependency graph · relationship/ERD · sequence viewer · state machine · swimlane · funnel steps · process flow · journey map | ⛔ heavyweight (own tasks; funnel may be simple) |
| 89 | Geospatial: map family, markers, heatmaps, route, geofence | ⛔ map tiles/3rd-party |
| 90 | Documents: preview · thumbnails · annotation pins · version history · diff view · TOC panel · reader mode | ⬜/⛔ diff-view medium |
| 91 | Financial: ticker/quote · price-change badge · order book · depth chart · portfolio breakdown · transaction list · balance card · invoice/receipt · budget bar | ⬜ (commerce-core) |
| 92 | Media display: thumbnail grid · poster · playlist row · podcast row · now-playing bar · lyrics view · queue panel | ⬜ |

## G — Feedback, states & overlays

| Batch | Items | Status |
|---|---|---|
| 13 (todo/08) | HoverCard · rich/interactive tooltip (Tooltip ✅ baseline) | ✅ batch 13 |
| 93 | Modal variants: size/fullscreen/scrollable/side/stacked/nested (Modal ✅ baseline) · wizard dialog | ⬜ |
| 94 | Popover variants: hover/focus/with arrow (Popover ✅ click baseline) · mega dropdown · quick view/peek panel | ⬜ |
| 95 | Toast upgrades: positions · loading/promise toast · grouped · progress toast (ToastProvider ✅ baseline tones) | ⬜ |
| 96 | System banners: announcement · promo · cookie · GDPR modal · push/prompt modals (install/update/permission) · session-timeout warning | ⬜ |
| 97 | Loading: spinner variants (ring/dots/bars/pulse/orbit — Spinner ✅ baseline) · circular/stepped/indeterminate/buffer progress (Progress ✅ linear) · infinite-scroll loader · route transition bar · splash screen | ⬜ |
| 98 | State pages: offline state · 400/403/404 (✅ 404 via Next) /500/503 · under construction · expired link · thank-you page · verification pending | ⬜ |
| 99 | Guidance: inline help · contextual help panel · walkthrough/product tour (step/spotlight) · checklist widget · tips carousel · feature announcement · new badge/beta tag (✅ Badge) · changelog popup · onboarding modal | ⬜ |
| (todo/08) | 18: status family — sync status · save status · connection quality · battery/signal · order/package tracking · delivery timeline (Timeline ✅) | ✅ shipped in the todo/08 completion pass (`SyncStatus`/`SaveStatus`/`ConnectionQuality`/`BatteryIndicator`; tracking/delivery = `Timeline` ✅; batch 18 itself shipped the commerce quick wins) |

## H — Additional chart types (engine: ink+accent per §23; SVG-first, happy-dom-testable)

| Batch | Items |
|---|---|
| 100 | Area family: stacked area · step line · spline (LineChart demo exists — promote + variants) · dual-axis · small multiples |
| 101 | Distribution: histogram · density plot · boxplot-ish range · error bars · ridgeline |
| 102 | Composition bars: range/floating bar · bullet (pairs with batch 82) · lollipop · dumbbell · slope · bump |
| 103 | Part-whole: waffle · pictogram · Marimekko/Mekko · waterfall |
| 104 | Radial family: radial bar · radial tree · gauge segments · speedometer · thermometer · battery bar |
| 105 | Comparison maps: cohort table · retention heatmap · heatmap calendar · population pyramid |
| 106 | Stream/graph: streamgraph · horizon · arc diagram · alluvial · force-directed · dendrogram · icicle · flame graph (⛔ heavy SIMD-caliber profiling = inspect only) |
| 107 | Markets: candlestick+volume · OHLC (Renko/Kagi/Point&figure ⛔ esoteric) |
| 108 | Management: Gantt (simple, row-based) · burndown/burnup · velocity · cumulative-flow · control chart· funnel conversion chart · Pareto |
| 109 | 3D charts (globe · surface · 3D scatter) — only via slab-engine era if at all → ⛔ for now |

## I — App & domain patterns (mostly composition built from kit primitives; ship as recipes/examples in web app, not kit components, unless reused)

| Batch | Domain — items |
|---|---|
| 110 | E-commerce I: product gallery (✅ Carousel base) · variant selector · size guide · add-to-cart · mini cart/cart drawer · price tag (sale/strikethrough) · stock indicator · promo code · quick buy · bundle builder · compare · recently viewed · wishlist |
| 111 | E-commerce II: reviews+ratings summary (Rating ✅) · Q&A · shipping calculator · order tracker (✅ Timeline) · order history · returns flow |
| 112 | SaaS/admin: org/project switcher · API-key manager · webhook manager · usage dashboard/quota bars (Progress ✅) · feature flags · audit log · role editor · billing portal/seat manager · import wizard/export center · impersonation banner |
| 113 | Devtools: command palette (✅ baseline) · log/trace/metrics explorer · request-response viewer · file explorer · variable inspector · schema/query console (⛔ own tasks) |
| 114 | Project mgmt: kanban · backlog · gantt (pairs batch 108) · calendar board · comments/mentions · assignee/due-date pickers |
| 115 | Communication: chat window · thread panel · email composer/list/reading pane · meeting scheduler · poll · reaction bar · presence |
| 116 | Social/content: feed post · comment tree · like/share/save bar · follow · profile header · story/reel player · hashtag chips · trending/suggestions · media composer |
| 117 | Education: course card · lesson player · quiz types · flashcards · certificate · streak/achievement |
| 118 | Health: vitals · activity ring · workout card · habit tracker · calendar heatmap (pairs 105) · appointment booking |
| 119 | Travel: flight/hotel search · seat map · itinerary (✅ Timeline) · boarding pass · price calendar · map+list split (⛔ map dep) |
| 120 | Finance/banking: transfer form · KYC upload flow (pairs batch 66) · statement viewer · savings goal · loan calc |
| 121 | Media/entertainment: streaming rows · hero banner · player UI (batch 57 controls) · episode/subtitle/audio selectors · watchlist · game HUD/leaderboard/inventory/HP-MP bars (Progress/SegmentedMeter ✅)· dialogue box |
| 122 | Gov/legal + real estate/auto + IoT/industrial: multi-step gov form · case tracker (✅ Timeline) · e-signature flow · listing/map-search (⛔ map) · vehicle configurator · thermostat dial/scene buttons · energy trend · alarm list/status lights/gauge cluster |

## J — Utilities, hooks & infrastructure

| Batch | Items | Status |
|---|---|---|
| 16 (todo/08) | useToggle · usePrevious · useInterval · useTimeout · useClickAway | ✅ batch 16 |
| 123 | Hooks group 1: useBreakpoint · useScrollPosition · useScrollLock (useOverlay ✅ has) · useWindowSize · useElementSize · useHover · useFocus · useFocusWithin · useActiveElement | ⬜ |
| 124 | Hooks group 2: useCounter · useCountdown · useEventListener · useKeyPress · useLongPress · useSwipe (pairs batch 29) · useDrag/useDrop | ⬜ |
| 125 | Hooks group 3: useIdle · useOnline · useGeolocation (⛔ permissions deny in headless) · usePermission · useClipboardRead · useShare · useFullscreen · usePageVisibility | ⬜ |
| 126 | Hooks group 4: useTitle · useFavicon · useMeta · useLocale · useDirection · useReducedMotion · useColorScheme · useContrastPreference | ⬜ |
| 127 | Hooks group 5: useAsync · useUndoRedo/history · useControllableState · useMergedRef · useId (React native) · useSteps·useStepper · useSelection · useSortable · useVirtualizer (DataGrid ✅ internal) · useInView · useMeasure · useAnnounce · useFocusTrap (useOverlay ✅) · useRovingTabindex · useTypeahead | ⬜ |
| 128 | Providers: ThemeProvider (✅ data-theme+useSkin) · ModalProvider/DialogProvider · TooltipProvider · DirectionProvider · LocaleProvider · ConfigProvider · IconProvider · FeatureFlagProvider · AnalyticsProvider · AuthProvider | ⬜ |
| 129 | Infra lightweight: `as`/polymorphic prop support plan · Slot/asChild pattern · variant helper (cvn-style, zero-dep) · style-prop framework decision · headless/unstyled export layer · README cookbook section · storybook decision (⛔ heavy npm) | ⬜/⛔ storybook |

## K — Accessibility & i18n

| Batch | Items | Status |
|---|---|---|
| 130 | A11y kit: roving tabindex helper (pairs 127) · skip link component · landmarks guidance · live-region helper (useAnnounce pairs) · keyboard-shortcuts help dialog | ⬜ |
| 131 | High-contrast/forced-colors · reduced-motion/transparency (✅ fidelity switch) · text-spacing support audit · 400% zoom audit · touch-target audit · voice-control labels audit | ⬜ (audits, not code) |
| 132 | i18n: pluralization/format helpers (Intl) · RTL mirroring audit (new component from batch B RTL wrapper) · locale switcher · translation-key manager decision · pseudo-localization script · text-expansion test fixtures | ⬜ |

## L — Animation & effects (skin/interaction layer; guard §17 "motion answers interaction" + §41 perf caps)

| Batch | Items | Status |
|---|---|---|
| 133 | Motion primitives: fade · slide · scale/zoom · flip · rotate · collapse/expand (✅ Accordion height) · stagger · spring presets (token-curves) | ⬜ |
| 134 | List reorder FLIP · shared-element/page transition · number counting · progress fill (✅) · typing effect | ⬜ |
| 135 | Effects: shimmer/skeleton shimmer (✅) · shine · pulse/wiggle/shake · confetti/particles (⛔ whimsy, maybe) · aura/gradient backgrounds (SceneBackdrop ✅ adjacency) · noise overlay · tilt card · cursor follower/magnetic (pairs 38) | ⬜/⛔ selective |
| 136 | Lottie/Rive — ⛔ new heavy deps; prefer CSS+SVG built-ins |

## Done when (per batch)
Items shipped + typed + exported · tests green · design-page rows · DESIGN.md rows · `bun run gate` green · this file + `PROGRESS.md` updated.
