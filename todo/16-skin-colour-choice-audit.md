# TASK 16 — Skin colour choices audit: readable, honest, DERIVED picker chips

**Status:** DONE (gate green: lint ✓ · typecheck ✓ · `bun test` 925/0 · web build ✓, 2026-10-18)
**User report:** component design choices / skin colour choices are still bad.

## A. Audit findings (measured with `contrast()` from `lib/skin/compile.ts`)

| # | Finding | Evidence (BEFORE) |
|---|---|---|
| 1 | **Chips whose two halves were invisible** — below the 3:1 non-text contrast a two-tone chip needs (WCAG 1.4.11) | `bento` **1.00:1**, `clay` 1.15:1, `neumorph` 1.23:1, `glass` 1.47:1, `skeuo` (+`-3d`) 2.41:1, `blue` 2.70:1 — 10 chips total |
| 2 | **Chips that lied** — colours the skin never renders (`glass` white-on-blue, `bento` two near-whites, `cyber` dark/cyan although its light card is `#F1F6FA`) | hand-written hex pairs in `skins/index.ts` |
| 3 | **Chips that could not tell skins apart** | `system/soft/material/depth` all `#F8FAFC/#2563EB` |
| 4 | **Chips were maintained by hand** — 27 literal pairs, so every palette edit silently desynced them | no test tied a chip to a token (only "2 hexes" in `fast-path.test.ts`) |
| 5 | **A worse fate was latent:** a naive "card + accent" derivation collapses 8 skins to one chip — the skins really do share theme tokens | signature analysis (see C) |

## B. Fix — chips are derived, never hand-written

### `packages/ui/skins/swatch.ts` (new) — `swatchFor(skin, lookup)`
- **BASE (left)** = the skin's own light surface: its signature `tint-a`, else the most
  saturated `tint-*` (luminance ≥ 0.6), else the resolved `card → panel → ground` fill,
  else the inherited theme surface.
- **MARK (right)** = the FIRST candidate ≥ 3:1 against the base, in this order:
  `accentHint.light.accent` (the skin's declared accent) → `hue-1` (its primary decor hue)
  → other light palette colours by saturation → resolved `card.edge` (bold-border skins show
  their ink) → resolved `primary` fill → the skin's own dark counterpart of the base → theme ink.
- Every value passes through the newly exported `resolveHex()` / `THEME` in
  `lib/skin/compile.ts` (one shared maths — no second mirrored theme table).

### `packages/ui/skins/index.ts` — registry refactor
- All **27 hand-written pairs deleted**; the literal is now `core` (no `swatch`) and
  `registry` is derived: `{ ...entry, swatch: swatchFor(entry.skin, coreLookup) }`.
- `SkinId`/`bundledSkins`/`skinRegistry` export shapes unchanged — picker, SkinManager and
  compile pipeline keep working; `bun run build:skins` output is **byte-identical** (0 diffs).

## C. Evidence — BEFORE → AFTER (all 27 chips ≥ 3:1, none below)

| Skin | Before (contrast) | After (contrast) |
|---|---|---|
| bento (+3d) | `#F3F6FF/#FFF4EC` **1.00** | `#f3f6ff/#2563eb` 4.8 |
| clay (+3d) | `#F1F2F5/#E1E3E9` 1.15 | `#f3eeff/#c2410c` (own accent) 4.6 |
| neumorph | `#E9EAEE/#D2D4DB` 1.23 | `#f1f5f9/#2563eb` 4.7 |
| glass (+3d) | `#BFD6FF/#FFFFFF` 1.47 | `#f1f5f9/#c2410c` (own orb hue) 4.7 |
| skeuo (+3d) | `#F4F5F7/#9AA0AA` 2.41 | `#f4f5f7/#0b0d12` 17.8 |
| blue | `#F0F7FD/#00A0E9` 2.70 | `#f0f7fd/#0077c8` (own accent) 4.3 |
| editorial | `#FBF8F1/#0B0D12` | `#fbf8f1/#b3261e` (own accent) 6.2 |
| maximal (+3d) | `#FFF4F9/#D6217F` | `#fff4f9/#6d28d9` (own accent) 6.6 |
| neo-brutal (+3d) | `#FFF3B8/#0B0D12` | `#fff3b8/#c21e73` (yellow base + own accent) 5.0 |
| brutal | `#FFFFFF/#0B0D12` | `#ffffff/#0f172a` (its own ink edge) 17.9 |
| y2k (+3d) | `#EAF6FF/#D6217F` | `#eaf6ff/#1d6fb8` (own accent) 4.8 |
| flat, retro, system… | already good | kept or tightened (own tokens) |

`-3d` variants always equal their 2D sibling (it is literally the same palette as slabs).

## D. The one honest collision (test-proven, not a bug)

`system · soft · minimal · material · depth` still share one chip, because their
**colour decisions are literally equal** — no palette hexes, no `accentHint`, and every
resolved card/panel/ground/primary fill comes from the same theme tokens. They differ by
geometry, motion and shadows — not by colour. `test/swatch.test.ts` *proves* this: any
collision outside `{system, soft, minimal, material, depth}` or an exact `x`/`x-3d` sibling
pair fails the gate, and the identical group must have byte-identical defining colours.

If those five are ever to read apart in the picker, the fix is a palette decision (give
`soft`/`material`/`depth`/`minimal` their own `accentHint` or `tint-a`), not a swatch fix —
that is the remaining "skin colours are bland" question left open for a design decision.

## E. Tests (new, all green — 925 total)
- `test/swatch.test.ts` (5): 2 lowercase hexes + ≥3:1 · both halves ∈ colours the skin
  actually renders · `-3d` ≡ 2D sibling · collision whitelist with a *proof* for the
  identical group · registry really derived (no hand-edited chip survives).
- Compile changes are additive (`THEME` + `resolveHex` exported); contrast/skin/theme-layer
  snapshots all still pass, and `build:skins` regenerates 27 files with zero diffs.

## F. Related fix in this batch
`/skins/undefined.css` root cause + fixes + 4 regression tests — documented in
`todo/15-perf-caching-skin-audit.md` §D.