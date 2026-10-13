# TASK 07 — Missing components (buildout)

**Status: DONE — batches 1, 2 & 3 shipped**
## Backlog (prioritized)
Value = how often a commerce/storefront UI reaches for it; risk = test
difficulty in the happy-dom harness.

| # | Component | Dir | Status |
|---|---|---|---|
| 1 | `Separator` | surface | ✅ batch 1 |
| 2 | `Kbd` | surface | ✅ batch 1 |
| 3 | `NumberInput` (stepper) | controls | ✅ batch 1 |
| 4 | `Rating` | surface | ✅ batch 1 |
| 5 | `Accordion` / `AccordionItem` | list | ✅ batch 1 |
| 6 | `Tooltip` | overlay | ✅ batch 1 |
| 7 | `Breadcrumb` | navigation | ✅ batch 2 |
| 8 | `Combobox` / autocomplete | form | ✅ batch 2 |
| 9 | `Range` (dual-handle) | controls | ✅ batch 2 |
| 10 | `Timeline` | list | ✅ batch 2 |
| 11 | `TreeView` | navigation | ✅ batch 3 |
| 12 | `Carousel` | data | ✅ batch 3 |
| 13 | `FileUpload` / dropzone | form | ✅ batch 3 |
| 14 | `OTP` input | form | ✅ batch 3 |
| 15 | `DatePicker` / calendar | form | ✅ batch 3 |
| 16 | `TimePicker` | form | ✅ batch 3 |
| 17 | `ScrollArea` | surface | ✅ batch 3 |
| 18 | `AspectRatio` | surface | ✅ batch 3 |
| 19 | `Link` | navigation | ✅ batch 3 |
| 20 | `Toolbar` | navigation | ✅ batch 3 |

## Rules (non-negotiable)
- Components bind only `mat-*` roles + `--m-*` / theme token utilities; never raw
  colour, never `dark:` variants (§ fast-path gate).
- Radii = `rounded-chip/control/card/sheet`; motion = `duration-skin ease-skin`;
  press = `active:scale-[var(--press-scale)]`; focus = `focusRing()`.
- Export type + component from the category barrel.
- Add `/** @jsxImportSource react */` line 1 to any component rendered by a test
  (root tsconfig maps JSX to hono/jsx otherwise).
- Tests: `installDom()` in `beforeEach`, `restoreDom()` in `afterAll`, use
  `render()` / `fire()` from `test/_dom.ts`. Avoid `onChange` (React 19 does not
  fire it under happy-dom synthetic events); drive inputs via `onInput` or test
  button/click/keyboard paths.

## Batch 1 — done
`Separator`, `Kbd`, `NumberInput`, `Rating`, `Accordion`(+`AccordionItem`),
`Tooltip` + one test file each.

## Batch 2 — done
`Breadcrumb` (navigation), `Combobox` (form), `Range` dual-handle (controls),
`Timeline` (list) + one test file each. Suite 175 pass / 0 fail.

## Batch 3 — done
`TreeView`, `Carousel`, `FileUpload`, `OTP`, `DatePicker`, `TimePicker`,
`ScrollArea`, `AspectRatio`, `Link`, `Toolbar` + one test file each.
Suite 223 pass / 0 fail. `bun run gate --no-build` green.

## Done when (per batch)
`bun run gate` green with the new tests included.
