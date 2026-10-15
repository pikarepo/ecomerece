# TASK 10 — Master themes & skins backlog (the FULL wishlist)

**Purpose:** capture every flavor/palette/style/mode/axis from the pasted
wishlist. Each candidate is one session-sized batch (one skin per session) and
**must** follow `todo/04-new-skin-fast-path.md`: register in `skins/`, compile
via `build:skins`, pass the contrast validator + skin tests, add to the
design-page picker, update DESIGN.md/SKIN-PACK-REPORT.

Classification: 🟩 skin candidate (buildable via fast-path) · 🟨 token-level
(theme/axis work, not a new skin) · ⛔ rejected-for-now (reason noted).

## Done

- ✅ **Doraemon** (2026-10-15, user-requested outside batch numbering):
  `packages/ui/skins/doraemon.ts` — gadget-blue decor hue + AA-safe
  `#0077C8` interactive accent via A2 `accentHint` (this session also WIRED
  `data-accent="skin"`, which was compiled but never applied by
  `useSkin`/bootstrap — 7 pre-existing accentHints were inert before).
  Nunito UI + Fredoka display, pill controls, 24/36 radii, blue-tinted
  shadows, chrome blue/yellow top rule, inset-pocket wells. Registered
  Expressive, `build:skins` ✓, contrast snapshot updated (all fills ≥4.5:1),
  skin + theme-layer + useSkin tests green, DESIGN.md §39 row added.

## Design-system flavors → 🟩 one skin per session

| Batch | Skin | Notes |
|---|---|---|
| 137 | Material 3 Expressive | tonal surfaces + expressive motion axis |
| 138 | Material 2 | baseline elevated cards |
| 139 | Fluent Acrylic (Mica) | backdrop-filter heavy — watch blur governor |
| 140 | Liquid Glass (Apple-style) | Glass v2 adjacency (PROGRESS.md §1.6) |
| 141 | iOS 6 skeuomorph | `skeuo` family adjacency |
| 142 | Windows Metro / Modern | flat + strong type |
| 143 | Windows 7 Aero | glass + gloss (playful corner) |
| 144 | Windows 11 | acrylic + rounded |
| 145 | GNOME Adwaita | lavender-neutral flat |
| 146 | KDE Breeze · 147 | Elementary · 148 | Ubuntu Yaru · 149 | Pop!_OS (one batch per OS family) | desktop-flavor |
| 150 | Gruvbox Material | editor-derived warm dark |
| 151 | Windows 98 / 95 | covered also by retro C.3 — one session |
| 152 | macOS 9 / Classic | retro family |
| 153 | Frutiger Aero | glossy 2000s |
| 154 | Vercel Geist | mono minimal |
| 155 | Linear-style | dense dark app |
| 156 | Notion-style | paper stack |
| 157 | Stripe-style | soft gradient accents |
| 158 | Apple HIG · 159 | Airbnb DLS · 160 | Spotify Encore | brand families, verify trademark-safe = shape-only, no logos |

 frameworks as *flows* not skins (token-shaped but not distinct enough) → 🟨:
 Open Props · Pico · Tachyons · Spectre · Pure · UIkit · Materialize · Vuetify ·
 Quasar · PrimeNG/React · Element Plus · Naive · Arco · Semi · NextUI/HeroUI ·
 Park · Ark · Headless UI · Flowbite · Preline · Tremor · Blueprint · Grommet ·
 Evergreen · Rebass · Theme UI · Reach · Gestalt · Clarity · Cloudscape ·
 Garden · Orbit · Wise Neptune — ≥14 of these overlap each other; do NOT clone
 each as a skin. Sequestered until a concrete integration need appears.

## Color themes (editor-derived & community) → 🟩 per family

| Batch | Family items |
|---|---|
| 161 | Atom One Light/Dark · VS Code Dark+/Light+ · Visual Studio Dark |
| 162 | Sublime Mariana · Monokai Pro · Monokai Soda · Darcula · Jellybeans |
| 163 | Panda · Shades of Purple · Cobalt2 · Dracula Pro |
| 164 | Rosé Pine Moon/Dawn · Tokyo Night Storm/Light |
| 165 | Catppuccin Latte · Frappé · Macchiato · Mocha |
| 166 | Nightfox family (Day/Dawn/Dusk/Nord/Tera/Carbon) |
| 167 | Kanagawa Wave/Dragon/Lotus · Gruvbox Hard/Medium/Soft |
| 168 | Solarized Osaka · Flexoki · Oxocarbon · Vesper |
| 169 | SynthWave · Outrun · City Lights · Synthwave-adjacent neon |
| 170 | Material Darker/Lighter/Ocean/Deep Ocean · Panda-adjacent |
| 171 | Tomorrow · Spacemacs · Doom One · Zenburn · Molokai |
| 172 | Sonokai · Edge · Andromeda · Poimandres · Vitesse · Min | 
| 173 | Remaining minor list items (Bluloco · Winter is Coming · Hopscotch · Ocean Dark · Papercolor · Seoul256 · Srcery · Challenger Deep · Afterglow · Ubuntu Terminal · Tango · Pastel Dark · Modus Operandi/Vivendi · Twilight · Iceberg · Everblush · Mellow · Melange · Oldworld · Cyberdream · Sandy · Github Dimmed · Darcula-adjacent) |

Rule: an editor theme that is just accent-for-accent does NOT pass the §36 "a
skin must change material+geometry+motion together" bar. Each must pick a
distinct material/radius/motion triple to qualify as a skin otherwise it is a
🟨 CSS-theme (tokens-only) not a skin — decisive per item before building.

