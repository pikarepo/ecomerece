# OS-Grade UI — Design System & Skin Engine Specification

**Tailwind CSS · Theme × Skin × Fidelity × Dimension · 320px → 3840px · Web, Android and iOS webviews**

Version 3.0 — adds the **Skin Engine** (Part VII)
Supersedes v2.0. Section numbers §1–§32 are unchanged so existing references still resolve; the skin engine lives in §33–§42 and amends the sections it touches.

---

## What changed in v3.0

| Area | v2.0 | v3.0 |
|---|---|---|
| Axes | Theme only (auto / light / dark) | **Theme × Skin × Fidelity × Dimension** (§33) |
| Surfaces | Colour tokens (`bg-surface-N`) | **Materials**: fill + edge + shadow + backdrop + sheen + depth per role (§34) |
| Radius | Size-based (`sm / lg / xl`) | **Role-based** (`chip / control / card / sheet`); old names kept as aliases (§12) |
| Rules | Eleven universal non-negotiables | **Invariants** (every skin) vs **skin-owned** rules (§4) |
| Stack | One CSS file | One generated CSS file **per skin** (§3, §38) |
| Gradients, blur, shadows | Banned or restricted globally | Banned **in markup**; allowed **inside skins** (§4, §36) |
| 3D | Not covered | Three tiers: 2.5D CSS, WebGL decor, spatial (§40) |
| Safety | Manual QA | Skin validator + CI gates (§41) |
| Known defects | Appendix E.6 listed 9 divergences | Divergences #1–#5, #7 become deliberate skins; #8 fixed (App. E) |

Corrections to the first skin-engine draft, folded in here:

- **Sheen is a background layer, not a `::before`.** A positioned pseudo-element paints above non-positioned children and washes over text. Layering it into `background` avoids that and costs nothing (§35).
- **`translate` for Z-depth is gated to `data-dimension="3d"`.** A non-`none` `translate` creates a stacking context and containing block on every element; apply it only when 3D is on.
- **Radius aliases.** `rounded-sm / rounded / rounded-lg / rounded-xl` now resolve through the role variables, so v2 markup keeps working unchanged.
- **Skin id is validated** before it is written into a `<link>` URL (§38).
- **Tilt vars renamed** (`--tilt-x` rotates X from pointer Y, `--tilt-y` rotates Y from pointer X). The draft had them crossed.
- **`AppShell` overflow vs `preserve-3d`.** `overflow: hidden` flattens 3D; `DepthStage` must sit inside the scroll container, not around the shell (§40).

---

## Table of contents

