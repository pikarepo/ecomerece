# TASK 06 — Palette rework (theme colour layer)

**Status: DONE this session**

## Why
User feedback: "the colour combinations are bad / washed out." Recon (web
research, 2026) confirmed the base theme violated several established
practices:
- light surfaces were a muddy neutral gray (`#E9EAEE` canvas) with almost no
  separation from white — the "washed out" complaint;
- dark mode was a plain value-inversion of a neutral ramp (no perceptible hue
  family, so light/dark didn't read as the same product);
- the warning token was brown (`#9A6212`) and read as "disabled";
- neutrals and semantics had no shared hue anchor.

## Principle (research-backed)
Author colour on **perceptual tonal ramps** — OKLCH thinking, but the shipping
token format stays **space-separated sRGB channels** (`rgb(var(--x) / a)`), so
the whole alpha/`<alpha-value>` plumbing is untouched. One cool hue family
(~255°) anchors every neutral; the accent is the single chroma spike; semantics
are drawn from the same lightness windows. Dark mode uses **lightness-based
elevation** (each surface step) rather than shadow, and never pure black.

## Final palette
| Token | Light | Dark | Notes |
|---|---|---|---|
| `canvas` | `#F1F5F9` | `#0B0F17` | |
| `surface-1` | `#F8FAFC` | `#131A26` | panels/wells |
| `surface-2` | `#FCFDFF` | `#1B2432` | cards |
| `surface-3` | `#FFFFFF` | `#253041` | raised/inputs/chrome |
| `surface-4` | `#FFFFFF` | `#313E52` | overlay/active thumb |
| `ink` | `#0F172A` | `#E8EEF7` | 17.5 / 13.4 on s2 |
| `ink-2` | `#475569` | `#A9B5C6` | 7.4 / 7.5 |
| `ink-3` | `#5B6470` | `#A0ABBD` | ≥5.4 on canvas, 4.6 on s4 |
| `ink-4` | `#94A3B8` | `#5B6675` | disabled only |
| `line` | `#0F172A` | `#FFFFFF` | alpha 5–20% |
| `accent` | `#2563EB` | `#60A5FA` | 5.1 / 6.1 on s2 |
| `accent-ink` | `#FFFFFF` | `#0B1220` | 5.2 / 7.4 on the fill |
| `success` | `#15803D` | `#4ADE80` | 4.9 / 9.0 |
| `warning` | `#B45309` | `#FBBF24` | 4.9 / 9.4 |
| `danger` | `#DC2626` | `#F87171` | 4.7 / 5.6 |
| `info` | `#2563EB` | `#60A5FA` | = accent |

## Files touched
- `packages/ui/styles/tokens.css` — light block + BOTH dark blocks (media-query
  and explicit `[data-theme="dark"]`).
- `packages/ui/lib/skin/compile.ts` — `THEME` constant (validator source).
- `packages/ui/test/contrast.test.ts` — mirrored `THEME` (kept in sync).
- `packages/ui/scripts/color.ts` — edge-check backdrop constants + comment.
- `packages/ui/skins/index.ts` — base-theme picker swatches
  (`system`/`soft`/`material`/`depth`) → new surface-1 + accent.
- `apps/web/app/layout.tsx` — PWA `themeColor` → new canvas light/dark.
- `DESIGN.md` — §5.4 text, §6.1 surfaces, §6.4 accent/semantics, §6.5 business
  accent, Appendix A JSON, Appendix B prompt, meta/PWA/washed-out examples,
  registry swatches.

## Kept deliberately
- Skin-specific hue palettes (`editorial`, `neo-brutal`, `clay`, `skeuo`, `glass`
  base/orbs, …) are **not** theme colour and were left as authored.
- `packages/ui/test/useSkin.test.tsx` swatch fixtures are arbitrary test data.

## Verification
- Contrast snapshot regenerated (`bun test -u`) — only the 416 role-fill lanes
  changed; the two hard AA asserts (ink ≥4.5 on text-bearing roles,
  `accent-ink` ≥4.5 on `primary`) still pass for all 26 skins.
- `bun test` → 142 pass / 0 fail.
- `bun run gate` green (lint · tsc · test · `next build`).