## Named palettes & hue families → 🟨 accent-hue themes (cheap tokens, NO new skin)

All hue accents route through the existing skin accent slots: Red · Orange ·
Amber · Yellow · Lime · Green · Emerald · Teal · Cyan · Sky · Blue · Indigo ·
Violet · Purple · Fuchsia · Pink · Rose · Gray · Slate · Zinc · Neutral ·
Stone · Crimson · Coral · Peach · Sand · Terracotta · Olive · Sage · Moss ·
Jade · Turquoise · Aqua · Navy · Cobalt · Royal · Plum · Magenta · Burgundy ·
Wine · Chocolate · Mocha · Charcoal · Graphite · Ink · Ivory · Cream · Pearl ·
Gold · Silver · Bronze · Copper · Rust · Dusk · Dawn · Twilight · Arctic ·
Glacier · Tundra · Desert · Savanna · Jungle · Reef · Lagoon · Volcano · Lava ·
Ember · Neon Pink · Neon Green · Electric Blue · Acid · Candy · Bubblegum ·
Cotton Candy · Mint Chocolate · Peach Sorbet.

Batch 174: build the **accent-hue theme layer** (a palette map compiled by
`build-skins` into `<skin>-hue.css` overrides) + design-page hue swatch sheet —
single session, unlocks all ~80 at once. Contrast validator must gate each hue.

## Visual styles → mostly 🟨 skin axes (not separate skins)

- ✅ covered: Bento (bento skin), Glass+aurora (glass-3d), Soft UI (neumorph),
  Claymation (clay/clay-3d), Maximalist (maximal), Brutalism (brutal,
  neo-brutal), Skeuo (skeuo/skeuo-3d), 3D/Isometric (slab engine era).
- Batch 175 🟨: gradient borders · grain/noise overlay · mesh gradients ·
  spotlight/glow cards — as **skin slots** (e.g. `--m-card-sheen`) documented
  in DESIGN.md §36 so any skin may opt in.
- Batch 176 🟨: Swiss/International · Bauhaus · Mid-century · Scandinavian ·
  Japandi · Wabi-sabi · Zen — evaluate as ONE "studio-minimal" skin family.
- Batch 177: retro families (8-bit/16-bit/Mac OS 9/Win 3.1 → one pixel skin;
  Winamp/VHS/Cassette/Web 1.0/Geocities/MySpace → one "early-web" skin; Comic ·
  Manga · Pop art · Memphis 90s · 70s groovy · 80s neon · 90s grunge · Retro-
  futurism → one per era, 3 sessions).
- Batch 178: thematic skins (Space/Galaxy · Ocean · Forest · Desert · Steampunk
  · Medieval · Gothic · Horror · Candy · Tropical · seasons · Cyber-noir ·
  Matrix/Hacker · Military · Industrial · Cardboard · Wood · Stone · Leather ·
  Denim · Textile · Metal · Carbon · Gold luxe · Holographic) — pick 3–5
  commercially sensible; rest logged but 🟨/⛔.
- Batch 179: professional/audience (Corporate blue · Legal · Banking · Medical
  · Academic · Dashboard dark · Trading terminal — Trading terminal is a strong
  commerce candidate; Kids · Senior-friendly · Dyslexia · Color-blind-safe ·
  E-ink · Print-friendly · High contrast — accessibility-first, pair with K
  batch 131; TV 10-foot · Kiosk · Wearable · Car HMI · VR = ⛔ platform tiers).

## Color-mode variants → 🟨 theme-layer work

| Batch | Items |
|---|---|
| 180 | True black · Dim/warm/cool dark · Sepia/Paper (light variants) · Blue-light filter |
| 181 | Grayscale · Inverted · E-ink monochrome · Forced-colors · Low/medium/high contrast presets |
| 182 | Scheduling: day/night schedule · location-based (differs from §9 only by trigger) · per-component inverted sections (scoped sub-theme) |

(ip data-theme already carries light/dark/auto = §9; these extend the mode layer.)

## Theme axes → 🟨 token-pipeline features

| Batch | Items |
|---|---|
| 183 | Shape axis: corner style (squircle/cut-corner/notched) · radius scale · mixed inner/outer radii |
| 184 | Typography axis: font-family slots · type-scale ratio presets · heading-case transform |
| 185 | Spacing/density axis: 4 vs 8 base unit · ultra-compact → spacious presets |
| 186 | Colour axis: 50–950 scales · state-color hooks · chart palettes (categorical/sequential/diverging, color-blind-safe — pairs §23) · gradient presets · harmony rules · dynamic color (from image) |
| 187 | Motion axis: density presets · duration/stagger scale · page-transition style |
| 188 | Iconography axis: stroke-width/size/density slots (Lucide shipping) + pipeline for Phosphor/Tabler/SF-style alternates |
| 189 | Imagery axis: illustration style storage · photo treatment utilities · empty-state art sets · avatar style (gradient-generated) |
| 190 | Sound & haptics: UI-sound taxonomy + `prefers-reduced-motion` gating · haptic presets (web: `navigator.vibrate` wrapper) |
| 191 | Context variants: TV/kiosk/print/PDF/email-safe themes as media-context token overrides |
| 192 | Theming mechanics: token JSON export/import (Figma tokens format) · theme preview gallery page · theme import · contrast checker page · theme versioning note in MIGRATION.md |

## Done when (per batch)
One skin (or one token-layer feature) · fast-path checklist complete ·
validator + skin tests green · design-page picker row · SKIN-PACK-REPORT/DESIGN.md
updated · this file + `PROGRESS.md` updated.
