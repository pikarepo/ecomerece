# TASK 08 — Even more components (wishlist buildout, batches 9+)

**Status: COMPLETE (2026-10-14). Batches 9–18 landed, then the leftover wishlist rows
traced back to this file were shipped in a "todo/08 completion pass": `Stopwatch` +
`BusinessHours` (batch 11 leftovers), `GaugeKPI` (batch 12), `Table.columnGroups`
(batch 17), status family `SyncStatus`/`SaveStatus`/`ConnectionQuality`/
`BatteryIndicator` (batch 18 wishlist) — tests in `test/batch08-completion.test.tsx`,
DESIGN.md E.5.29. A follow-up hydration fix removed all render-time wall-clock reads
from the design page + batch-11 time components (`TimezoneClock`/`Countdown` mount-empty).
Everything else lives in `todo/09` master backlog (batch 19+).**
Split from the pasted "Even More Components,
Sub-components, Themes & Skins" wishlist (categories A–L + themes/skins backlog).
Each batch stays small (3–5 items) so one batch ≈ one focused session: build →
tests → design-page row → DESIGN.md E.5 row → gate green → status update here +
in `PROGRESS.md`.

## Rules (inherited from TASK 07, non-negotiable)
- Components bind only `mat-*` roles + `--m-*` / theme token utilities; never raw
  colour, never `dark:` variants.
- Radii `rounded-chip/control/card/sheet`; motion `duration-skin ease-skin`;
  press `active:scale-[var(--press-scale)]`; focus `focusRing()`.
- Data-viz marks follow §23: ink/accent opacity steps, no gradients in marks.
- Export type + component from the category barrel.
- `/** @jsxImportSource react */` on line 1 of any component rendered by a test.
- Tests use `test/_dom.ts` (`registerDom`/`restoreDom`, `render`/`fire`); avoid
  `onChange` under happy-dom (React 19 quirk) — use `onInput` or click paths.
- Gate: `bun run gate` (or `--no-build` while iterating) must pass before the
  batch's status line is updated.

## Batches (prioritized: commerce value × harness risk)

| Batch | Items (category) | Dir(s) | Status |
|---|---|---|---|
| 9 | `Sparkline` (line/bar inline), `DataBar` (in-cell bar), `MetricCard` (big number + trend arrow + comparison) — F "data-viz in-cell" + "key metrics" | data | ✅ batch 9 |
| 10 | Eyebrow/Overline, Lead paragraph, Line clamp, Text highlight — B typography | surface | ✅ batch 10 |
| 11 | TimeAgo / Timezone clock, Countdown, Duration — F "time & date display" | data | ✅ batch 11 |
| 12 | StatTile/KPI row (scorecard), SLA/Health indicator — F "key metrics" | data | ✅ batch 12 |
| 13 | HoverCard, rich Tooltip interactive hint — G overlays | overlay | ✅ batch 13 |
| 14 | Pagination v2 (page-size selector, jump-to-page, first/last) — E "pagination parts" | data | ✅ batch 14 |
| 15 | Breadcrumb variants (collapsed to dropdown, with icons) — E | navigation | ✅ batch 15 |
| 16 | Mini utility hooks: `useToggle`, `usePrevious`, `useInterval`, `useTimeout`, `useClickAway` — J | lib | ✅ batch 16 |
| 17 | Table add-ons: row selection + bulk bar, sortable-chevrons pass, summary row — F "table variants" | data | ✅ batch 17 |
| 18 | Mini cart drawer, promo-code chip, stock indicator — I e-commerce "quick wins" | overlay + data | ✅ batch 18 |
| — | **Themes/skins wishlist** (Material 3 Expressive, Liquid Glass, Fluent, editor palettes like Catppuccin/Flexoki/Tokyo Night, retro 8-bit, kids/Eink audience modes, etc.) | skins/ | ⬜ sequestered: one skin per session following `todo/04-new-skin-fast-path.md`; never batch with components |

## Where the REST of the wishlist lives
- **Every** wishlist item (categories A–L) is enumerated in
  `todo/09-components-master-backlog.md` (batches 19–136) — including the ones
  this file does not curate. Nothing was dropped from chat.
- **Every** theme/skin idea is enumerated in
  `todo/10-themes-skins-master-backlog.md` (batches 137–192) with a decision per
  item: build it as a skin (fast-path), treat it as a token/theme-axis feature,
  or defer with a traceable reason.
- Items here marked "in todo/08" are simply the first in line; the master files
  hold the complete long tail.

## Done when (per batch)
- Items shipped + typed + exported from the barrel.
- One test file per item, suite green.
- Design QA page has a demo row per item.
- `DESIGN.md` Appendix E.5 (+ §21/§23 where relevant) gains a row.
- `bun run gate` green; `todo/08` + `PROGRESS.md` updated.

## Batch 9 — done
`Sparkline` (line/bar, tone tokens, `role=img`), `DataBar` (`mat-well` track +
token fill, descriptive label, optional tabular readout), `MetricCard` (big
number + signed trend arrow + comparison) + `test/batch9-dataviz.test.tsx`
(9 cases). Design QA page: "Inline data-viz (batch 9)" section (metric row +
in-cell table-grade demos). DESIGN.md E.5 gains the three rows. Gate:
lint ✓ types ✓ test 242/0 ✓ build ✓.