**Part I — Foundations**
1. [Philosophy](#1-philosophy) · 2. [How to use this document](#2-how-to-use-this-document) · 3. [Stack rules](#3-stack-rules) · 4. [Invariants and skin-owned rules](#4-invariants-and-skin-owned-rules)

**Part II — Tokens**
5. [Token architecture](#5-token-architecture) · 6. [Colour reference](#6-colour-reference) · 7. [`tailwind.config.js`](#7-tailwindconfigjs--complete) · 8. [`tokens.css`](#8-tokenscss--complete) · 9. [Theme switching](#9-theme-switching) · 10. [Light is not inverted dark](#10-light-mode-is-not-inverted-dark-mode)

**Part III — Form** *(values below are the `system` skin; geometry, depth and motion are skin-owned)*
11. [Spacing](#11-spacing-and-the-4px-grid) · 12. [Radius](#12-radius-roles-and-concentric-corners) · 13. [Elevation](#13-elevation-model) · 14. [Materials](#14-materials) · 15. [Typography](#15-typography) · 16. [Iconography](#16-iconography) · 17. [Motion](#17-motion)

**Part IV — Layout** (skin-independent)
18. [Responsive system](#18-responsive-system--320px-to-3840px) · 19. [Navigation](#19-navigation-patterns) · 20. [Page archetypes](#20-page-archetypes)

**Part V — Components**
21. [Component library](#21-component-library) · 22. [Density](#22-density-and-enterprise-views) · 23. [Data visualisation](#23-data-visualisation) · 24. [Feedback states](#24-feedback-states)

**Part VI — Quality**
25. [Copy](#25-content-and-copywriting) · 26. [Accessibility](#26-accessibility) · 27. [Platform notes](#27-platform-notes) · 28. [Performance](#28-performance) · 29. [Implementation](#29-implementation-guide) · 30. [QA checklist](#30-qa-checklist) · 31. [Troubleshooting](#31-troubleshooting) · 32. [Migrating a dark-only build](#32-migrating-a-dark-only-build)

**Part VII — Skin engine**
33. [Four axes](#33-four-axes) · 34. [Materials](#34-materials-roles-and-slots) · 35. [Tailwind plugin](#35-tailwind-plugin-mat-utilities) · 36. [Skin definition format](#36-skin-definition-format) · 37. [Compiler and fallbacks](#37-compiler-and-guaranteed-fallbacks) · 38. [Loading, registry, runtime](#38-loading-registry-and-runtime) · 39. [Bundled skins](#39-bundled-skins) · 40. [3D](#40-3d-three-honest-tiers) · 41. [Validator and CI gates](#41-skin-validator-and-ci-gates) · 42. [Migrating to the skin engine](#42-migrating-to-the-skin-engine)

**Appendices**
A. [Token export](#appendix-a--token-export-json) · B. [AI prompt block](#appendix-b--paste-ready-ai-prompt-block) · C. [Cheat sheet](#appendix-c--one-page-cheat-sheet) · D. [Glossary](#appendix-d--glossary) · E. [`packages/ui` reference](#appendix-e--packagesui-implementation-reference) · F. [Skin authoring checklist](#appendix-f--skin-authoring-checklist)

---

# Part I — Foundations

## 1. Philosophy

> Someone opening your product should feel they entered **a system**, not visited **a site**.

An interface reads as native because of physics, not palette. iOS Settings, One UI, macOS System Settings and Windows 11 Settings look nothing alike, yet all four feel like an operating system for the same seven reasons.

### The seven signals

| # | Signal | Why it reads as "system" | How this spec delivers it |
|---|---|---|---|
| 1 | **Layered surfaces** | Real OS chrome is stacked panes, not painted depth | Material roles `ground → panel → card → raised → overlay` |
| 2 | **One corner language** | Every OS picks a corner language and never breaks it | Role-based radii per skin, stepping down when nested |
| 3 | **Hairline separation** | System UI separates with 1px rules | `border-line/10`, `divide-line/5` (skin may change stroke) |
| 4 | **Floating chrome material** | Translucent material over moving content | `mat-chrome` role |
| 5 | **The system typeface** | The interface renders in the OS face | `-apple-system`, `Segoe UI Variable`, `Roboto` |
| 6 | **Motion that answers you** | Nothing moves unprompted | `ease-skin`, interaction-only |
| 7 | **Layout that recomposes** | Phone and desktop are different compositions of one system | `flex-col` → `md:tall:flex-row` → multi-pane |

Signals 1–6 are expressed through the **skin**. Signal 7 and everything in Part IV is skin-independent.

### Three failure modes

- **Website tells.** A boxed page centred on grey, a hero, a four-column footer, scroll-triggered fade-ups.
- **Template tells.** Identical cards with identical shadows, decoration used as identity, an accent on every third element. *In a multi-skin system the template tell is subtler: a skin that is only a colour change.* A skin must change material, geometry and motion together or it is a theme.
- **Dead flatness.** Removing depth without replacing it. Flat is a *skin* (`minimal`), not the default law.

### What "comfortable" means here

- **Low luminance range in dark, low glare in light.**
- **Predictable geography.** Navigation in the same place on every screen.
- **Nothing competes.** One accent, one primary action, one display heading per screen.
- **No surprises.** Nothing animates unless the person caused it.
- **Readable at arm's length.** 16px body, 4.5:1 contrast, 44px targets. **In every skin.**

---

## 2. How to use this document

| You want to… | Go to |
|---|---|
| Start a new project | §7 config, §8 tokens, §35 plugin, then §21 |
| Add or author a skin | §36–§39, Appendix F |
| Brief an AI build tool | Appendix B |
| Check a colour value | §6 |
| Decide a layout at a breakpoint | §18, §20 |
| Build a component | §21 |
| Add 3D | §40 |
| See what is shipped | Appendix E |
| Add light mode to a dark build | §32 |
| Move an existing build to skins | §42 |
| Debug | §31 |
| Ship | §30, §41 |

Copy `tailwind.config.js` (§7) and `tokens.css` (§8) into a new project, then add the `mat-*` plugin (§35). The default skin is `system`; its output is identical to v2.0.

---

## 3. Stack rules

**Allowed**

- Tailwind utility classes in markup, plus the `mat-*` role classes (§35).
- One `tailwind.config.js` holding every token binding.
- Raw CSS limited to: the three `@tailwind` directives, theme variables, **generated skin files** (one per skin), `@keyframes` where a skin genuinely needs one, the reduced-motion guard, and a handful of `@layer base` resets.
- Arbitrary values for one-off cases **in markup that is not a component** (see §41 lint).
- Official Tailwind plugins (`@tailwindcss/container-queries` is effectively required, §18.8).

**Not allowed**

- Hand-written component `.css` / `.scss` / `.module.css`.
- CSS-in-JS, Bootstrap, Bulma, MUI, Ant, DaisyUI, Chakra, or their class names.
- Inline `style=""` carrying design decisions (runtime-computed values are fine).
- A second hand-authored `<style>` block.
- **Skin logic in components**: no `glass:`, `clay:` or `[data-skin=…]` selectors in component code. Components ask for a role; skins answer.

**Amendment from v2.** "One CSS file" becomes **"one generated CSS file per skin, and nothing else."** Skins are authored as typed objects (§36) and compiled; nobody hand-writes the Auto/Light/Dark selector triplication.

**Why this strictness.** Every design decision lives in tokens or skins. Changing the corner language, the material, or the entire personality is a one-object edit that propagates to every screen. Leaks into component CSS or per-component overrides destroy that guarantee.

---

## 4. Invariants and skin-owned rules

v2.0 listed eleven non-negotiables. They mixed two different things: laws that protect people, and aesthetic choices of one particular look. v3.0 separates them.

### 4.1 Invariants — hold in every skin, enforced in CI

| # | Invariant | Check |
|---|---|---|
| I1 | **Markup is theme-blind and skin-blind.** No `dark:`, no per-skin variants or selectors in components. | Lint (§41) |
| I2 | **Contrast:** body text 4.5:1, large text and UI boundaries 3:1, focus 3:1 — for every skin × theme × role. | Contrast matrix |
| I3 | **Targets and reach:** 44×44 minimum, visible `focus-visible` ring, 320px floor. | Visual regression |
| I4 | **Degradation:** `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast: more` and `fidelity=low` always yield a legible, usable form. | Fallback render |
| I5 | **One accent, one primary action per screen.** | Review |
| I6 | **Motion only answers an action.** No scroll reveals, no staggered entrances, no decorative loops (skeletons and spinners excepted). | Lint + review |
| I7 | **Tokens only.** All styling resolves to tokens or skin variables; no component CSS. | Lint |
| I8 | **Both themes ship together** for every skin. | Schema check |
| I9 | **Recompose, never scale** (Part IV) and **360/320 first.** | Visual regression |
| I10 | **Status never by colour alone; real semantics; no hover-only function.** | Review |

### 4.2 Skin-owned — defaults below describe the `system` skin

| v2.0 rule | Now | Where it lives |
|---|---|---|
| No gradients | Banned **in markup**. Skins may use gradients in `bg`, `sheen`, `scene`. `system` and `minimal` use none. | §36 |
| Never pure black; pure white only on `surface-4` | `system` skin only. | §39.1 |
| No sharp edges / radius scale 8·14·20·28 | Radius is role-based per skin. `minimal` may use 6/8/10/12; `soft` uses pills. A container never uses `rounded-none` in any skin. | §12, §36 |
| Depth is surface → hairline → shadow | The depth cue is the skin's choice (shadow, blur, inset, border, or Z-space). | §13, §34 |
| Blur only on floating chrome | `system`: yes. `glass`: chrome + overlay + (capped) cards. Perf cap applies to all. | §28, §41 |
| Press scale 0.97, `ease-spring`, 200ms | `--press-scale`, `--ease`, `--dur` per skin. | §17, §36 |
| No webfont for UI | A skin may declare `--font-ui`. `system` does not. | §15 |
| Flat fills | Materials may be any `<background>`. | §34 |

### 4.3 Still true everywhere (restated for continuity)

Four solid text tokens (`ink`, `ink-2`, `ink-3`, `ink-4`, never white-at-opacity); `ink-4` is disabled only; `accent-ink` is separate from `ink`; no `dark:` in components; 360px is the practical floor and 320px the real one; both themes are checked on every screen.

---

# Part II — Tokens

## 5. Token architecture

### 5.1 Why not `dark:` variants

```html
<div class="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800
            text-zinc-900 dark:text-zinc-100 shadow-sm dark:shadow-none">
```

- Every class string doubles; real components reach 200+ characters.
- One missed variant is a shipped bug (a white flash in a dark app).
- A third theme means touching every file.
- Design and code drift; the palette lives in a thousand strings.

The same argument applies, harder, to skins. N skins × 2 themes in class strings is unmaintainable. Variables solve both.

### 5.2 Semantic names bound to variables

```js
colors: { 'surface-2': 'rgb(var(--surface-2) / <alpha-value>)' }
```

```css
:root                  { --surface-2: 248 249 251; }  /* light */
:root[data-theme=dark] { --surface-2:  27  29  33; }  /* dark  */
```

```html
<div class="mat-card rounded-card p-4">   <!-- skin-blind, theme-blind -->
```

### 5.3 Why channels, not hex

Variables hold **space-separated RGB channels** (`27 29 33`) so `<alpha-value>` works:

```
bg-surface-3/72  → rgb(36 38 43 / 0.72)
border-line/10   → rgb(255 255 255 / 0.1)
bg-accent/12     → rgb(61 139 255 / 0.12)
```

Hex in a variable makes all of these invalid and they render as nothing — the most common implementation mistake in this pattern. Material slots (`--m-*`) hold **complete CSS values** (they are consumed by `background`, `box-shadow`, `backdrop-filter`, not by Tailwind opacity), and inside those values you reference colour channels as `rgb(var(--surface-2) / .6)`.

### 5.4 Semantic naming and the text-token correction

Tokens are named for **role**, never appearance. Text uses **four solid tokens**, each tuned per theme (translucent black over light surfaces computes to ~3.4:1 and reads muddy; translucent white over dark recedes cleanly, so opacity tiers are dark-only thinking):

| Role | Token | Light | Dark | Contrast on `surface-2` | Use |
|---|---|---|---|---|---|
| Primary | `text-ink` | `#0F172A` | `#E8EEF7` | 17.5:1 / 13.4:1 | Headings, values |
| Secondary | `text-ink-2` | `#475569` | `#A9B5C6` | 7.4:1 / 7.5:1 | Supporting text |
| Tertiary | `text-ink-3` | `#5B6470` | `#A0ABBD` | 5.9:1 / 6.7:1 | Captions, metadata, placeholders |
| Disabled | `text-ink-4` | `#94A3B8` | `#5B6675` | 2.5:1 / 2.7:1 | Unavailable controls **only** |

**Skins and contrast.** Ink tokens are measured against `surface-2`. A skin that makes a material translucent (glass) or tinted must ensure text still passes **on the worst-case composite** of that material over its scene. The validator (§41) computes this; the `ink-*` tokens themselves do not change per skin.

Borders keep alpha: `--line` is one channel triple used at 5–15%.

### 5.5 Token layers

```
┌────────────────────────────────────────────────────────────────┐
│ Layer 4 — Components   mat-card rounded-card ease-skin         │ ← what you write
├────────────────────────────────────────────────────────────────┤
│ Layer 3 — Tailwind     mat-* plugin · rounded-* → var(--r-*)   │ ← written once
├────────────────────────────────────────────────────────────────┤
│ Layer 2 — Skin         [data-skin=glass][data-theme=dark]      │ ← one generated file per skin
├────────────────────────────────────────────────────────────────┤
│ Layer 1 — Theme        --surface-2, --ink, --accent (channels) │ ← colour only
└────────────────────────────────────────────────────────────────┘
```

Layer 4 never knows the theme or skin. Layer 1 changes only when colour changes. Layer 2 changes only when material, geometry or motion changes.

---

## 6. Colour reference

Colour belongs to the **theme layer** and is shared by all skins. A skin may *reference* any token but must not redefine colour channels (that would be a second theme).

### 6.1 Surfaces

| Token | Light | Dark | Elevation role |
|---|---|---|---|
| `canvas` | `#F1F5F9` | `#0B0F17` | Root background |
| `surface-1` | `#F8FAFC` | `#131A26` | Panels, rails, inset wells |
| `surface-2` | `#FCFDFF` | `#1B2432` | Cards, list groups |
| `surface-3` | `#FFFFFF` | `#253041` | Raised, inputs, popovers, chrome |
| `surface-4` | `#FFFFFF` | `#313E52` | Modals, sheets, active segment thumbs |

Cool slate ramp (OKLCH-derived, ~hue 255) so light and dark read as the same
material. Dark steps span ~34 luminance points and separate on their own; light
steps are near-white and rely on shadow (§10).

### 6.2 Text · 6.3 Line

See §5.4 table. `line` is `#0F172A` (light) / `#FFFFFF` (dark) at `/5 /10 /15 /20`.

### 6.4 Accent and semantics

| Token | Light | Dark | Contrast on `surface-2` (L / D) |
|---|---|---|---|
| `accent` | `#2563EB` | `#60A5FA` | 5.1 / 6.1 |
| `accent-ink` | `#FFFFFF` | `#0B1220` | 5.2 / 7.4 *(on the fill)* |
| `success` | `#15803D` | `#4ADE80` | 4.9 / 9.0 |
| `warning` | `#B45309` | `#FBBF24` | 4.9 / 9.4 |
| `danger` | `#DC2626` | `#F87171` | 4.7 / 5.6 |
| `info` | `#2563EB` | `#60A5FA` | = accent |

`accent-ink` is the token most people get wrong: white on the dark accent is
weak; a DARK ink sits on the accent fill in dark mode and clears 4.5:1 easily.

### 6.5 Choosing a different accent

Swap `--accent` and `--accent-ink` only; never add a second accent.

| Product type | Light | Dark | Dark `accent-ink` |
|---|---|---|---|
| Business | `#2563EB` | `#60A5FA` | `#0B1220` |
| Finance / health | `#0F7B52` | `#34C77B` | `#05210F` |
| Consumer / warm | `#C2410C` | `#FF6B4A` | `#2B0A02` |
| Media / creative | `#6D28D9` | `#A78BFA` | `#1A0B33` |
| Neutral / tooling | `#3F3F46` | `#D4D4D8` | `#18181B` |

Any candidate must reach ≥4.5:1 on `surface-2` in both themes, and text on the fill ≥4.5:1 against the fill. **Skins that tint materials with the accent (glass scenes, clay) inherit whichever accent is active.**

### 6.6 Shadows

Shadow *tokens* (`--shadow-sm/md/lg`) are skin-owned (§36). Values for the `system` skin:

| Token | Light | Dark |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgb(15 18 26/.06), 0 1px 3px rgb(15 18 26/.04)` | `0 1px 2px rgb(0 0 0/.35)` |
| `shadow` | `0 4px 14px rgb(15 18 26/.08), 0 1px 3px rgb(15 18 26/.05)` | `0 4px 12px rgb(0 0 0/.40)` |
| `shadow-lg` | `0 16px 40px rgb(15 18 26/.14), 0 2px 8px rgb(15 18 26/.06)` | `0 8px 28px rgb(0 0 0/.50)` |

---

## 7. `tailwind.config.js` — complete

```js
/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

// Fixed vocabulary. Skins fill these in; components only ever name a role.
const ROLES = ['ground','panel','card','raised','overlay','chrome','well','control','primary'];

module.exports = {
  content: ['./index.html', './src/**/*.{html,js,jsx,ts,tsx,vue,svelte,astro}',
            './packages/ui/**/*.{ts,tsx}'],

  // Only for third-party components you cannot restyle. Your own never use it.
  darkMode: ['class', '[data-theme="dark"]'],

  theme: {
    // REPLACED, not extended — extended screens sort after defaults and `xs`
    // would win at every width above 360px. See §18.
    screens: {
      xs: '360px', sm: '480px', md: '768px', lg: '1024px',
      xl: '1440px', '2xl': '1920px', '3xl': '2560px', '4xl': '3200px',
      tall:  { raw: '(min-height: 560px)' },
      short: { raw: '(max-height: 559px)' },
      touch: { raw: '(pointer: coarse)' },
      fine:  { raw: '(pointer: fine)' },
    },

    extend: {
      colors: {
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        surface: {
          1: 'rgb(var(--surface-1) / <alpha-value>)',
          2: 'rgb(var(--surface-2) / <alpha-value>)',
          3: 'rgb(var(--surface-3) / <alpha-value>)',
          4: 'rgb(var(--surface-4) / <alpha-value>)',
        },
        ink:          'rgb(var(--ink)        / <alpha-value>)',
        'ink-2':      'rgb(var(--ink-2)      / <alpha-value>)',
        'ink-3':      'rgb(var(--ink-3)      / <alpha-value>)',
        'ink-4':      'rgb(var(--ink-4)      / <alpha-value>)',
        line:         'rgb(var(--line)       / <alpha-value>)',
        accent:       'rgb(var(--accent)     / <alpha-value>)',
        'accent-ink': 'rgb(var(--accent-ink) / <alpha-value>)',
        success:      'rgb(var(--success)    / <alpha-value>)',
        warning:      'rgb(var(--warning)    / <alpha-value>)',
        danger:       'rgb(var(--danger)     / <alpha-value>)',
        info:         'rgb(var(--info)       / <alpha-value>)',
      },

      // Role-based radii. v2 size names stay as aliases, so old markup is unchanged.
      borderRadius: {
        chip:    'var(--r-chip)',
        control: 'var(--r-control)',
        card:    'var(--r-card)',
        sheet:   'var(--r-sheet)',
        sm:      'var(--r-chip)',      // alias
        DEFAULT: 'var(--r-control)',   // alias
        lg:      'var(--r-card)',      // alias
        xl:      'var(--r-sheet)',     // alias
      },

      fontFamily: {
        sans: ['var(--font-ui)', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Text',
               'Segoe UI Variable', 'Segoe UI', 'Roboto', 'Inter', 'sans-serif'],
        mono: ['ui-monospace', 'SF Mono', 'Menlo', 'Consolas', 'monospace'],
      },

      // Elevation shadows are skin tokens; role shadows live in the mat-* classes.
      boxShadow: {
        sm: 'var(--shadow-sm)', DEFAULT: 'var(--shadow-md)', lg: 'var(--shadow-lg)', none: 'none',
      },

      backdropBlur: { xs: '20px', sm: '30px' },

      transitionTimingFunction: {
        spring: 'cubic-bezier(0.32, 0.72, 0, 1)',   // fixed reference curve
        exit:   'cubic-bezier(0.4, 0, 1, 1)',
        skin:   'var(--ease)',                        // the active skin's curve
        'skin-exit': 'var(--ease-exit)',
      },
      transitionDuration: {
        instant: '120ms', DEFAULT: '200ms', slow: '300ms',
        skin: 'var(--dur)', 'skin-slow': 'var(--dur-slow)',
      },

      zIndex: { base: '0', raised: '10', sticky: '20', chrome: '30', overlay: '40', modal: '50', toast: '60' },
      maxWidth: { prose: '68ch', shell: '1200px' },
      spacing: { 11: '2.75rem', 'safe-b': 'env(safe-area-inset-bottom)', 'safe-t': 'env(safe-area-inset-top)' },
    },
  },

  plugins: [
    // §35 — material roles. Written once, never edited per skin.
    plugin(({ addComponents }) => {
      const out = {};
      for (const r of ROLES) {
        out[`.mat-${r}`] = {
          position: 'relative',
          // sheen is an <image> layer stacked above the fill (see §35 for why not ::before)
          background: `var(--m-${r}-sheen, none), var(--m-${r}-bg)`,
          border: `var(--stroke, 1px) solid var(--m-${r}-edge, transparent)`,
          boxShadow: `var(--m-${r}-shadow, none)`,
          backdropFilter: `var(--m-${r}-backdrop, none)`,
          WebkitBackdropFilter: `var(--m-${r}-backdrop, none)`,
        };
      }
      out['.mat-control:hover']  = { background: 'var(--m-control-hover-sheen, var(--m-control-sheen, none)), var(--m-control-hover-bg)', boxShadow: 'var(--m-control-hover-shadow)' };
      out['.mat-control:active'] = { background: 'var(--m-control-press-sheen, none), var(--m-control-press-bg)', boxShadow: 'var(--m-control-press-shadow)' };
      out['.mat-primary:hover']  = { filter: 'brightness(1.05)' };
      // Z-depth only exists under data-dimension="3d" (a non-none `translate` makes a stacking context)
      out['[data-dimension="3d"] .mat-ground, [data-dimension="3d"] .mat-panel, [data-dimension="3d"] .mat-card, [data-dimension="3d"] .mat-raised, [data-dimension="3d"] .mat-overlay, [data-dimension="3d"] .mat-chrome, [data-dimension="3d"] .mat-well, [data-dimension="3d"] .mat-control, [data-dimension="3d"] .mat-primary'] = { transformStyle: 'preserve-3d' };
      for (const r of ROLES) {
        out[`[data-dimension="3d"] .mat-${r}`] = { translate: `0 0 var(--m-${r}-z, 0px)` };
      }
      addComponents(out);   // components layer: `fixed`, `sticky`, `hidden` utilities still win
    }),
    require('@tailwindcss/container-queries'),
  ],
};
```

---

## 8. `tokens.css` — complete

The **theme layer** (colour channels, shadows for `system`, color-scheme) plus base resets. Skin files (§37) are generated separately and loaded after this file.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ─── LIGHT (default) ─────────────────────────────────────────────────── */
:root {
  color-scheme: light;

  --canvas: 233 234 238;  --surface-1: 241 242 245;  --surface-2: 248 249 251;
  --surface-3: 252 252 253;  --surface-4: 255 255 255;
  --glass: 255 255 255;

  --ink: 11 13 18;  --ink-2: 76 82 96;  --ink-3: 103 109 123;  --ink-4: 162 167 178;
  --line: 11 13 18;

  --accent: 11 99 229;  --accent-ink: 255 255 255;
  --success: 15 123 82;  --warning: 154 98 18;  --danger: 206 43 43;  --info: 11 99 229;

  /* skin-owned defaults (system skin). A skin file overrides these. */
  --r-chip: 8px;  --r-control: 14px;  --r-card: 20px;  --r-sheet: 28px;  --stroke: 1px;
  --ease: cubic-bezier(.32,.72,0,1);  --ease-exit: cubic-bezier(.4,0,1,1);
  --dur: 200ms;  --dur-slow: 300ms;  --press-scale: .97;
  --scene: rgb(var(--canvas));
  --shadow-sm: 0 1px 2px rgb(15 18 26/.06), 0 1px 3px rgb(15 18 26/.04);
  --shadow-md: 0 4px 14px rgb(15 18 26/.08), 0 1px 3px rgb(15 18 26/.05);
  --shadow-lg: 0 16px 40px rgb(15 18 26/.14), 0 2px 8px rgb(15 18 26/.06);
}

/* ─── DARK (follows the OS) ───────────────────────────────────────────── */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
    --canvas: 10 11 13;  --surface-1: 19 20 23;  --surface-2: 27 29 33;
    --surface-3: 36 38 43;  --surface-4: 46 48 54;
    --glass: 36 38 43;
    --ink: 245 246 248;  --ink-2: 169 174 184;  --ink-3: 134 139 150;  --ink-4: 86 90 99;
    --line: 255 255 255;
    --accent: 61 139 255;  --accent-ink: 7 20 43;
    --success: 52 199 123;  --warning: 240 178 61;  --danger: 255 92 92;  --info: 61 139 255;
    --shadow-sm: 0 1px 2px rgb(0 0 0/.35);
    --shadow-md: 0 4px 12px rgb(0 0 0/.40);
    --shadow-lg: 0 8px 28px rgb(0 0 0/.50);
  }
}

/* ─── DARK (explicit override) — identical values ─────────────────────── */
:root[data-theme="dark"] {
  color-scheme: dark;
  --canvas: 10 11 13;  --surface-1: 19 20 23;  --surface-2: 27 29 33;
  --surface-3: 36 38 43;  --surface-4: 46 48 54;
  --glass: 36 38 43;
  --ink: 245 246 248;  --ink-2: 169 174 184;  --ink-3: 134 139 150;  --ink-4: 86 90 99;
  --line: 255 255 255;
  --accent: 61 139 255;  --accent-ink: 7 20 43;
  --success: 52 199 123;  --warning: 240 178 61;  --danger: 255 92 92;  --info: 61 139 255;
  --shadow-sm: 0 1px 2px rgb(0 0 0/.35);
  --shadow-md: 0 4px 12px rgb(0 0 0/.40);
  --shadow-lg: 0 8px 28px rgb(0 0 0/.50);
}

/* ─── Base resets ─────────────────────────────────────────────────────── */
@layer base {
  html { -webkit-tap-highlight-color: transparent; }
  body {
    background: var(--scene);              /* skins may paint a scene; system = canvas */
    background-color: rgb(var(--canvas));  /* always a solid fallback */
    background-attachment: fixed;
    color: rgb(var(--ink));
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  ::selection { background-color: rgb(var(--accent) / .25); }
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-thumb {
    background-color: rgb(var(--line) / .18); border-radius: 8px;
    border: 3px solid transparent; background-clip: content-box;
  }
  ::-webkit-scrollbar-thumb:hover { background-color: rgb(var(--line) / .28); }
  ::-webkit-scrollbar-track { background: transparent; }
}

/* ─── Reduced motion ──────────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 1ms !important; animation-duration: 1ms !important;
    animation-iteration-count: 1 !important; scroll-behavior: auto !important;
  }
}
```

**On the duplication.** The dark block appears twice by design: the media query handles Auto, the attribute handles an explicit choice. The `:root:not([data-theme="light"])` guard is what lets "Light" override a dark OS. Generate both from one source in your build; do not restructure the selectors. Skin files use the same triple (§37) and are generated, not hand-written.

**`--glass`** is the frosted-material base fill, consumed by skin materials (`rgb(var(--glass)/.55)`).

---

## 9. Theme switching

### 9.1 Three states

**Auto (default) → Light → Dark.** Following the device is itself an OS signal.

### 9.2 No flash of the wrong theme (or skin)

Inline in `<head>`, above the CSS link. Never in a deferred bundle. The v3 bootstrap handles theme **and** skin (skin id is validated; see §38 for the full script):

```html
<script>
  try {
    var r = document.documentElement, t = localStorage.getItem('theme'), s = localStorage.getItem('skin');
    if (t === 'dark' || t === 'light') r.setAttribute('data-theme', t);
    if (s && /^[a-z0-9-]{1,32}$/.test(s)) r.setAttribute('data-skin', s);
  } catch (e) {}
</script>
```

- `try/catch`: private mode and some webviews throw.
- No value written for Auto; the absence of the attribute *is* Auto.
- `data-theme`, not a class, so it never collides with utilities.

### 9.3 The control

```js
function setTheme(choice) {            // 'auto' | 'light' | 'dark'
  const root = document.documentElement;
  if (choice === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', choice);
  try { localStorage.setItem('theme', choice === 'auto' ? '' : choice); } catch (e) {}
  syncMetaThemeColor();
}
```

### 9.4 System bars

```html
<meta name="theme-color" content="#F1F5F9" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0B0F17" media="(prefers-color-scheme: dark)">
```

`media` only covers Auto; on manual override update the tag from `--canvas`:

```js
function syncMetaThemeColor() {
  const [r, g, b] = getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim().split(/\s+/);
  let tag = document.querySelector('meta[name="theme-color"]:not([media])');
  if (!tag) { tag = document.createElement('meta'); tag.name = 'theme-color'; document.head.appendChild(tag); }
  tag.content = `rgb(${r} ${g} ${b})`;
}
```

Skins never change `--canvas`, so the system bar stays correct under every skin.

### 9.5 React hook

```jsx
import { useCallback, useEffect, useState } from 'react';

export function useTheme() {
  const [choice, setChoice] = useState(() => {
    try { return localStorage.getItem('theme') || 'auto'; } catch { return 'auto'; }
  });
  useEffect(() => {
    const root = document.documentElement;
    if (choice === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', choice);
    try { localStorage.setItem('theme', choice === 'auto' ? '' : choice); } catch {}
  }, [choice]);
  const resolved = choice !== 'auto' ? choice
    : (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  return { choice, resolved, setTheme: useCallback(setChoice, []) };
}
```

### 9.6 Do not animate the transition

No `transition: background-color` on `*` or `body`. Watching every surface tween is the definitive "website theme toggle" tell. The same applies to **skin switches**: swap instantly.

---

## 10. Light mode is not inverted dark mode

| | Dark | Light |
|---|---|---|
| Elevation direction | Surfaces get **lighter** forward | Surfaces get **whiter**; shadow does most of the work |
| Range | Wide — four distinct greys | Narrow — four near-whites |
| Shadow role | Reinforces a surface step | *Is* the elevation cue |
| Shadow value | Near-black .35–.50, single layer | Cool-tinted .04–.14, two layers |
| Hairlines | White 5–15% | Ink 5–12% |
| Accent | Bright; text on fill goes **dark** | Deeper; text on fill goes **white** |
| Status hues | Bright | Deepened (`#34C77B` on white is 1.9:1) |
| Frosted chrome | `bg-surface-3/72 backdrop-blur-sm` | Same plus `backdrop-saturate-150` |
| Emphasis | Brightness | Weight |
| Characteristic failure | Grey mud | Glare |
| Disabled | Dims toward background | Lightens toward background |

### 10.1 Three light-only rules

**Reach for weight, not darkness** (`font-medium` → `font-semibold`). **Saturate the blur** (`backdrop-saturate-150`) or it goes flat grey over near-white. **Shadow before border on the topmost layer** — `surface-4` is white on a near-white canvas, so `shadow-lg` carries the separation.

### 10.2 One accent

`--accent` differs between themes as a *tuning*, not a second brand colour. The same holds for skins: **a skin may tint with the accent but never introduce another hue** as an identity colour (scene blobs in `glass` use `accent`, `success`, `warning` tokens as ambient light, not as UI colour).

---

# Part III — Form

> Everything in Part III describes the **`system` skin**, which is the default and reproduces v2.0 exactly. Where a value is skin-owned it is marked 🎨 and the token that carries it is named. Other skins change those values; none changes the *structure* (roles, nesting rule, interaction states).

## 11. Spacing and the 4px grid

Every spacing value is a multiple of 4px; never break it with `p-[13px]`. Spacing is **not** skin-owned (density is a layout concern, §22).

| Utility | px | Use |
|---|---|---|
| `gap-1` / `p-1` | 4 | Icon-to-label inside a chip |
| `gap-2` / `p-2` | 8 | Tightly related items, dense cells |
| `gap-3` / `p-3` | 12 | Row internals |
| `gap-4` / `p-4` | 16 | **Default.** Card padding, phone screen padding |
| `gap-5` / `p-5` | 20 | Consumer rows, sheet padding |
| `gap-6` / `p-6` | 24 | Desktop panel padding |
| `gap-8` | 32 | Between major sections |
| `mt-12` | 48 | Between top-level screen sections |

| Density | Row | Card | Between cards |
|---|---|---|---|
| Consumer (phone) | `py-3 px-4` | `p-4` | `gap-3` |
| Consumer (desktop) | `py-4 px-5` | `p-5` | `gap-4` |
| Data-dense | `py-2 px-3` | `p-4` | `gap-3` |
| Ultra-dense | `py-1.5 px-2.5` | `p-3` | `gap-2` |

Density changes **padding only**. Materials, radii and borders are identical across all four. Vertical rhythm: label→value `mt-1`; heading→body `mt-1`/`mt-3`; body→control `mt-4`; section→section `mt-8` phone, `mt-12` desktop.

**Touch targets:** `min-h-11 min-w-11` on every interactive element. Pad the hit area, don't grow the icon:

```html
<button class="-m-2 flex h-11 w-11 items-center justify-center rounded-control"><svg class="h-4 w-4">…</svg></button>
```

Skins with large Z-depth must keep the hit area within ±24px of the parent plane (§40).

---

## 12. Radius roles and concentric corners

🎨 Radius is **role-based**. Four roles; every skin defines all four.

| Role | Tailwind | v2 alias | `system` | Applies to |
|---|---|---|---|---|
| `--r-chip` | `rounded-chip` | `rounded-sm` | 8px | Chips, tags, checkboxes, small icon tiles |
| `--r-control` | `rounded-control` | `rounded` | 14px | Buttons, inputs, list rows, segment thumbs |
| `--r-card` | `rounded-card` | `rounded-lg` | 20px | Cards, panels, dropdowns, popovers |
| `--r-sheet` | `rounded-sheet` | `rounded-xl` | 28px | Modals, sheets, large containers |
| — | `rounded-full` | — | ∞ | Avatars, switches, status dots, progress tracks |

A skin may make `--r-control: 999px` (the `soft` skin). That is a skin decision, not a code change: **components never hard-code a radius.** Appendix E.6 divergences #1 and #2 (pill controls, `rounded-2xl` cards) are exactly this and are now expressed as the `soft` skin.

### The concentric rule (invariant of structure, not of value)

**A nested element uses a smaller role than its parent, never the same.**

```
rounded-sheet   modal
└ rounded-card    card inside it
  └ rounded-control row inside the card
    └ rounded-chip  chip inside the row
```

### Computed concentric corners

Because radii are variables, the optical rule — **child radius ≈ parent radius − parent padding** — can be computed instead of hand-stepped:

```css
/* opt-in utility emitted by the plugin: .concentric */
.concentric          { --r-outer: var(--r-card); --pad: 16px; }
.concentric > *      { border-radius: max(calc(var(--r-outer) - var(--pad)), 4px); }
```

Use the role steps by default; use `.concentric` only for unusual padding (a segmented control with `p-1` inside a card).

### Edge-attached surfaces

```html
<div class="rounded-t-sheet">  <!-- bottom sheet: top corners only -->
<div class="rounded-l-sheet">  <!-- right side panel: left corners only -->
```

`rounded-none` and `rounded-sm`-as-"almost-square" never appear on a container in any skin. `minimal` is the squarest skin and still uses 6px.

---

## 13. Elevation model

Five levels. Each is a combination of surface, edge and shadow. 🎨 **How** a level is expressed is skin-owned; the **ordering and the states** are not.

| Level | Role | `system` expression | Examples |
|---|---|---|---|
| 0 Ground | `mat-ground` | `canvas`, no edge, no shadow | Root background |
| 1 Structural | `mat-panel` / `mat-well` | `surface-1` + hairline | Sidebars, rails, inset wells, progress tracks |
| 2 Content | `mat-card` | `surface-2` + hairline + `shadow-sm` | Cards, list groups, table bodies |
| 3 Raised | `mat-raised` | `surface-3` + hairline + `shadow-sm` | Inputs, popovers, hovered rows |
| 4 Overlay | `mat-overlay` | `surface-4` + hairline + `shadow-lg` | Modals, sheets, menus, active segment thumbs |

Other skins express the same ladder differently: `glass` by blur and edge-light, `clay` by stacked inset shadows, `neumorph` by paired opposed shadows, `minimal` by hairline only, `depth` by real Z-space.

### Order of reach (system skin)

1. Surface step. 2. Hairline border. 3. Shadow — only when the element floats above scrolling content.

### Never skip levels

A card (2) inside a card (2) is wrong — the inner one is 3 or not a card.

### Interactive elevation (all skins)

| State | Change |
|---|---|
| Rest | Level 2 |
| Hover | One level up (`mat-control:hover` slot) |
| Active | Back down, `active:scale-[var(--press-scale)]` |
| Selected | Level 3 + accent edge or `border-l-2 border-accent` |
| Disabled | Level 2, `text-ink-4`, `cursor-not-allowed` |

Hover moves a surface step; it does **not** change hue, in every skin.

---

## 14. Materials

A **material** is a role's complete appearance: fill, edge, shadow, backdrop, sheen, depth (§34). §14 describes the `system` skin's chrome, scrims, dividers and grabbers.

### 14.1 Frosted chrome (`mat-chrome`)

```html
<header class="mat-chrome sticky top-0 z-sticky border-x-0 border-t-0">
```

`system` expands `mat-chrome` to `bg surface-3/72`, `backdrop-filter: blur(30px) saturate(1.5)`, `border-line/10`.

| Parameter | Value | Why |
|---|---|---|
| Blur | 30px | <20px reads as a bug; >40px reads as shower glass |
| Opacity | 72% | <60% text loses contrast; >85% blur invisible |
| Saturation | 150% | Essential in light mode |
| Edge | hairline on the content-facing side | Defines the boundary the blur cannot |

**Use for:** top bars, tab bars, sheet headers, floating toolbars, palettes, menus. **Not for** list rows or repeated elements (§28).

### 14.2 Scrims

| Purpose | Class |
|---|---|
| Modal backdrop | `bg-black/55 backdrop-blur-xs` |
| Sheet backdrop (phone) | `bg-black/50` |
| Popover (click-away) | `bg-transparent` |

Scrims are black in both themes and **in every skin** — a white scrim reads as a wash, not as "behind". A skin changing the scrim would be changing the meaning of modality, so scrims are not a material role.

### 14.3 Dividers · 14.4 Grabbers

| Class | Use |
|---|---|
| `divide-y divide-line/5` | Dense rows |
| `divide-y divide-line/10` | Lists, settings groups |
| `border-line/15` | Where a divider must be noticed |

Inset dividers: `<div class="pl-12"><div class="h-px bg-line/10"></div></div>`. Sheet grabber: `<div class="mx-auto h-1 w-10 rounded-full bg-line/20"></div>`.

Skins with `--stroke: 0px` (clay, neumorph) lose hairline dividers; they must supply an alternative separation (spacing or inset gap), and the validator checks list rows remain distinguishable (§41).

---

## 15. Typography

Typography is mostly skin-independent; a skin may set `--font-ui` and `--font-display-weight`.

| Role | Classes | Size | Use |
|---|---|---|---|
| Display | `text-3xl font-bold tracking-tight` | 30px | Screen title — **one per screen** |
| Title | `text-xl font-semibold tracking-tight` | 20px | Section / modal / sheet titles |
| Body | `text-base` | 16px | Default reading text |
| Body strong | `text-base font-medium` | 16px | Row labels with a value |
| Subtext | `text-sm text-ink-2` | 14px | Helper text |
| Micro | `text-xs text-ink-3 font-medium` | 12px | Timestamps, table headers, tab labels |

**System font stack:** `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI Variable', 'Segoe UI', Roboto, Inter, sans-serif`. The `system` skin loads **no webfont**. A skin that declares `--font-ui` must (a) ship the font with `font-display: swap`, (b) keep the system stack as fallback, (c) keep body ≥16px. Never 300 weight or lighter.

| Property | Rule |
|---|---|
| Weight | 400 body · 500 emphasis · 600 titles · 700 display |
| Tracking | `tracking-tight` on `text-xl` and up; never `tracking-wide` on body |
| Line length | `max-w-prose` (68ch) on paragraphs |
| Alignment | Left. Centre only a single line in an empty state or modal |

**Hierarchy comes from weight and tier, never colour.** No blue headings, no green "good" numbers.

**Numbers:** `font-mono tabular-nums` for anything in a column; right-align numeric columns.

**Truncation:** every unbounded text node needs a strategy, and the flex parent needs `min-w-0`:

```html
<div class="flex min-w-0 items-center gap-3">
  <p class="truncate text-sm font-medium">A very long device name</p>
  <span class="ml-auto shrink-0 text-xs text-ink-3">2 min ago</span>
</div>
```

---

## 16. Iconography

| Property | Value |
|---|---|
| Style | Outline, single stroke (skins may declare `--icon-stroke`, default 2) |
| Stroke | `2` at 24px, `1.75` at 20px |
| Corners | `round` caps and joins |
| Colour | `currentColor` always |
| Library | Lucide, Phosphor (regular) or Heroicons (outline). One, never mixed |

Filled icons only for the **active** tab-bar or rail item. Sizes: chip `h-3`, inline `h-4`, row/button `h-5`, tab bar/rail `h-6`, empty-state hero `h-8`.

**Icon tiles:** accent tile `bg-accent/12 text-accent`, neutral tile `mat-control`-lite (`border border-line/10 bg-surface-4 text-ink-2`), `rounded-chip` inside a `rounded-control` row inside a `rounded-card` group. Icons optically centre slightly high (`-mt-px` if needed); always `shrink-0` in a flex row.

---

## 17. Motion

🎨 Motion *personality* is skin-owned: `--ease`, `--ease-exit`, `--dur`, `--dur-slow`, `--press-scale`. The **rules** about what may move are invariants (I6).

`system` values: `duration 200ms`, `ease cubic-bezier(0.32, 0.72, 0, 1)` ("fast out, long settle"), `press .97`.

| Interaction | `system` | Class |
|---|---|---|
| Hover, focus, colour | 120ms | `transition-all duration-instant ease-skin` |
| Press | 100ms | `active:scale-[var(--press-scale)]` |
| Toggle, checkbox, segment | 200ms | `duration-skin ease-skin` |
| Row expand | 300ms | `duration-skin-slow ease-skin` |
| Modal open / close | 200 / 150ms | `ease-skin` / `ease-skin-exit` |
| Sheet open / close | 300 / 200ms | `ease-skin` / `ease-skin-exit` |
| Toast in | 200ms | `ease-skin` |

Dismissals are always faster than entrances and use `ease-skin-exit`.

```html
<!-- press -->     class="transition-all duration-skin ease-skin active:scale-[var(--press-scale)]"
<!-- hover lift --> class="transition-all duration-skin ease-skin hover:bg-surface-3 hover:shadow"
<!-- sheet -->     class="translate-y-full transition-transform duration-skin-slow ease-skin data-[open=true]:translate-y-0"
<!-- modal -->     class="scale-95 opacity-0 transition-all duration-skin ease-skin data-[open=true]:scale-100 data-[open=true]:opacity-100"
<!-- side panel --> class="translate-x-full transition-transform duration-skin-slow ease-skin data-[open=true]:translate-x-0"
<!-- expand row --> class="grid grid-rows-[0fr] transition-all duration-skin-slow ease-skin data-[open=true]:grid-rows-[1fr]"  <!-- child: overflow-hidden -->
```

**Skin guidance.** `clay` may use an overshoot curve (`cubic-bezier(.34,1.56,.64,1)`) and `press .94`; `minimal` uses `120ms` and `press 1`. **Overshoot is allowed only on scale/translate of the element the person touched**, never on layout properties and never on pane transitions.

### What never moves (all skins)

No animation on scroll; no staggered entrances; no decorative `animate-*` (skeleton and spinner excepted); no looping animation; no hover animation on non-interactive elements. 3D tilt (§40) is **pointer-driven only**, not time-driven.

### One orchestrated moment per flow

A success checkmark that draws once is memorable; the same energy on every card is noise.

### Reduced motion

The §8 block collapses durations to 1ms. Verify sheets still appear and disappear. Under reduced motion, `DepthStage` tilt and `SceneLayer` animation are off (§40).

---

# Part IV — Layout

> Part IV is skin-independent. A skin can change how a pane *looks*, never how many panes there are.

## 18. Responsive system — 320px to 3840px

Unprefixed utilities target the **320px** floor; prefixes layer upward. Three independent problems:

| Problem | Symptom | Lever |
|---|---|---|
| Too little **width** | Overflow, clipped labels | Width ladder §18.2 |
| Too little **height** | Phone landscape gets a tablet layout in 430px | Height guards §18.3 |
| Too much **space** | 200-char lines, 1300px dead canvas | Large-display strategy §18.5 |

### 18.1 The device contract

| Device | CSS viewport | Tier | Composition |
|---|---|---|---|
| iPhone SE 1st, budget Android | **320 × 568** | *(none)* | Single column, tab bar |
| 5″ Android | 360 × 640 | `xs` | Single column, tab bar |
| iPhone 13 mini | 375 × 812 | `xs` | Same |
| iPhone 15 / Pixel 8 | 393 × 852 | `xs` | Same |
| Pixel 8 Pro / S24 Ultra | 412 × 892 | `xs` | Same |
| iPhone 15 Pro Max | 430 × 932 | `xs` | Same |
| **Phone landscape** | **852×393, 932×430** | `md`+`short` | **Single column + left rail. Never split-pane** |
| 7″ tablet | 600 × 960 | `md`+`tall` | Single column, wider gutters |
| iPad mini | 744 × 1133 | `md`+`tall` | Two panes |
| iPad Split View ½ / ⅓ | 507 / 375 × 1024 | `sm` / none | Single column |
| iPad Air portrait / landscape | 820×1180 / 1180×820 | `md` / `lg` | Two panes / rail + two panes |
| iPad Pro portrait / landscape | 1024×1366 / 1366×1024 | `lg` | Rail + two panes |
| Laptop, common Windows | **1366 × 768** | `lg`+`tall` | Rail + two panes, **short height** |
| MacBook 13″ | 1280 × 800 | `lg` | Rail + two panes |
| MacBook Pro 16″ | 1728 × 1117 | `xl` | Rail + sidebar + main + inspector |
| 24″ desktop | 1920 × 1080 | `2xl` | Four regions, 3-col grid |
| 27″ QHD / ultrawide | 2560×1440 / 3440×1440 | `3xl` | 4–5 col grid, root +1px |
| **40″ 4K @100%** | **3840 × 2160** | `4xl` | Four regions + secondary, 6-col, root +2px |
| 40″ 4K @150% | 2560 × 1440 | `3xl` | Same as 27″ |

The two that break real builds: **932×430** (width says tablet, height says no) and **1366×768** (`lg` but only 768px tall).

### 18.2 The width ladder

| Tier | Min | What changes |
|---|---|---|
| *(none)* | **320** | Single column · `px-4` full-bleed · bottom tab bar · `min-h-11` · `p-4` · `text-base` |
| `xs:` | 360 | Same structure, slightly looser rhythm |
| `sm:` | 480 | Two-column card grids possible · `sm:px-5` |
| `md:` | 768 | **Split** (with `tall`) · `md:w-64` master · tab bar → sidebar |
| `lg:` | 1024 | Rail `lg:w-[72px]` + sidebar `lg:w-72` + main |
| `xl:` | 1440 | **Third pane** — inspector `xl:w-80` |
| `2xl:` | 1920 | Grid to 3 columns · tables reveal secondary columns |
| `3xl:` | 2560 | 4–5 columns · optional root +1px |
| `4xl:` | 3200 | **Fourth region** · 6 columns · optional root +2px |

Thresholds sit where a **composition** changes: 768 = a second pane fits; 1024 = a rail fits beside it; 1440 = a third pane; 1920 = the main pane can subdivide.

### 18.3 Height and pointer guards

`tall` (min-height 560), `short` (max-height 559), `touch` (pointer coarse), `fine` (pointer fine) — stackable: `md:tall:flex-row`.

**Split-pane rule — never split on width alone:**

```html
<div class="flex flex-col md:tall:flex-row">   <!-- right -->
```

**Short-viewport rule.** Below 560px height, collapse vertical chrome rather than compressing content:

```html
<nav class="mat-chrome fixed inset-x-0 bottom-0 flex flex-row justify-around
            short:inset-x-auto short:inset-y-0 short:left-0 short:w-16 short:flex-col
            md:tall:hidden">
```

At `short:` also drop the display heading to `text-xl`, section spacing `mt-8 → mt-4`, hide the top-bar subtitle (≈90px recovered).

**Pointer rule.** A 1366×768 touch laptop is `lg:` **and** `touch:`:

```html
<div class="opacity-0 group-hover:opacity-100 touch:opacity-100 transition-opacity duration-skin ease-skin">
```

### 18.4 The recomposition ladder

```
320–767             768–1023             1024–1439
┌─────────────┐    ┌───────┬───────┐    ┌──┬──────┬─────────┐
│  top bar    │    │master │detail │    │ra│ side │  main   │
├─────────────┤    │ 256   │       │    │il│ 288  │         │
│  content    │    └───────┴───────┘    │72│      │         │
├─────────────┤                         └──┴──────┴─────────┘
│  tab bar    │
└─────────────┘
1440–1919: + inspector 320       1920–2559: main subdivides into columns, inspector 380
3200+:     + fourth region 340 (activity), main grid 6 columns
```

Chrome widths are **fixed at every size above 1024**; only the main pane is fluid, and it absorbs extra width by **subdividing**, never stretching.

```html
<div class="flex flex-col md:tall:flex-row md:tall:h-dvh md:tall:overflow-hidden">
  <aside class="hidden lg:flex lg:w-[72px] lg:shrink-0 lg:flex-col mat-panel border-y-0 border-l-0">…</aside>
  <aside class="hidden md:tall:flex md:w-64 lg:w-72 md:shrink-0 md:flex-col mat-panel border-y-0 border-l-0">…</aside>
  <main class="min-w-0 flex-1 overflow-y-auto">
    <div class="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-6 gap-4 p-4 lg:p-6">…</div>
  </main>
  <aside class="hidden xl:block xl:w-80 2xl:w-[380px] xl:shrink-0 mat-panel border-y-0 border-r-0">…</aside>
  <aside class="hidden 4xl:block 4xl:w-[340px] 4xl:shrink-0 mat-panel border-y-0 border-r-0">…</aside>
</div>
```

`min-w-0` on the fluid child is mandatory — the most common large-screen bug is the shell scrolling sideways.

### 18.5 Large displays: 24″, 32″, 40″

| Problem | Cause | Wrong fix | Right fix |
|---|---|---|---|
| **More space** | Wider viewport | Stretch content | Add panes and grid columns |
| **More distance** | 40″ viewed from ~85cm | `3xl:text-*` everywhere | One root font-size step |

**Space.** The forbidden option is `max-w-[1200px] mx-auto` on 3840px: that is the "boxed webpage on a wallpaper" anti-pattern. The shell fills; content subdivides:

| Content | 1440 | 1920 | 2560 | 3840 |
|---|---|---|---|---|
| Card grid | 2 | 3 | 4 | 6 |
| Stat row | 3 | 4 | 6 | 8 |
| Table columns | 5 | 7 | 9 | all |
| Panes | 3 | 3 | 3 | 4 |
| Prose column | 68ch | 68ch | 68ch | 68ch |

Tables gain columns, not width:

```html
<th class="hidden 2xl:table-cell …">Last sync</th>
<th class="hidden 3xl:table-cell …">OS version</th>
<th class="hidden 4xl:table-cell …">IP address</th>
```

Prose stays at `max-w-prose`, paired with a contents pane and a related pane so no region is dead.

**Distance.** Opt-in, in CSS, max 18px:

```css
@media (min-width: 2560px) { :root { font-size: 17px; } }
@media (min-width: 3200px) { :root { font-size: 18px; } }
```

Don't combine with scattered `3xl:text-lg`. **Ultrawide (3440×1440):** add horizontal regions and columns; add nothing vertical.

### 18.6 The 320px floor

| Breaks | Fix |
|---|---|
| Icon tile + two-line label + value + chevron | `min-w-0` + `truncate` on the label, `shrink-0` elsewhere |
| `px-4` gutters + 44px targets | Icon buttons use `-m-2` |
| Five tab items | Four max below `xs:`; fifth into "More" |
| Modal `p-6` | `p-4` below `sm:` |
| Wide numbers | `font-mono tabular-nums text-xs` below `xs:` |
| Two buttons side by side | `flex-col sm:flex-row` |
| Three-label segmented control | Shorten, or `select` below `xs:` |

Verify with the longest realistic content, not "Device 1".

### 18.7 Rules at every size

- Build 320 first, then 1920, then interpolate.
- Never hide functionality to fit; relocate it. Only reveal *extra* columns and panes as space grows.
- Chrome fixed-width above 1024; only main is fluid.
- No horizontal page scroll; wide content scrolls in its own `overflow-x-auto`.
- Full-bleed on phone.
- Safe areas: `pb-[max(0.5rem,env(safe-area-inset-bottom))]`, `pt-[env(safe-area-inset-top)]`, `viewport-fit=cover`.
- `h-dvh`, never `h-screen`.
- Test both orientations on every phone and tablet.

### 18.8 Container queries

A card in both a 2000px region and a 340px inspector needs container queries, not viewport prefixes (`@tailwindcss/container-queries`, or built into v4):

```html
<div class="@container"><div class="flex flex-col @md:flex-row">…</div></div>
```

### 18.9 Testing matrix

```
PHONE   320×568 360×640 375×812 393×852 412×892 430×932
PHONE LANDSCAPE   667×375 812×375 852×393 932×430
TABLET  600×960 744×1133 820×1180 1024×1366     LANDSCAPE 1133×744 1180×820 1366×1024
SPLIT VIEW  375×1024 507×1024 678×1024
LAPTOP  1280×800 1366×768 1512×982 1728×1117
DESKTOP 1920×1080 2560×1440     ULTRAWIDE 3440×1440     40" 4K 3840×2160
```

Add 320×568, 932×430, 1366×768, 3840×2160 as custom DevTools devices. **v3: run the matrix for every skin** — at minimum the four custom devices × every registered skin × both themes (§41 gate 5).

---

## 19. Navigation patterns

| Device class | Primary nav | Secondary |
|---|---|---|
| Phone portrait | Fixed bottom tab bar, 3–4 items at 320, ≤5 from `xs:` | Sheet or segmented control |
| Phone landscape (`short:`) | **Left rail 64px** | Sheet |
| Tablet (`md:tall:`) | Sidebar `md:w-64` | Master list |
| Laptop / desktop (`lg:`) | Rail 72 + sidebar 288 | Inspector or header tabs |
| 24″+ | Same rail + sidebar — **never wider** | Inspector + contents pane |
| 40″ | Same | Inspector + fourth region |

### 19.2 Bottom tab bar

```html
<nav class="mat-chrome fixed inset-x-0 bottom-0 z-chrome flex items-center justify-around border-x-0 border-b-0 px-2 py-2
            pb-[max(0.5rem,env(safe-area-inset-bottom))]
            short:inset-x-auto short:inset-y-0 short:left-0 short:w-16 short:flex-col short:border-y-0 short:border-l-0 short:py-4
            md:tall:hidden">
  <a class="flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded-control text-accent">
    <svg class="h-5 w-5">…</svg><span class="text-[10px] font-medium">Home</span>
  </a>
</nav>
```

3–5 items; labels always visible; active = accent + filled icon (no pill); replaced by the sidebar at `md:tall:`.

### 19.3 Icon rail

Active item `bg-surface-3 text-ink` — **not accent** (the rail is chrome; accent is for actions). Every item has `aria-label`/tooltip.

### 19.4 Master–detail

On phone the detail is a pushed route with a back chevron; from `md:` both are visible. Selected state is a surface step, not an accent fill. Master: `md:w-80 md:shrink-0 md:overflow-y-auto mat-panel`; rows `divide-y divide-line/5`.

### 19.5 Back and titles

Phone: back chevron top-left, never moves. Desktop: no back button; a detail pane closes, it doesn't navigate back. No breadcrumbs.

---

## 20. Page archetypes

**20.1 Settings screen** — sticky `mat-chrome` header with back chevron; display title + subtext; a `mat-card` meter group; a grouped list (`mat-card` + `divide-y divide-line/10`); one accent action; tab bar.

**20.2 Dashboard** — three stat cards, one primary chart, one dense table. Value `text-3xl font-bold`, label `text-xs text-ink-3`; the size difference should be dramatic.

**20.3 List + detail** — §19.4.

**20.4 Form / wizard** — one column `max-w-prose` even on desktop; labels above inputs (never floating); sections as `mat-card` with `text-xl font-semibold` headers; primary action bottom-right on desktop, full-width fixed bottom on phone; errors inline `text-sm text-danger` + `border-danger/50`.

**20.5 Empty screen** — centred, `max-w-[40ch]`: 32px `text-ink-3` icon, `text-xl` line saying what is missing, `text-sm text-ink-2` why, one accent button. No illustration, no apology.

---

# Part V — Components

Every recipe is **skin-blind and theme-blind**: no `dark:`, no skin selectors, no literal `rounded-[…]` or `shadow-[…]`. Looks come from `mat-*` roles, `rounded-{chip|control|card|sheet}`, and `ease-skin`. In the `system` skin each recipe renders identically to v2.0.

> **Implemented code lives in `packages/ui` (`@ecomerece/ui`).** Appendix E maps every recipe to its component, API and status.

### Role map

| Component | Role | Radius | Notes |
|---|---|---|---|
| Page background | `mat-ground` | — | Paints `--scene` |
| Sidebar, rail, inspector | `mat-panel` | — | |
| Card, grouped list, table shell | `mat-card` | `rounded-card` | |
| Input, popover, hovered row | `mat-raised` | `rounded-control` | |
| Modal, sheet, menu, toast, segment thumb | `mat-overlay` | `rounded-sheet` / `rounded-card` | |
| Top bar, tab bar | `mat-chrome` | — | Blur lives here |
| Progress/slider track, segmented track | `mat-well` | `rounded-full` | Inset in every skin |
| Secondary / ghost button, icon button | `mat-control` | `rounded-control` | Has hover/press slots |
| Primary button, active checkbox | `mat-primary` | `rounded-control` | `accent` fill, `text-accent-ink` |

## 21. Component library

### 21.1 Buttons

```html
<!-- Primary — one per screen -->
<button class="mat-primary rounded-control inline-flex min-h-11 items-center justify-center gap-2 px-4
               text-sm font-semibold text-accent-ink
               transition-all duration-skin ease-skin active:scale-[var(--press-scale)]
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
               focus-visible:ring-offset-2 focus-visible:ring-offset-canvas
               disabled:pointer-events-none disabled:opacity-100 disabled:bg-surface-3 disabled:text-ink-4 disabled:shadow-none">
  Save changes
</button>

<!-- Secondary -->
<button class="mat-control rounded-control inline-flex min-h-11 items-center justify-center gap-2 px-4
               text-sm font-medium transition-all duration-skin ease-skin active:scale-[var(--press-scale)] …focus ring…">
  Cancel
</button>

<!-- Ghost (no material; hover lifts one surface step) -->
<button class="rounded-control inline-flex min-h-11 items-center gap-2 px-4 text-sm font-medium text-ink-2
               transition-all duration-skin ease-skin hover:bg-surface-3 hover:text-ink active:scale-[var(--press-scale)]">
  Learn more
</button>

<!-- Destructive (text-only in context) -->
<button class="rounded-control inline-flex min-h-11 items-center gap-2 px-4 text-sm font-semibold text-danger
               transition-all duration-skin ease-skin hover:bg-danger/10 active:scale-[var(--press-scale)]">Delete</button>

<!-- Icon button -->
<button aria-label="More options"
        class="mat-control rounded-control flex h-11 w-11 items-center justify-center text-ink-2
               transition-all duration-skin ease-skin active:scale-[var(--press-scale)]">…</button>
```

Sizes: `min-h-11 px-4 text-sm` default · `min-h-9 px-3` compact · `min-h-12 px-5 text-base` prominent. A red *fill* is reserved for the confirmed action inside a confirmation dialog.

### 21.2 Segmented control

Track `mat-well rounded-full p-1`; thumb `mat-overlay rounded-full`. Track and thumb differ by **two levels** in every skin — that is what makes it look physical. `role="tablist"`, `aria-selected`.

### 21.3 Switch

Track 48×28, `rounded-full`; on = `bg-accent border-accent`, off = `mat-well`. Thumb is `bg-white shadow-sm` **in every theme and skin** — a physical object, not a themed surface.

### 21.4 Checkbox and radio

Checkbox `rounded-chip`, radio `rounded-full` — the shape distinction signals exclusivity and **holds in every skin**. Checked checkbox `bg-accent text-accent-ink`; unchecked `mat-raised` with `border-line/20`; radio selected `border-2 border-accent` with an `h-2.5 w-2.5 bg-accent` dot.

### 21.5 Inputs

```html
<label class="block">
  <span class="mb-1.5 block text-sm font-medium">Device name</span>
  <div class="mat-raised rounded-control flex items-center gap-2 px-3 py-2.5
              transition-all duration-skin ease-skin
              focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/25">
    <input class="w-full bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none" placeholder="Studio desktop">
  </div>
  <span class="mt-1.5 block text-xs text-ink-3">Shown on every synced device.</span>
</label>
```

Error: `border-danger/50 ring-2 ring-danger/20` + `text-xs text-danger` below. The ring lives on the **wrapper**. Placeholders `text-ink-3`. No floating labels. Inputs ≥16px on iOS.

### 21.6 Grouped list rows

```html
<div class="mat-card rounded-card divide-y divide-line/10 overflow-hidden">
  <div class="flex min-h-11 items-center gap-3 px-4 py-3">
    <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-chip bg-accent/12 text-accent"><svg class="h-4 w-4">…</svg></div>
    <div class="min-w-0"><p class="truncate text-sm font-medium">Wi-Fi sync</p><p class="truncate text-xs text-ink-3">Upload only on Wi-Fi</p></div>
    <span class="ml-auto shrink-0 text-xs text-ink-3">On</span>
  </div>
</div>
```

`overflow-hidden` clips first/last rows to the container radius; `divide-y` on the group, never `border-b` per row. In skins with `--stroke: 0` and no hairline, `divide-line/10` still renders (it is a utility, not a material) — it is the one hairline every skin keeps.

### 21.7 Cards

`mat-card rounded-card p-4` with an optional header (title `text-sm font-medium`, subtitle `text-xs text-ink-3`, icon button `-m-2 h-11 w-11`). Not every group of content is a card; a screen of identical cards is the templated look.

### 21.8 Dropdown / menu

`mat-overlay rounded-card p-1 min-w-[220px]`, items `rounded-control px-3 py-2.5 hover:bg-surface-3`, divider `my-1 h-px bg-line/10`, destructive row `text-danger hover:bg-danger/10`. `p-1` on the container creates the concentric relationship.

### 21.9 Modal (desktop)

```html
<div class="fixed inset-0 z-modal flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs
            opacity-0 pointer-events-none transition-opacity duration-skin ease-skin
            data-[open=true]:opacity-100 data-[open=true]:pointer-events-auto">
  <div role="dialog" aria-modal="true" aria-labelledby="dlg-title"
       class="mat-overlay rounded-sheet w-full max-w-md scale-95 p-4 sm:p-6
              transition-transform duration-skin ease-skin data-[open=true]:scale-100">
    <h2 id="dlg-title" class="text-xl font-semibold tracking-tight">Add a device</h2>
    …
  </div>
</div>
```

Escape and backdrop close; focus traps and returns to trigger.

### 21.10 Bottom sheet (phone)

`fixed inset-x-0 bottom-0 z-modal mat-overlay rounded-t-sheet p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] translate-y-full transition-transform duration-skin-slow ease-skin data-[open=true]:translate-y-0`, with a grabber. **Never stretch across a desktop viewport** — from `md:tall:` it becomes a centred modal or side panel.

### 21.11 Side panel

`fixed inset-y-0 right-0 z-modal w-full max-w-md mat-overlay rounded-l-sheet translate-x-full … data-[open=true]:translate-x-0`. Write both state classes **statically** (Appendix E.6 #8).

### 21.12 Toast

`mat-overlay rounded-card flex items-center gap-3 px-4 py-3`, status dot + text + optional action. Bottom-centred above the tab bar on phone, bottom-right on desktop. 4s, 8s with Undo; max 3 stacked; `aria-live="polite"`.

### 21.13 Badge, chip, tag

Neutral count badge: `rounded-chip border border-line/10 bg-surface-4 px-2 py-0.5 font-mono text-xs text-ink-2`. Tinted: `rounded-chip bg-accent/12 px-2.5 py-1 text-xs font-medium text-accent`. Status pill: `rounded-full bg-surface-3 px-3 py-1` with a `h-1.5 w-1.5` dot. (Shipped components use pills for all three; with role radii that is the `--r-chip` of the `soft` skin.)

### 21.14 Progress and meters

Track `mat-well rounded-full h-1.5`; fill `rounded-full bg-accent transition-all duration-skin-slow ease-skin` with runtime `style="width:78%"`. The track is **inset** (one level below the card holding it) — in every skin. Segmented meter: flat tonal segments in one pill.

### 21.15 Skeleton

`animate-pulse` blocks in `bg-line/8` (or the skin's `well` fill), mirroring the real layout's shape. The one sanctioned looping animation.

### 21.16 Table

```html
<div class="mat-card rounded-card overflow-hidden">
  <div class="max-h-[420px] overflow-auto">
    <table class="w-full min-w-[640px] text-left">
      <thead class="sticky top-0 z-raised bg-surface-2"><tr class="border-b border-line/10">
        <th class="px-3 py-2 text-xs font-medium text-ink-3">Device</th>
        <th class="px-3 py-2 text-right text-xs font-medium text-ink-3">Used</th>
      </tr></thead>
      <tbody class="divide-y divide-line/5">
        <tr class="transition-colors duration-150 hover:bg-surface-3">
          <td class="px-3 py-2 text-sm">MacBook Pro</td>
          <td class="px-3 py-2 text-right font-mono tabular-nums text-sm text-ink-2">84.2 GB</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

`min-w` + `overflow-auto` keeps the page from scrolling sideways. Sticky header needs an **opaque** `bg-surface-2` — in translucent skins (glass) the sticky header must stay opaque or rows show through; the validator checks this. No zebra striping by default — it is opt-in via `striped` (batch 80).

### 21.17 Tabs vs segmented control

Tabs switch **views**; a segmented control filters or scopes **one** view. `system` tabs are the underline form (`after:` accent bar); the shipped `Tabs` is the filled-pill form, which is a skin-level variation (Appendix E.6 #7).

### 21.18 Avatar

`rounded-full border border-line/10 object-cover`; initials fallback on `bg-surface-4 text-ink-2`. Never colour-code fallbacks by name hash. Optional `status` adds a corner presence dot (`online`→`bg-success`, `away`→`bg-warning`, `busy`→`bg-danger`, `offline`→`bg-ink-3`) ringed with `ring-2 ring-surface-1` and appended to the accessible name; optional `badge` is a small overlay at the top-right. Presence is never the only signal — the status is named in the label. (`getInitials(name)` is exported.)

### 21.19 Layout primitives — the bare tags

Shipped in `packages/ui/components/surface/Primitives.tsx`: application **bare tags** that name only a ROLE and token utilities, so app-specific widgets restyle with the active skin with zero markup changes. Use these to invent application-local widgets; never hard-code a colour, radius or shadow "just this once".

| Primitive | Purpose | Key props |
|---|---|---|
| `Div` / `Box` | Plain flow `div` — you control everything | any `className` |
| `Container` | Centers content at an accepted width | `width: prose (68ch) · shell (1200px)`, `bleed` (no padding) |
| `Stack` | Vertical flex — the default rhythm primitive | `gap: 0–8` (default 3), `align` |
| `HStack` | Wrapping horizontal flex | `gap`, `align`, `wrap` (default true) |
| `Grid` | Equal-column responsive grid, 1 col on phones | `cols: 1–4` (≥sm: 2/3/4) |
| `Surface` | Box painted by an engine MATERIAL | `material: card (default) · well · raised · panel · chrome · ground · overlay · control · primary`, `radius: chip · control · card (default) · sheet` |
| `Well` / `Raised` / `Panel` / `Chrome` / `Ground` | One-line shortcuts for `Surface` | same as `Surface` |
| `Text` | Paragraph or inline span from theme tokens | `tone: ink · ink-2 · ink-3 · ink-4`, `size: xs–xl`, `as: p · span` |
| `Heading` | Themed heading | `level: 1–6` (renders `hN`), `tone` |

Rules:

- `Stack`/`HStack` gaps map to Tailwind's `gap-*` scale — do not pass arbitrary values; compose nested stacks instead.
- `Surface.material` names the same vocabulary as §14/§34. `control` and `primary` are reserved for interactive/CTA surfaces inside primitives.
- Composition beats configuration: a stat card is `Surface` (+ `Raised`/`Well` variant) + `Stack` + `Text` — no new component required for one screen.
- The reference composition lives on the design QA page (`/design` → "Layout primitives — build your own").

---

## 22. Density and enterprise views

Density changes **padding only** (§11). Colours, radii, borders, shadows and materials are identical across densities **and skins' roles stay the same** — a dense table in `glass` uses the same `mat-card` as a settings screen in `glass`.

| | Consumer | Dense |
|---|---|---|
| Row | `py-4 px-5` | `py-2 px-3` |
| Card | `p-5` | `p-4` |
| Gap | `gap-4` | `gap-3` |
| Body | `text-base` | `text-sm` |
| Metadata | `text-sm` | `text-xs` |

**Status:** a dot (`h-2 w-2 rounded-full bg-success`), a `border-l-2` rule, or coloured text — never a full-bleed coloured banner. **Enterprise:** checkbox column + `mat-overlay` bulk-action bar at the bottom on selection; sort chevrons `h-3 w-3` (`text-ink-3` inactive, `text-ink` active); removable filter chips above the table (filter sheet on phone); pagination bottom-right with `min-h-11` buttons; row actions on `group-hover` at `md:` with `touch:opacity-100`.

**Skin guidance for dense views.** Dense data screens should default to a low-fidelity-friendly skin (`system` or `minimal`). `glass`, `clay` and `neumorph` are permitted in dense views but the perf cap (§41, ≤4 blurred layers) and the opaque-sticky-header rule still apply.

---

## 23. Data visualisation

Charts are the hardest place for skins, so charts use **ink and accent opacity steps** in every skin; the skin controls only the *container* (`mat-card`).

| Series | Fill |
|---|---|
| Primary | `bg-accent` |
| Secondary | `bg-accent/55` |
| Tertiary | `bg-accent/30` |
| Baseline | `bg-line/10` |

Categorical data: semantic tokens only (`success`, `warning`, `danger`, `accent`) — four categories is usually the right maximum.

| Element | Treatment |
|---|---|
| Grid | `stroke-line/8`, horizontal only |
| Axis labels | `text-xs text-ink-3` |
| Axis lines | None |
| Tooltip | `mat-overlay rounded-control px-3 py-2` |
| Highlight | Full `accent`, rest `/30` |
| Area under line | `fill-accent/12` — **flat in every skin**, even in `glass` |
| Bar caps | `rounded-chip` |

Gradients inside chart marks are not allowed even in skins that use gradients elsewhere; marks must stay legible at the validator's contrast thresholds and survive `fidelity=low`.

**Reference implementations as-built.** The design QA page (`/design`) ships two demo charts that follow exactly these rules:

- `BarChart` — tone-mapped bars (`bg-accent | bg-success | bg-warning | bg-danger | bg-ink-3`), `rounded-t-sm` caps like `rounded-chip`, `text-[10px] text-ink-3` axis labels, height = value/peak ratio; wrapped in `mat-card` (§23 container rule).
- `LineChart` — multi-series SVG polyline using `stroke-accent`/`stroke-success`, `vector-effect="non-scaling-stroke"` so strokes stay hairline in every viewport, `preserveAspectRatio="none"` for fluid width, week labels `text-[10px] text-ink-3`.

These are page-local demos (not yet kit exports); promote them to `packages/ui/components/data` following the same contract when a second consumer needs them.

---

## 24. Feedback states

| Situation | Pattern |
|---|---|
| Success, no decision | Toast 4s |
| Success, reversible | Toast + Undo 8s |
| Persistent condition | Inline banner |
| Field problem | Inline text under the field |
| Destructive confirm | Modal (desktop) / sheet (phone) |
| Nothing yet | Empty state |
| Loading known shape | Skeleton |
| Loading unknown shape | Spinner after 300ms |

**Banner.** Spec form: neutral `mat-card rounded-card border-l-2 border-{tone} p-4` with a tone dot. The shipped component uses a tinted `bg-{tone}/10` panel. Both are legitimate; **choose per skin** (`system`: rule form; `soft`: tinted form). Three tinted panels on a screen is unreadable in any skin.

**Empty state:** 32px icon, `text-xl font-semibold` line, `text-sm text-ink-2` reason (`max-w-[40ch]`), one accent button. **Error state:** a `h-2 w-2 bg-danger` dot, what happened, what to do, "Try again". Errors never apologise and are never vague.

---

# Part VI — Quality

## 25. Content and copywriting

| Rule | Bad | Good |
|---|---|---|
| Name the action | "Submit" | "Save changes" |
| Keep the name through the flow | "Publish" → "Successfully submitted" | "Publish" → "Published" |
| Sentence case | "Delete This Device" | "Delete this device" |
| Active voice | "The file was not uploaded" | "The upload failed" |
| User's vocabulary | "Configure webhook endpoints" | "Choose where to send alerts" |
| No filler | "Please note that you can optionally…" | "You can…" |
| Specific errors | "Something went wrong" | "The name is already in use" |
| Empty states invite | "No data available" | "No devices yet — add one to start syncing" |

Never ALL CAPS labels. Numerals in data, words one–nine in prose, numerals with units ("4 GB"). **Skin names in the picker are nouns** ("Glass", "Clay"), never marketing ("Ultra Crystal").

---

## 26. Accessibility

Floor, not stretch. Every item verified **in both themes and in every skin**.

### 26.1 Contrast

| Content | Min | Where it usually fails |
|---|---|---|
| Body text | 4.5:1 | `ink-3` on light; **text over translucent glass** |
| Large text (≥18.66px bold / ≥24px) | 3:1 | — |
| UI boundaries, icons | 3:1 | Hairlines at `/5`; **neumorph and clay edges** |
| Focus indicators | 3:1 vs adjacent | Accent ring on accent button |
| Disabled | exempt | — |

**Skin-specific traps**

- **Glass:** contrast must hold on the *worst-case composite* (the material over the brightest and darkest regions of `--scene`). Compute at both extremes.
- **Neumorph:** soft shadows alone fail 1.4.11 (non-text contrast). Declare tier `AA-with-fallback`; force a visible edge under `prefers-contrast: more` and when `fidelity=low` (§37).
- **Clay:** zero stroke is fine **if** the fill-to-background luminance gap yields ≥3:1; otherwise add a skin edge.
- **Minimal:** with no shadows, the 1px edge must itself reach 3:1 on controls (a `line/10` hairline will not — use `line/45`, about 3.1:1 in light, for controls; the validator confirms).

### 26.2 Focus

```html
class="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
       focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
```

`focus-visible`, not `focus`. Ring offset must match the actual background (`ring-offset-surface-2` on a card). In scene skins, the offset colour is `canvas` and the ring must still reach 3:1 against the **scene** at that location — if not, the skin declares `--focus-ring-boost` (a 2px canvas-colour inner ring).

### 26.3 Targets and gestures

44×44 minimum; any swipe has a visible equivalent; no hover-only function. In `3d`, hit-targets stay within ±24px Z of the parent plane.

### 26.4 Semantics

Real `<button>`/`<a href>`; `aria-label` on icon-only controls; `role="switch|dialog|tablist|status"`; modals trap focus, close on Escape, restore focus; status never colour alone; `aria-live="polite"` toasts; decorative scene/canvas layers are `aria-hidden="true"` and `pointer-events: none`.

### 26.5 Motion, transparency, zoom

- `prefers-reduced-motion` honoured; interface fully usable.
- `prefers-reduced-transparency: reduce` → solid fallback for every skin (§37).
- `prefers-contrast: more` → stronger edges, no translucency (§37).
- 200% zoom reflows; no `user-scalable=no`.

---

## 27. Platform notes

### 27.1 Android webview

`theme-color` per scheme and updated on manual change (§9.4). `overscroll-behavior-y: contain` in sheets. `-webkit-tap-highlight-color: transparent`. `backdrop-filter` safe from Chrome 76, **but low-end devices drop frames**: `fidelity=auto` resolves to `low` when `deviceMemory ≤ 2` or `hardwareConcurrency ≤ 4` (§38). `100dvh`. Foldables report 344×882 folded and 674×841 unfolded — unfolded is `md:` by width but near-square, so guard splits with `tall:` and verify the fold transition doesn't remount (and doesn't reset the skin).

### 27.2 iOS Safari / WKWebView

Safe areas + `viewport-fit=cover`. Inputs ≥16px. `position: fixed` inside scrolling containers is unreliable. `body` background shows on rubber-band, so `background-color: rgb(var(--canvas))` must stay solid even when a skin paints a scene. iPad Split View/Stage Manager hand arbitrary widths with no reload — use CSS or container queries, never a width measured once. Phone landscape (393–430 tall) is the most commonly broken viewport. **WebKit caveat for 3D:** `backdrop-filter` inside a `preserve-3d` subtree is unreliable; the `depth` skin disables it (§40). `DeviceOrientationEvent.requestPermission()` is required on iOS for gyro tilt and must be triggered by a user gesture.

### 27.3 PWA / installed

```json
{ "display": "standalone", "background_color": "#0B0F17", "theme_color": "#0B0F17" }
```

Splash matches the dark canvas. Skins never change the manifest colours.

### 27.4 Windows / desktop browsers

`Segoe UI Variable` on 11, `Segoe UI` on 10. Custom scrollbars matter (§8). Hover is real; §13 applies. Large GPUs make `glass` cheap on desktop, but `fidelity=auto` still caps blur layers.

---

## 28. Performance

### 28.1 `backdrop-filter` is expensive

Each blurred element forces a compositor layer and a per-frame blur of everything behind it. **Hard cap: 4 visible blurred elements at 1920×1080, 2 at ≤430px wide.** `system` uses 1–2 (top bar, tab bar). `glass` spends its budget on chrome + overlay + at most two cards; remaining cards use the opaque fallback fill via a role downgrade (`card → raised-opaque`). Never on list items, table rows, or elements inside a scroll container that also blurs.

### 28.2 Transitions

Name properties on long lists (`transition-[background-color,transform]`). Animate `transform` and `opacity` only; never `width/height/top/margin`. The `grid-rows` expand trick triggers layout; fine for one row, not fifty. **Multi-layer `box-shadow` (clay, neumorph) repaints on hover:** keep `transition` on `box-shadow` only for the pressed element, not for entire lists.

### 28.3 Skin cost classes

| Cost | Skins | Notes |
|---|---|---|
| Low | `system`, `minimal`, `soft` | Opaque, ≤1 shadow layer |
| Medium | `clay`, `neumorph` | 3–4 shadow layers per control |
| High | `glass`, `depth` | Blur / preserve-3d; capped and degraded by `fidelity` |

### 28.4 Long lists

Virtualise above ~200 rows; keep row markup shallow (three elements deep).

### 28.5 Tailwind build

`content` globs must cover every file with class names; never build class names dynamically (`` `bg-${color}` ``). **Skin CSS is generated at build time and never depends on the scanner**, which is why skin variables are safe from purge — but component classes (`data-[open=true]:…`) still must be static strings. Production CSS: ~12–18 KB gzipped core + 2–4 KB per loaded skin.

---

## 29. Implementation guide

### 29.1 File structure

```
src/
  styles/tokens.css           ← theme layer (§8)
skins/                         ← authored skins (§36)
  system.ts  soft.ts  minimal.ts  glass.ts  clay.ts  neumorph.ts  depth.ts  index.ts
scripts/build-skins.ts         ← compiler (§37) → public/skins/*.css
components/ui/…                ← skin-blind components
hooks/useTheme.ts  hooks/useSkin.ts
tailwind.config.js             ← §7
```

Raw CSS: `tokens.css` plus generated skin files. If a hand-written CSS file appears, the system is leaking.

### 29.2 Variants without a dependency

```jsx
const styles = {
  base: 'inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-4 text-sm ' +
        'transition-all duration-skin ease-skin active:scale-[var(--press-scale)] ' +
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ' +
        'focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
  primary:   'mat-primary font-semibold text-accent-ink',
  secondary: 'mat-control font-medium',
  ghost:     'font-medium text-ink-2 hover:bg-surface-3 hover:text-ink',
  danger:    'font-semibold text-danger hover:bg-danger/10',
};
export function Button({ variant = 'secondary', className = '', ...props }) {
  return <button className={`${styles.base} ${styles[variant]} ${className}`} {...props} />;
}
```

### 29.3 Next.js — no flash

```jsx
<html lang="en" suppressHydrationWarning>
  <head><script dangerouslySetInnerHTML={{ __html: BOOTSTRAP_SCRIPT /* §38.2 */ }} /></head>
  <body className="bg-canvas font-sans text-ink antialiased">{children}</body>
</html>
```

`suppressHydrationWarning` is required because the script mutates `<html>` before hydration.

### 29.4 Tailwind v4

```css
@import "tailwindcss";
@theme {
  --color-canvas: rgb(var(--canvas));
  --radius-chip: var(--r-chip);  --radius-control: var(--r-control);
  --radius-card: var(--r-card);  --radius-sheet: var(--r-sheet);
  --breakpoint-xs: 360px;
  --ease-skin: var(--ease);
}
```

The `mat-*` classes become a `@utility mat-card { … }` block per role (or keep the v3 plugin via `@plugin`). Token variables stay identical.

---

## 30. QA checklist

**Layout — device contract (§18.1)** — *run for every skin*
- [ ] 320×568 with longest realistic content; no clipping, no horizontal scroll
- [ ] 430×932 comfortable
- [ ] **932×430** no split-pane; tab bar became a rail
- [ ] 820×1180 and 1180×820 compose correctly
- [ ] 375×1024 and 507×1024 get phone / small-tablet layouts
- [ ] **1366×768** three-pane shell fits 768px height
- [ ] 1920×1080 shell fills, 3-column grid
- [ ] 2560×1440 and 3440×1440 4–5 columns, no dead canvas
- [ ] **3840×2160** four regions, no stranded 1200px column
- [ ] No body line > ~75 chars
- [ ] Chrome same pixel width at 1440 and 3840
- [ ] No full-width bottom sheet on desktop; safe-area insets; `h-dvh` not `h-screen`

**Theme and skin**
- [ ] No flash of wrong theme **or skin** on first paint
- [ ] Every screen in light and dark × every shipped skin, including modals, sheets, toasts, empty and error states
- [ ] Zero `dark:` and zero skin selectors in component markup
- [ ] `color-scheme` set; `theme-color` updates; Auto is the default theme
- [ ] Skin switch is instant (no tween) and preserves scroll position and open overlays
- [ ] Per-subtree `data-skin` renders correctly inside another skin

**Visual**
- [ ] No gradients in component markup (gradients only inside `skins/`)
- [ ] `system`: no `bg-black`, no white canvas
- [ ] Nested radii step down (roles), no same-role nesting
- [ ] One accent, one primary action per screen
- [ ] Every container has a radius role; no `rounded-[…]` in components

**Fallbacks**
- [ ] `fidelity=low`, `prefers-reduced-transparency`, `prefers-contrast: more`, and no-`backdrop-filter` each give a legible form for every skin
- [ ] ≤4 blurred layers at 1920×1080 (≤2 at 430px)

**Motion** — interaction only; reduced motion honoured; dismissals faster than entrances; no ambient 3D movement.

**Accessibility** — 4.5:1 body in both themes **and over each skin's worst-case composite**; status colours verified on light; focus ring on every control; 44×44; status never colour alone; modals trap/close/restore.

**Content** — buttons name actions; sentence case; errors say what and what next; empty states offer an action.

---

## 31. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `bg-surface-2/70` renders as nothing | Variable holds hex | `--surface-2: 27 29 33;` (§5.3) |
| `xs:` wins at desktop widths | `screens` extended not replaced | Replace the object (§7) |
| White flash on load | Bootstrap deferred | Inline in `<head>` above CSS (§9.2) |
| White scrollbar in dark | `color-scheme` missing | Add to both `:root` blocks |
| White status bar on Android | `theme-color` missing/stale | §9.4 |
| Light mode washed out | White canvas | Canvas `#F1F5F9`; white only `surface-4` |
| Light mode harsh | Dark shadows reused | Light shadow tokens |
| Frosted bar flat in light | No saturation | `saturate(150%)` in the skin's backdrop value |
| Label unreadable on accent (dark) | White not `accent-ink` | `text-accent-ink` |
| Tertiary text illegible in light | Opacity tier from dark | Solid `ink-3` |
| Corners "collided" | Same role on parent and child | Step down (§12) |
| Truncation not working | Missing `min-w-0` | §15 |
| First row square on hover | Group lacks `overflow-hidden` | §21.6 |
| Sticky header shows rows | No/translucent bg on `thead` | Opaque `bg-surface-2` |
| Sheet stuck with reduced motion | Transition-only open state | Toggle a data attribute |
| Classes missing in prod | Narrow glob / dynamic names | §28.5 |
| Android scroll jank | Too many blurs | Chrome only; check `fidelity` |
| Phone landscape two-pane | Split on width alone | `md:tall:flex-row` |
| 1366×768 cut off | Chrome sized for 1080p | `short:` collapse |
| Shell scrolls sideways | Fluid pane missing `min-w-0` | §18.4 |
| 40″ narrow column | `max-w-shell mx-auto` on shell | Let the shell fill (§18.5) |
| Row actions unreachable on touch laptop | Hover-only | `touch:opacity-100` |
| Wrong layout after Split View | Width measured once in JS | CSS/container queries |
| Labels clipped at 320 only | Floor assumed 360 | §18.6 |
| Chrome behind URL bar | `100vh` | `h-dvh` |
| **Glass looks like flat grey** | No scene behind it, or no saturation | Skin must define `--scene`; `saturate()` in backdrop |
| **Glass text unreadable over bright blob** | Contrast checked on `surface-2` only | Validate on scene composite (§41) |
| **Skin has no effect** | CSS not loaded, or `data-skin` id not in registry | Check `<link>` and id regex (§38) |
| **Radius ignored** | Literal `rounded-[…]` in component | Use role class; lint §41 |
| **3D flattened** | `overflow:hidden`/`filter`/`backdrop-filter`/`opacity<1` on an ancestor of `preserve-3d` | Keep the stage chain clean (§40) |
| **Modal misplaced under 3D** | `fixed` inside a transformed ancestor | Portal overlays outside the stage |
| **Click lands in the wrong place under tilt** | Large Z delta | Keep targets within ±24px |
| **Neumorph controls invisible** | Shadows only, no edge | Required `edge` under `prefers-contrast` and low fidelity |
| **Press feels broken in clay** | `scale` fighting `translate` | Depth uses `translate`; press uses `scale`; do not mix `transform` utilities |
| **Skin flashes on navigation** | Skin CSS loaded after paint | `document.write` link in head (§38.2) or inline the active skin |

---

## 32. Migrating a dark-only build

Roughly a day for a medium app.

1. **Add the token layer** (§8, §7). Nothing changes yet.
2. **Sweep colour utilities, mechanically:**

| Find | Replace |
|---|---|
| `bg-[#0A0B0D]`, `bg-zinc-950` | `bg-canvas` |
| `bg-[#131417]`, `bg-zinc-900` | `bg-surface-1` |
| `bg-[#1B1D21]`, `bg-zinc-800` | `bg-surface-2` |
| `bg-[#24262B]` | `bg-surface-3` |
| `bg-[#2E3036]` | `bg-surface-4` |
| `text-white` | `text-ink` |
| `text-white/60` | `text-ink-2` |
| `text-white/38`, `/40` | `text-ink-3` |
| `text-white/24`, `/25` | `text-ink-4` |
| `border-white/5` · `border-white/10` | `border-line/5` · `border-line/10` |
| `bg-[#3D8BFF]` | `bg-accent` |

3. **Delete every `dark:` variant.** Anything that breaks was relying on a variant instead of a token.
4. **Fix `accent-ink`:** `bg-accent text-white` → `bg-accent text-accent-ink`.
5. **Switch to light and walk every screen.**
6. **Add the theme control and head script** (§9).
7. **Run the QA checklist** (§30). Then continue with §42 to adopt skins.

---

# Part VII — Skin engine

The system now has one idea at its centre: **components ask for a role; the active theme × skin × fidelity × dimension decides what that role looks like.** This part defines the axes, the material vocabulary, the skin format, the compiler, the runtime, six bundled skins, the 3D tiers, and the gates that make "many skins" safe.

## 33. Four axes

| Axis | Attribute | Values | Owns | Default |
|---|---|---|---|---|
| **Theme** | `data-theme` | auto · light · dark | Colour channels, ink contrast | auto (attribute absent) |
| **Skin** | `data-skin` | `system` · `soft` · `minimal` · `glass` · `clay` · `neumorph` · `depth` · third-party | Materials, geometry, motion personality, scene | `system` (attribute absent) |
| **Fidelity** | `data-fidelity` | auto · high · low | Whether expensive effects (blur, 3D, noise, scene animation) run | auto (attribute absent) |
| **Dimension** | `data-dimension` | flat · layered · 3d | Whether depth tokens become real Z-space | set by the skin |

Markup knows none of them. All four are variables or attributes on the **nearest ancestor**, so per-subtree skinning is free:

```html
<section data-skin="glass"> <!-- a glass island inside a system app --> </section>
```

Nested *themes* are not supported (material values resolve colour channels where they are declared). If a subtree needs a different theme **and** skin, put both attributes on the same element.

**Independence is the point.** The same person can run Glass + Dark + Low fidelity (OS reduces transparency) or Clay + Light + 3D tilt off. Every combination must be legible; §41 tests the product, not the parts.

**What a skin may not do:** redefine colour channels (that is a theme), change layout (that is Part IV), change what may animate (that is I6), or alter scrims/modality semantics (§14.2).

---

## 34. Materials: roles and slots

Colour tokens alone cannot express glass (`backdrop-filter`), clay (stacked inset shadows) or neumorphism (two opposed shadows). So each surface role is a **material**: a bundle of fill, edge, shadow, backdrop, sheen and depth.

### 34.1 Role vocabulary (fixed — skins fill it in, never extend it)

`ground · panel · card · raised · overlay · chrome · well · control · primary`

| Role | Purpose | Elevation level (§13) |
|---|---|---|
| `ground` | Root background | 0 |
| `panel` | Sidebars, rails, inspectors | 1 |
| `card` | Cards, grouped lists, table shells | 2 |
| `raised` | Inputs, popovers, hovered rows | 3 |
| `overlay` | Modals, sheets, menus, toasts, thumbs | 4 |
| `chrome` | Top bars, tab bars (floats over scroll) | 3, translucent-capable |
| `well` | Inset: tracks, segmented track, pressed areas | 1, *inverted* |
| `control` | Buttons, icon buttons | interactive (rest/hover/press) |
| `primary` | Accent-filled action, checked controls | interactive, accent |

### 34.2 Slots per role

```css
--m-card-bg:        ;  /* the FILL: any <color> */
--m-card-sheen:     ;  /* an <image> layer stacked above the fill: gradient highlight, noise, specular; or none */
--m-card-edge:      ;  /* border colour */
--m-card-shadow:    ;  /* any number of layers, inset allowed */
--m-card-backdrop:  ;  /* backdrop-filter value, or none */
--m-card-z:         ;  /* translateZ depth, used only when dimension=3d */
```

`control` and `primary` additionally have `-hover-*` and `-press-*` sets (`bg`, `sheen`, `shadow`, `edge`).

`--m-*-bg` is a `<color>`; any gradient belongs in `--m-*-sheen`. This is what lets the plugin stack them as `background: <sheen>, <bg>` (§35).

### 34.3 Skin-level tokens

```css
/* geometry (role-based) */  --r-chip --r-control --r-card --r-sheet --stroke
/* scene */                  --scene            /* what <body> paints; glass needs something to blur */
/* motion */                 --ease --ease-exit --dur --dur-slow --press-scale
/* elevation shadows */      --shadow-sm --shadow-md --shadow-lg   /* for shadow-* utilities */
/* 3D */                     --persp --tilt-max
/* typography (optional) */  --font-ui --font-display-weight --icon-stroke
/* a11y (optional) */        --focus-ring-boost
```

### 34.4 Inheritance

A skin may declare `extends: 'system'` (the default). Any unspecified role or slot falls through to the parent, so a new skin can be ~30 lines. Roles resolve **per mode**: a skin can define `light.card` and inherit `dark.card`.

---

## 35. Tailwind plugin: `mat-*` utilities

The plugin is in §7. Behaviour:

| Class | Emits |
|---|---|
| `.mat-{role}` | `position: relative`; `background: <sheen>, <bg>`; `border: var(--stroke) solid <edge>`; `box-shadow`; `backdrop-filter` (+ `-webkit-`) |
| `.mat-control:hover` / `:active` | Swap to `-hover-*` / `-press-*` slots |
| `[data-dimension=3d] .mat-{role}` | `translate: 0 0 var(--m-{role}-z)` and `transform-style: preserve-3d` |

Design decisions worth knowing:

- **Emitted into the `components` layer**, so `fixed`, `sticky`, `hidden` and any utility still win over `position: relative`.
- **Sheen is a background layer, not `::before`.** A positioned pseudo-element paints above non-positioned children (it would wash over text), and requires `position: relative` plus `pointer-events: none` hacks. `background: sheen, fill` costs nothing and can never cover content. With `--m-*-sheen: none` the declaration is `none, <color>`, which is valid.
- **`translate` (the CSS property), not `transform`,** carries Z-depth, so a card can sit in Z-space *and* take `active:scale-[var(--press-scale)]` without the two fighting over one `transform`. It is gated to `data-dimension="3d"` because any non-`none` `translate` creates a stacking context and containing block.
- **Edge defaults to `transparent`** and `--stroke` to `1px`, so a skin that omits them gets a borderless, layout-stable box (border width stays constant between skins that differ only in edge colour; set `--stroke: 0px` to remove it).
- **Alpha-tinted edges** use `rgb(var(--line) / .1)` inside the slot value — channel variables compose fine inside `--m-*` values.

### Components then become

```jsx
Button   'mat-control rounded-control min-h-11 px-4 text-sm font-medium transition-all duration-skin ease-skin active:scale-[var(--press-scale)]'
Primary  'mat-primary rounded-control …'
Card     'mat-card rounded-card p-4'
Modal    'mat-overlay rounded-sheet p-6'
TopBar   'mat-chrome sticky top-0 z-sticky'
Track    'mat-well rounded-full h-2'
```

Existing `bg-surface-N` utilities remain valid for one-offs (icon tiles, ghost hover). They are simply no longer how components get their look.

---

## 36. Skin definition format

A skin is **one typed object**. A build step compiles it to CSS (§37), so no one hand-writes the Auto/Light/Dark selector triplication.

```ts
// @ecomerece/ui/skin
export type Role = 'ground'|'panel'|'card'|'raised'|'overlay'|'chrome'|'well'|'control'|'primary';
export type Capability = 'backdrop-filter' | 'preserve-3d' | 'webgl';

export interface Material {
  bg?: string; sheen?: string; edge?: string; shadow?: string; backdrop?: string; z?: string;
}
export interface Interactive extends Material {
  hover?: Material; press?: Material;
}
export type Materials = Partial<Record<Role, Interactive>>;

export interface Skin {
  id: string;                                  // /^[a-z0-9-]{1,32}$/
  label: string;                               // a noun: "Glass"
  extends?: string;                            // default 'system'
  dimension: 'flat' | 'layered' | '3d';
  renderer?: 'dom' | 'dom+webgl' | 'spatial';  // 'dom' default; 'spatial' reserved
  needs: Capability[];                         // gated by @supports / runtime detection
  cost: 'low' | 'medium' | 'high';             // §28.3, drives fidelity=auto
  a11yTier: 'AA' | 'AA-with-fallback';         // see §41; non-default skins only for the latter
  fallback: 'self' | 'solid' | string;         // 'self' already opaque · 'solid' opaque fills of this skin · or another skin id
  geometry: { chip: string; control: string; card: string; sheet: string; stroke: string };
  motion:   { ease: string; easeExit?: string; dur: string; durSlow?: string; press: number };
  shadows?: { light: [string, string, string]; dark: [string, string, string] };  // sm, md, lg
  scene?:   { light: string; dark: string };   // <background>; must end in a solid colour layer
  depth?:   { persp: string; tiltMax: string };
  typography?: { fontUi?: string; displayWeight?: number; iconStroke?: number };
  contrastEdge?: string;                       // edge colour forced under prefers-contrast / low fidelity
  modes: { light: Materials; dark: Materials };
}
```

### 36.1 `system` — the reference skin (reproduces v2.0 exactly)

```ts
export const system: Skin = {
  id: 'system', label: 'System', extends: undefined, dimension: 'layered',
  needs: [], cost: 'low', a11yTier: 'AA', fallback: 'self',
  geometry: { chip: '8px', control: '14px', card: '20px', sheet: '28px', stroke: '1px' },
  motion:   { ease: 'cubic-bezier(.32,.72,0,1)', easeExit: 'cubic-bezier(.4,0,1,1)', dur: '200ms', durSlow: '300ms', press: 0.97 },
  shadows: {
    light: ['0 1px 2px rgb(15 18 26/.06), 0 1px 3px rgb(15 18 26/.04)', '0 4px 14px rgb(15 18 26/.08), 0 1px 3px rgb(15 18 26/.05)', '0 16px 40px rgb(15 18 26/.14), 0 2px 8px rgb(15 18 26/.06)'],
    dark:  ['0 1px 2px rgb(0 0 0/.35)', '0 4px 12px rgb(0 0 0/.40)', '0 8px 28px rgb(0 0 0/.50)'],
  },
  scene: { light: 'rgb(var(--canvas))', dark: 'rgb(var(--canvas))' },
  modes: (['light','dark'] as const).reduce((m, k) => ({ ...m, [k]: {
    ground:  { bg: 'rgb(var(--canvas))', edge: 'transparent', shadow: 'none' },
    panel:   { bg: 'rgb(var(--surface-1))', edge: 'rgb(var(--line)/.10)', shadow: 'none' },
    card:    { bg: 'rgb(var(--surface-2))', edge: 'rgb(var(--line)/.10)', shadow: 'var(--shadow-sm)' },
    raised:  { bg: 'rgb(var(--surface-3))', edge: 'rgb(var(--line)/.10)', shadow: 'var(--shadow-sm)' },
    overlay: { bg: 'rgb(var(--surface-4))', edge: 'rgb(var(--line)/.10)', shadow: 'var(--shadow-lg)' },
    chrome:  { bg: 'rgb(var(--surface-3)/.72)', edge: 'rgb(var(--line)/.10)', shadow: 'none',
               backdrop: 'blur(30px) saturate(150%)' },
    well:    { bg: 'rgb(var(--surface-1))', edge: 'rgb(var(--line)/.10)', shadow: 'none' },
    control: { bg: 'rgb(var(--surface-3))', edge: 'rgb(var(--line)/.10)', shadow: 'var(--shadow-sm)',
               hover: { bg: 'rgb(var(--surface-4))' }, press: { bg: 'rgb(var(--surface-3))', shadow: 'none' } },
    primary: { bg: 'rgb(var(--accent))', edge: 'transparent', shadow: 'var(--shadow-sm)' },
  }}), {} as Skin['modes']),
};
```

### 36.2 `glass`

```ts
export const glass: Skin = {
  id: 'glass', label: 'Glass', dimension: 'layered',
  needs: ['backdrop-filter'], cost: 'high', a11yTier: 'AA', fallback: 'solid',
  geometry: { chip: '12px', control: '16px', card: '24px', sheet: '32px', stroke: '1px' },
  motion:   { ease: 'cubic-bezier(.32,.72,0,1)', dur: '300ms', press: 0.97 },
  scene: {
    light: 'radial-gradient(60% 50% at 20% 10%, rgb(var(--accent)/.35), transparent), radial-gradient(50% 40% at 85% 85%, rgb(var(--success)/.25), transparent), rgb(var(--canvas))',
    dark:  'radial-gradient(60% 50% at 20% 10%, rgb(var(--accent)/.30), transparent), radial-gradient(50% 40% at 85% 85%, rgb(var(--warning)/.18), transparent), rgb(var(--canvas))',
  },
  modes: {
    light: {
      card:    { bg: 'rgb(var(--glass)/.55)', edge: 'rgb(255 255 255/.60)', backdrop: 'blur(24px) saturate(160%)',
                 shadow: '0 8px 32px rgb(15 18 26/.10)',
                 sheen: 'linear-gradient(135deg, rgb(255 255 255/.45), transparent 40%)' },
      overlay: { bg: 'rgb(var(--glass)/.78)', edge: 'rgb(255 255 255/.70)', backdrop: 'blur(32px) saturate(170%)',
                 shadow: '0 24px 64px rgb(15 18 26/.18)',
                 sheen: 'linear-gradient(135deg, rgb(255 255 255/.55), transparent 45%)' },
      chrome:  { bg: 'rgb(var(--glass)/.62)', edge: 'rgb(255 255 255/.60)', backdrop: 'blur(30px) saturate(170%)' },
      control: { bg: 'rgb(var(--glass)/.60)', edge: 'rgb(255 255 255/.70)', backdrop: 'none',   // controls do not blur (perf cap)
                 hover: { bg: 'rgb(var(--glass)/.78)' }, press: { bg: 'rgb(var(--glass)/.45)' } },
      well:    { bg: 'rgb(var(--surface-1)/.60)', shadow: 'inset 0 1px 3px rgb(15 18 26/.14)' },
    },
    dark: {
      card:    { bg: 'rgb(var(--glass)/.50)', edge: 'rgb(255 255 255/.10)', backdrop: 'blur(28px) saturate(140%)',
                 shadow: '0 8px 32px rgb(0 0 0/.40)',
                 sheen: 'linear-gradient(135deg, rgb(255 255 255/.10), transparent 40%)' },
      overlay: { bg: 'rgb(var(--glass)/.80)', edge: 'rgb(255 255 255/.14)', backdrop: 'blur(36px) saturate(150%)',
                 shadow: '0 24px 64px rgb(0 0 0/.55)',
                 sheen: 'linear-gradient(135deg, rgb(255 255 255/.14), transparent 45%)' },
      chrome:  { bg: 'rgb(var(--glass)/.60)', edge: 'rgb(255 255 255/.10)', backdrop: 'blur(30px) saturate(150%)' },
      control: { bg: 'rgb(var(--glass)/.55)', edge: 'rgb(255 255 255/.14)', backdrop: 'none',
                 hover: { bg: 'rgb(var(--glass)/.75)' }, press: { bg: 'rgb(var(--glass)/.40)' } },
      well:    { bg: 'rgb(var(--canvas)/.55)', shadow: 'inset 0 1px 3px rgb(0 0 0/.45)' },
    },
  },
};
```

Glass rules that are part of the skin, not left to authors: overlay opacity ≥ .78 (legibility over arbitrary content), **controls and rows never blur**, sticky table headers are opaque (override `chrome`→`raised-solid`), the `scene` always ends in a solid `canvas` layer so a missing gradient degrades to the system canvas.

### 36.3 `clay`

```ts
export const clay: Skin = {
  id: 'clay', label: 'Clay', dimension: 'layered', needs: [], cost: 'medium',
  a11yTier: 'AA', fallback: 'self',
  geometry: { chip: '14px', control: '20px', card: '28px', sheet: '36px', stroke: '0px' },
  motion:   { ease: 'cubic-bezier(.34,1.56,.64,1)', dur: '260ms', press: 0.94 },   // slight overshoot on touched element
  modes: {
    light: {
      card:    { bg: 'rgb(var(--surface-2))', edge: 'transparent',
                 shadow: '0 14px 28px rgb(15 18 26/.10), inset 0 -8px 14px rgb(15 18 26/.06), inset 0 8px 12px rgb(255 255 255/.90)' },
      control: { bg: 'rgb(var(--surface-3))', edge: 'transparent',
                 shadow: '0 8px 16px rgb(15 18 26/.12), inset 0 -4px 8px rgb(15 18 26/.08), inset 0 4px 8px rgb(255 255 255/.95)',
                 press: { shadow: 'inset 0 6px 12px rgb(15 18 26/.16)' } },
      well:    { bg: 'rgb(var(--surface-1))', shadow: 'inset 0 4px 8px rgb(15 18 26/.12)' },
    },
    dark: {
      card:    { bg: 'rgb(var(--surface-2))', edge: 'transparent',
                 shadow: '0 14px 28px rgb(0 0 0/.45), inset 0 -8px 14px rgb(0 0 0/.35), inset 0 6px 10px rgb(255 255 255/.05)' },
      control: { bg: 'rgb(var(--surface-3))', edge: 'transparent',
                 shadow: '0 8px 16px rgb(0 0 0/.45), inset 0 -4px 8px rgb(0 0 0/.35), inset 0 3px 6px rgb(255 255 255/.07)',
                 press: { shadow: 'inset 0 6px 12px rgb(0 0 0/.55)' } },
      well:    { bg: 'rgb(var(--canvas))', shadow: 'inset 0 4px 8px rgb(0 0 0/.55)' },
    },
  },
};
```

Clay trades the hairline for volume: with `stroke: 0px`, the validator requires either a ≥3:1 fill-to-background luminance gap or an alternative edge for `control` (§41 gate 2).

### 36.4 `minimal`

```ts
export const minimal: Skin = {
  id: 'minimal', label: 'Minimal', dimension: 'flat', needs: [], cost: 'low',
  a11yTier: 'AA', fallback: 'self',
  geometry: { chip: '6px', control: '8px', card: '10px', sheet: '12px', stroke: '1px' },
  motion:   { ease: 'cubic-bezier(.2,0,0,1)', dur: '120ms', durSlow: '180ms', press: 1 },
  shadows: { light: ['none','none','0 8px 24px rgb(15 18 26/.10)'], dark: ['none','none','0 8px 24px rgb(0 0 0/.45)'] },
  modes: (['light','dark'] as const).reduce((m, k) => ({ ...m, [k]: {
    card:    { bg: 'rgb(var(--surface-2))', edge: 'rgb(var(--line)/.12)', shadow: 'none' },
    raised:  { bg: 'rgb(var(--surface-3))', edge: 'rgb(var(--line)/.18)', shadow: 'none' },
    overlay: { bg: 'rgb(var(--surface-4))', edge: 'rgb(var(--line)/.18)', shadow: 'var(--shadow-lg)' },  // only floating layer casts a shadow
    chrome:  { bg: 'rgb(var(--surface-1))', edge: 'rgb(var(--line)/.12)', backdrop: 'none' },           // opaque; no blur
    control: { bg: 'rgb(var(--surface-3))', edge: 'rgb(var(--line)/.45)', shadow: 'none',              // ≥3:1 UI boundary
               hover: { bg: 'rgb(var(--surface-4))' }, press: { bg: 'rgb(var(--surface-2))' } },
    primary: { bg: 'rgb(var(--accent))', edge: 'transparent', shadow: 'none' },
  }}), {} as Skin['modes']),
};
```

### 36.5 `neumorph`

```ts
export const neumorph: Skin = {
  id: 'neumorph', label: 'Soft emboss', dimension: 'layered', needs: [], cost: 'medium',
  a11yTier: 'AA-with-fallback',          // shadows alone fail WCAG 1.4.11; see contrastEdge
  fallback: 'system',                    // degraded form is the system skin
  contrastEdge: 'rgb(var(--line)/.45)',
  geometry: { chip: '12px', control: '16px', card: '24px', sheet: '32px', stroke: '1px' },
  motion:   { ease: 'cubic-bezier(.32,.72,0,1)', dur: '220ms', press: 0.98 },
  modes: {
    light: {
      card:    { bg: 'rgb(var(--canvas))', edge: 'transparent', shadow: '8px 8px 16px rgb(15 18 26/.14), -8px -8px 16px rgb(255 255 255/.90)' },
      control: { bg: 'rgb(var(--canvas))', edge: 'transparent', shadow: '6px 6px 12px rgb(15 18 26/.14), -6px -6px 12px rgb(255 255 255/.90)',
                 press: { shadow: 'inset 4px 4px 8px rgb(15 18 26/.16), inset -4px -4px 8px rgb(255 255 255/.90)' } },
      well:    { bg: 'rgb(var(--canvas))', shadow: 'inset 4px 4px 8px rgb(15 18 26/.14), inset -4px -4px 8px rgb(255 255 255/.90)' },
    },
    dark: {
      card:    { bg: 'rgb(var(--canvas))', edge: 'transparent', shadow: '8px 8px 16px rgb(0 0 0/.55), -8px -8px 16px rgb(255 255 255/.04)' },
      control: { bg: 'rgb(var(--canvas))', edge: 'transparent', shadow: '6px 6px 12px rgb(0 0 0/.55), -6px -6px 12px rgb(255 255 255/.04)',
                 press: { shadow: 'inset 4px 4px 8px rgb(0 0 0/.6), inset -4px -4px 8px rgb(255 255 255/.04)' } },
      well:    { bg: 'rgb(var(--canvas))', shadow: 'inset 4px 4px 8px rgb(0 0 0/.55), inset -4px -4px 8px rgb(255 255 255/.04)' },
    },
  },
};
```

Neumorphism is the honest hard case. It is a *valid* skin, not a *default* one: it ships behind the picker label "Soft emboss — lower contrast", and its edge returns whenever the person asks for more contrast or the device is on low fidelity.

### 36.6 `soft` and `depth`

```ts
// soft — the shipped pill language (resolves Appendix E.6 #1, #2, #5, #7 as a deliberate skin)
export const soft: Skin = {
  id: 'soft', label: 'Soft', extends: 'system', dimension: 'layered', needs: [], cost: 'low',
  a11yTier: 'AA', fallback: 'self',
  geometry: { chip: '999px', control: '999px', card: '16px', sheet: '24px', stroke: '1px' },
  motion:   { ease: 'cubic-bezier(.32,.72,0,1)', dur: '200ms', press: 0.97 },
  modes: { light: {}, dark: {} },          // all materials inherited from system
};

// depth — real Z-space (§40); blur is restricted to chrome + overlay, cards are opaque
export const depth: Skin = {
  id: 'depth', label: 'Depth', extends: 'system', dimension: '3d',
  needs: ['preserve-3d'], cost: 'high', a11yTier: 'AA', fallback: 'system',
  geometry: { chip: '10px', control: '16px', card: '22px', sheet: '30px', stroke: '1px' },
  motion:   { ease: 'cubic-bezier(.32,.72,0,1)', dur: '240ms', press: 0.97 },
  depth:    { persp: '1200px', tiltMax: '6deg' },
  modes: (['light','dark'] as const).reduce((m, k) => ({ ...m, [k]: {
    card:    { z: '12px' },  raised: { z: '24px' },  overlay: { z: '48px' },  chrome: { z: '36px' },
    control: { z: '8px' },
  }}), {} as Skin['modes']),
};
```

Skins the system *invites but does not ship* (all expressible in this format): `aurora` (animated mesh scene, `dom+webgl`), `paper` (noise sheen + soft inner shadow), `terminal` (mono `--font-ui`, 0 radii on chips only, 1px edges), `brutal` (hard offset shadows, 2px stroke), `aqua`/`frutiger` (glossy sheen layers). Each must pass §41 unchanged.

---

## 37. Compiler and guaranteed fallbacks

`scripts/build-skins.ts` reads `skins/*.ts` and writes `public/skins/<id>.css`. Rules:

1. **Resolve inheritance** (`extends`, per role, per mode, per slot).
2. **Emit every variable in every mode block.** No variable depends on cascade order against `tokens.css` — geometry, motion and shadows are repeated inside the light block, the Auto-dark media block, and the explicit-dark block.
3. **Out-rank §8.** Skin selectors always have higher specificity than the `:root` theme blocks, so file load order never matters.
4. **Emit the fallback blocks** (below) after the mode blocks, with selectors repeated once to guarantee they win.
5. **Gate on `needs`.** A skin with `needs: ['backdrop-filter']` has its blur values inside `@supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))`; outside it, the solid fallback applies.

### 37.1 Emitted structure (glass, abridged)

```css
/* light */
:root[data-skin="glass"], [data-skin="glass"] {
  --r-chip: 12px; --r-control: 16px; --r-card: 24px; --r-sheet: 32px; --stroke: 1px;
  --ease: cubic-bezier(.32,.72,0,1); --dur: 300ms; --press-scale: .97;
  --scene: radial-gradient(60% 50% at 20% 10%, rgb(var(--accent)/.35), transparent), …, rgb(var(--canvas));
  --m-card-bg: rgb(var(--glass)/.55); --m-card-edge: rgb(255 255 255/.60);
  --m-card-backdrop: blur(24px) saturate(160%); --m-card-shadow: 0 8px 32px rgb(15 18 26/.10);
  --m-card-sheen: linear-gradient(135deg, rgb(255 255 255/.45), transparent 40%);
  /* …every role, every slot… */
}
/* dark: Auto and explicit — same variable set, dark values */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"])[data-skin="glass"], :root:not([data-theme="light"]) [data-skin="glass"] { … }
}
:root[data-theme="dark"][data-skin="glass"], :root[data-theme="dark"] [data-skin="glass"] { … }
```

### 37.2 Guaranteed solid fallback (every skin)

Emitted under **all four** of these conditions:

```css
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) { … }
@media (prefers-reduced-transparency: reduce) { … }
@media (prefers-contrast: more) { … }
:root[data-fidelity="low"][data-skin="glass"], :root[data-fidelity="low"] [data-skin="glass"] { … }
```

What the fallback does (default `fallback: 'solid'`):

| Slot | Fallback |
|---|---|
| `--m-*-bg` | Opaque token for the role: `ground→canvas`, `panel→surface-1`, `card→surface-2`, `raised→surface-3`, `overlay→surface-4`, `chrome→surface-3`, `well→surface-1`, `control→surface-3` |
| `--m-*-backdrop` | `none` |
| `--m-*-sheen` | `none` |
| `--scene` | `rgb(var(--canvas))` |
| `--m-*-z` | `0px` |
| Under `prefers-contrast: more` and low fidelity | edge forced to the skin's `contrastEdge` (default `rgb(var(--line)/.45)`) |

`fallback: 'self'` means the skin is already opaque and only gets the contrast edge. `fallback: 'system'` (or any skin id) swaps the whole material set for that skin's. **A skin with no legible degraded form cannot be published** (§41).

---

## 38. Loading, registry and runtime

### 38.1 Loading many skins without bloat

- Each skin compiles to its own file (`skins/glass.css`, ≈2–4 KB). **Only the active skin loads**; 50 skins cost the same as 1 at runtime.
- `system.css` is always loaded (it also holds the base fallback), declared at zero specificity (`:where(:root)`) so any skin overrides it regardless of order.
- Skins switched at runtime swap one `<link>`; since the link is added before the old one is removed, there is no unstyled frame.

### 38.2 Bootstrap — one script, no flash of theme, skin or fidelity

Inline in `<head>`, before any stylesheet. The skin id is **validated against a strict pattern** before it touches a URL:

```html
<script>
(function () { try {
  var d = document.documentElement, ls = localStorage;
  var t = ls.getItem('theme'), s = ls.getItem('skin'), f = ls.getItem('fidelity');
  if (t === 'dark' || t === 'light') d.setAttribute('data-theme', t);
  if (s && s !== 'system' && /^[a-z0-9-]{1,32}$/.test(s)) {
    d.setAttribute('data-skin', s);
    document.write('<link rel="stylesheet" id="skin-css" href="/skins/' + s + '.css">');  // render-blocking on purpose
  }
  if (f === 'low' || f === 'high') d.setAttribute('data-fidelity', f);
  else if ((navigator.connection && navigator.connection.saveData) ||
           (navigator.deviceMemory && navigator.deviceMemory <= 2) ||
           (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4 && /Android/.test(navigator.userAgent)))
    d.setAttribute('data-fidelity', 'low');
} catch (e) {} })();
</script>
<link rel="stylesheet" href="/skins/system.css">
```

Notes: `document.write` is deliberate (parser-blocking so the skin is applied before first paint); if your CSP forbids it, inline the active skin's CSS server-side from a cookie instead. Unknown ids fall back to `system` because the registry lookup in `useSkin` repairs the attribute on mount. Also store the choice in a cookie if you server-render.

### 38.3 Registry

```ts
// skins/index.ts
export const registry = {
  system:   { skin: system,   swatch: ['#F8FAFC', '#2563EB'] },
  soft:     { skin: soft,     swatch: ['#F8FAFC', '#2563EB'] },
  minimal:  { skin: minimal,  swatch: ['#F8F9FB', '#0B0D12'] },
  glass:    { skin: glass,    swatch: ['#BFD6FF', '#FFFFFF'] },
  clay:     { skin: clay,     swatch: ['#F1F2F5', '#E1E3E9'] },
  neumorph: { skin: neumorph, swatch: ['#E9EAEE', '#D2D4DB'] },
  depth:    { skin: depth,    swatch: ['#F8FAFC', '#2563EB'] },
} satisfies Record<string, { skin: Skin; swatch: [string, string] }>;
```

The skin picker reads this list (label, swatch, `cost`, `a11yTier`). Third parties ship `@acme/skin-foo` packages exporting a `Skin`; the build step registers them after running the validator.

### 38.4 `useSkin`

```tsx
export function useSkin() {
  const [skin, setSkinState] = useState(() => { try { return localStorage.getItem('skin') || 'system'; } catch { return 'system'; } });
  const [fidelity, setFidelityState] = useState<'auto'|'high'|'low'>(() => { try { return (localStorage.getItem('fidelity') as any) || 'auto'; } catch { return 'auto'; } });

  const supported = (id: string) => {
    const s = registry[id as keyof typeof registry]?.skin; if (!s) return false;
    return s.needs.every(n => n === 'backdrop-filter' ? CSS.supports('backdrop-filter', 'blur(1px)')
                          : n === 'preserve-3d'     ? CSS.supports('transform-style', 'preserve-3d')
                          : n === 'webgl'           ? !!document.createElement('canvas').getContext?.('webgl') : true);
  };

  const setSkin = useCallback((id: string) => {
    const next = supported(id) ? id : (registry[id as keyof typeof registry]?.skin.fallback ?? 'system');
    const root = document.documentElement;
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = `/skins/${next}.css`; link.id = 'skin-css-next';
    link.onload = () => {                                    // swap only after the new CSS is parsed → no unstyled frame
      document.getElementById('skin-css')?.remove(); link.id = 'skin-css';
      next === 'system' ? root.removeAttribute('data-skin') : root.setAttribute('data-skin', next);
      root.setAttribute('data-dimension', registry[next as keyof typeof registry].skin.dimension);
      try { localStorage.setItem('skin', next); } catch {}
      setSkinState(next);
    };
    document.head.appendChild(link);
  }, []);

  useEffect(() => { /* fidelity: 'auto' removes the attribute; 'high'/'low' set it; persist */ }, [fidelity]);
  return { skin, setSkin, fidelity, setFidelity: setFidelityState, registry };
}
```

Skin switches are instant (no tween, §9.6) and **must not** remount the tree: they change attributes and one stylesheet.

---

## 39. Bundled skins

| Skin | Dimension | Cost | Corner language | Depth cue | Motion | Tier | Best for |
|---|---|---|---|---|---|---|---|
| `system` | layered | low | 8 · 14 · 20 · 28 | Surface step → hairline → shadow | 200ms spring, .97 | AA | Default, enterprise, dense data |
| `soft` | layered | low | Pill controls, 16/24 | As system | As system | AA | Consumer, friendly |
| `minimal` | flat | low | 6 · 8 · 10 · 12 | Hairline only; shadow on overlay | 120ms, no press | AA | Tools, editors, content |
| `glass` | layered | high | 12 · 16 · 24 · 32 | Blur + edge-light + sheen over a scene | 300ms spring | AA | Media, dashboards on desktop, launchers |
| `clay` | layered | medium | 14 · 20 · 28 · 36, stroke 0 | Stacked inset + drop shadows | 260ms overshoot, .94 | AA | Playful consumer, kids, onboarding |
| `neumorph` | layered | medium | 12 · 16 · 24 · 32 | Paired opposed shadows, inverted wells | 220ms | AA-with-fallback | Smart-home, controls panels (opt-in) |
| `depth` | 3d | high | 10 · 16 · 22 · 30 | Real Z-space + pointer tilt | 240ms | AA | Showcase, product configurators |
| `blue` | layered | low | Pill controls, 24/36, stroke 2 | Blue-tinted gadget shadows + chrome blue/yellow rule, yellow/red tints | 220ms back-out, .96 | AA | Playful consumer, kids, branded showcases |

**Authoring principle.** A skin must change **material, geometry and motion together**. Changing only colour is a theme; changing only radius is a tweak. If two skins differ in just one of the three, merge them.

---

## 40. 3D: three honest tiers

`data-dimension` controls how much real Z-space exists. Never promise more than the tier delivers.

### Tier 1 — 2.5D depth (CSS only; build this first)

Every role carries `--m-*-z`. Under `data-dimension="3d"` the plugin turns that into `translate: 0 0 <z>`, and a `DepthStage` wrapper provides perspective and pointer-driven tilt.

```css
[data-dimension="3d"] .stage      { perspective: var(--persp, 1200px); }
[data-dimension="3d"] .stage-body { transform-style: preserve-3d;
  transform: rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg));
  transition: transform var(--dur) var(--ease); }
```

```tsx
// DepthStage — pointer (fine) or gyro (touch, opt-in) writes two CSS vars, nothing else
export function DepthStage({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = document.documentElement;
    const off = () => matchMedia('(prefers-reduced-motion: reduce)').matches
              || root.dataset.fidelity === 'low' || root.dataset.dimension !== '3d';
    if (off()) return;
    const max = parseFloat(getComputedStyle(root).getPropertyValue('--tilt-max')) || 6;
    let raf = 0;
    const on = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;       // touch tilt is opt-in via gyro
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const b = ref.current!.getBoundingClientRect();
        const x = (e.clientX - b.left) / b.width  - .5;                        // −.5….5
        const y = (e.clientY - b.top)  / b.height - .5;
        ref.current!.style.setProperty('--tilt-y', `${ x * max}deg`);          // pointer X rotates around Y
        ref.current!.style.setProperty('--tilt-x', `${-y * max}deg`);          // pointer Y rotates around X
      });
    };
    window.addEventListener('pointermove', on, { passive: true });
    return () => { window.removeEventListener('pointermove', on); cancelAnimationFrame(raf); };
  }, []);
  return <div className="stage"><div ref={ref} className="stage-body">{children}</div></div>;
}
```

**Placement.** `AppShell` is `h-dvh overflow-hidden`, and `overflow: hidden` flattens `preserve-3d`. Put `DepthStage` **inside** the scrolling main pane (or around a feature region), never around the shell. Overlays render through `Portal` into `document.body`, outside the stage, so `position: fixed` keeps working and modals are not tilted.

### Tier 2 — WebGL decor layer

`<SceneLayer>` is a `<canvas aria-hidden="true">` fixed behind the DOM that paints the skin's `scene` (animated mesh gradients, refraction-ready backgrounds, 3D objects). The DOM stays the source of truth — accessibility, focus, text rendering and hit-testing are unchanged.

- Skins declare `needs: ['webgl']` and `renderer: 'dom+webgl'`; without WebGL, or at `fidelity=low`, they fall back to the static CSS `--scene`.
- Lazy-load Three.js (or a tiny shader runner) only for skins that need it; it is never in the core bundle.
- Pause the render loop on `visibilitychange`, when reduced motion is on, and when the layer is off-screen. Ambient scene animation is the one sanctioned *non-interactive* motion, and it is **slow, low-contrast and skippable** — it must not exceed 30fps and must stop under reduced motion.
- Cap devicePixelRatio at 1.5.

### Tier 3 — true spatial UI (DOM-in-WebGL, WebXR)

Out of scope for now. The schema stays open to it: `renderer: 'dom' | 'dom+webgl' | 'spatial'`. Tier 3 would require its own input and accessibility model and is not covered by this specification.

### Known gotchas (normative)

- `backdrop-filter`, `filter`, `opacity < 1`, `overflow: hidden/clip`, `mask`, `will-change: transform/filter` and `isolation` on an **ancestor** of a `preserve-3d` element flatten it. Glass and 3D together work only if blur sits on the **leaf** and the `stage-body` chain is clean. WebKit is stricter than Blink.
- Backdrop blur on every 3D layer multiplies GPU cost. Under `data-dimension="3d"`, blur is limited to `chrome` and `overlay`; `card` and below are opaque. (The bundled `depth` skin enforces this by omitting `backdrop` on cards.)
- Tilt is decorative: off under `prefers-reduced-motion` and `fidelity=low`; never time-driven; never on touch without explicit gyro opt-in (iOS needs a user-gesture permission).
- Never put hit-targets across a big Z delta. Parallax can misalign the visual and the click area. Keep interactive elements within ±24px of their parent plane, and keep `control` z ≤ 8px.
- `transform` on an ancestor makes `position: fixed` descendants relative to it. Portal every overlay, toast and tooltip.
- Text under `perspective` can blur at fractional pixels; keep the resting tilt at exactly `0deg` and avoid `translateZ` on text-only elements.

---

## 41. Skin validator and CI gates

"Many skins" is only safe if every skin is machine-checked. A skin that fails any gate **does not build**.

### 41.1 Validator rules

| # | Check | Pass criteria |
|---|---|---|
| V1 | **Schema** | All nine roles resolve (defined or inherited) in **both** modes; all geometry/motion fields present; id matches `^[a-z0-9-]{1,32}$` |
| V2 | **Colour channels untouched** | Skin sets no `--canvas`, `--surface-*`, `--ink*`, `--accent*`, `--success|warning|danger|info`, `--line` |
| V3 | **Text contrast on materials** | `ink`, `ink-2`, `ink-3` ≥ 4.5:1 on every text-bearing role (`panel, card, raised, overlay, chrome, control, well`); `accent-ink` on `primary` ≥ 4.5:1. **Translucent materials are composited over the worst case** — the lightest and the darkest sampled regions of the scene (sample ≥ 9 points of `--scene` rendered headlessly) — and both must pass |
| V4 | **UI boundary contrast** | For `control`, `raised` inputs, `well`: either `edge` vs adjacent ≥ 3:1, **or** fill-vs-background luminance ≥ 3:1, **or** the skin declares `a11yTier: 'AA-with-fallback'` and a `contrastEdge` that itself reaches 3:1 |
| V5 | **Focus ring** | `ring-accent` vs `canvas` and vs each role's fill ≥ 3:1 (else the skin must set `--focus-ring-boost`) |
| V6 | **Fallback legibility** | Rendering with `fidelity=low`, with `prefers-reduced-transparency`, and with `prefers-contrast: more` passes V3–V5 |
| V7 | **Dividers survive** | With `--stroke: 0px` or no edge, grouped-list rows remain distinguishable (`divide-line/10` renders ≥ 1.1:1; or the skin supplies inset gap) |
| V8 | **Scene ends solid** | `--scene` last layer is a solid colour; body `background-color` is always `canvas` |
| V9 | **Opaque table header** | `raised` or the sticky-header override resolves to alpha 1 |
| V10 | **Geometry sanity** | `chip ≤ control ≤ card ≤ sheet` (px or 999px); never `0` for any container role |
| V11 | **Motion sanity** | `dur ≤ 400ms`, `press ∈ [.9, 1]`, overshoot only for press/scale (no layout properties) |
| V12 | **Blur budget** | At most 3 roles may carry a non-`none` backdrop; no backdrop on `control`, `raised` or `well` |
| V13 | **3D gates** | `dimension: '3d'` ⇒ `needs` includes `preserve-3d`; `control.z ≤ 8px`; no backdrop on roles with `z > 0` except `chrome` and `overlay` |

### 41.2 CI gates

1. **Schema check** (V1, V2, V8, V10–V13).
2. **Contrast matrix** (V3–V5): for every skin × theme × role, compute `ink`, `ink-2`, `ink-3`, `accent-ink`/`primary`, and edge-vs-surface. Fail below thresholds.
3. **Fallback render** (V6): screenshot every skin with `fidelity=low` and with `prefers-reduced-transparency` forced; text must still pass contrast.
4. **Markup lint:** in component files ban `dark:`, `bg-gradient-*`, `from-*/via-*/to-*`, `backdrop-*`, `shadow-[…]`, `rounded-[…]`, `blur-*`, `[data-skin`, and any `glass:`/`clay:`-style variant. Those belong to skins. Allow `shadow-sm|shadow|shadow-lg` (they resolve through skin variables) and `rounded-{chip,control,card,sheet,full}`.
5. **Visual regression:** component × skin × theme at **320×568, 932×430, 1366×768, 3840×2160** (extends §18.9). A skin that breaks the 932×430 rail, causes horizontal page scroll, or shrinks a target below 44px fails.
6. **Perf budget:** count elements with computed `backdrop-filter ≠ none` per skin at 1920×1080 (cap **4**) and at 430px wide (cap **2**); count box-shadow layers per control (cap **5**); `depth` additionally checks that no ancestor of a `preserve-3d` node has a flattening property.
7. **Combinatorial smoke:** skin × theme × fidelity (3) × reduced-motion × reduced-transparency × forced-colors on a canonical set of screens (settings, dashboard, table, form, modal, sheet, toast). No unreadable text, no invisible control.
8. **Bundle gate:** each compiled skin ≤ 6 KB gzipped; Three.js not reachable from the core entry.

### 41.3 Skin-owned vs invariant — enforced split

| Gate | Checks an invariant | Checks a skin choice |
|---|---|---|
| 2, 3, 5, 7 | ✔ (I2, I3, I4, I9) | |
| 4 | ✔ (I1, I7) | |
| 6 | ✔ (perf) | |
| 1 | | ✔ (shape of the skin object) |

Invariants fail the build; skin choices never do as long as they are inside the schema.

---

## 42. Migrating to the skin engine

No visual change until step 4.

1. **Add the engine tokens.** In `tokens.css` add `--r-*`, `--stroke`, `--ease`, `--ease-exit`, `--dur`, `--dur-slow`, `--press-scale`, `--scene` (already in §8) and compile `system.css` with the material slots. Values reproduce today's output exactly.
2. **Add the `mat-*` plugin and role-based radii** (§7). `rounded-sm|rounded|rounded-lg|rounded-xl` keep working through the aliases.
3. **Refactor `packages/ui` from literal classes to roles** (the mapping in §35, Appendix E.5). Screenshot-diff against current: it must be **zero-diff** in the `system` skin.
4. **Extract the current pill look as `soft`**; keep 8/14/20/28 as `system`. This closes Appendix E.6 #1–#5 and #7 by making each divergence a deliberate skin choice. **Fix the `SidePanel` dynamic-class bug (#8) in the same pass** — skins must not break Tailwind scanning.
5. **Ship `minimal`** first (easiest, proves the schema), then `glass`, then `clay`, then `neumorph`.
6. **Add `DepthStage`, then `SceneLayer`**, as opt-in features and the `depth` skin.
7. **Turn on the gates** (§41), starting with schema + lint, then contrast, then perf.
8. **Add the skin picker** (reads the registry), with Auto/Light/Dark as an independent control and a "Reduce effects" switch that writes `data-fidelity="low"`.

| v2 pattern | v3 replacement |
|---|---|
| `rounded-full bg-surface-3 shadow-sm border border-line/10` (button) | `mat-control rounded-control` |
| `rounded-2xl bg-surface-2 shadow-sm` (card) | `mat-card rounded-card` |
| `bg-surface-4 shadow-lg rounded-2xl` (modal) | `mat-overlay rounded-sheet` |
| `bg-surface-1/95 backdrop-blur-sm …` (bars) | `mat-chrome` |
| `bg-surface-3` track (progress, slider) | `mat-well rounded-full` |
| `transition-all duration-200 ease-spring` | `transition-all duration-skin ease-skin` |
| `active:scale-[0.97]` | `active:scale-[var(--press-scale)]` |

---

# Appendix A — Token export (JSON)

For Figma variables, Style Dictionary, or any design-token pipeline. Colour is the theme layer; skins export separately.

```json
{
  "surface": {
    "canvas":    { "light": "#F1F5F9", "dark": "#0B0F17" },
    "surface-1": { "light": "#F8FAFC", "dark": "#131A26" },
    "surface-2": { "light": "#FCFDFF", "dark": "#1B2432" },
    "surface-3": { "light": "#FFFFFF", "dark": "#253041" },
    "surface-4": { "light": "#FFFFFF", "dark": "#313E52" }
  },
  "text": {
    "ink":   { "light": "#0F172A", "dark": "#E8EEF7" },
    "ink-2": { "light": "#475569", "dark": "#A9B5C6" },
    "ink-3": { "light": "#5B6470", "dark": "#A0ABBD" },
    "ink-4": { "light": "#94A3B8", "dark": "#5B6675" }
  },
  "line":       { "light": "#0F172A", "dark": "#FFFFFF" },
  "accent":     { "light": "#2563EB", "dark": "#60A5FA" },
  "accent-ink": { "light": "#FFFFFF", "dark": "#0B1220" },
  "semantic": {
    "success": { "light": "#15803D", "dark": "#4ADE80" },
    "warning": { "light": "#B45309", "dark": "#FBBF24" },
    "danger":  { "light": "#DC2626", "dark": "#F87171" },
    "info":    { "light": "#2563EB", "dark": "#60A5FA" }
  },
  "breakpoint": { "xs": 360, "sm": 480, "md": 768, "lg": 1024, "xl": 1440, "2xl": 1920, "3xl": 2560, "4xl": 3200 },
  "roles": ["ground","panel","card","raised","overlay","chrome","well","control","primary"],
  "skins": {
    "system":   { "radius": { "chip": 8,   "control": 14,  "card": 20, "sheet": 28 }, "stroke": 1, "dur": 200, "press": 0.97, "cost": "low" },
    "soft":     { "radius": { "chip": 999, "control": 999, "card": 16, "sheet": 24 }, "stroke": 1, "dur": 200, "press": 0.97, "cost": "low" },
    "minimal":  { "radius": { "chip": 6,   "control": 8,   "card": 10, "sheet": 12 }, "stroke": 1, "dur": 120, "press": 1,    "cost": "low" },
    "glass":    { "radius": { "chip": 12,  "control": 16,  "card": 24, "sheet": 32 }, "stroke": 1, "dur": 300, "press": 0.97, "cost": "high" },
    "clay":     { "radius": { "chip": 14,  "control": 20,  "card": 28, "sheet": 36 }, "stroke": 0, "dur": 260, "press": 0.94, "cost": "medium" },
    "neumorph": { "radius": { "chip": 12,  "control": 16,  "card": 24, "sheet": 32 }, "stroke": 1, "dur": 220, "press": 0.98, "cost": "medium" },
    "depth":    { "radius": { "chip": 10,  "control": 16,  "card": 22, "sheet": 30 }, "stroke": 1, "dur": 240, "press": 0.97, "cost": "high" }
  },
  "motion": { "easing": { "spring": "cubic-bezier(0.32,0.72,0,1)", "exit": "cubic-bezier(0.4,0,1,1)" } }
}
```

(v2.0 listed `"2xl": 1600` here; the config and §18 use **1920**. Corrected.)

---

# Appendix B — Paste-ready AI prompt block

Paste everything between the fences into an AI design or coding tool at the start of a UI task.

```
Build this interface as a native OS surface, not a webpage (reference: iOS Settings, One UI, macOS
System Settings). It must support MANY SKINS (system, soft, minimal, glass, clay, neumorph, depth)
without the markup knowing which is active.

STACK
Tailwind utilities in markup + the mat-* role classes. One tailwind.config.js. Raw CSS = tokens.css
(@tailwind + theme variables + base resets + reduced-motion) plus one GENERATED css file per skin.
No hand-written component CSS, no CSS-in-JS, no Bootstrap/MUI/DaisyUI/Chakra. Skins are authored as
typed objects and compiled; never hand-write skin CSS.

FOUR INDEPENDENT AXES (attributes on <html> or any subtree)
data-theme auto|light|dark · data-skin system|soft|minimal|glass|clay|neumorph|depth
data-fidelity auto|high|low · data-dimension flat|layered|3d
Components never branch on any of them. NO `dark:` variants, NO per-skin variants/selectors in
components. Components ask for a ROLE; the active skin x theme x fidelity decides the look.

TOKENS
Colour = theme layer, shared by all skins, stored as space-separated RGB channels bound through
Tailwind's <alpha-value> (never hex in variables). Skins may reference colour tokens but never
redefine them. Text = four SOLID tokens ink / ink-2 / ink-3 / ink-4 (never white at opacities);
ink-4 is disabled only. accent-ink is the text colour ON the accent fill (white in light, dark navy
in dark). One accent.
Light: canvas #F1F5F9 s1 #F8FAFC s2 #FCFDFF s3 #FFFFFF s4 #FFFFFF · ink #0F172A #475569 #5B6470
#94A3B8 · accent #2563EB · success #15803D · warning #B45309 · danger #DC2626
Dark: canvas #0B0F17 s1 #131A26 s2 #1B2432 s3 #253041 s4 #313E52 · ink #E8EEF7 #A9B5C6 #A0ABBD
#5B6675 · accent #60A5FA (accent-ink #0B1220) · success #4ADE80 · warning #FBBF24 · danger #F87171

MATERIAL ROLES (fixed vocabulary)
ground panel card raised overlay chrome well control primary
Slots per role: --m-{role}-bg (a <color>) · -sheen (an <image>: gradient/noise/none) · -edge ·
-shadow (multi-layer, inset allowed) · -backdrop · -z (3D depth). control/primary also have
-hover-* and -press-*. The plugin emits `.mat-{role}` as background: sheen, bg; border: var(--stroke)
solid edge; box-shadow; backdrop-filter. Missing roles inherit from `system`.
Skin-level tokens: --r-chip --r-control --r-card --r-sheet --stroke · --scene · --ease --ease-exit
--dur --dur-slow --press-scale · --shadow-sm/md/lg · --persp --tilt-max · optional --font-ui.

USE IN MARKUP
button  mat-control rounded-control min-h-11 px-4 transition-all duration-skin ease-skin
        active:scale-[var(--press-scale)]  ·  primary: mat-primary text-accent-ink
card    mat-card rounded-card p-4          ·  modal: mat-overlay rounded-sheet p-6
bars    mat-chrome sticky top-0            ·  tracks: mat-well rounded-full
Radii are ROLE-based: rounded-chip / rounded-control / rounded-card / rounded-sheet / rounded-full.
(rounded-sm|rounded|rounded-lg|rounded-xl are aliases.) Nested radii step DOWN a role, never the
same role. NEVER write rounded-[..], shadow-[..], backdrop-*, bg-gradient-*, blur-* in components.

INVARIANTS (every skin, machine-checked)
1 markup is theme-blind and skin-blind · 2 contrast 4.5:1 text / 3:1 UI + focus, per skin x theme x
role, translucent materials checked over the worst-case scene composite · 3 44x44 targets, visible
focus-visible ring, 320px floor · 4 prefers-reduced-motion / reduced-transparency / contrast:more
and fidelity=low ALWAYS give a legible solid fallback · 5 one accent, one primary action per screen ·
6 motion only answers an action: no scroll reveals, staggers or decorative loops · 7 tokens only ·
8 both themes ship with every skin · 9 recompose, never scale; build 320 first.

SKIN-OWNED (not universal): gradients (allowed in skins, banned in markup), pure black/white rules
(system only), radius values, shadow-vs-border-vs-blur as the depth cue, motion curve/duration/press,
optional webfont, sheen/noise/scene.

SKIN CONTRACT
Skin = one typed object: id, label, extends, dimension, needs[], cost, a11yTier, fallback,
geometry{chip,control,card,sheet,stroke}, motion{ease,dur,press}, shadows, scene, modes{light,dark}
each partial over roles. A skin must change material + geometry + motion together (else it is a
theme). Rules: overlays opaque enough to read (glass >= .78), controls/rows never blur, scene ends in a
solid canvas layer, sticky table headers opaque, max 3 blurred roles, 4 blurred elements on screen
(2 at phone width), neumorph/clay must keep a >=3:1 boundary or declare a contrastEdge.
Compiler emits every variable in every mode block, out-ranks tokens.css, and emits a solid fallback
under @supports-not(backdrop-filter), prefers-reduced-transparency, prefers-contrast:more and
data-fidelity=low. Load ONLY the active skin (inline bootstrap in <head> validates the id with
^[a-z0-9-]{1,32}$). Skin switches are instant; per-subtree data-skin works.

3D (opt-in, data-dimension=3d)
Tier 1 CSS: perspective on .stage, preserve-3d on .stage-body, --m-*-z via the `translate` property,
pointer tilt via --tilt-x/--tilt-y (off under reduced motion and fidelity=low). Tier 2: a <canvas
aria-hidden> SceneLayer behind the DOM for scene only; lazy-load WebGL; falls back to CSS --scene.
Tier 3 spatial: out of scope. Gotchas: filter/backdrop-filter/opacity<1/overflow:hidden on an
ancestor of preserve-3d flatten it; portal overlays outside transformed ancestors; hit targets within
+-24px Z of their parent; DepthStage goes INSIDE the scroll container, never around the app shell.

TYPE Display text-3xl bold tracking-tight (one per screen) · Title text-xl semibold · Body text-base
· Subtext text-sm text-ink-2 · Micro text-xs text-ink-3 medium. System font stack unless a skin
declares --font-ui. Hierarchy from weight and ink tier, never colour. Numbers font-mono tabular-nums.
Sentence case, no ALL CAPS, active voice; buttons name their action.

MOTION via skin tokens: duration-skin ease-skin, press scale var(--press-scale); dismissals faster
than entrances (ease-skin-exit). Honour prefers-reduced-motion.

RESPONSIVE (skin-independent) 320 to 3840, recompose upward
screens REPLACED not extended: xs 360 sm 480 md 768 lg 1024 xl 1440 2xl 1920 3xl 2560 4xl 3200 +
guards tall/short/touch/fine, stackable (md:tall:flex-row). Unprefixed = 320.
(none) single column, tab bar · md:tall split · lg rail 72 + sidebar 288 · xl inspector · 2xl 3-col
grid · 3xl 4-5 col · 4xl fourth region, 6 col. Height is a separate axis: phone landscape 932x430
gets a left rail (short:), never a split. Verify 1366x768. Large displays: shell FILLS, main
SUBDIVIDES, chrome is fixed px, tables gain columns, prose stays max-w-prose with side panes; never
max-w-[1200px] mx-auto on the shell. min-w-0 on fluid flex children. h-dvh not h-screen. touch:
guard for hover actions. Container queries for components shown at different pane widths.

ACCESSIBILITY focus-visible ring everywhere, 44px targets, status never by colour alone, real
button/a, aria-label on icon-only controls, modals trap focus and close on Escape, decorative scene
layers aria-hidden and pointer-events:none.

AVOID gradients in markup · skin selectors or dark: in components · literal radii/shadows/blurs ·
white-at-opacity text · inverting dark to make light · identical rounded cards with identical shadows
· a skin that is only a colour change · two competing accents · floating labels · zebra striping
by default ·
boxed page on grey · hover-only functionality · ALL CAPS labels · "Something went wrong".
```

---

# Appendix C — One-page cheat sheet

```
AXES       data-theme (auto|light|dark) · data-skin · data-fidelity (auto|high|low) · data-dimension
ROLES      ground panel card raised overlay chrome well control primary   → class mat-{role}
SLOTS      --m-{role}-bg | -sheen | -edge | -shadow | -backdrop | -z   (control/primary: -hover-* -press-*)
SKIN VARS  --r-chip --r-control --r-card --r-sheet --stroke · --scene · --ease --dur --press-scale
           --shadow-sm/md/lg · --persp --tilt-max · --font-ui

COLOUR     canvas · surface-1..4 · ink · ink-2 · ink-3 · ink-4 (solid) · line/5 /10 /15 · accent · accent-ink
           success · warning · danger · info        (theme layer; skins never redefine)

RADIUS     rounded-chip · -control · -card · -sheet · -full     (aliases sm · DEFAULT · lg · xl)
           system 8/14/20/28 · soft pill/16/24 · minimal 6/8/10/12 · glass 12/16/24/32 · clay 14/20/28/36
           nested ALWAYS steps down one role

ELEVATION  0 ground · 1 panel/well · 2 card · 3 raised · 4 overlay     (how it is drawn = skin)
           hover = one level up · press = scale(--press-scale) · selected = level 3 + accent edge

TYPE       text-3xl bold tight display (1/screen) · text-xl semibold title · text-base body
           text-sm text-ink-2 subtext · text-xs text-ink-3 micro · numbers font-mono tabular-nums

SPACING    4px grid · p-4 default · py-2 px-3 dense · py-4 px-5 consumer · min-h-11 targets · max-w-prose

MOTION     transition-all duration-skin ease-skin active:scale-[var(--press-scale)]
           dismissals ease-skin-exit · interaction only · tilt = pointer only

CHROME     mat-chrome sticky top-0 (blur lives in the skin, not the markup)

BREAK      320 stack · 360 xs · 480 sm · 768 md split · 1024 lg rail · 1440 xl +inspector
           1920 2xl 3-col · 2560 3xl 4-col · 3200 4xl 4 regions
           md:tall: split · short: rail · touch: show hover actions · chrome fixed px · recompose

FALLBACK   no backdrop-filter · reduced-transparency · contrast:more · fidelity=low → solid, no sheen/scene/z
           blur cap: 4 elements @1920, 2 @430 · 3 blurred roles max per skin

3D         .stage{perspective} .stage-body{preserve-3d} · --m-*-z via `translate` · ±24px hit-target rule
           no filter/backdrop/opacity<1/overflow:hidden on ancestors · portal overlays · stage INSIDE scroller

FOCUS      focus-visible:ring-2 ring-accent ring-offset-2 ring-offset-canvas

NEVER      dark: or skin selectors in components · rounded-[..] shadow-[..] backdrop-* gradients in markup
           pure black (system) · white canvas (system) · repeated role nesting · two accents
           scroll animation · full-width bottom sheet on desktop · a skin that is only a colour swap
```

---

# Appendix D — Glossary

| Term | Meaning here |
|---|---|
| **Canvas** | Root background colour. The "desktop" the interface sits on. |
| **Scene** | What `<body>` paints (`--scene`); `system` = canvas, `glass` = ambient blobs. Always ends in solid canvas. |
| **Surface** | A fill representing one elevation level. |
| **Material** | A role's full appearance: fill, sheen, edge, shadow, backdrop, depth. |
| **Role** | One of nine fixed material names (`card`, `chrome`, …). Components name roles, never looks. |
| **Slot** | One property of a material (`--m-card-shadow`). |
| **Skin** | A typed bundle of materials, geometry, motion, scene and optional type. Compiled to one CSS file. |
| **Theme** | Colour channels and ink contrast (light/dark). Shared by every skin. |
| **Fidelity** | Whether expensive effects run (`high`/`low`/auto). |
| **Dimension** | Whether depth tokens become real Z-space (`flat`/`layered`/`3d`). |
| **Fallback** | The guaranteed solid, legible form of a skin. |
| **Sheen** | An `<image>` layer above the fill: highlight, specular, noise. |
| **Elevation** | How far forward something sits; expressed by the skin. |
| **Hairline** | A 1px border at 5–15% (or the skin's `edge`). |
| **Chrome** | Persistent furniture: top bars, tab bars, rails, sidebars. |
| **Scrim** | The black dimming layer behind modals and sheets. Not a skin role. |
| **Ink** | Text colour in four solid tiers. |
| **Accent / `accent-ink`** | The single action colour / the text colour that sits on its fill. |
| **Concentric** | Nested radii that step down a role so corners read as parallel. |
| **Recomposition** | Changing layout *structure* across breakpoints, not size. |
| **Density** | Row and card padding only; never colour, radius or material. |
| **DepthStage** | Wrapper providing perspective and pointer tilt under `3d`. |
| **SceneLayer** | A decorative `<canvas>` behind the DOM, for WebGL skins. |
| **Validator** | Build step that refuses a skin that fails schema, contrast, fallback, perf or 3D rules. |

---

# Appendix E — `packages/ui` implementation reference

This appendix documents the **as-built** `@ecomerece/ui` and the **skin-engine delta** to apply. §21 describes intent; this describes the code. When they disagree, fix one — don't let both drift.

## E.1 Package shape

```
packages/ui/
  index.ts                     barrel
  package.json                 exports ".", "./tokens.css", "./skin", "./skins/*"
  tsconfig.json                react-jsx, noEmit — typed, never compiled
  lib/
    cn.ts  focus.ts  useOverlay.ts  Portal.tsx
    skin/                      NEW  types.ts · compile.ts · validate.ts · useSkin.ts · bootstrap.ts
  skins/                       NEW  system.ts soft.ts minimal.ts glass.ts clay.ts neumorph.ts depth.ts index.ts
  styles/tokens.css            theme layer (§8) — hand-written
  scripts/build-skins.ts       NEW  → public/skins/*.css
  components/
    controls/   Button, IconButton, Switch, Checkbox, Radio, SegmentedControl, Slider, Range, NumberInput
    surface/    Card, IconTile, Avatar, Badge(+Chip, Tag, StatusDot), Rating, Separator, AspectRatio,
                ScrollArea, Kbd, Primitives (NEW — Div, Box, Container, Stack, HStack, Grid,
                Surface + Well/Raised/Panel/Chrome/Ground, Text, Heading)
    navigation/ AppShell, TopBar, Sidebar, BottomTabBar, IconRail, Tabs, Breadcrumb, Toolbar(+Button/Separator), TreeView, Link
    list/       GroupedList, ListRow, ListHeader, Accordion(+Item), Timeline
    data/       Table, DataGrid (virtualized), Pagination, Carousel, Progress, SegmentedMeter, Skeleton family, Spinner
    feedback/   ToastProvider + useToast, Banner, EmptyState, ErrorState, ConfirmDialog
    form/       Field, Input, Textarea, Select, SearchField, Combobox, DatePicker, TimePicker, OTP, FileUpload
    overlay/    Modal, BottomSheet, ActionSheet, SidePanel, Popover, Dropdown, Tooltip
    depth/      Stage3D + slabEngine (lazy), SceneBackdrop, blurGovernor
```

Import from the barrel: `import { Button, useToast, useSkin } from '@ecomerece/ui'`. Runtime dependency: `lucide-react` (pinned 0.468.0); `react`/`react-dom` are peers. Three.js is an **optional** peer, loaded only by `dom+webgl` skins.

## E.2 Conventions every component follows

- **Theming and skinning are token-only.** No `dark:`, no skin selectors; components use `mat-*`, role radii, `ease-skin`.
- **Motion:** `transition-all duration-skin ease-skin` + `active:scale-[var(--press-scale)]`; slides via `data-[open=true]:…` (static strings).
- **Focus** from the shared `focusRing()` helper (§26.2).
- **Touch targets** `min-h-11`; icon buttons `h-11 w-11`, smaller visuals via `-m-2 h-9 w-9`.
- **Truncation** per §15 (`min-w-0`, `truncate`, `shrink-0`).
- **A11y:** real elements, roles/aria as §26.4, `inert` on closed overlays, `aria-hidden` on decorative layers.
- **Class names written in full** (§28.5).

## E.3 Overlay plumbing

`Portal` renders into `document.body` once mounted (SSR-safe) — this also keeps overlays **outside** any 3D stage. `useOverlay({ open, onClose, trapFocus })` provides scroll lock, Escape, focus restore, and a Tab trap, exposing `containerRef`. `Modal`, `BottomSheet`, `SidePanel`, `ConfirmDialog` are always rendered with `data-open` and `inert` when closed (animation = CSS transition on the attribute). `Popover` is conditional-mount; `Dropdown` is fully controlled and positions against a supplied `triggerRef`.

## E.4 Material tokens

`tokens.css` carries `--glass` (white light / `36 38 43` dark) and the skin defaults (`--r-*`, `--stroke`, `--ease`, `--dur`, `--press-scale`, `--scene`, `--shadow-*`). **`glass:glass-surface` is retired:** frosted chrome is now just `mat-chrome`, and the `glass` skin supplies the blur values. TopBar/BottomTabBar/overlays no longer need an app-defined `glass:` variant.

## E.5 Component inventory — as-built API and target role

| Component | As-built key props / notes | Target role / classes under the engine |
|---|---|---|
| `Button` | `variant: primary · secondary · ghost · danger · destructive`, `size: sm · md · lg · icon`, `isLoading`, `loadingText`, `fullWidth`. Base is `rounded-full` | `primary → mat-primary`, `secondary → mat-control`, radius `rounded-control` (`soft` makes it a pill) |
| `IconButton` | `h-11 w-11 rounded-full`, requires `label` | `mat-control rounded-control` |
| `Switch` | `role=switch`, 48×28, thumb `bg-white` both themes | Track on `bg-accent`, off `mat-well rounded-full` |
| `Checkbox` | Native, `appearance-none`, `rounded-md`, indeterminate | `rounded-chip`; checked `mat-primary` |
| `Radio` | Native, `rounded-full`, `bg-accent-ink` dot | unchanged shape |
| `SegmentedControl` | `role=tablist`, track `bg-surface-3 p-1`, thumb `bg-surface-4` | Track `mat-well`, thumb `mat-overlay` |
| `Slider` | Span-drawn track/thumb + invisible native range | Track `mat-well`; thumb `mat-control` |
| `Card` | `rounded-2xl bg-surface-2 shadow-sm`, `padding`, header props | `mat-card rounded-card` |
| `IconTile` / `Avatar` / `Badge` / `Chip` / `Tag` / `StatusDot` | Tinted `bg-*/12` tiles; pills | `rounded-chip` + tinted fills; Avatar `rounded-full` |
| `AppShell` | Slots `rail · sidebar · main · inspector · fourth`, `md:tall:flex-row`, `h-dvh overflow-hidden` | `mat-ground` root; panes `mat-panel`; **do not wrap in DepthStage** |
| `TopBar` | Sticky, `bg-surface-1/95` + `glass:glass-surface` | `mat-chrome` |
| `Sidebar` / `IconRail` | `md:tall:flex` / `lg:flex`, active = surface step | `mat-panel` |
| `BottomTabBar` | Fixed, safe-area pad, collapses to 64px rail under `short:` | `mat-chrome` |
| `Tabs` | Filled-pill form | Skin-level variant (E.6 #7) |
| `GroupedList` / `ListRow` / `ListHeader` | `divide-y divide-line/10`, inset option | `mat-card rounded-card`; row `rounded-control` |
| `Table` | Generic columns, sortable, `density`, `maxHeight`, sticky opaque `thead`, per-column `show` | Shell `mat-card`; sticky header **opaque** in every skin |
| `Pagination` / `Progress` / `SegmentedMeter` / `Spinner` / `Skeleton*` | As before | Tracks `mat-well`; skeleton fill = skin `well` bg |
| `Sparkline` *(batch 9)* | `data`, `variant: line · bar`, `tone`, `label` | `role=img` + accent/semantic stroke/fill, hairline `non-scaling-stroke`; container material from caller |
| `DataBar` *(batch 9)* | `value`, `max`, `showValue` (+ `font-mono tabular-nums` readout) | `role=meter`, track `mat-well h-1.5`, token fill, `duration-skin-slow` |
| `MetricCard` *(batch 9)* | `label`, pre-formatted `value`, signed `trend` (+arrow & tone), `comparison` | `mat-card rounded-card`; hierarchy from type tokens, numbers `tabular-nums` |
| `ToastProvider` / `useToast` | Portal, max 3, bottom-centre → bottom-right at `sm:`, 4s/8s | `mat-overlay rounded-card` |
| `Banner` | Tinted `bg-*/10` panel | Skin variant: `system` rule form, `soft` tinted form |
| `EmptyState` / `ErrorState` / `ConfirmDialog` | As §24 | `ConfirmDialog` = `mat-overlay rounded-sheet` |
| `Field` / `Input` / `SearchField` / `Textarea` / `Select` | Pill wrapper, ring on wrapper | `mat-raised rounded-control`; Textarea `rounded-card` |
| `Modal` / `BottomSheet` / `ActionSheet` / `SidePanel` / `Popover` / `Dropdown` | As §21.9–§21.11 | `mat-overlay`; radii `rounded-sheet` / `rounded-t-sheet` / `rounded-l-sheet` / `rounded-card` |
| `DepthStage` *(new)* | Pointer tilt; no-op unless `data-dimension=3d` | Place inside the scroller |
| `SceneLayer` *(new)* | Lazy canvas; falls back to `--scene` | `aria-hidden`, `pointer-events-none` |

### E.5.1 Layout primitives — as-built (§21.19)

| Component | Key props / notes | Classes under the engine |
|---|---|---|
| `Div` / `Box` | Plain `div`, zero opinionated styling | caller's `className` only |
| `Container` | `width: prose \| shell`, `bleed` removes padding | `mx-auto max-w-prose / max-w-shell px-4 sm:px-6` |
| `Stack` / `HStack` | `gap: 0–8` (default 3), `align`, HStack `wrap` (default true) | `flex flex-col` / `flex flex-wrap` + `gap-*` + `items-{align}` |
| `Grid` | `cols: 1–4`; 1 col on phones, >=sm per `cols` | `grid grid-cols-1 gap-4 sm:grid-cols-*` |
| `Surface` | `material` (default `card`), `radius` (default `card`) | `mat-{material}` + `rounded-{radius}` |
| `Well` / `Raised` / `Panel` / `Chrome` / `Ground` | `Surface` one-line shortcuts | same |
| `Text` | `tone`, `size`, `as: p \| span` | `text-{tone}` + `text-{size}` |
| `Heading` | `level 1–6` → `hN`; `tone` | per-level type classes + `text-{tone}` |

Tests: `packages/ui/test/primitives.test.tsx` (10 cases — roles, gaps, widths, tone/size, hN mapping).

## E.6 Divergences — status after the skin engine

| # | Spec (v2) | Code | Status in v3.0 |
|---|---|---|---|
| 1 | Radius family 8/14/20/28; `rounded` controls | Pill controls, `rounded-2xl` cards, `rounded-md` checkbox | **Resolved as the `soft` skin** (§36.6); `system` keeps 8/14/20/28 |
| 2 | §21.13 badges `rounded-sm` squares | Badges/chips pills, borderless | **Resolved** — `--r-chip` in `soft` is 999px |
| 3 | Progress/meter tracks `bg-surface-1` wells | `bg-surface-3` | **Fixed in code**: tracks become `mat-well` (inset in every skin) |
| 4 | Skeleton `bg-line/8` | `bg-surface-3` | **Resolved**: skeleton uses the skin's `well` fill |
| 5 | Banner neutral body + `border-l-2` | Tinted panel | **Resolved per skin** (§24) |
| 6 | Chrome `bg-surface-3/72 backdrop-blur-sm` | `bg-surface-1/95` + app-provided `glass:` | **Resolved**: `mat-chrome` in the `system` skin = §14.1; no app plumbing |
| 7 | Underline tabs | Pill tabs | **Resolved**: skin-level variant (`soft` pill, `system` underline) |
| 8 | No dynamic class names (§28.5) | `SidePanel` builds `data-[open=true]:${revealed}` | **Bug — fix in the migration pass** (below) |
| 9 | Variant handling by plain concat | `cn.ts` filter-join, no `tailwind-merge` | Unchanged; add `tailwind-merge` only if a consumer must override utilities |

**Fix for #8.** Replace the template literal with two static strings chosen by `side`:

```tsx
const panel = side === 'right'
  ? 'right-0 translate-x-full data-[open=true]:translate-x-0 rounded-l-sheet'
  : 'left-0 -translate-x-full data-[open=true]:translate-x-0 rounded-r-sheet';
// …className={cn('fixed inset-y-0 z-modal mat-overlay transition-transform duration-skin-slow ease-skin', panel, widthClass)}
```

New divergence risks introduced by the engine, to watch in review: components that hard-code a radius or shadow "just this once"; a skin that duplicates another with one value changed; a 3D wrapper placed around `AppShell`.

## E.7 Host-app responsibilities

`packages/ui` ships tokens, skins and components but **not** the Tailwind setup. The consuming app must:

1. Import `@ecomerece/ui/tokens.css` as its theme layer and serve the compiled `skins/*.css` (always `system.css`; others on demand).
2. Configure Tailwind per §7, **including the `mat-*` plugin**, role radii and aliases, `skin` easing/duration utilities, the breakpoint scale with `tall/short/touch/fine`, and the z-index scale.
3. Inline the bootstrap script (§38.2) in `<head>` before any stylesheet.
4. Mount `ToastProvider` once near the root (`useToast()` throws without it).
5. Compose screens from `AppShell` + `TopBar` / `Sidebar` / `BottomTabBar` / `IconRail`; the shell owns `h-dvh`, pane visibility prefixes and the fluid `min-w-0` main region.
6. Expose the skin picker (reads the registry), the theme control (Auto/Light/Dark) and a "Reduce effects" switch (`data-fidelity="low"`).
7. Run the validator and CI gates (§41) on every change to `skins/` or `tokens.css`.

---

# Appendix F — Skin authoring checklist

Before opening a PR for a new skin:

**Identity**
- [ ] `id` matches `^[a-z0-9-]{1,32}$`; `label` is a noun
- [ ] It changes **material, geometry and motion** — not just colour or one radius
- [ ] It does not duplicate an existing skin with a single value changed
- [ ] `cost` and `a11yTier` are honest

**Materials**
- [ ] All nine roles resolve in light **and** dark (defined or inherited)
- [ ] Gradients live in `sheen` / `scene` only; `bg` is always a `<color>`
- [ ] No backdrop on `control`, `raised` or `well`; ≤3 blurred roles; overlay fill ≥ 78% if translucent
- [ ] Sticky table header resolves opaque
- [ ] `well` is inverted relative to `card` (inset)
- [ ] No colour channel is redefined

**Geometry and motion**
- [ ] `chip ≤ control ≤ card ≤ sheet`, no zero radius on a container role
- [ ] `--stroke` chosen deliberately; if `0`, a ≥3:1 fill gap or `contrastEdge` exists
- [ ] `dur ≤ 400ms`; `press ∈ [.9, 1]`; overshoot only on scale/translate of the touched element

**Accessibility and fallback**
- [ ] Text contrast passes on the **worst-case scene composite** in both themes
- [ ] UI boundaries ≥ 3:1 (or `AA-with-fallback` + `contrastEdge`)
- [ ] Focus ring ≥ 3:1 (or `--focus-ring-boost` set)
- [ ] Legible under `fidelity=low`, `prefers-reduced-transparency`, `prefers-contrast: more`, no `backdrop-filter`
- [ ] `fallback` is `self`, `solid` or a real skin id

**3D (if any)**
- [ ] `dimension: '3d'` and `needs` includes `preserve-3d`
- [ ] `control.z ≤ 8px`; blur only on `chrome` / `overlay`
- [ ] Tested with `DepthStage` inside the scroller, overlays portalled, tilt off under reduced motion

**Layout**
- [ ] Verified at 320×568, 932×430, 1366×768, 3840×2160 in both themes
- [ ] No horizontal page scroll, no target under 44px, rail still replaces the tab bar at `short:`

**Performance**
- [ ] ≤4 blurred elements at 1920×1080, ≤2 at 430px
- [ ] ≤5 shadow layers per control
- [ ] Compiled CSS ≤ 6 KB gzipped

---

*End of specification. Version 3.0 = v2.0 + the Skin Engine (Part VII). The companion visual reference should render every token, role, skin and breakpoint in both themes; use it to eyeball changes before the gates run.*
### E.5.2 Typography add-ons — as-built (batch 10)

| Component | As-built key props / notes | Target role / classes under the engine |
|---|---|---|
| `LineClamp` | `as?: ElementType`, `lines?: number`, `clamp?: number \| string`. Applies `overflow-hidden` + `-webkit-line-clamp`/`-webkit-box-orient: vertical`. | utility-only; surface typography helper, no `mat-*` |
| `LineClampText` | `lines?: number` (default 2), renders `<p>` via `LineClamp as="p"`. | paragraph-specific convenience |
| `TimeAgo` | `date: Date \| string \| number`, `formatter? (d)=>string`. Renders `<time>` with `dateTime`. | data display, tabular friendly; formatter overrides locale string |
| `TimeDifference` | `start`, `end: Date \| string \| number`, `formatter? (ms)=>string`. Returns diff in `ms` (max 0). | interval display helper |

### E.5.3 Time & date — as-built (batch 11)

| Component | As-built key props / notes | Target role / classes under the engine |
|---|---|---|
| `TimezoneClock` | `timezone?: string`, `formatOptions?`, `intervalMs=1000`. Updates every second; renders `<time>`. | live clock helper; uses locale formatting |
| `Countdown` | `target: Date \| string \| number`, `onComplete?`, `formatter?`, `intervalMs=1000`. Counts down to target; stops at 0. | timer display |
| `Duration` | `ms: number`, `formatter?`, `precision: 's' \| 'ms' = 's'`. Rounds seconds by default. | duration formatter |

### E.5.4 Scorecard & health — as-built (batch 12)

| Component | As-built key props / notes | Target role / classes under the engine |
|---|---|---|
| `StatTile` | `label`, `value: ReactNode`, `hint?`, `trend?: up\|down\|flat`. Card with `role="status"`. | KPI tile; `mat-card rounded-card`; trend colored by direction |
| `SLAIndicator` | `status: ok\|warn\|breach`, `label?`. Dot + label; `role="status"`. | SLA status indicator |

### E.5.5 Overlays & hints — as-built (batch 13)

| Component | As-built key props / notes | Target role / classes under the engine |
|---|---|---|
| `HoverCard` | `trigger: ReactNode`, `content: ReactNode`, `side: top\|right\|bottom\|left`. Shows on hover/focus-within; uses `role="tooltip"`, `mat-overlay rounded-card`. | lightweight hover hint (CSS-only) |

### E.5.6 Pagination v2 — as-built (batch 14)

| Component | As-built key props / notes | Target role / classes under the engine |
|---|---|---|
| `Pagination` *(v2)* | base `page`/`pageCount`/`onPageChange`. Adds `showFirstLast`, `showJump`, `totalItems`, `pageSize` + `pageSizeOptions` + `onPageSizeChange`. Native select/input styled `mat-control`. | First (ChevronsLeft) / Prev / windowed pages / Next / Last (ChevronsRight); jump input commits on Enter/blur |

### E.5.7 Breadcrumb variants — as-built (batch 15)

| Component | As-built key props / notes | Target role / classes under the engine |
|---|---|---|
| `Breadcrumb` *(v2)* | items gain `icon?`; props gain `separator?`, `maxVisible?`, `collapsedLabel?`. When `items.length > maxVisible`, middle crumbs collapse into a `<details>` dropdown (first + trailing `maxVisible-1` stay visible). | `rounded-chip`, `focusRing()`, `mat-overlay` dropdown panel |

### E.5.8 Mini hooks — as-built (batch 16)

| Hook | Signature / notes |
|---|---|
| `useToggle` | `(initial=false) => [value, toggle, setValue]` — stable toggle identity |
| `usePrevious` | `<T>(value: T) => T \| undefined` — prior render's value |
| `useInterval` | `(cb, delay: number \| null)` — `null` pauses; latest cb always used |
| `useTimeout` | `(cb, delay: number \| null)` — `null` cancels; latest cb always used |
| `useClickAway` | `(ref, handler, enabled=true)` — fires on outside `mousedown`/`touchstart` or `Escape` |

### E.5.9 Table add-ons — as-built (batch 17)

`Table<T>` gained four optional props (all backward compatible):

| Prop | Type | Notes |
|---|---|---|
| `selectedKeys` | `Array<string \| number>` | controlled selection |
| `onSelectedKeysChange` | `(keys) => void` | presence enables the select column |
| `bulkBar` | `(selected, clear) => ReactNode` | bar shown above the table while rows are selected |
| `summary` | `ReactNode[]` | cells aligned to `columns`, rendered in `<tfoot>` |
| `columnGroups` | `{ label, span, align? }[]` | grouped header row above the column headers (`scope="colgroup"`, spans in column order; completion of the batch 17 wishlist row) |

The select column uses a header select-all (tri-state via `aria-checked="mixed"`) plus per-row
checkboxes; selection is click-driven (not change-driven) so it is harness-stable. Selected rows
get an `bg-accent/5` wash. Sortable headers keep the existing `SortButton` chevrons
(`ChevronsUpDown` idle → `ArrowUp`/`ArrowDown`).

### E.5.10 Commerce quick wins — as-built (batch 18)

| Component | Dir | Notes |
|---|---|---|
| `CartDrawer` | overlay | Mini cart built on `SidePanel`; `CartLine[]` with qty steppers (`Minus`/`Plus`), remove, subtotal + checkout, empty state. Controlled via `onQtyChange`/`onRemove`. |
| `PromoCode` | data | Promo-code chip: `state: 'available' \| 'applied' \| 'invalid'`; interactive apply/remove when handlers supplied, otherwise static. |
| `StockIndicator` | data | `level: 'in-stock' \| 'low-stock' \| 'out-of-stock' \| 'preorder'`; status-token dot + text label (never colour-only), optional `count` → "N left". |

`SidePanel.tsx` gained the `/** @jsxImportSource react */` pragma because it is now rendered by `CartDrawer` tests.

### E.5.11 Every Layout patterns — as-built (batch 19)

Added to `components/surface/Primitives.tsx` (exported from the surface barrel):

| Primitive | Signature | Notes |
|---|---|---|
| `Frame` | `ratio?: 'square' \| 'video' \| 'photo' \| 'portrait' \| 'wide' \| 'none'` | aspect-locked crop; direct children stretched + `object-fit: cover` |
| `Bleed` | `vertical?: boolean` | escapes `Container` gutters (`-mx-4 sm:-mx-6`, full-width calc) |
| `Cluster` | `gap?`, `justify?: 'start' \| 'between' \| 'center' \| 'end'`, `align?` | wrapping row with horizontal distribution |
| `Switcher` | `gap?` | row above `40rem`, column below (flex-basis recipe, no container query) |

No raw theme tokens are referenced; `Switcher`'s threshold is a stable layout constant baked into the utility class (keeps the `fast-path` markup contract green).

### E.5.12 Every Layout patterns II — as-built (batch 20)

Added to `components/surface/Primitives.tsx` (exported from the surface barrel):

| Primitive | Signature | Notes |
|---|---|---|
| `Reel` | `gap?`, `snap?: boolean` | horizontal scroll rail; children `shrink-0`, optional snap |
| `SidebarLayout` | `gap?`, `side?: 'left' \| 'right'` | 16rem sidebar + flexible content, stacks when narrow. Named `SidebarLayout` to avoid clashing with the navigation `Sidebar` widget |
| `Imposter` | `fixed?: boolean`, `contain?: boolean` | centers its child on both axes; `fixed` pins to the viewport (overlay backdrop) |
| `Cover` | `gap?`, `minHeight?: string` (default `100vh`) | fills block-size, pins first/last children to edges, centers the middle |

No raw theme tokens referenced (markup contract stays green). `Sidebar`/`SidebarProps` already exist in `components/navigation`, hence the distinct `SidebarLayout` name.

### E.5.13 Floating surfaces — as-built (batch 21)

Added to `components/overlay/` (exported from the overlay barrel):

| Component | Signature | Notes |
|---|---|---|
| `PinnedPanel` | `edge?: 'top' \| 'bottom' \| 'left' \| 'right'`, `role?: 'chrome' \| 'overlay' \| 'panel'` | `position: fixed` panel pinned to a viewport edge |
| `FloatingPanel` | `title?`, `defaultPosition?`, `draggable?`, `onClose?`, `widthClass?` | absolutely-positioned panel; drag by header grip via pointer events (document listeners) |
| `PipContainer` | `corner?`, `label?`, `expanded?`, `onToggle?`, `onClose?` | corner-docked picture-in-picture mini container with expand/collapse |
| `PopoutPanel` | `open`, `title?`, `children`, `onClose?`, `width?`, `height?`, `fallback?` | opens a real browser window and `createPortal`s children into it; mirrors theme attrs + stylesheets; falls back inline when popups are blocked (latest `onClose` held in a ref so re-renders don't reopen) |

All four use `mat-*` roles + token utilities only (markup contract stays green).

### E.5.14 Column layout — as-built (batch 22)

Added to `components/surface/Primitives.tsx` (exported from the surface barrel):

| Primitive | Signature | Notes |
|---|---|---|
| `MultiColumn` | `count?: 2 \| 3 \| 4`, `gap?: string` (default `2rem`) | newspaper text flow via CSS `column-count` |
| `Columns` | `min?: string` (default `16rem`), `gap?: string` (default `1rem`) | auto-fit responsive grid (`repeat(auto-fit, minmax(min, 1fr))`) |
| `Gutter` | `size?: StackGap` (default 4) | vertical rhythm between flow siblings via `[&>*+*]:mt-*` |
| `Offset` | `start?`, `span?` (default 1), `columns?` | explicit `grid-column` placement in a grid parent |
| `Push` / `Pull` | `amount?: string` (default `1rem`) | `translateX` nudges that don't affect surrounding layout |

No raw theme tokens referenced (markup contract stays green).

### E.5.15 Responsive visibility — as-built (batch 23)

Added to `components/surface/Primitives.tsx` (exported from the surface barrel):

| Primitive | Signature | Notes |
|---|---|---|
| `Show` | `above?: Breakpoint` (default `md`) | renders children only at `above` and wider |
| `Hide` | `above?: Breakpoint` (default `md`) | renders children only below `above` |
| `VisuallyHidden` | `as?: 'span' \| 'div'`, `focusable?: boolean` | `sr-only`; `focusable` adds `focus:not-sr-only` reveal (skip links) |

`Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'`.

### E.5.16 Sticky layout — as-built (batch 24)

New file `components/surface/Sticky.tsx` (exported from the surface barrel):

| Primitive | Signature | Notes |
|---|---|---|
| `StickySidebar` | `top?: string` (default `1rem`), `bottom?`, `axis?: 'y' \| 'x'` | sticky child with `self-start` for flex/grid columns |
| `StickyToc` | `items: TocItem[]`, `activeId?`, `title?`, `top?`, `onSelect?` | sticky `<nav>` of anchor links; active item gets `border-accent` + `aria-current` |
| `StickyCtaBar` | `action?`, `position?: 'bottom' \| 'top'` | `mat-chrome` bar pinned to a container edge |

`TocItem = { id: string; label: ReactNode }`.

### E.5.17 Scroll utilities — as-built (batch 25)

New file `components/feedback/ScrollUtils.tsx` (exported from the feedback barrel):

| Export | Signature | Notes |
|---|---|---|
| `ScrollProgress` | `value?: number` (controlled `0..1`), `position?: 'top' \| 'bottom'` | `role="progressbar"` bar; tracks `window` scroll when uncontrolled |
| `useScrollSpy` | `(ids: string[], { offset?: number })` | returns the active section id by scroll position |
| `ScrollSpy` | `items: TocItem[]`, `spyOffset?` | `StickyToc` with active item driven by `useScrollSpy` |
| `ScrollReveal` | `visible?`, `once?` (default true) | `IntersectionObserver` fade+rise; controlled via `visible` |
| `ScrollToTop` | `threshold?` (default 400), `visible?`, `onClick?` | floating button; smooth-scrolls to top unless `onClick` given |

`aria-valuenow` clamps to `0..100`. Progress fill uses `bg-accent`.

### E.5.18 Galleries — as-built (batch 26)

New file `components/surface/Gallery.tsx` (exported from the surface barrel):

| Export | Signature | Notes |
|---|---|---|
| `MosaicGrid` | `columns?` (4), `rowHeight?` (`8rem`), `gap?` | equal tracks; auto-placed items |
| `MosaicItem` | `colSpan?`, `rowSpan?` | spans N columns/rows in a `MosaicGrid` |
| `Bento` | `columns?` (4), `rowHeight?` (`7rem`), `gap?` | fixed-height bento tracks |
| `BentoCell` | `col?`, `row?`, `colSpan?`, `rowSpan?` | explicit grid placement inside `Bento` |
| `MasonryBoard` | `columns?: 2 \| 3 \| 4` (3), `gap?` | CSS multi-column masonry; children `break-inside-avoid` |
| `JustifiedGallery` | `items: JustifiedImage[]`, `rowHeight?` (180px), `gap?`, `onSelect?` | proportional flex tiles; buttons when `onSelect` set |

`JustifiedImage = { src: string; alt: string; aspect?: number }`.

### E.5.19 Mobile layout — as-built (batch 28)

New file `components/surface/Mobile.tsx` (exported from the surface barrel):

| Export | Signature | Notes |
|---|---|---|
| `SafeArea` | `edges?: SafeAreaEdge[]` (all) | applies `env(safe-area-inset-*)` padding; `data-edges` mirrors the set |
| `KeyboardAvoidingView` | `behavior?: 'padding' \| 'height'`, `offset?: number` | reserves keyboard height from `visualViewport`; `offset` controls it directly |
| `PullToRefresh` | `onRefresh?`, `threshold?` (64), `disabled?` | pointer-drag past threshold fires `onRefresh`; spinner while promise settles |

`SafeAreaEdge = 'top' | 'right' | 'bottom' | 'left'`. Note: happy-dom drops `env()`
values, so `SafeArea` tests assert the `data-edges` contract rather than computed padding.

### E.5.20 Swipe gestures — as-built (batch 29)

New file `components/surface/Swipe.tsx` (exported from the surface barrel):

| Export | Signature | Notes |
|---|---|---|
| `Swipeable` | `onSwipe?: (dir: SwipeDirection) => void`, `threshold?` (40), `disabled?` | pointer swipe; dominant axis wins |
| `SwipeActions` | `actions: SwipeAction[]`, `threshold?` (48), `disabled?` | list row that latches open (`data-open`) and reveals trailing actions |

`SwipeDirection = 'left' | 'right' | 'up' | 'down'`;
`SwipeAction = { label; icon?; tone?: 'default' | 'danger'; onAction? }`, each action a `4.5rem` slot.

### E.5.21 Orientation — as-built (batch 30)

New file `components/surface/Orientation.tsx` (exported from the surface barrel):

| Export | Signature | Notes |
|---|---|---|
| `useOrientation` | `(): 'portrait' \| 'landscape'` | derives from viewport width/height; updates on resize/rotation |
| `Orientation` | `portrait?`, `landscape?`, `orientation?` (controlled) | renders the matching branch, else `children`; mirrors `data-orientation` |

`OrientationValue = 'portrait' | 'landscape'`.

### E.5.22 Typography variants — as-built (batch 31)

Added to `components/surface/Primitives.tsx` (exported from the surface barrel):

| Export | Signature | Notes |
|---|---|---|
| `Display` | `size?: 'sm' \| 'md' \| 'lg'` (md), `tone?`, `as?` (h1) | oversized hero text (4xl/5xl/6xl) |
| `Subtitle` | `size?: 'sm' \| 'md'` (md), `tone?` (ink-2), `as?` (p) | medium-weight supporting line |

### E.5.23 Text effects — as-built (batch 32)

New file `components/surface/TextEffects.tsx` (exported from the surface barrel):

| Export | Signature | Notes |
|---|---|---|
| `GradientText` | `material?: TextEffectRole` (primary), `as?` (span) | `background-clip: text` painted from `--m-<role>-sheen`/`-bg` — skin-owned gradient |
| `OutlineText` | `material?`, `strokeWidth?` (`1px`), `as?` | `-webkit-text-stroke` from `--m-<role>-bg`; transparent fill |

`TextEffectRole` = the nine `mat-*` material roles. Neither component names a raw colour:
the gradient/stroke is resolved through the skin's `--m-<role>-*` indirection (so this batch's
"gradients are a skin decision" caveat is satisfied).

### E.5.24 Animated text — as-built (batch 33)

New file `components/surface/AnimatedText.tsx` (exported from the surface barrel):

| Export | Signature | Notes |
|---|---|---|
| `Typewriter` | `text`, `speed?` (40), `startDelay?`, `cursor?`, `visibleChars?` (controlled), `onDone?` | types char by char; `data-done` |
| `FadeInText` | `show?` (controlled) | fades in on mount or when `show` flips; `data-visible` |
| `WordRotator` | `words`, `interval?` (2200), `index?` (controlled) | cycles words; `data-index` |
| `ScrambleText` | `text`, `revealed?` (controlled), `speed?` | de-scrambles left to right; `data-revealed` |
| `SplitText` | `text`, `by?: 'char' \| 'word'`, `show?`, `stagger?` (40) | staggered pieces + `sr-only` full text |

All accept a controlled prop so they render deterministically in tests.

### E.5.25 Editorial — as-built (batch 34)

New file `components/surface/Editorial.tsx` (exported from the surface barrel):

| Export | Signature | Notes |
|---|---|---|
| `DropCap` | `size?: 'sm' \| 'md' \| 'lg'` (md) | `first-letter:` drop cap |
| `PullQuote` | `cite?`, `align?: 'left' \| 'center'` | `<figure>` + `<blockquote>` + attribution |
| `FootnoteRef` | `id`, `index` | `<sup><a href="#fn-<id>">` marker |
| `Footnote` | `id`, `index` | `<li id="fn-<id>">` with back-reference |
| `FootnoteList` | `heading?` | `<section>` grouping `<ol>` of notes |
| `Citation` | `href?`, `author?`, `year?` | inline `<cite>`, link when `href` |

### E.5.26 Inline — as-built (batch 35)

New file `components/surface/Inline.tsx` (exported from the surface barrel):

| Export | Signature | Notes |
|---|---|---|
| `InlineBadge` | `tone?: 'neutral' \| 'accent' \| 'success' \| 'warning' \| 'danger'` (neutral) | compact pill, sibling of `Chip` |
| `Abbr` | passes `title` | `<abbr>` with dotted underline + help cursor |
| `Definition` | `term`, `definition` | focusable `<button><dfn>` trigger + `aria-describedby` tooltip (`role="tooltip"`, hover/focus reveal) |
| `Code` | — | inline monospace `<code>` chip |

### E.5.27 Inline text — as-built (batch 36)

New file `components/surface/InlineText.tsx` (exported from the surface barrel):

| Export | Signature | Notes |
|---|---|---|
| `Mention` | `href?` | `@handle` accent text; `<a>` + hover underline when `href` |
| `Hashtag` | `href?` | `#tag` accent text; `<a>` + hover underline when `href` |
| `Emoji` | `label?` | inline-block, baseline-safe; `role="img"` + `aria-label` when labeled, else `aria-hidden` |
| `TextDiff` | `before`, `after`, `by?: 'word' \| 'char'` (word) | LCS diff; `<del>` danger/strike + `<ins>` success/underline |

### E.5.28 Read more — as-built (batch 37)

New file `components/surface/ReadMore.tsx` (exported from the surface barrel):

| Export | Signature | Notes |
|---|---|---|
| `ReadMore` | `lines?` (3), `moreLabel?` ("Read more"), `lessLabel?` ("Show less"), `expanded?` (controlled), `onExpandedChange?` | CSS `line-clamp` collapse; toggle is a real `<button>` with `aria-expanded`/`aria-controls`; `focusRing()` + `active:scale-[var(--press-scale)]` |

### E.5.29 todo/08 completion — as-built (batches 11/12/17/18 leftovers)

Closes every open row traced back to `todo/08` in the master backlog:

| Export | File | Signature | Notes |
|---|---|---|---|
| `Stopwatch` | `data/Stopwatch.tsx` | `running?` (controlled), `autoStart?`, `initialMs?`, `intervalMs?` (50), `formatter?`, `controls?`, `onChange?`, `onReset?`, `onRunningChange?` | wall-clock accurate (Date.now deltas, no tick drift); `role="timer"`; optional Start/Pause + Reset buttons (`mat-control`, `focusRing()`, press scale) |
| `formatStopwatch` | `data/Stopwatch.tsx` | `(ms) => string` | `mm:ss.cc` (or `h:mm:ss.cc` past an hour) |
| `BusinessHours` | `data/BusinessHours.tsx` | `open`, `close` (24h `HH:MM`), `timezone?`, `days?` (Mon–Fri), `now?` (frozen clock), `openLabel?`, `closedLabel?`, `showNext?` | open/closed dot + `closes 5:00 PM` / `opens Mon 9:00 AM`; `role="status"` |
| `businessStatus` / `parseHm` / `formatClock12` | `data/BusinessHours.tsx` | pure helpers | timezone-correct via `Intl` weekday/hour parts, `local` fallback on error |
| `GaugeKPI` | `data/GaugeKPI.tsx` | `label`, `value`, `min?`, `max?` (100), `hint?`, `format?` | 270° SVG arc, `surface-3` track + `accent` value (§23: solid tokens, no gradients), `role="img"` + descriptive `aria-label` |
| `SyncStatus` | `data/Status.tsx` | `state: synced \| syncing \| offline \| error`, `lastSyncedAt?`, `label?` | dot + text, `role="status" aria-live="polite"`, optional `<time>` stamp |
| `SaveStatus` | `data/Status.tsx` | `state: saved \| saving \| error \| idle`, `label?` | document save line (`All changes saved` / `Saving…` / `Couldn't save changes`) |
| `ConnectionQuality` | `data/Status.tsx` | `level: good \| fair \| poor \| offline`, `label?` | 4-bar signal glyph (filled = accent), `role="img"` + `aria-label` |
| `BatteryIndicator` | `data/Status.tsx` | `level` (0–100, clamped), `charging?`, `showLabel?`, `label?` | battery glyph; red ≤20 ≤ amber ≤50 < green; `role="img"` |
| `Table.columnGroups` | `data/Table.tsx` | `{ label, span, align? }[]` | colgroup row above the column headers (see E.5.9) |

Tests: `test/batch08-completion.test.tsx` (15 cases). Design page: "todo/08 completion —
stopwatch · business hours · gauge · status" section (data tab) + grouped headers on the
batch 17 table demo.

### E.5.30 Effect buttons — as-built (batch 38, todo/09 §C)

New file `components/controls/EffectButton.tsx` (exported from the controls barrel).
The visual identity of each effect is a SKIN decision — components bind tokens only:
shimmer reads `--m-<role>-sheen`, glow reads `--m-<role>-glow`, ripple paints with
`currentColor`, magnetic is transform-only. A new optional `Material.glow?` slot
(emitted as `--m-<role>-glow`) lets a skin own the emissive halo — `cyber` overrides
it in dark mode with `rgb(var(--k-hue-1))`; every other skin falls back to
`rgb(var(--accent))`, so no component ever names a literal colour.

| Export | Signature | Notes |
|---|---|---|
| `EffectButton` | `effect: 'ripple' \| 'magnetic' \| 'shimmer' \| 'glow'`, `variant?: 'primary' \| 'secondary'`, `material?` (role), `strength?` (6) | one button, four effects; `mat-primary`/`mat-control` role fill |
| `RippleButton` | `EffectButtonProps` minus `effect` | `onPointerDown` spawns a `currentColor` ripple (`.fx-ripple`) |
| `MagneticButton` | ″ | pointer-follow translate (`strength`, default 6px); reduced-motion aware; resets on leave |
| `ShimmerButton` | ″ | `--m-fx-sheen` overlay (`.fx-shimmer`) sweeps once on hover/focus — no looping animation (I6) |
| `GlowButton` | ″ | `--m-fx-glow-color` drop-shadow halo on hover/focus |

CSS primitives (`.fx-btn`/`.fx-shimmer`/`.fx-glow`/`.fx-ripple` + `fx-ripple` keyframes)
live in `styles/engine.css` utilities layer.

Tests: `test/batch38-effects.test.tsx` (5 cases). Design page: "Effect buttons (batch 38)"
section (controls tab).

### E.5.31 Gradient border button — as-built (batch 39, todo/09 §C)

New file `components/controls/GradientBorderButton.tsx` (exported from the controls
barrel). A single `<button>` whose 1px ring is drawn by a masked `::before` pseudo
(`.fx-gradbtn`, utilities layer of `engine.css`): `linear-gradient(135deg, …)` over
`--m-<role>-glow` → `--m-<role>-edge`, with token fallbacks supplied in CSS
(`--m-fx-grad-a/b-fallback`) so markup stays `--m-*`-only. The variant fill
(`mat-primary`/`mat-control`) sits under the ring; the label is a `relative z-10`
span so the ring never covers it.

| Export | Signature | Notes |
|---|---|---|
| `GradientBorderButton` | `variant?: 'primary' \| 'secondary'`, `size?: 'sm' \| 'md' \| 'lg'`, `material?` (role) + native button props | ring source defaults to the variant role; `material` overrides it |

Tests: `test/batch39-gradient-border.test.tsx` (4 cases). Design page: "Gradient border
button (batch 39)" section (controls tab).

### E.5.32 Confirmation controls — as-built (batch 40, todo/09 §C)

New file `components/controls/Confirm.tsx` (exported from the controls barrel). Three
gesture gates that must be satisfied before `onConfirm` fires — no accidental
destructive taps. Fills use theme token utilities (`bg-accent/25`, `bg-danger`) and the
`mat-*` roles; no raw custom properties (markup-contract clean).

| Export | Signature | Notes |
|---|---|---|
| `HoldToConfirmButton` | `onConfirm?`, `duration?` (1200), `variant?` (`danger`\|`primary`\|`secondary`), `size?`, `holdingLabel?`, `confirmedLabel?` + native props | interval-driven fill (`bg-accent/25`); releases early cancel; keyboard hold (Space/Enter) works |
| `SwipeToConfirm` | `onConfirm?`, `threshold?` (0.9), `thumbLabel?`, `disabled?` | `mat-well` track + `mat-primary` thumb; confirms when dragged past `threshold × (width − height)`; keyboard Enter/Space confirms |
| `DoubleClickToConfirm` | `onConfirm?`, `timeout?` (400), `variant?`, `size?`, `armedLabel?` | first click arms (`data-armed`, shows `armedLabel`), second within `timeout` confirms; disarm timer clears on unmount |

Tests: `test/batch40-confirm.test.tsx` (4 cases). Design page: "Confirmation controls
(batch 40)" section (controls tab).

### E.5.33 Timed buttons — as-built (batch 41, todo/09 §C)

New file `components/controls/Cooldown.tsx` (exported from the controls barrel). Three
time-gated buttons sharing one 250ms interval loop so the visible remaining time is
consistent. Labels accept render functions for localisation; `aria-live="polite"` and
`data-cooling`/`data-counting` expose state. `mat-*` + theme token utilities only.

| Export | Signature | Notes |
|---|---|---|
| `CooldownButton` | `seconds?` (30), `onActivate?`, `cooldownLabel?(secondsLeft)`, `variant?`, `size?` + native props | disabled while cooling; fires `onActivate` then starts the cooldown |
| `ResendCodeButton` | `onResend?`, `seconds?` (30), `resendLabel?` ("Resend code"), `coolingLabel?` | thin `CooldownButton` wrapper; default cooling label "Resend in {s}s" |
| `CountdownButton` | `seconds?` (5), `onComplete?`, `countdownLabel?(secondsLeft)`, `variant?`, `size?`, `auto?` (true) | counts down on mount, disabled while counting, then re-enables and fires `onComplete` |

Tests: `test/batch41-timed-buttons.test.tsx` (3 cases). Design page: "Timed buttons
(batch 41)" section (controls tab).

### E.5.34 Chip-button family — as-built (batch 42, todo/09 §C)

New file `components/controls/ChipButton.tsx` (exported from the controls barrel) —
interactive variants of the static `Chip`/`Tag`. Selection swaps the `mat-control`
role for `mat-primary`; the semantics match the flavour (`radio` for choice, `tab` for
tabs, `aria-pressed` for toggles, none for input). Removal uses a **two-sibling-button
composition** (`<span>` container with a label `<button>` + a remove `<button>`) so a
button is never nested in a button. `mat-*` + theme token utilities only.

| Export | Signature | Notes |
|---|---|---|
| `ChipButton` | `variant?: 'chip'\|'filter'\|'choice'\|'suggestion'\|'tab'\|'input'`, `selected?`, `onSelectedChange?`, `leading?`, `removable?`, `onRemove?`, `removeLabel?` + native props | one component, all variants |
| `FilterChip` | `ChipButtonProps` minus `variant` | toggle, `aria-pressed` |
| `ChoiceChip` | ″ | `role="radio"` + `aria-checked` |
| `SuggestionChip` | ″ | toggle, `aria-pressed` |
| `TabChip` | ″ | `role="tab"` + `aria-selected` |
| `InputChip` | `ChipButtonProps` minus `variant`/`onSelectedChange` | `removable` defaults true; token/avatar + remove |

Tests: `test/batch42-chip-buttons.test.tsx` (6 cases). Design page: "Chip-button family
(batch 42)" section (controls tab).

### E.5.35 Nav buttons — as-built (batch 55, todo/09 §C)

`components/controls/NavButtons.tsx`: `ArrowButton` (four-direction chevron), `StepperButtons`
(`±` pair with `min`/`max` clamping and an optional value slot), `ScrollButton` (nudges a
`target` ref or the window by `amount` px). `mat-*` + tokens only.
Tests: `test/batch55-nav-buttons.test.tsx` (3 cases).

### E.5.36 Window & panel chrome — as-built (batch 56, todo/09 §C)

`components/controls/WindowButtons.tsx` — `ExpandCollapseButton` (rotating chevron +
`aria-expanded`), `FullscreenButton` (Fullscreen API, tracks `fullscreenchange`),
`WindowControls` (glyph mode + macOS `traffic` dots). `mat-*` + theme tokens only.

Tests: `test/batch56-window-buttons.test.tsx` (4 cases).

### E.5.37 Viewport transform controls — as-built (batch 57, todo/09 §C)

`components/controls/ViewportControls.tsx` — `ZoomControls` (clamped, % readout),
`PanPad` (d-pad emitting `(dx,dy)` vectors), `RotateControl` (wraps 0–359°).
`mat-*` + theme token utilities only.

### E.5.38 Media controls — as-built (batch 57, todo/09 §C)

`components/controls/MediaControls.tsx` — `MediaControls` transport bar (shuffle · prev ·
play/pause · stop · next · repeat) and standalone `PlayPauseButton`. Repeat cycles
`'off' | 'all' | 'one'`. Play/pause uses the `mat-primary` fill + `active:scale-[var(--press-scale)]`.

Tests: `test/batch57-media-controls.test.tsx` (5 cases). Design page: "Zoom, pan, rotate &
media controls (batch 57)" section (controls tab).

### E.5.39 Call-controls family — as-built (batch 58, todo/09 §C)

New file `components/controls/CallControls.tsx` — `MicButton`, `CameraButton`,
`ScreenShareButton`, `EndCallButton` and the `CallControls` cluster. Active device =
`mat-primary`; muted/camera-off/end = `bg-danger`; `aria-pressed` reflects the on/off state.

Tests: `test/batch58-call-controls.test.tsx` (3 cases). Design page: "Call controls (batch
58)" section (controls tab).

### E.5.40 Contextual toolbars — as-built (batch 59, todo/09 §C)

New file `components/navigation/FloatingToolbar.tsx` — `FloatingToolbar` (fixed-position
`mat-overlay` panel, `x`/`y` + `placement`), `BubbleMenu` (text-selection menu; `mousedown`
`preventDefault` so the selection survives), `InlineToolbar` (compact inline strip). All expose
`role="toolbar"`.

Tests: `test/batch59-toolbars.test.tsx` (3 cases). Design page: "Floating, bubble & inline
toolbars (batch 59)" section (controls tab).

### E.5.41 Handles — as-built (batch 60, todo/09 §C)

New file `components/controls/Handles.tsx` — `DragHandle`, `GripDots`, `GripButton`,
`ResizeHandle` (`edge: horizontal|vertical|corner`, `onResize` on pointer-down,
`data-resize-edge`), `PullHandle` (bottom-sheet pill). Interactive handles are real buttons.

Tests: `test/batch60-handles.test.tsx` (3 cases). Design page: "Drag, resize & pull handles
(batch 60)" section (controls tab).

### E.5.42 Provider / wallet / store buttons — as-built (batch 61, todo/09 §C)

New file `components/controls/ProviderButtons.tsx`. Social providers (apple/google/github/
microsoft/facebook/x) → `SignInButton`; wallets (apple-pay/google-pay/paypal) → `WalletButton`;
`AppStoreBadge` (`store` + optional `href`); `QrDownload` (QR image or children + caption).
Brand marks come from lucide icons; `mat-*` + token utilities only.

Tests: `test/batch61-provider-buttons.test.tsx` (4 cases). Design page: "Sign-in, wallet &
store buttons (batch 61)" section (controls tab).

### E.5.43 TextField variants — as-built (batch 43, todo/09 §D)

New file `components/form/TextField.tsx`. `TextField` extends native input props with
`variant` (`outlined | filled | underlined | borderless | inset`), `size` (`sm | md | lg`),
optional `floating` label (needs `label`), `leading` / `trailing` / `badge` slots, `showCount`
(`used/max`, requires `maxLength`), plus `hint` / `error` / `tooltip`. Error sets
`role="alert"` and is wired through `aria-describedby`; the counter is `aria-describedby`-linked
too. All styling via `mat-*` + token utilities.

Tests: `test/batch43-text-field.test.tsx` (4 cases). Design page: "Form inputs II (batches 43–48)"
→ "Text field variants (batch 43)".

### E.5.44 Smart inputs — as-built (batch 44, todo/09 §D)

New file `components/form/SmartInputs.tsx`. `EmailInput` (domain-suggestion button, e.g. `@gm` →
`@gmail.com`); `UrlInput` (prepends `https://` on blur when missing, warns while no scheme);
`UsernameInput` (debounced async `check`, status `idle/checking/available/taken`, `role="status"`);
`PasswordStrength` (segmented `role="meter"` + rule checklist); `PasswordInput` (eye toggle that
composes `PasswordStrength`).

Tests: `test/batch44-smart-inputs.test.tsx` (5 cases). Design page: "Form inputs II (batches 43–48)"
→ "Smart inputs (batch 44)".

### E.5.45 Pattern / format inputs — as-built (batch 45, todo/09 §D)

New file `components/form/PatternInputs.tsx`. Pure helpers `detectCardBrand` / `formatCardNumber`,
`formatExpiry` / `isExpiryValid`, `normalizeIban` / `formatIban` / `isValidIban` (mod-97),
`formatSsn`, `formatPostalCode`. Components: `CardNumberInput` (brand badge, `data-brand`),
`CardExpiryInput`, `CardCvcInput` (`length 3|4`), `CardInput` (composes number/expiry/CVC),
`IbanInput`, `SsnInput` (optional `mask` — all but last 4), `PostalCodeInput`, `CoordinatesInput`
(lat/lng range-validated). Every field binds `onChange` **and** `onInput` because React 19's
`onChange` does not fire under happy-dom synthetic events.

Tests: `test/batch45-pattern-inputs.test.tsx` (6 cases). Design page: "Form inputs II (batches
43–48)" → "Pattern inputs (batch 45)".

### E.5.46 Pickers I — unit / currency / timezone / avatar (batch 46, todo/09 §D)

New file `components/form/Pickers.tsx`. A single `Picker` (combobox trigger + listbox popover,
optional search field) backs `UnitPicker` (`DEFAULT_UNITS`), `CurrencyPicker`
(`DEFAULT_CURRENCIES`, searchable) and `TimezonePicker` (searchable; `Intl.supportedValuesOf
('timeZone')` with a fallback list). `AvatarPicker` wraps a hidden file input: image / initial /
`UserRound` fallback, pick + remove actions. Search field binds `onInput` (happy-dom).

Tests: `test/batch46-pickers.test.tsx` (5 cases). Design page: "Form inputs II (batches 43–48)"
→ "Pickers I (batch 46)".

### E.5.47 Pickers II — emoji / font / icon / gradient / shadow (batch 47, todo/09 §D)

New file `components/form/AdvancedPickers.tsx`. `EmojiPicker` (data-driven `EMOJI_GROUPS`, category
toolbar + grid); `FontPicker` (`DEFAULT_FONTS`, live preview via inline `fontFamily`); `IconPicker`
(`DEFAULT_ICONS` lucide map, name search); `GradientPicker` (`DEFAULT_GRADIENTS`) and `ShadowPicker`
(`DEFAULT_SHADOWS`) with inline-style swatches. Presets are data, not tokens; markup stays
`mat-*` + token utilities. Icon search binds `onInput` (happy-dom).

Tests: `test/batch47-advanced-pickers.test.tsx` (5 cases). Design page: "Form inputs II (batches
43–48)" → "Pickers II (batch 47)".

### E.5.48 Template / layout / theme pickers — as-built (batch 48, todo/09 §D)

New file `components/form/TemplatePickers.tsx`. `TemplatePicker` (`DEFAULT_TEMPLATES` cards),
`LayoutPicker` (`DEFAULT_LAYOUTS` icon toggles, `role="toolbar"` + `aria-pressed`) and
`ThemePicker` (`DEFAULT_THEMES` swatch rows). Cron + recurrence are flagged **⛔ own-task** in the
backlog and intentionally not built here.

Tests: `test/batch48-template-pickers.test.tsx` (3 cases). Design page: "Form inputs II (batches
43–48)" → "Pickers III — template / layout / theme (batch 48)".

### E.5.49 Selection extras — as-built (batch 62, todo/09 §D)

New file `components/form/SelectionExtras.tsx`. `TileSelect` (radio-card tiles with description +
icon slot), `ImageSelectGrid` (multi-select image tiles, `columns`, SVG/URL `src`), `SwatchSelect`
(single- or multi-select colour swatches via `multiple` + `onValuesChange`), `ToggleChipGroup`
(multi-toggle chips), `NpsScale` (0–10 `role="toolbar"` buttons + low/high captions), `LikertScale`
/ `LikertGroup` (`DEFAULT_LIKERT` agreement options, single- or multi-statement), `ThumbsRating`
(up/down `ThumbsValue`). Rating stays in `surface/Rating`; tri-state checkbox stays in `Checkbox`.

Tests: `test/batch62-selection-extras.test.tsx` (6 cases). Design page: "Selection extras
(batch 62)".

### E.5.50 Slider extras — as-built (batch 63, todo/09 §D)

New file `components/controls/SliderExtras.tsx`, all built on the existing `Slider`/`Range`
primitives: `MarksSlider` (`SliderMark[]` tick labels), `TooltipSlider` (bubble echoing the live
value), `VerticalSlider` (`height`, orientation-aware input), `HistogramSlider` (bin bars behind the
track for distribution filtering), `StepperSlider` (−/+ buttons clamped to `min`/`max`/`step`).

Tests: `test/batch63-slider-extras.test.tsx` (5 cases). Design page: "Slider extras (batch 63)".

### E.5.51 Chip / token inputs — as-built (batch 64, todo/09 §D)

New file `components/form/ChipInputs.tsx`. `TagInput` (free-text chips + `suggestions`),
`TokenInput` (`key:value` pairs typed through the exported `parseToken`-style helper, exposed
`Token` type), `EmailChipsInput` (validates against exported `EMAIL_RE`, one chip per recipient).
All are controlled (`values`/`tokens`/`emails` + `on*Change`) so state ownership stays with the
form.

Tests: `test/batch64-chip-inputs.test.tsx` (6 cases). Design page: "Chip inputs, uploads &
validation (batches 64–67)" → "Chip inputs (batch 64)".

### E.5.52 Upload upgrades — as-built (batch 66, todo/09 §D)

New file `components/form/UploadExtras.tsx`. `UploadQueue` (per-file rows: thumbnail/`FileIcon`,
name, `formatBytes` size, percentage, per-status tone, retry + remove buttons, `UploadItem`/
`UploadStatus` types), `CameraCapture` (hidden `capture="environment"` file input behind a button),
`PasteImageZone` (keyboard-focusable region for Ctrl/⌘+V paste + drag-and-drop of images; the two
a11y suppressions on the zone are traced — static div, no pointer action, focus exists only to
receive the paste event). Chunked/resumable upload and the video trimmer stay ⛔ own-task.

Tests: `test/batch66-upload-extras.test.tsx` (4 cases). Design page: "… (batches 64–67)" →
"Upload upgrades (batch 66)".

### E.5.53 Validation parts — as-built (batch 67, todo/09 §D)

New file `components/form/Validation.tsx`. `AsyncValidationIndicator` (`role="status"`
idle/validating/valid/invalid states), `DirtyIndicator` (dirty/touched pill), `focusFirstInvalid`
(pure helper that focuses and returns the first `[data-invalid]` element inside a root), `Summary`
(`ValidationIssue[]` list with `onIssueClick`), `useBeforeUnload` (guards `beforeunload` while
`when`), `UnsavedChangesBar` (save/discard sticky bar). Field-level error/hint/counter stay in
`Field` (batch 43).

Tests: `test/batch67-validation.test.tsx` (5 cases). Design page: "… (batches 64–67)" →
"Validation parts (batch 67)".

### E.5.54 Form layouts — as-built (batch 68, todo/09 §D)

New file `components/form/FormLayouts.tsx`. `FormWizard` (`mode="stepper"` numbered header with
`aria-current`, or `mode="one-question"`; `onStepChange`/`onComplete`), `TabbedForm`
(tabs + panel, `onTabChange`), `ConditionalField` (show/hide wrapper — pairs with any controlled
flag), `FieldArray<T>` (list of `renderItem` rows with add/remove; the list root is a `fieldset`
with the fieldset reset so biome's `useAriaPropsSupportedByRole`/`useSemanticElements` stay clean).
The full survey/builder flow stays ⛔ own-task.

Tests: `test/batch68-form-layouts.test.tsx` (5 cases). Design page: "Form layouts (batch 68)".

### E.5.55 Search & filter — as-built (batch 69, todo/09 §D)

New file `components/data/FilterBuilder.tsx`. `SortBuilder` (multi-rule field + asc/desc toggle,
`SortRule`/`SortDir` types), `FilterBuilder` (multi-rule field + operator select + value input,
`DEFAULT_OPERATORS`, `FilterRule` type), `SavedViews` (active-view list + save/delete),
`DateRangePresets` (`DateRangePreset` toolbar buttons with `aria-pressed`), `FacetedFilterPanel`
(`FacetGroup[]` checkbox facets with counts + clear-all). All roots are `fieldset`s with
`aria-label` (biome-clean a11y semantics). No commerce-specific logic — pure controlled UI.

Tests: `test/batch69-search-filter.test.tsx` (6 cases). Design page: "Search & filter
(batch 69)".

### E.5.56 Security forms — as-built (batch 70, todo/09 §D)

New file `components/form/SecurityForms.tsx`. `TwoFactorSetup` (optional backend-provided QR
`img`, manual-entry Base32 key grouped by 4 + `otpauthUri` caption, `OTP`-based 6-digit entry with
`TwoFactorStatus` idle/verifying/verified/error states, `role="alert"` error + `role="status"`
success), `RecoveryCodes` (masked list, reveal/hide, copy-all via `navigator.clipboard` with a
traced empty-handler button — no clipboard event misuse, optional regenerate, one-time-use
warning), `PasskeyPrompt` (`mat-panel` card, primary continue + ghost "use password instead"),
`Honeypot` (`sr-only`, `tabIndex={-1}`, `autoComplete="off"`, `aria-hidden` wrapper — gate
submissions on `value === ''`; binds `onChange`+`onInput` for happy-dom). No QR encoder shipped —
the QR image is a backend concern, keeping the kit dependency-free.

Tests: `test/batch70-security-forms.test.tsx` (9 cases). Design page: "Security forms
(batch 70)".

### E.5.57 Floating nav — as-built (batch 71, todo/09 §E)

New file `components/navigation/FloatingNav.tsx`. `Dock` (macOS-style `mat-chrome` pill of
icon buttons, `edge` top/bottom, hover-lift transform, `aria-current="page"` for the active
item), `RadialMenu` (centre toggle + items spread over the top half-circle; geometry is inline
`transform`, items `aria-hidden`/`tabIndex=-1` while closed, toggle `aria-expanded`),
`Hamburger` (three-bar → ✕ morph, controlled), `OffCanvas` (Portal drawer + scrim, Escape and
scrim-click close, `role="presentation"` scrim with traced biome ignore), `FullscreenMenu`
(Portal `role="dialog" aria-modal` overlay with large links; staggered reveal via the new
`.fx-menu-item` keyframe utility in `engine.css` — the kit has no `tailwindcss-animate`, so
`animate-in`-style classes are not available). All components are fully controlled; no
`--m-*` custom properties in markup.

Tests: `test/batch71-floating-nav.test.tsx` (5 cases). Design page: "Floating nav
(batch 71)" (layout tab).

### E.5.58 Tabs variants — as-built (batch 72, todo/09 §E)

New file `components/navigation/TabsVariants.tsx` (base `Tabs` untouched — its underline is
E.6 #7 and the pill look comes free from `--r-control` in the soft skin). `StickyTabs`
(base Tabs in a `sticky` `mat-chrome` bar, `offset` px), `ClosableTabs` (per-tab close as a
two-sibling-button `<span>` composition — no nested buttons; `editable` renames on
double-click via an inline input: Enter commits `onRename`, Escape cancels, no `autoFocus`
attribute — focus comes from a ref callback to keep biome's `noAutofocus` clean),
`DraggableTabs` (HTML5 drag-drop reorder + keyboard `Alt+ArrowLeft/Right`, internal order
stays synced with appearing/disappearing items, `onReorder(from, to)` indices),
`OverflowTabs` (tail past `maxVisible` moves into a `Dropdown` "More" menu with
`aria-haspopup`/`aria-expanded`; the active tab is always kept inline; closes on
`useClickAway`/Escape), `DocumentTabs` (`chrome="browser"` traffic-light dots ·
`"document"` plain strip · `"workspace"` icon chips; raised active tab `rounded-t-control`,
hover close badge). All controlled; theme tokens only, no `--m-*` in markup.

Tests: `test/batch72-tabs-variants.test.tsx` (9 cases). Design page: "Tabs variants
(batch 72)" (layout tab).

### E.5.59 Steppers — as-built (batch 73, todo/09 §E)

New file `components/navigation/Stepper.tsx`. `stepStatus(i, value, errorAt)` pure helper
(before = complete, at = current, `errorAt` wins). `ProgressDots` (carousel-style page dots —
active dot stretches into a pill; interactive mode = buttons with `aria-label`, static mode =
`role="img"` spans, both `aria-current="step"`). `Stepper` (numbered steps, horizontal or
vertical; complete steps show ✓ in an accent circle, current is ringed + `aria-current="step"`,
`errorAt` renders a `!` danger circle; connectors between steps fill accent behind progress;
clickable via `onChange` — only completed/current steps respond, `disabled` steps stay inert;
horizontal labels centre under circles, vertical rail uses exact 15px centre). `TimelineStepper`
(vertical rail with `ring-surface-1` status markers, timestamps right-aligned, clickable titles,
disabled titles render as plain text — no button). Theme tokens only, `mat-*` semantics, no
`--m-*` in markup; distinct from `StepperSlider` (numeric ±) and `Timeline` (display-only).

Tests: `test/batch73-steppers.test.tsx` (8 cases). Design page: "Steppers (batch 73)"
(layout tab).

### E.5.60 Side navigation — as-built (batch 74, todo/09 §E)

New file `components/navigation/SideNavVariants.tsx` exporting three pieces. Shared model
`NavLeaf` / `NavGroup` (`children`) / `NavItem`, discriminated by `Array.isArray(children)`.
**`MultiLevelSidebar`** — nested sidebar rendered as `<nav><ul><li>`; group rows toggle with
`aria-expanded`/`aria-controls` (pointing at a nested `<ul aria-label>`), leaves navigate and
carry `aria-current="page"` (groups never do); the path to `value` auto-opens via
`ancestorsOf`/`withActivePath` so the active leaf is never hidden; controlled (`expanded` +
`onExpandedChange`) or uncontrolled (`defaultExpanded`); indentation scales with depth.
**`MiniSidebar`** — compact sidebar that collapses to an icon-only rail (width 72px ↔ 15rem);
a bottom toggle (`aria-expanded`, default label "Toggle sidebar") flips it; collapsed rows keep
their accessible name through `aria-label` + native `title` tooltip and hide labels/badges.
**`AccordionNav`** — accordion navigation (`<nav><ul><li>`): each group is a disclosure
(`aria-expanded`/`aria-controls`), items are navigable leaves with `aria-current="page"`;
`allowMultiple` (off by default) chooses single-open vs many; `defaultOpen`/`open` +
`onOpenChange`. Distinct from `list/Accordion` (generic content) and `Sidebar` (flat levels) —
this family adds nesting/collapse. Theme tokens only, `mat-*` semantics, no `--m-*` in markup.

Tests: `test/batch74-side-nav-variants.test.tsx` (8 cases). Design page: "Side navigation
(batch 74)" (layout tab).

### E.5.61 Bottom nav variants — as-built (batch 75, todo/09 §E)

New file `components/navigation/BottomNavVariants.tsx` exporting two shells that build on the
`BottomTabBar` item shape (`BottomTabItem`). Shared `BottomNavAction` (`icon`/`label`/`onClick`/
`badge`) + `FabPosition` (`center`/`start`/`end`). **`BottomTabBarFAB`** — full-width bottom tab
bar (`mat-chrome`, `z-chrome`, safe-area bottom padding) with a raised centre FAB: tabs keep
`aria-current="page"`, badges render a danger pill; the FAB interrupts the row at `fabPosition`
(`center` splits evenly around it, `start`/`end` put it first/last) and `raised` (default) lifts
it above the bar via negative margin. **`FloatingBottomNav`** — centred `mat-chrome` pill that
hovers above the bottom edge (`fixed inset-x-0 bottom-4`, not full-width); `labels` toggles
icon+text (labelled) vs icon-only (native `title` tooltip + `aria-label`); optional `action`
floats a FAB above the pill centre. Distinct from `BottomTabBar` (plain, no FAB), `Dock`
(macOS hover-lift) and `IconRail`. Both default to `fixed`; pass `className="static …"` for a
contained preview. Theme tokens only, `mat-*` semantics, no `--m-*` in markup.

Tests: `test/batch75-bottom-nav-variants.test.tsx` (7 cases). Design page: "Bottom nav variants
(batch 75)" (layout tab).

### E.5.62 Footers — as-built (batch 76, todo/09 §E)

New file `components/navigation/Footer.tsx` exporting four pieces over a shared model
(`FooterLink` — `label`/`href`/`external`; `FooterColumn` — `title`/`links`; `SocialLink` —
`label`/`href`/`icon`). **`SocialBar`** — labelled `<nav>` of round `mat-control` icon links,
each `target="_blank" rel="noopener noreferrer"` with `aria-label` + native `title`. **`MegaFooter`**
— sitemap footer (`mat-ground`): brand + newsletter block beside up to four `<ul>` link columns
(column titles are `h6` headings), then a bottom bar with the social bar, legal copy and legal
links in a `Container`. **`FatFooter`** — brand-forward footer: oversized wordmark (`text-4xl`→
`text-5xl`) + tagline + social bar on the left, compact link columns on the right, closed by a
legal rule. **`StickyFooter`** — `sticky bottom-0 z-chrome` `mat-chrome` action bar (safe-area
bottom padding) for consent/bulk-action bars; flex content + right-aligned `actions` slot + an
optional labelled dismiss (✕) button wired via `onDismiss`. External `FooterLink`s get
`target`/`rel` auto-applied through `Link`. Theme tokens only, `mat-*` semantics, no `--m-*` in
markup; distinct from `BottomTabBar`/`FloatingBottomNav` (tab navigation) and `CartDrawer`.

Tests: `test/batch76-footers.test.tsx` (6 cases). Design page: "Footers (batch 76)" (layout tab).

### E.5.63 Command palette — as-built (batch 77, todo/09 §E)

New file `components/navigation/CommandMenu.tsx`. The state baseline already lived in
`packages/frontend` (`useCommandPaletteStore`, recents persisted to sessionStorage); this is the
headless UI half — `packages/ui` stays store-free, so recents come in as props (`recentSearches` /
`onClearRecentSearches`). Rendered through `Portal` as a `role="dialog"` `aria-modal` panel over a
`bg-canvas/60` scrim. The search field is a `role="combobox"` (with `aria-expanded` /
`aria-controls` / `aria-activedescendant`) driving a `role="listbox"`; rows are `role="option"`
with `aria-selected` on the active row and `aria-keyshortcuts` derived from the item's `shortcut`
(`⌘`/`⌥`/`⇧`/`⌃` are normalised to Meta/Alt/Shift/Control).

Content model: `CommandItem` (`id`/`label`/`icon`/`hint`/`shortcut`/`keywords`/`disabled`/
`closeOnSelect`/`onSelect`) and `CommandGroup` (heading + items). Render order is **quick actions
(pinned) → recent searches → groups**; recents only exist while the query is empty, and
`closeOnSelect: false` keeps the palette open (used by "Clear recent searches"). Filtering matches
`label` + `keywords` and drops empty groups. Keyboard: ↑/↓ cycle the active row (wrapping), ↵ runs
it, or submits the trimmed query through `onSubmitQuery` when nothing matches; Escape and an
outside pointer (both via `useClickAway`) dismiss. The footer spells out the hints as `Kbd` chips
(↑↓ Navigate · ↵ Select · Esc Close) alongside an optional `footer` slot, and each item's
`shortcut` renders as trailing `Kbd` chips. Query is controlled (`value`/`onValueChange`) or
internal (`defaultValue`). Theme tokens only, `mat-overlay` surface, no `--m-*` in markup.

Tests: `test/batch77-command-menu.test.tsx` (11 cases). Design page: "Command menu (batch 77)"
(layout tab).

### E.5.64 Share links & history nav — as-built (batch 78, todo/09 §E)

Two new files. `components/navigation/ShareLinks.tsx`: `PermalinkCopier` copies `value`, else `url`
(or the current location) with an optional `#anchor`, flips to a `Check` + `copiedLabel` for
`resetDelay` ms, and reports the text via `onCopied`; `ShareLink` prefers `navigator.share` (unless
`copyOnly`), aborting quietly when the sheet is dismissed (`AbortError`, never copies behind the
user's back), else copies and reports through `onShare` as `'share' | 'clipboard' | 'unavailable'`.
Both share one best-effort `writeToClipboard` helper (insecure context / denied permission leaves
the button unchanged) and a `useCopiedFlag` reset timer.

`components/navigation/HistoryNav.tsx`: `HistoryDropdown` is a split `mat-control` — a back arrow
(`onBack`, disabled when omitted) and a chevron that opens a recent-entries menu reusing `Dropdown`
(`triggerRef` + `useClickAway` + Escape, mirroring `OverflowTabs`); entries are
`{ id, label, hint?, icon?, href?, onSelect? }`, truncated to `max` (default 8), the chevron
disables when the list is empty, open state is controlled (`open`/`onOpenChange`) or internal
(`defaultOpen`), and selection calls `onSelect` then `onNavigate`. `RecentlyViewed` renders a
`role`-free `<section>` + `<h3>` with an optional `Clear` button and a `<ul>` in a `rail`
(horizontal scroll) or `list` layout, each row a `mat-control` card with thumbnail (or clock icon),
label + `hint`; `href` rows render a `Link`, the rest a button, and an empty list renders `null`.
Theme tokens only (`mat-control`/`mat-raised`/`mat-overlay`), no `--m-*` in markup.

Tests: `test/batch78-share-links.test.tsx` (9 cases) + `test/batch78-history-nav.test.tsx`
(12 cases). Design page: "Share links & history nav (batch 78)" (layout tab).

### E.5.65 Site-search overlay & voice search — as-built (batch 79, todo/09 §E)

Two new files. `components/navigation/SiteSearch.tsx` — a top-anchored `role="dialog"` panel
mirroring `Modal` (`Portal` + `useOverlay` for body scroll lock, focus trap, focus restore and
Escape) with `CommandMenu`'s listbox model: a `Search` icon + `role="combobox"` field
(`aria-expanded`/`aria-controls`/`aria-activedescendant`) + voice button + close ✕, a
`role="listbox"` of grouped `role="option"` rows, and a footer of `Kbd` hints (↑↓ Navigate · ↵
Search · Esc Close) plus an optional `footer` slot. Query is controlled (`value`/`onValueChange`)
or internal (`defaultValue`); while empty the `trending` sections render (falling back to
`sections` when none are given), otherwise `sections` filter case-insensitively over `label` +
`keywords`. ↑/↓ cycle the active row (wrapping, resetting on query change), ↵ runs the active row
(`onSelect` + `onClose`) or submits the trimmed query through `onSubmit`; the scrim
(`role="presentation"`, biome-suppressed `noStaticElementInteractions`) closes too. Keyboard
handling is `onKeyDownCapture` (React drops bubble-phase `keydown` on inputs under happy-dom).

`components/navigation/VoiceSearch.tsx` — `useSpeechRecognition({ lang, continuous,
interimResults, onResult, onError })` headless controller over the platform Web Speech API
(`SpeechRecognition` / `webkitSpeechRecognition`, with self-contained local types so we don't
depend on `lib.dom`): `supported` is detected in an effect (SSR renders the unsupported state),
`start()` bails when unsupported or already listening, the handle is abandoned on `end`/`error`
(restarting a finished handle throws), and interim/final transcripts are reported trimmed with
`isFinal`. `VoiceSearchButton` wraps it in an `IconButton` — mic-off + disabled when unsupported,
`aria-pressed` + pulsing red mic while listening — and `SiteSearch` embeds it, setting the query
from each transcript (and optionally auto-submitting via `submitOnVoice`).

Tests: `test/batch79-site-search.test.tsx` (12 cases) + `test/batch79-voice-search.test.tsx`
(10 cases). Design page: "Site search & voice search (batch 79)" (layout tab).

### E.5.66 Table variants — as-built (batch 80, todo/09 §F)

`components/data/Table.tsx` gains purely additive variant props (all default to today's behaviour,
so the batch-17 tests stay green). Presentation: `striped` (zebra body rows, skipped on selected
rows — explicit index parity, so detail rows don't offset it), `bordered` (a rule between every
column plus a hairline around the table), `borderless` (flush: no card chrome, no row dividers, no
outer border — wins over `bordered`/`cardRows`), `hoverable` (row tint without `onRowClick`) and
`cardRows` (`border-separate` + `border-spacing-y-2`, each row's cells `bg-surface-2` with rounded
ends). `responsive="stack"` reflows below `md`: the `<table>` becomes `block md:table`, the header
`hidden md:table-header-group`, each row `block … md:table-row`, and every cell
`flex items-center justify-between … md:table-cell` with the column's `stackLabel` (falling back to
a string `header`, then `key`) shown as a `md:hidden` label — select/expand controls are hidden on
mobile. `compact` density already shipped.

Expansion adds one leading toggle column for two models: `renderDetail(row)` (master-detail) renders
a full-width `<tr>` under an expanded row, while `getSubRows(row)` (nested/tree) flattens the
visible tree depth-first and indents each descendant's toggle cell by `depth × 16px`. State is
controlled (`expandedKeys` + `onExpandedKeysChange`) or uncontrolled (`defaultExpandedKeys`); the
toggle sets `aria-expanded` and stops click propagation so it never triggers `onRowClick`; leaf rows
render a spacer instead of a button. When both models are given the detail row renders above child
rows.

Tests: `test/batch80-table-variants.test.tsx` (15 cases). Design page: "Table variants (batch 80)"
(data tab). `TableResponsive` is exported from the `data` barrel.

### E.5.67 Table power — as-built (batch 81, todo/09 §F)

`components/data/Table.tsx` adds six interactive capabilities, all additive. **Merged cells**: a
column may carry `colSpan`/`rowSpan`, applied to its header + body cells (and the `tfoot` summary).
**Frozen columns**: `frozen: 'left' | 'right'` pins a column with `sticky` + `z-raised`; offsets
accumulate from each column's `width` (or `frozenOffset`), body cells get an opaque `bg-surface-1`
so scrolled content can't bleed through. **Resizable columns**: `resizable` renders a
`role="separator"` handle at each header's right edge; pointer-drag updates a `widths` map (clamped
to 48px) and reports via `onResize(key, width)`, which is also stamped onto the header/body cells.
**Reorderable rows**: `reorderable` makes each `<tr>` draggable (drag a row onto another →
`onReorder(from, to)`) and adds a leading grip that is keyboard-operable with ↑/↓ (the row drag
uses the component's own `dragIndex` state, so it works without `DataTransfer`). **Multi-sort**:
`multiSort` + `sorts`/`onSortsChange` keep an ordered `TableSort[]`; a plain header click cycles
`asc → desc → removed` (replacing the list) and a **Shift-click** toggles that key in place, each
active column showing a `1`, `2`, … rank chip. The pure `cycleSort` helper is exported for reuse.
**Editable cells**: `editable` turns each body cell (opt-out with `editable: false`) into a button
that swaps to a text input on click — seeded from `column.editValue` (or a string cell) — and
commits on **Enter** (`onCellEdit(rowKey, columnKey, value)`) or discards on **Escape**. Control
columns now render in the order reorder → expand → select.

Tests: `test/batch81-table-power.test.tsx` (15 cases — includes `MouseEvent`-based shift-click and
pointer-drag synthesis, and `cycleSort` unit coverage). Design page: "Table power (batch 81)" (data
tab). `TableSort` is exported from the `data` barrel; batch-17/80 table tests remain green.

### E.5.68 In-cell marks — as-built (batch 82, todo/09 §F)

Three new `components/data` primitives for dense rows, KPI strips and matrix grids.

`Bullet.tsx` — **`Bullet`** bullet graph: one measure against an optional target, read through
qualitative bands. `value`, `target?`, `ranges?` (increasing thresholds → `poor / ok / good`
shading via `bg-line/10|20|30`), `max?` (defaults to `max(100, value, target, last range)`),
`tone` (`accent | success | warning | danger`), `showValue?`. The track is a `mat-well`; band
spans are positioned by percentage, the measure bar is tone-filled, and the target is a `bg-ink`
tick. Root carries `role="img"` with an aria-label combining value, target and bands; inner marks
are `aria-hidden`.

`HeatCell.tsx` — **`HeatCell`** heat cell: `value`, `min`/`max`, `ramp`
(`accent | success | warning | danger | diverging`), `format?`, `children?`. The background is a
**role class + opacity bucket** (`heatClass` → e.g. `bg-success/40`), never a raw theme token, so
it respects the 02-E §1 markup contract; `diverging` picks `success` for non-negative values and
`danger` for negatives, with intensity from `|value| / maxAbs`. Pure `heatIntensity(value, min, max)`
and `heatClass(ramp, value, min, max)` are exported. Root is `role="img"`.

`IconIndicators.tsx` — two in-cell marks. **`StatusLights`** traffic-light triplet: `level`
(`good | warn | bad | neutral`), `size` (`sm | md`), `orientation` (`row | column`); only the active
light is coloured (others `bg-line/25`) so status is never colour-only, root `role="img"`.
**`TrendArrow`** directional indicator: `direction` (`up | down | flat`), optional signed `value`
(`formatDelta` → `+12.4%` / `-3.2`), `percent?`, `upIsGood?` (default true — flips the tone map),
`tone?` override. Icons `TrendingUp | TrendingDown | Minus`; tone classes
`text-success | text-danger | text-ink-3 | text-accent`. Pure `formatDelta(value, percent)` exported.

Tests: `test/batch82-incell.test.tsx` (17 cases). Design page: "In-cell marks (batch 82)" (data
tab). Exports from the `data` barrel: `Bullet`/`BulletProps`/`BulletTone`; `HeatCell`/`HeatCellProps`/
`HeatRamp`/`heatIntensity`/`heatClass`; `StatusLights`/`StatusLightsProps`/`StatusLevel`/
`TrendArrow`/`TrendArrowProps`/`TrendDirection`/`TrendTone`/`formatDelta`.

### E.5.69 People — as-built (batch 83, todo/09 §F)

`components/surface/Avatar.tsx` gains **presence** (`status?: online | away | busy | offline`) and a
**badge** overlay (`badge?: ReactNode`); both wrap the core in a `relative` span and pin a corner
element (status dot `ring-2 ring-surface-1` bottom-right, badge top-right). The accessible name
carries the status (`"Alex Chen, busy"`) so presence is never colour-only. §21.18 now also applies:
initials fallback is `bg-surface-4 text-ink-2` with `border border-line/10`. `getInitials(name)` is
exported.

`components/surface/People.tsx` adds four composites:

- **`AvatarGroup`** — overlapping avatars (`-space-x-2`, each ringed `ring-2 ring-surface-1`) with a
  `+N` chip once the list exceeds `max` (default 4); `total` overrides the count that drives `N`,
  `size` follows the Avatar scale. Root `role="img"`, label `"<label> — N people"`.
- **`TeamStack`** — a `<ul>` of avatar + name + role columns (`showNames?`, `max`, `total`, `size`),
  collapsing the remainder into a `+N` tile; label `"<label> — N members"`.
- **`NameRole`** — avatar + name + muted role block (`avatar?`, `href?` links the name, `trailing?`,
  `stacked?`, `size`).
- **`Byline`** — author byline: optional avatar, `prefix?` ("By"), author (`href?`), `role?`, `date?`
  joined by a `separator?` (default `·`); `size` (`sm | md`).

Tests: `test/batch83-people.test.tsx` (16 cases). Design page: "People (batch 83)" (data tab).
Exports from the `surface` barrel: `Avatar`/`AvatarProps`/`PresenceStatus`/`getInitials`;
`AvatarGroup`/`AvatarGroupProps`/`AvatarPerson`; `TeamStack`/`TeamStackProps`/`TeamMember`;
`NameRole`/`NameRoleProps`; `Byline`/`BylineProps`.

### E.5.70 Content cards — as-built (batch 84, todo/09 §F)

`components/data/ContentCards.tsx` — eight content cards sharing a private `Shell` (root is an
`<a>` when `href` is set — with `focusRing()` — else an `<article>`; `group mat-card block
overflow-hidden rounded-card`), a `Cover` (aspect `video | wide | square | poster`, `bg-surface-3`,
lazy `object-cover` image with a `group-hover:scale-105` zoom and an `ImageOff` placeholder), a
`PlayOverlay` (real `<button aria-label="Play">` when `onPlay` and no `href`, decorative otherwise),
a `DurationBadge`, a `Meta`/`Dot` line and a `TagRow`.

- **`ArticleCard`** — `title`, `excerpt?`, `category?` (accent `Badge` on the cover), `image?`,
  `href?`, `author?`, `date?`, `readTime?`.
- **`BlogCard`** — led by an author row (`Avatar` + name + date), `title`, `excerpt?`, `tags?`,
  `readTime?`.
- **`NewsCard`** — uppercase `section?` kicker, `headline`, `summary?`, `source?`, `date?`.
- **`VideoCard`** — thumbnail + `duration?` badge + play, `channel?`, `views?`, `date?`, `onPlay?`.
- **`AlbumCard`** (alias **`MusicCard`**) — square cover + play, `artist`, `year?`, `tracks?`.
- **`PodcastCard`** — cover + play with an inline layout, `show?`, `episode?`, `duration?`, `date?`.
- **`MovieCard`** — `poster` (2:3), `year?`, `runtime?`, `rating?` (read-only `Rating`), `genres?`.
- **`RecipeCard`** — `cookTime?`, `servings?`, `difficulty?` (easy/medium/hard → success/warning/
  danger `Badge`), `rating?`.

Root tokens only (`mat-card`/`surface-*`/role colors); no raw theme tokens. Also fixed: `Badge.tsx`
now carries the `/** @jsxImportSource react */` pragma (required for any component file first
rendered by `bun test` from the repo root).

Tests: `test/batch84-content-cards.test.tsx` (12 cases). Design page: "Content cards (batch 84)"
(data tab). Exports from the `data` barrel: `ArticleCard`/`ArticleCardProps`, `BlogCard`/
`BlogCardProps`, `NewsCard`/`NewsCardProps`, `VideoCard`/`VideoCardProps`, `AlbumCard`/`AlbumCardProps`,
`MusicCard`, `PodcastCard`/`PodcastCardProps`, `MovieCard`/`MovieCardProps`, `RecipeCard`/
`RecipeCardProps`.

### E.5.71 Commerce cards — as-built (batch 85, todo/09 §F)

`components/data/CommerceCards.tsx` — eight commerce cards plus two pure helpers and a card-visual
pair. Helpers: **`formatPrice(amount, currency='USD', locale='en-US')`** (locale-stable
`Intl.NumberFormat` currency string) and **`maskCardNumber(number)`** (keeps the last four digits,
grouped in fours → `•••• •••• •••• 4242`). Shared private `Shell` (root `<a>` with `focusRing()`
when `href`, else `<article>`; `group mat-card block overflow-hidden rounded-card`), `Cover`
(aspect `video | wide | square | poster`, `bg-surface-3`, lazy zoom, `ImageOff` placeholder), `Meta`/
`Dot`, `CardTitle`, `PriceRow` (price + optional struck-through original + computed `-N%` danger
`Badge`). Root tokens only (`mat-*`/`surface-*`/role colors) — **no raw theme tokens**; credit/gift
card backgrounds use the skin material roles via `CARD_MATERIAL` (`mat-primary text-accent-ink` |
`mat-raised` | `mat-panel`) rather than a hand-rolled gradient.

- **`ProductCard`** — square cover, `badge?`/`badgeTone?`, optional `onWishlist` (`Heart` button),
  `title`, `rating?` + `reviews?` (read-only `Rating`), `price`/`originalPrice?`/`currency?`, `stock?`
  (`StockIndicator`), optional `onAddToCart` primary button.
- **`PropertyCard`** (alias **`ListingCard`**) — wide cover, `tag?`/`tagTone?`, `price` +
  `priceInterval?` (`month | night | sqft`), `address?` (`MapPin`), `beds?`/`baths?`/`area?` meta.
- **`HotelCard`** — wide cover, guest-score chip (`rating`, `Star`), `stars?` (`role="img"` star
  row), `location?` + `reviews?`, governed `amenities?` icon map (wifi/breakfast/parking/gym/pool/
  restaurant/tv → `role="img"` `aria-label`), `pricePerNight` + "/ night".
- **`FlightCard`** — airline (`Plane`), `from`→`to` with `departTime`/`arriveTime`, a rule with
  `duration?` and `stops?` (`Direct` / `N stop(s)`), `price` + optional `onSelect` button.
- **`TicketCard`** — event stub: `date?`/`event` (`href` link)/`venue?`/`section?`/`row?`/`seat?`
  plus a dashed right stub with `Notch` (top/bottom semicircles), `price?` and mono `code?`.
- **`CouponCard`** — dashed-border card, large `discount`, `title?`, `code` badge, `expires?` and
  optional `onCopy` ghost button.
- **`GiftCard`** — `1.586:1` material card, `brand`, `Gift` icon, `balance` (formatted), `code?`
  and `expiry?`.
- **`CreditCardVisual`** — `1.586:1` material card (`role="group"` with a
  `"<label?> <brand> ending NNNN"` `aria-label`), `Credit` tag, masked number (mono tracking),
  `holder?` and `expiry?`; `tone` picks the material role. (Not yet exported to the design page's
  payment *inputs* — those remain `form/PatternInputs`.)

Tests: `test/batch85-commerce-cards.test.tsx` (19 cases). Design page: "Commerce cards (batch 85)"
(data tab). Exports from the `data` barrel: `formatPrice`, `maskCardNumber`, `ProductCard`/
`ProductCardProps`, `PropertyCard`/`PropertyCardProps`, `ListingCard`/`ListingCardProps`, `HotelCard`/
`HotelCardProps`, `FlightCard`/`FlightCardProps`, `TicketCard`/`TicketCardProps`, `CouponCard`/
`CouponCardProps`, `GiftCard`/`GiftCardProps`, `CreditCardVisual`/`CreditCardVisualProps`.

### E.5.72 Work cards & card variants — as-built (batch 86, todo/09 §F)

Two new `components/data` files. `WorkCards.tsx` — thirteen work/domain cards over a private `Shell`
(root `<a>` with `focusRing()` when `href`, else `<article>`; `group mat-card block overflow-hidden
rounded-card`), `Meta`/`Dot`/`CardTitle`-style heads and shared `Avatar`/`Rating`/`Badge`/`Chip`/
`IconTile`/`Progress`/`Button` parts. **`ContactCard`** (avatar + role/company + mailto/tel links +
Email/Call) · **`BusinessCard`** (logo + category + rating/reviews + address/phone/website + Directions) ·
**`TeamMemberCard`** (`<ul>` socials) · **`ReviewCard`** (verified `BadgeCheck` + rating + body + Helpful) ·
**`NotificationCard`** (`IconTile` tone + unread `role="img"` dot + Mark read / Dismiss) · **`TaskCard`**
(`aria-pressed` completion toggle + priority `Badge` + assignee `Avatar` + due + `Chip` tags) ·
**`ProjectCard`** (`Progress` + `AvatarGroup` members + `doneCount/taskCount`) · **`FileCard`** (kind→icon
map, thumbnail, download) · **`FolderCard`** (item count + shared) · **`AppCard`** (rating + Install/Open) ·
**`IntegrationCard`** (connected badge + Connect/Disconnect) · **`FeatureCard`** (icon + Learn-more link) ·
**`MetricAlertCard`** (status→icon/tone map + value + `TrendArrow` + threshold + View).

`CardVariants.tsx` — eight layout/interaction variants: **`HorizontalCard`** (media beside content) ·
**`OverlayImageCard`** (text over an `bg-ink/60` scrim + optional CTA) · **`HoverRevealCard`** (detail
revealed on `group-hover`/`group-focus-within`, full-card stretched link) · **`FlipCard`** (3D
`rotateY(180deg)` with `aria-hidden` on the hidden face and an `aria-pressed` flip button) ·
**`ExpandableCard`** (`aria-expanded`/`aria-controls` + `hidden` body, `defaultOpen`) ·
**`SelectableCard`** (native `sr-only` checkbox + visual check, `ring-accent` when selected, `disabled`) ·
**`DraggableCard`** (`draggable` + grip `role="img"` label + opacity while dragging) · **`StackedCards`**
(`<ul>` deck with peeking `mat-card` edges + `+N` overflow).

Pragmas added to `data/Skeleton.tsx` and `surface/IconTile.tsx` (first rendered by the batch-86 tests).
Root tokens only — no raw theme tokens. Tests: `test/batch86-work-cards.test.tsx` (15 cases) +
`test/batch86-card-variants.test.tsx` (12). Design page: "Work cards (batch 86)" (data tab). Exports
from the `data` barrel: all 13 `WorkCards` + 8 `CardVariants` components and their `*Props` types,
plus `FileKind`, `TaskPriority`, `MetricAlertStatus`.

### E.5.73 Lists — as-built (batch 87, todo/09 §F)

New `components/list/Lists.tsx` — thirteen list/feed patterns over a shared row shell (`<ul>` root,
`mat-card` when framed, `focusRing()` on interactive rows). **`ChatList`** (avatar + name + message
snippet + time + unread count badge + active row, `onSelect`) · **`ContactList`** (avatar + name +
subtitle + `mailto:` link, `onSelect`) · **`NotificationList`** (leading icon `LucideIcon` + title +
description + time + unread `role="img"` dot, `onSelect`) · **`ChecklistList`** (native `sr-only`
checkbox + label strike-through when done, `onToggle`) · **`TodoList`** (`TodoPriority`
`low|medium|high` → `Badge` tone, `aria-pressed` done toggle, due time, `onAdd`) · **`PlaylistList`**
(index column swaps to a playing `Music` glyph, title/artist/duration, `onSelect`) · **`SearchResults`**
(local `Highlight` wraps query matches in `<mark>`, type label + url, `onSelect`) · **`StickyHeaderList`**
(`StickyGroup[]`, group `<h4>` headers pinned with `sticky top-0 bg-surface-2`, scroll container) ·
**`AlphabetIndexList`** (`AlphabetItem[]` grouped by first letter `#`-fallback, letter `<h4>` headers with
`id="letter-X"` + a `nav[aria-label="Jump to letter"]` rail of anchor jumps, `onSelect`) ·
**`SwipeList`** (action layer behind a `bg-canvas` row + Complete/Delete `aria-label` buttons,
`onComplete`/`onDelete`) · **`ReorderableList`** (`GripVertical` handle, `Move <label> up/down` buttons,
first-up/last-down disabled, `onReorder(next)`) · **`InfiniteList`** (`ReactNode[]` items + `hasMore`/
`loading`/`onLoadMore` "Load more" control) · **`NestedList`** (recursive `NestedRows` with
`aria-expanded` expanders, `NestedNode[]`, `onSelect`). Types exported: `ChatMessage`, `ContactItem`,
`NotificationItem`, `ChecklistItem`, `TodoItem`, `TodoPriority`, `PlaylistTrack`, `SearchResultItem`,
`StickyGroup`, `AlphabetItem`, `SwipeItem`, `ReorderableItem`, `NestedNode` and each component's
`*Props`.

Pragmas added to `list/GroupedList.tsx` and `list/ListHeader.tsx` (first rendered by the batch-87
tests). Root tokens only — no raw theme tokens (`bg-canvas`/`bg-surface-2`/`bg-accent/20`, not the
undefined `bg-ground`/`bg-card`). Test: `test/batch87-lists.test.tsx` (15 cases; checkbox toggles
dispatch a real `MouseEvent` via a local `mouse()` helper). Design page: "Lists (batch 87)" (data tab).
Exports from the `list` barrel: all 13 components + their `*Props` types and the shared item/enum
types above.

### E.5.74 Documents — as-built (batch 90, todo/09 §F)

New `components/data/Documents.tsx` — seven document surfaces over a private compact `ToolButton`
(a `size-8` icon button with `focusRing()` + `aria-label`; `IconButton` is fixed `h-11` and `cn` does
not merge utilities, so the toolbar uses its own control). **`DocumentPreview`** (`<section>` viewer
with filename, prev/next page — bounded by `page`/`pageCount` — zoom in/out, download, fullscreen; a
`3/4` `bg-canvas` sheet with an optional `children` page body) · **`DocumentThumbnails`** (`<ul>` page
rail, `aria-current` on the active page) · **`AnnotationPins`** (`src`/placeholder media with numbered
pin buttons positioned by `x`/`y` percent + a linked `<ol>` of notes, `activeId`/`onSelect`) ·
**`VersionHistory`** (`<ol>` timeline with a `Current` `Badge`, author · date, size, per-row Download /
Restore) · **`DiffView`** (side-by-side line diff; status derived from `left`/`right` presence —
`added` `bg-success/12`, `removed` `bg-danger/12`, `changed` `bg-warning/12`, `unchanged` plain; "No
differences" empty state) · **`ReaderMode`** (`role="progressbar"` reading bar + A-/A+ size controls over
a `useState` size step `ReaderSize = 1|2|3|4` → `text-sm|base|lg|xl`, `max-w-prose` body) ·
**`TocPanel`** (card-framed TOC reusing `TocItem` from `Sticky.tsx`, active highlight, optional
collapsible header with `aria-expanded`/`aria-controls`). Diff/viewer controls use `bg-canvas`,
`bg-surface-2` and role tints — no raw theme tokens.

Complements existing surfaces rather than duplicating them: the sticky rail TOC is the existing
`StickyToc` (`surface/Sticky.tsx`, ✅) and inline character/word diff is the existing `TextDiff`
(`surface/InlineText.tsx`, ✅). Test: `test/batch90-documents.test.tsx` (10 cases; `expandable`
required-children components rendered as JSX to satisfy `noChildrenProp`). Design page: "Documents
(batch 90)" (data tab). Exports from the `data` barrel: the 7 components + their `*Props` types,
`AnnotationPin`, `DiffLine`, `DocumentPage`, `DocumentVersion` and `ReaderSize`.

### E.5.75 Financial — as-built (batch 91, todo/09 §F)

New `components/data/Financial.tsx` — ten finance/money surfaces plus a pure formatter.
**`formatMoney(value, currency = '$')`** (locale-stable `Intl.NumberFormat` signed amount,
e.g. `-$900.00`) · **`PriceChangeBadge`** (`change`/`changePercent`/`upIsGood`; lucide
`TrendingUp`/`TrendingDown`/`Minus` glyph + signed percent, tone derived from
`directionOf(change)` — `bg-success/12 text-success`, `bg-danger/12 text-danger`, neutral
`bg-ink/8 text-ink-3`; direction repeated in an `sr-only` label so it is never colour-only) ·
**`PriceTicker`** (`PriceQuote` card: symbol + name + `formatMoney(price)` + badge, optional
`spark` array reusing the existing `Sparkline` with `tone` from the change sign) ·
**`TickerTape`** (`<ul aria-label="Market ticker">` of horizontal quotes; each percent is a
`role="img"` span so the `aria-label` ("up/down N%") is valid) · **`OrderBook`** (two-column
bids/asks table with proportional depth bars — `bg-success/15` right-anchored on bids,
`bg-danger/15` left-anchored on asks, width `size/max × 100%`) · **`DepthChart`** (cumulative
`cumulative()` levels → bid/ask `<polygon>` areas + `<polyline>` outlines over a `0 0 100 40`
viewBox with `vectorEffect="non-scaling-stroke"`, centre `stroke-line/40` rule, `<figure>`
with `role="img"` label + Bids/Price/Asks caption) · **`PortfolioBreakdown`** (segmented
`aria-hidden` bar over role-tone classes + a legend `<ul>` with swatch, percent-of-total and
`formatMoney` value per `Holding`) · **`TransactionList`** (`divide-y` rows: `ArrowDownRight`
green incoming / `ArrowUpRight` red outgoing, description + date · category, signed amount,
`Pending` note) · **`BalanceCard`** (`mat-primary text-accent-ink` hero: label + `Wallet`
icon, big tabular balance, Available/Pending `<dl>`, optional `Plus` "Add funds" action
button) · **`InvoiceReceipt`** (number/date header, From/To slots, line-item `<table>` with
optional `× quantity`, `Subtotal`/`Tax (N%)`/`Total` `<dl>` — tax computed from
`subtotal × taxRate`) · **`BudgetBar`** (`role="progressbar"` with `aria-valuenow` clamped to
100, tone `bg-success` → `bg-warning` at ≥80% → `bg-danger` when over, "left"/"Over budget by"
helper line). Root tokens only (`mat-*`, role tints `success/danger/warning/info`,
`bg-surface-3`, `stroke-line/40`) — no raw theme tokens.

Distinct from existing primitives: the signed-change pill is presentation (badge) versus the
batch-82 `TrendArrow` indicator, `formatMoney` is a signed plain number helper alongside
batch-85's locale-currency `formatPrice`, and `PriceTicker` composes the existing `Sparkline`
rather than redrawing one. Test: `test/batch91-financial.test.tsx` (12 cases). Design page:
"Financial (batch 91)" (data tab). Exports from the `data` barrel: the 10 components +
their `*Props` types, `PriceQuote`, `OrderLevel`, `Holding`, `Transaction`, `InvoiceLine` and
`formatMoney`.

### E.5.76 Media display — as-built (batch 92, todo/09 §F)

New `components/data/MediaDisplay.tsx` — seven media surfaces plus the pure
`fmtTime(seconds)` (`m:ss`) helper. A private `Art` helper renders the shared artwork frame
(`<img>` with `alt` + `loading="lazy"` when `src`, else an `aria-hidden` `bg-surface-3
text-ink-4` icon fallback keyed per surface — `ImageOff`/`Film`/`Music`/`Headphones`). **`ThumbnailGrid`**
(`<ul>` of aspect-video tiles; `columns` 2/3/4/6 static map or the responsive 2→3→4 default;
each tile is an `aria-pressed` button, selected tiles get `ring-2 ring-accent`, optional
bottom-right duration chip and an accent "Now playing" glyph with `sr-only` text) ·
**`PosterCard`** (`<figure>` 2:3 `aspect-[2/3]` frame over `bg-ink/60` scrim with a
`text-white` `figcaption` title/meta, `Badge` slot top-left, optional top-right play button
`aria-label="Play <title>"`; display-only without `onPlay` — distinct from `MovieCard`,
which is a content card with rating/genres) · **`PlaylistRow`** (composable single track row:
artwork + title/artist (accent + `Music` glyph while `playing`) + duration + optional like
toggle `aria-pressed` + `mat-primary` play/pause whose `aria-label` flips Play↔Pause) ·
**`PodcastRow`** (episode row: artwork + title + show · date + duration, optional listened
`progress` 0–1 → `role="progressbar"` accent line with `aria-valuenow` + percent readout,
download + play actions) · **`NowPlayingBar`** (`mat-chrome` bar reusing the batch-57
**`MediaControls`** transport, artwork + title/artist, and a private `SeekSlider` —
`role="slider"` + `tabIndex={0}` with `aria-valuenow/min/max` + `aria-valuetext`
(`1:12 of 3:20`), click-to-seek guarded on zero-width rects, ←/→/↑/↓ ±5s, Home/End → 0/total;
times shown as `fmtTime`) · **`LyricsView`** (`mat-well` scroll region `<section aria-label>`
+ `<ul>`; the active line is marked by an accent left rail + `font-medium` **and**
`aria-current="true"` — never colour-only; optional per-line buttons via `onLineClick`,
`timeMs` surfaces as `sr-only` timestamps) · **`QueuePanel`** (`<section>` with a `ListMusic`
header — title + "N tracks" + optional Clear — over an `<ol>`: current row `aria-current` +
accent tint + `Music` glyph, title button `onSelect`, `Move <title> up/down` buttons with
ends `disabled`, `Remove <title>`, empty state "Queue is empty"; row controls are siblings of
the title button, so no nested buttons). Root tokens only (`mat-card`/`mat-chrome`/`mat-well`/
`mat-primary`, `bg-accent/8`, `bg-ink/60|70`, role accents) — no raw theme tokens.

Complements rather than duplicates: `PlaylistList` (batch 87) is the full playlist *list*
with inline select, while `PlaylistRow` is a single composable row with play/like controls;
`MediaControls` (batch 57) is reused for transport instead of being redrawn; `MediaControls`
covers generic transport, `NowPlayingBar` adds the track context + seek. Test:
`test/batch92-media-display.test.tsx` (13 cases; keyboard seek via synthesized `keydown`).
Design page: "Media display (batch 92)" (data tab). Exports from the `data` barrel: the 7
components + their `*Props` types, `MediaThumb`, `LyricLine`, `QueueItem` and `fmtTime`.

### E.5.77 Modal variants — as-built (batch 93, todo/09 §G)

Baseline `overlay/Modal.tsx` gains additive variant props (**`size`** now
`sm|md|lg|xl|fullscreen` — `xl` = `max-w-4xl`, `fullscreen` = `h-full w-full max-w-none` inside
the backdrop inset; **`scrollable`** turns the panel into a `flex max-h-full flex-col
overflow-hidden` column so the header stays `flex-none`, the body scrolls
(`min-h-0 flex-1 overflow-y-auto`) and the footer stays pinned; **`side="left"|"right"`**
anchors the panel to the edge — backdrop `justify-start|end`, panel `h-full`, `data-side`
stamped) plus two stacking gates: **`trapFocus`** and **`closeOnEscape`** (both default on;
set `false` on a modal that has another modal stacked above it so Tab and Escape stay with
the topmost dialog). `Modal.tsx` also gained the required
`/** @jsxImportSource react */` pragma (first time rendered by root `bun test`).

**Real defect fixed in `lib/useOverlay.ts`** (surfaced by the batch-93 focus test): the focus
trap never installed — `Portal` mounts one effect-pass late, so the trap effect first ran
against a `null` container and, with `[open, trapFocus]` deps, could never re-run. The
container is now tracked with `useState` (returned under the same `containerRef` name, which
every consumer only attaches as `ref={containerRef}`), the trap effect depends on it, and a
new `closeOnEscape` option (default `true`, wired from `Modal`) lets a lower stacked overlay
stand down. This restores the documented §21.9 contract (focus traps on open) for `Modal`,
`SidePanel`, `BottomSheet`, `ConfirmDialog` and `SiteSearch` — full suite 763/0 after the
change.

New `overlay/ModalVariants.tsx` — **`WizardDialog`** (stepped dialog over the baseline
`Modal`: `ModalWizardStep[]` (`id`/`title`/`content`), "Step X of N" + step heading over the
body, batch-73 **`ProgressDots`** header with `aria-current="step"`, Back/Next footer with
ends disabled and Next swapping to `finishLabel` on the last step; controlled (`step` +
`onStepChange`) or uncontrolled (`defaultStep`); `onFinish` fires on the last step and the
owner decides whether to close) + pure **`clampStep(step, count)`** bounds helper. The step
type is `ModalWizardStep`, not `WizardStep` — the form barrel already exports a `WizardStep`
for `FormWizard`. Complements `SidePanel` (utility panel with trigger), `BottomSheet`
(bottom edge) and `ConfirmDialog` (inline confirm) rather than duplicating them. Test:
`test/batch93-modal-variants.test.tsx` (11 cases: sizes/side/scrollable classes, Escape
gating, focus-trap behaviour incl. the disabled case, stacked Escape isolation, wizard
stepping + `clampStep`). Design page: "Modal variants (batch 93)" (overlay tab). Exports
from the `overlay` barrel: `WizardDialog`/`WizardDialogProps`/`ModalWizardStep`/`clampStep`
plus the extended `ModalProps`.

### E.5.78 Popover variants — as-built (batch 94, todo/09 §G)

Baseline `overlay/Popover.tsx` gains additive variant props (**`triggerOn`
`click|hover|focus`** — `click` keeps the original toggle; `hover` opens on
`mouse enter`/`leave` of the wrapper (the panel is a DOM child, so no gap timer is
needed); `focus` opens on React `focus` (bubbling `focusin`) and closes on blur
when `relatedTarget` leaves the wrapper — outside-click and Escape keep working in
every mode; **`arrow`** renders an `aria-hidden` rotated `size-2.5 mat-overlay`
square hugging the panel edge — `-top-1`/`-bottom-1` by `side`, offset by `align`
— so it inherits the panel's skin surface), plus the required
`/** @jsxImportSource react */` pragma (first render by root `bun test`). The
trigger keeps its `aria-haspopup`/`aria-expanded` span wrapper; all existing
click-popover call sites are unchanged.

New `overlay/PopoverVariants.tsx` — two composed panels over the baseline popover.
**`MegaDropdown`** (nav mega menu: `MegaMenuColumn[]` — `title` + `MegaMenuItem[]`
(`label`/`href` → anchor with optional `description`, else a `button` with
`onSelect`) in a static 1–4 `grid-cols-*` layout over `min-w-[420px]`, optional
bordered `footer` row; `triggerOn` defaults to `hover`, click still toggles) ·
**`QuickViewPanel`** (peek card: `title`/`subtitle`/`media` slot/`description`, a
2-up `<dl>` of `QuickViewMeta` label/value pairs, an `actions` row, arrow on by
default, `w-72`, hover-triggered — interactive with real actions, distinct from the
CSS-only role-`tooltip` `HoverCard`, from the click `Dropdown` and from modal
`SidePanel`). Root tokens only (`mat-overlay`, `bg-surface-3`, `border-line/10`,
`text-ink*`) — no raw theme tokens. Test: `test/batch94-popover-variants.test.tsx`
(7 cases: baseline click regression, Escape/outside close, hover via
`mouseover`/`mouseout`, focus via `focusin`/`focusout`, arrow edge per side,
MegaDropdown columns/links/footer/`onSelect`, QuickViewPanel meta/actions/arrow).
Design page: "Popover variants (batch 94)" (overlay tab, visible in the `all` view).
Exports from the `overlay` barrel: `MegaDropdown`/`MegaDropdownProps`/
`MegaMenuColumn`/`MegaMenuItem`/`QuickViewPanel`/`QuickViewPanelProps`/`QuickViewMeta`
plus the extended `PopoverProps`.

### E.5.79 Toast upgrades — as-built (batch 95, todo/09 §G)

Baseline `feedback/Toast.tsx` gains additive batch-95 capabilities without touching
existing `push({ message, tone, durationMs, action })` call sites (the root
`<ToastProvider>` in `apps/web/app/layout.tsx` keeps its default look — mobile-first
bottom strip → `sm:` bottom-right with safe-area padding).

- **`position`** — provider prop and per-toast `position` override, one of
  **`ToastPosition`** = `top|bottom` × `left|center|right`. Each position in use gets
  its own `fixed z-toast` region (`data-toast-region` + `data-position`); the provider
  default region always exists, overrides lazily add theirs. Mobile stays a full-width
  `left-4 right-4` strip; `sm:` tightens to a corner (`items-start`/`items-end`), and
  bottom regions keep `env(safe-area-inset-bottom)` (tops get the inset-top variant).
- **Loading toast** — `loading: true` swaps the tone dot for a spinning `LoaderCircle`
  (`text-accent animate-spin`) and defaults to **sticky**: `durationMs <= 0` now means
  "no auto-dismiss timer" (previously `0` fired instantly), explicit `durationMs`
  still wins. Documented on `Toast.durationMs`.
- **`promise(pending, labels, opts?)`** on `useToast()` — pushes a sticky loading
  toast, then settles it to `success`/`danger` (labels accept functions of the settled
  value/error), re-arming the default 4s — or `opts.durationMs`. Rejections update the
  card **and** rethrow, so callers still own the error.
- **Grouped toasts** — `group: string` collapses same-key pushes into one card:
  latest message/tone wins, a `+N` badge (`sr-only` "more in this group") counts the
  collapsed members, and the auto-dismiss timer re-arms. A synchronous `toastsRef`
  mirror (single `commit()` writer) lets `push` see earlier pushes in the same tick
  without a re-render; the §21.12 three-toast cap still applies.
- **Progress toast** — `progress: number` (clamped by exported **`clampProgress`**) renders
  a `role="progressbar"` bar with `aria-valuenow` plus a mono `%` label under the
  message; drive it with the new **`update(id, patch)`** (a `durationMs` in the patch
  re-arms dismissal; `progress: undefined` removes the bar). **`push` now returns the
  id**, **`dismiss(id)`** is exposed on the context, and **`ToastProvider`/`ToastCard`**
  carry the required `/** @jsxImportSource react */` pragma (rendered by root `bun test`).

Test: `test/batch95-toast-upgrades.test.tsx` (14 cases: id + default region, three-toast
cap, action/dismiss regressions, sticky `durationMs: 0` vs timed auto-dismiss, provider +
per-toast positions, spinner swap, promise success/error incl. rethrow, group collapse
`+2`, progress bar/update/clamp, unknown-id no-op, `useToast` throw, `clampProgress`).
Design page: "Toast upgrades (batch 95)" (feedback tab, visible in the `all` view — six
position buttons, sticky loading, upload progress, promise success/error, grouped push).
Exports from the `feedback` barrel: `ToastPosition`/`PromiseToastLabels` types +
`clampProgress` alongside the extended `Toast`/`ToastInput` shapes and the context's
`push/update/dismiss/promise`.

### E.5.80 System banners — as-built (batch 96, todo/09 §G)

New `feedback/SystemBanners.tsx` (line-1 JSX pragma) — six surfaces over existing
primitives (`Button`, `Switch`, `Modal`; tinted-rule tone edges copied from `Banner`,
so tone stays semantics), all with **controlled visibility** (`open`, default `true`
for the banners; `onDismiss` is where the owner flips it):

- **`AnnouncementBanner`** — slim in-flow strip (`role="region"`), tone dot, optional
  link + labelled dismiss. For site-wide status/promo notices at the top of a layout.
- **`PromoBanner`** — accent-tinted card: `badge` slot, headline, description,
  optional `secondary` (ghost) + `cta` (primary button, or accent `a` when `ctaHref`),
  absolute dismiss. Distinct from neutral `Banner` (no CTA emphasis) and `Toast`.
- **`CookieConsentBanner`** — bottom-fixed `z-chrome` bar (safe-area padded), two-step
  flow: decide (Reject non-essential · Manage preferences · Accept all) ⇄ tune four
  `Switch` categories (Necessary locked on) → `onSave(prefs)` with
  **`CookiePreferences`**`{ necessary, preferences, analytics, marketing }`; optional
  `policyHref`.
- **`GdprConsentModal`** — `Modal` (`scrollable`) with `ConsentPurpose[]`
  (label/description/`required`/`defaultChecked`), required switches locked,
  footer •Reject non-essential (left) •Save choices •Accept all; `onSave` gets a
  `Record<string, boolean>`. **Non-required purposes start OFF** — pre-ticked consent
  is not valid consent; selections initialise once on mount (mount while `open`, or
  remount per flow, to reset). Defaults: strictly-necessary / preferences / analytics /
  marketing.
- **`PromptModal` + `PromptKind`** — the install / update / permission ("push prompt")
  family in one modal: icon well (`Download`/`RefreshCw`/`Bell`), per-kind default copy
  and labels ("Install"/"Not now", "Update available"→"Update now", "Enable
  notifications"→"Allow"), every string overridable plus `title`/`description`/`badge`;
  footer ghost-cancel + primary-confirm; confirm does **not** close — the owner closes
  from `onConfirm`.
- **`SessionTimeoutWarning` + exported `formatCountdown`** — expiry warning over `Modal`:
  "You'll be signed out in `countdown`…" (`s` below a minute, `m:ss` above), ≤10s flips
  the countdown to `text-danger` + `data-urgent`, primary "Stay signed in" is what
  Escape/backdrop also trigger (**never signs the user out by accident**), optional
  quiet `danger` "Sign out now".

Test: `test/batch96-system-banners.test.tsx` (13 cases: announcement link/dismiss+
closed render, promo CTA/secondary/dismiss, cookie decide step + manage switch matrix
incl. locked necessary + save payload + back, cookie closed, GDPR purposes/save/accept/
reject + inert closed modal, three prompt kinds + overrides + cancel via button and
Escape, session countdown/urgent/custom format/no-sign-out, `formatCountdown` units).
Also fixed en route: `controls/Switch.tsx` was missing the
`/** @jsxImportSource react */` pragma (first time it renders under root `bun test`,
it compiled to Hono nodes → "Objects are not valid as a React child").

Design page: "System banners (batch 96)" (feedback tab, visible in the `all` view).
**Convention (user request): batch sections on `/design` render in strict ascending
order from the first batch to the last** — the whole page was re-sequenced (TS-AST
split of the container's JSX children, chunks keyed by their `batch N`, non-batch
chunks ride with their nearest preceding batch; multiset-preserving, verified
ascending `9→96` in source and in the prerendered HTML). Exports from the `feedback`
barrel: `AnnouncementBanner`/`PromoBanner`/`CookieConsentBanner`/`GdprConsentModal`/
`PromptModal`/`SessionTimeoutWarning`/`formatCountdown` + their props types,
`CookiePreferences`, `ConsentPurpose`, `PromptKind`.

### E.5.81 Loading — as-built (batch 97, todo/09 §G)

**`data/Spinner.tsx`** gains **`SpinnerVariant` = `ring | dots | bars | pulse | orbit`**
(additive `variant` prop, default `ring` keeps the original `Loader2` look; `data-variant`
on the root; `role="status"`/`aria-live`/`sr-only` label unchanged) — dots = three
staggered `animate-pulse` discs (150ms steps), bars = four columns of varying heights
with 120ms steps, pulse = one breathing disc, orbit = `animate-spin` wrapper carrying an
offset dot. The required `/** @jsxImportSource react */` pragma was added (first render
by root `bun test`).

**`data/Progress.tsx`** gains **`ProgressVariant` = `linear | circular | stepped |
indeterminate | buffer`** (+ `steps`, `buffer`, `showValue`, `label`; default `linear`
byte-compiles to the previous markup apart from `aria-label`/`data-variant`).
· **`circular`**: `role="progressbar"` wrapper over an `r=40` two-circle SVG
(`stroke-dasharray`/`offset` sweep with `stroke-{tone}` classes, `-rotate-90` start-at-top),
centre `font-mono` % readout (hidden with `showValue={false}`).
· **`stepped`**: N pills (default 5) filled `round(value/max·N)`; `aria-valuenow/max`
report **filled steps of total**, unfilled `bg-line/15`.
· **`indeterminate`**: sweeps a 2/5-width tone bar via the new **`.fx-indeterminate`
keyframe in `styles/engine.css`** (translated 250% because the bar is 40% wide;
`prefers-reduced-motion` pins it to a static 40% bar) — and, correctly, **omits
`aria-valuenow`** so AT announces "busy" instead of a fake value.
· **`buffer`**: soft `bg-tone/30` "loaded" fill behind the solid value fill.

**New `data/LoadingVariants.tsx`** (line-1 pragma):
· **`InfiniteScrollLoader`** — trailing sentinel (distinct from batch-87 `InfiniteList`,
a full container): states via `data-state` = `loading` (dots spinner with `label`) ·
`end` (Check + `endLabel`, no button) · `idle`/`sentinel`; `trigger="auto"` observes
intersection through `IntersectionObserver` (guarded → **falls back to a Load more
button** so it never dead-ends), observer disconnected on cleanup and paused while
`loading`.
· **`RouteProgressBar`** — `fixed top-0 z-toast h-0.5` transition bar, stays mounted so
`active` animates `scale-x-0 → scale-x-100`; inactive is `aria-hidden`.
· **`SplashScreen`** — `fixed inset-0` boot screen: brand slot, title/description, a
spinner (any batch-97 variant; the nested `Spinner` owns the live region) and a status
line; controlled by `open` (default shown).

Test: `test/batch97-loading.test.tsx` (17 cases: baseline ring + linear regressions
incl. clamped width/tone, every variant's structure and stagger delays, circular
readout+hide, stepped aria math/edge (0 filled), indeterminate (no `aria-valuenow`,
fx class), buffer fill widths/tones, loader loading/button/end/auto-fallback, route bar
active↔inactive + AT hiding, splash content/closed/variant). Design page: "Loading
(batch 97)" (feedback tab, rendered **right after batch 96 per the ascending-order
convention**) — five spinners, ±10% driven linear + circular/stepped/buffer/indeterminate,
a 3-page infinite list, a route-bar simulation and a 1.6s auto-closing splash.
Exports (data barrel): `SpinnerVariant`, `ProgressVariant`,
`InfiniteScrollLoader(Props)`, `RouteProgressBar(Props)`, `SplashScreen(Props)`.

### E.5.82 State pages — as-built (batch 98, todo/09 §G)

New `feedback/StatePages.tsx` (line-1 JSX pragma) over a private **`StatePageShell`**
(centred column mirroring `EmptyState` metrics: mono eyebrow → `size-16` tone circle →
title → ≤42ch description → `mid` slot → centred action row; tones `neutral|success|
warning|danger` map to `bg-*-10` circles). `States.tsx` (EmptyState/ErrorState) is
untouched — these are whole-surface pages, not in-view states.

- **`OfflineState`** — `WifiOff` warning circle, offline copy, optional `status` sync
  note (mono), `onRetry` + extra `action` slot. Distinct from `ErrorState` (failed fetch
  inside a view).
- **`ErrorPage` + `StatePageErrorCode` + exported `ERROR_PAGE_COPY`** — full-page
  **400 · 403 · 404 · 500 · 503**: mono eyebrow label, oversized `text-6xl` status code
  (plus `sr-only — <label>`), tone-mapped icon (400/403/503 warning · 404 neutral · 500
  danger), stock title/description from the copy map — all overridable — with
  `onRetry` convenience (500/503), `primaryAction`/`secondaryAction` slots (replace the
  retry) and a mono `details` box (request id/trace). The kit 404 mirrors Next's
  `not-found` so non-Next hosts can reuse it.
- **`UnderConstructionPage`** — `Construction` icon, "Work in progress" eyebrow, ETA
  note, decorative (aria-hidden) indeterminate `Progress` bar + action slot.
- **`ExpiredLinkPage`** — `Link2Off`, `expiresAt` note, `onResend` primary,
  `homeHref` quiet anchor + action slot.
- **`ThankYouPage`** — success-tone `PartyPopper`, `reference` chip (mono, e.g. order
  number), action + home link.
- **`VerificationPendingPage`** — `MailCheck`, default copy embeds `maskedEmail`
  (`a•••@…`), decorative indeterminate bar, `hint` (spam note), `onResend`.

Test: `test/batch98-state-pages.test.tsx` (11 cases: all five codes render copy+code+
icon, tone circles per code, overrides/retry/actions/details, `ERROR_PAGE_COPY` key set
+ entry sanity — icon asserted as function **or** object since lucide icons are
`memo(forwardRef(...))`, offline retry/status/override, construction bar under
`aria-hidden` + ETA + action, expired resend/home-href, thank-you reference/success
tone, verification masked-email/hint/resend + generic fallback). Design page: "State
pages (batch 98)" (feedback tab, rendered **directly after batch 97 per the
ascending-order convention**) — offline card, a 5-code error grid, and one card each
for construction/expired/thank-you/verification wired to toasts. Exports (feedback
barrel): `ErrorPage`/`OfflineState`/`UnderConstructionPage`/`ExpiredLinkPage`/
`ThankYouPage`/`VerificationPendingPage` + props types, `StatePageErrorCode`,
`ERROR_PAGE_COPY`.

### E.5.83 Guidance — as-built (batch 99, todo/09 §G)

New `feedback/Guidance.tsx` (line-1 pragma) over `Popover`/`Modal`/`Button`/`Progress`/
`ProgressDots`. (New-badge/beta-tag was already ✅ via `Badge`/`Chip` — no new code.)

- **`InlineHelp`** — "?" affordance (or custom label) inline with copy; click-opens a
  72-width explanation popover (title + body), Escape/outside close. Between `Tooltip`
  (hover gloss) and `HelpPanel`.
- **`HelpPanel`** — contextual drawer: right-edge `Modal` (`side="right"`, `scrollable`)
  with intro children + `HelpPanelItem[]` (link or plain + description) + footer.
- **`ProductTour`** — step/spotlight walkthrough in a `Portal`: scrim, ringed spotlight
  hole measured from the step's `target` selector (`getBoundingClientRect`, re-measured
  on resize; absent target → centred card) and a `role="dialog"` card — "Step X of N",
  Back/Next→Finish, Skip, clickable `ProgressDots`; controlled (`step`+`onStepChange`)
  or internal; **Escape triggers `onSkip`** (never a silent close). `defaultIndex`.
- **`ChecklistWidget`** — onboarding checklist card: "N of M done" + `Progress` bar +
  per-item toggle buttons (`aria-pressed`, Check/Circle, line-through when done,
  optional per-item link), `onToggle(id, done)` and `onDone` on completion of the last
  item. Type is **`GuidanceChecklistItem`** — `ChecklistItem` was already taken by
  batch 87's list barrel (ambiguous re-export, caught by typecheck).
- **`TipsCarousel`** — one-tip card with polite live region, "Tip N of M", wrap-around
  prev/next + `ProgressDots`; controlled or internal index; `GuidanceTip` type.
- **`FeatureAnnouncement`** — "What's new" anchor with a NEW chip (or custom trigger)
  opening a 80-wide card: NEW badge + title, description, `media` screenshot slot, CTA
  (link or button) + "Got it" `onDismiss`; arrow on.
- **`ChangelogPopup`** — "Changelog" anchor opening version entries (`v{version}` mono
  chip, `Latest` chip, date, bullet items in a max-h scroll list) + "View all releases"
  link. 
- **`OnboardingModal`** — welcome `Modal`: brand slot, headline, description, feature
  bullets (icon circle + title/description), footer Skip (`onClose`) / primary
  `onStart`; Escape closes.

**Hydration fix (user-reported, batch 97 component)** — `InfiniteScrollLoader`
evaluated `typeof IntersectionObserver !== 'undefined'` **during render**: SSR HTML
painted the button fallback while the client's first render painted the observer
sentinel → hydration mismatch on `/design` (same class as the batch-11 `BusinessHours`
fix; first paint must be deterministic). IO support is now detected in a **mount-only
`useState`+`useEffect` swap** — server and first client render both show the button;
capable clients upgrade to the sentinel after mount. Batch-97 tests unchanged (17/17).

Test: `test/batch99-guidance.test.tsx` (12 cases: InlineHelp open/Escape + custom
label, HelpPanel right-side modal/link/✕-close, ProductTour step flow incl. Finish +
Back + Escape + dot jump + controlled-index lock + spotlight measurement (0-size box →
+8px padding) + closed null, Checklist progress/`aria-pressed`/onToggle+onDone, Tips
wrap-around + dots + `onIndexChange`, FeatureAnnouncement trigger/NEW chip/content/
CTA/dismiss, Changelog versions/latest/`viewAllHref`, Onboarding features/start/
skip/Escape). Design page: "Guidance (batch 99)" (feedback tab, **directly after batch
98 per the order convention**). Exports (feedback barrel): the eight components + prop
types (`GuidanceChecklistItem`, `GuidanceTip`, `TourStep`, `ChangelogEntry`,
`HelpPanelItem`, `OnboardingFeature`…).
