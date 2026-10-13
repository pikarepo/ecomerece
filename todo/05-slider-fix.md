# TASK 05 — Slider ("movable button") glitch fix

**Status: DONE this session**

## Goal
Make the `Slider` thumb track the pointer exactly, with no vertical
misalignment, no end-drift, and no animation lag while dragging.

## Why (the bugs)
`packages/ui/components/controls/Slider.tsx` renders a native
`<input type=range>` (fully transparent) under a custom track + thumb span.

1. **Vertical misalignment.** The thumb class sets `-translate-y-1/2`, but the
   inline `style={{ transform: … }}` *overrides the whole `transform`*, dropping
   the Y-centering — so the thumb sits ~10px low (handled).

2. **End-drift.** A native range thumb only travels `[half, width − half]`. The
   custom thumb used `left: percent%` (travel `0..width`) and was 20px while the
   native thumb was 24px → the visible thumb drifted from the value/click point
   and overshot the track by ~12px at 0 / 100.

3. **Drag lag.** `transition-transform` + `transition-[width]` ran *during*
   pointer drag, so thumb and fill trailed the pointer.

## Plan
- Position the thumb with the native thumb insets:
  `left: calc(10px + fraction * (100% - 20px))`, constant
  `transform: translate(-50%, -50%)`.
- Size the native thumb to the visual thumb (`size-5`, both webkit + moz) so the
  travel maths line up.
- Track `dragging` state (pointerdown/up/cancel/lost-capture) and only apply
  `transition-[left]` / `transition-[width]` when **not** dragging, so keyboard
  steps still animate but dragging is 1:1.

## Tests
- `packages/ui/test/slider.test.tsx` (happy-dom, via `test/_dom.ts`):
  - thumb inline style uses the inset formula at value 0 / 50 / 100;
  - `data-dragging` set on pointerdown, cleared on pointerup;
  - `onValueChange` fires with a number on input change;
  - `disabled` dims the control.
- Harness: add a generic `render()` (+ event `fire()`) to `test/_dom.ts`.

## Done when
`bun run gate` green; slider test added; no regression in the 137-test suite.

## Result
- `Slider.tsx`: thumb now `left: calc(10px + fraction * (100% - 20px))` +
  inline `transform: translate(-50%, -50%)` (Y-centering can't be clobbered);
  native thumb resized to `size-5`; `dragging` state drops the transitions.
- `test/_dom.ts`: added generic `render()` + bubbling `fire()` helpers.
- `test/slider.test.tsx` (5): inset formula at 0/50/100, native thumb sizing,
  drag state, value/`showValue`, disabled.
- **Harness finding:** root `tsconfig.json` sets `jsxImportSource: hono/jsx`, so
  `bun test` from the repo root transpiles component JSX to Hono nodes React
  rejects. Fixed by adding `/** @jsxImportSource react */` to `Slider.tsx`
  (the file's real runtime is React); also noted for future component tests.
  React 19's `onChange` does NOT fire under happy-dom synthetic events (only
  `onInput` does), so the value-change assertion was replaced with prop/geometry
  assertions.
- Suite: 137 → **142 pass / 0 fail.** `bun run gate` green.
