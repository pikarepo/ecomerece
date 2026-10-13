# MASTER EXECUTION PLAN — All components & themes/skins (from wishlist)

> Comprehensive todo covering batches 12–136 (components, A–L) and 137–192 (themes/skins). Execute one batch at a time, gate-green before marking done. Design page updated per batch.


## Components (todo/09 master backlog) — batches 19–136 mapped to A–L

**Priority next after 12:** 19–24 (core layout/typography/interaction small batches)...
  | 19 | Frame · Bleed · Cluster · Switcher (Every Layout patterns) | ⬜ |
  | 20 | Reel (horizontal scroll rail) · Sidebar-with-content · Imposter · Cover | ⬜ |
  | 21 | Fixed/pinned panel · Floating panel · Pop-out window · Picture-in-picture container | ⬜ |
  | 22 | Multi-column text · Column layout · Gutter · Offset/Push/Pull | ⬜ |
  | 23 | Hide/Show on breakpoint helper · Visually-hidden-but-focusable | ⬜ |
  | 24 | Sticky sidebar · Sticky table of contents · Sticky CTA bar | ⬜ |

## Themes/skins (todo/10 master backlog) — batches 137–192
- 137–146: Design-system flavor skins (Material 3 Expressive, Fluent Acrylic/Mica, Liquid Glass, iOS skeuo, Windows flavors, GNOME/KDE, editor palettes...) — one per session via todo/04
- 147–156: Editor/community color themes (Catppuccin variants, Tokyo Night, Nightfox family, Kanagawa, Gruvbox, Rosé Pine, Flexoki, Oxocarbon, SynthWave...) 
- 157–166: Hue families & named palettes (comprehensive accent families)
- 167–176: Visual styles (skeuo/3d/glass/brutal/minimal/maximal/retro)
- 177–192: Modes, theme axes, theming mechanics (token pipeline, export, contrast checker, a11y)

## Execution rules
- One batch in flight. Mark in_progress in todo/08 (or create per-batch file), gate-green required.
- Each component: add to packages/ui/components/<cat>, export barrel, add types, test, demo in apps/web/app/design/page.tsx, row in DESIGN.md E.5.x.
- Skins: follow todo/04-new-skin-fast-path.md (never batch with many components).
- No API changes unless necessary. Maintain mat-* roles, focusRing(), motion tokens.
- Do not re-run unrelated tests as blockers; UI tests must stay green.

## Immediate next (continue from todo/08)
- Batch 12: StatTile/KPI row, SLA/Health indicator (data)
- Then 19–24 from master backlog...
