/** @jsxImportSource react */
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

/**
 * Layout primitives — the "bare tags" of the design system.
 *
 * Every component here names only a ROLE (a `mat-*` class) and theme-token
 * utilities (`text-*`, `rounded-*`, `border-*`). The active skin decides what
 * those roles look like, so a `Div`/`Surface` you compose today stays correct
 * when the skin changes. Use these to build application-specific widgets
 * without hard-coding colours, radii or elevation.
 *
 * Material roles (engine.css): ground · panel · card · raised · overlay ·
 * chrome · well · control (interactive only) · primary (CTA only).
 */

/* ── Div / Box ─────────────────────────────────────────────────────────── */

export interface DivProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/** Plain flow div. Zero styling — the tag you control everything on. */
export function Div({ className, ...rest }: DivProps) {
  return <div className={className} {...rest} />;
}

/** Alias of ⧉. Prefer `Div` in app code; `Box` reads better in tokens context. */
export function Box({ className, ...rest }: DivProps) {
  return <div className={className} {...rest} />;
}

/* ── Container ─────────────────────────────────────────────────────────── */

export type ContainerWidth = 'prose' | 'shell';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** `prose` (68ch) for reading layouts, `shell` (1200px) for app shells. */
  width?: ContainerWidth;
  /** Disable the symmetric horizontal padding. */
  bleed?: boolean;
}

/** Centers content at the design-system's accepted width. */
export function Container({ width = 'shell', bleed = false, className, ...rest }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        width === 'shell' ? 'max-w-shell' : 'max-w-prose',
        !bleed && 'px-4 sm:px-6',
        className,
      )}
      {...rest}
    />
  );
}

/* ── Stack / HStack ────────────────────────────────────────────────────── */

export type StackGap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8;

const GAP: Record<StackGap, string> = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
};

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  gap?: StackGap;
  /** Align children: start (default) · center · stretch · end. */
  align?: 'start' | 'center' | 'stretch' | 'end';
}

const STACK_ALIGN = {
  start: 'items-start',
  center: 'items-center',
  stretch: 'items-stretch',
  end: 'items-end',
} as const;

/** Vertical flex column. The default rhythm primitive. */
export function Stack({ gap = 3, align = 'stretch', className, ...rest }: StackProps) {
  return <div className={cn('flex flex-col', GAP[gap], STACK_ALIGN[align], className)} {...rest} />;
}

export interface HStackProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  gap?: StackGap;
  align?: 'start' | 'center' | 'stretch' | 'end';
  /** Wrap children gracefully when space runs out (default true). */
  wrap?: boolean;
}

/** Horizontal flex row that wraps on narrow viewports. */
export function HStack({
  gap = 3,
  align = 'center',
  wrap = true,
  className,
  ...rest
}: HStackProps) {
  return (
    <div
      className={cn('flex', wrap && 'flex-wrap', GAP[gap], STACK_ALIGN[align], className)}
      {...rest}
    />
  );
}

/* ── Grid ──────────────────────────────────────────────────────────────── */

export type GridCols = 1 | 2 | 3 | 4;

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Column count at ≥sm. Falls back to 1 on phones. */
  cols?: GridCols;
}

const COLS = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
} as const;

/** Equal-column responsive grid (1 col on phones). */
export function Grid({ cols = 2, className, ...rest }: GridProps) {
  return <div className={cn('grid grid-cols-1 gap-4', COLS[cols], className)} {...rest} />;
}

/* ── Frame (Every Layout) ──────────────────────────────────────────────── */

export type FrameRatio = 'square' | 'video' | 'photo' | 'portrait' | 'wide' | 'none';

const FRAME_RATIO: Record<FrameRatio, string> = {
  square: 'aspect-square',
  video: 'aspect-video',
  photo: 'aspect-[4/3]',
  portrait: 'aspect-[3/4]',
  wide: 'aspect-[21/9]',
  none: '',
};

export interface FrameProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Locked aspect ratio (default `video`). `none` leaves the box unconstrained. */
  ratio?: FrameRatio;
}

/**
 * Aspect-ratio media box that crops its child to fill (Every Layout "Frame").
 * Direct children are stretched and `object-fit: cover` applied so images/video
 * crop rather than distort.
 */
export function Frame({ ratio = 'video', className, ...rest }: FrameProps) {
  return (
    <div
      className={cn(
        'block overflow-hidden',
        FRAME_RATIO[ratio],
        '[&>img]:size-full [&>img]:object-cover [&>video]:size-full [&>video]:object-cover [&>*]:size-full',
        className,
      )}
      {...rest}
    />
  );
}

/* ── Bleed ─────────────────────────────────────────────────────────────── */

export interface BleedProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Also cancel the vertical rhythm (adds negative block margins). */
  vertical?: boolean;
}

/**
 * Break content out of a padded ancestor (e.g. `Container`) to the full width
 * of that ancestor. Matches `Container`'s `px-4 sm:px-6` gutters.
 */
export function Bleed({ vertical = false, className, ...rest }: BleedProps) {
  return (
    <div
      className={cn(
        vertical && '-my-4',
        '-mx-4 w-[calc(100%+2rem)] sm:-mx-6 sm:w-[calc(100%+3rem)]',
        className,
      )}
      {...rest}
    />
  );
}

/* ── Cluster ───────────────────────────────────────────────────────────── */

export type ClusterJustify = 'start' | 'between' | 'center' | 'end';

const CLUSTER_JUSTIFY: Record<ClusterJustify, string> = {
  start: 'justify-start',
  between: 'justify-between',
  center: 'justify-center',
  end: 'justify-end',
};

export interface ClusterProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  gap?: StackGap;
  justify?: ClusterJustify;
  align?: 'start' | 'center' | 'stretch' | 'end';
}

/**
 * Wrapping row of items that "cluster" together (Every Layout "Cluster") —
 * like `HStack` but with horizontal distribution (`justify`).
 */
export function Cluster({
  gap = 3,
  justify = 'start',
  align = 'center',
  className,
  ...rest
}: ClusterProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap',
        GAP[gap],
        CLUSTER_JUSTIFY[justify],
        STACK_ALIGN[align],
        className,
      )}
      {...rest}
    />
  );
}

/* ── Switcher ──────────────────────────────────────────────────────────── */

export interface SwitcherProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  gap?: StackGap;
}

/**
 * Row that automatically becomes a column when the container is narrower than
 * `40rem` (Every Layout "Switcher") — no media query, container-driven. The
 * threshold is a stable layout constant baked into the utility recipe.
 */
export function Switcher({ gap = 4, className, ...rest }: SwitcherProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap',
        GAP[gap],
        '[&>*]:grow [&>*]:basis-[calc((40rem-100%)*999)]',
        className,
      )}
      {...rest}
    />
  );
}

/* ── Reel ──────────────────────────────────────────────────────────────── */

export interface ReelProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  gap?: StackGap;
  /** Snap each item to the start of the rail while scrolling. */
  snap?: boolean;
}

/**
 * Horizontal scroll rail (Every Layout "Reel"). Children stay on one line and
 * scroll horizontally; overflow is native so it works without JS.
 */
export function Reel({ gap = 3, snap = false, className, ...rest }: ReelProps) {
  return (
    <div
      className={cn(
        'flex overflow-x-auto',
        GAP[gap],
        '[&>*]:shrink-0',
        snap && 'snap-x snap-mandatory [&>*]:snap-start',
        className,
      )}
      {...rest}
    />
  );
}

/* ── Sidebar layout ────────────────────────────────────────────────────── */

export interface SidebarLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /** First child = sidebar, remaining children = content (unless `side`). */
  children?: ReactNode;
  gap?: StackGap;
  /** Which edge the sidebar hugs when there is room (default `left`). */
  side?: 'left' | 'right';
}

/**
 * Content with an accompanying sidebar (Every Layout "Sidebar"). The sidebar
 * keeps `16rem` and the content takes the rest; both stack when the container
 * is too narrow. Named `SidebarLayout` to distinguish it from the navigation
 * `Sidebar` widget.
 */
export function SidebarLayout({ gap = 4, side = 'left', className, ...rest }: SidebarLayoutProps) {
  const recipe =
    side === 'left'
      ? '[&>*:first-child]:basis-64 [&>*:first-child]:grow [&>*:last-child]:basis-0 [&>*:last-child]:grow-[999]'
      : '[&>*:last-child]:basis-64 [&>*:last-child]:grow [&>*:first-child]:basis-0 [&>*:first-child]:grow-[999]';
  return <div className={cn('flex flex-wrap', GAP[gap], recipe, className)} {...rest} />;
}

/* ── Imposter ──────────────────────────────────────────────────────────── */

export interface ImposterProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Take over the viewport and stay pinned (overlays). */
  fixed?: boolean;
  /** Center a single bounded box instead of stretching to the edges. */
  contain?: boolean;
}

/**
 * Centers its child on both axes (Every Layout "Imposter"). Use as an overlay
 * backdrop (`fixed`) or to center one box within the current flow.
 */
export function Imposter({ fixed = false, contain = false, className, ...rest }: ImposterProps) {
  return (
    <div
      className={cn(
        'grid place-items-center',
        fixed ? 'fixed inset-0' : 'min-h-full',
        contain && '[&>*]:max-w-prose',
        className,
      )}
      {...rest}
    />
  );
}

/* ── Cover ─────────────────────────────────────────────────────────────── */

export interface CoverProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  gap?: StackGap;
  /** Minimum block size, e.g. `100vh` or `60vh` (default `100vh`). */
  minHeight?: string;
}

/**
 * Fills a target block-size, pinning the first and last children to the edges
 * and centering everything between (Every Layout "Cover").
 */
export function Cover({ gap = 4, minHeight = '100vh', className, style, ...rest }: CoverProps) {
  return (
    <div
      className={cn(
        'flex flex-col',
        GAP[gap],
        '[&>*]:my-0',
        '[&>:only-child]:my-auto',
        '[&>*:not(:first-child):not(:last-child)]:my-auto',
        className,
      )}
      style={{ minHeight, ...style }}
      {...rest}
    />
  );
}

/* ── MultiColumn ───────────────────────────────────────────────────────── */

export type MultiColumnCount = 2 | 3 | 4;

const MULTI_COLUMN: Record<MultiColumnCount, string> = {
  2: '[column-count:2]',
  3: '[column-count:3]',
  4: '[column-count:4]',
};

export interface MultiColumnProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Number of text columns (default 2). */
  count?: MultiColumnCount;
  /** Column gap (default `2rem`). */
  gap?: string;
}

/**
 * Newspaper-style multi-column text (Every Layout "Multi-column text"). Content
 * flows across `count` columns; each column stays balanced.
 */
export function MultiColumn({
  count = 2,
  gap = '2rem',
  className,
  style,
  ...rest
}: MultiColumnProps) {
  return (
    <div
      className={cn(MULTI_COLUMN[count], className)}
      style={{ columnGap: gap, ...style }}
      {...rest}
    />
  );
}

/* ── Columns ───────────────────────────────────────────────────────────── */

export interface ColumnsProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Minimum column width before wrapping (default `16rem`). */
  min?: string;
  /** Row/column gap (default `1rem`). */
  gap?: string;
}

/**
 * Responsive column layout (Every Layout "Column layout"): as many equal
 * columns as fit above `min`, wrapping to fewer when the container narrows.
 */
export function Columns({ min = '16rem', gap = '1rem', className, style, ...rest }: ColumnsProps) {
  return (
    <div
      className={cn('grid', className)}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${min}, 1fr))`,
        gap,
        ...style,
      }}
      {...rest}
    />
  );
}

/* ── Gutter ────────────────────────────────────────────────────────────── */

const GUTTER_TOP: Record<StackGap, string> = {
  0: '[&>*+*]:mt-0',
  1: '[&>*+*]:mt-1',
  2: '[&>*+*]:mt-2',
  3: '[&>*+*]:mt-3',
  4: '[&>*+*]:mt-4',
  5: '[&>*+*]:mt-5',
  6: '[&>*+*]:mt-6',
  8: '[&>*+*]:mt-8',
};

export interface GutterProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Vertical rhythm between siblings (default 4). */
  size?: StackGap;
}

/**
 * Vertical gutter between sibling blocks using flow layout + margin (Every
 * Layout "Gutter"). Unlike `Stack`, it does not make children flex items, so
 * it is safe around headings, paragraphs and custom blocks.
 */
export function Gutter({ size = 4, className, ...rest }: GutterProps) {
  return <div className={cn(GUTTER_TOP[size], className)} {...rest} />;
}

/* ── Offset / Push / Pull ──────────────────────────────────────────────── */

export interface OffsetProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** First grid line to occupy (1-based). */
  start?: number;
  /** Number of grid lines to span (default 1). */
  span?: number;
  /** Number of columns in the parent grid (default 12). */
  columns?: number;
}

/**
 * Places a child on an explicit grid track (offset) or spans several tracks
 * (push/pull) inside a grid parent. Uses inline `grid-column` so it needs no
 * extra classes.
 */
export function Offset({ start, span = 1, columns, className, style, ...rest }: OffsetProps) {
  const from = start ?? 1;
  const to = columns !== undefined ? Math.min(from + span, columns + 1) : undefined;
  const gridColumn = to !== undefined ? `${from} / ${to}` : `${from} / span ${span}`;
  return <div className={cn(className)} style={{ gridColumn, ...style }} {...rest} />;
}

export interface PushPullProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Shift distance (default `1rem`). */
  amount?: string;
}

/** Nudges a block to the right without affecting the surrounding layout. */
export function Push({ amount = '1rem', className, style, ...rest }: PushPullProps) {
  return (
    <div
      className={cn('relative', className)}
      style={{ transform: `translateX(${amount})`, ...style }}
      {...rest}
    />
  );
}

/** Nudges a block to the left without affecting the surrounding layout. */
export function Pull({ amount = '1rem', className, style, ...rest }: PushPullProps) {
  return (
    <div
      className={cn('relative', className)}
      style={{ transform: `translateX(calc(-1 * ${amount}))`, ...style }}
      {...rest}
    />
  );
}

/* ── Show / Hide ───────────────────────────────────────────────────────── */

export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const SHOW_ABOVE: Record<Breakpoint, string> = {
  sm: 'hidden sm:block',
  md: 'hidden md:block',
  lg: 'hidden lg:block',
  xl: 'hidden xl:block',
  '2xl': 'hidden 2xl:block',
};

const HIDE_ABOVE: Record<Breakpoint, string> = {
  sm: 'block sm:hidden',
  md: 'block md:hidden',
  lg: 'block lg:hidden',
  xl: 'block xl:hidden',
  '2xl': 'block 2xl:hidden',
};

export interface BreakpointProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Breakpoint at which visibility changes (default `md`). */
  above?: Breakpoint;
}

/** Renders children only at `above` and wider (hidden below it). */
export function Show({ above = 'md', className, ...rest }: BreakpointProps) {
  return <div className={cn(SHOW_ABOVE[above], className)} {...rest} />;
}

/** Renders children only below `above` (hidden at `above` and wider). */
export function Hide({ above = 'md', className, ...rest }: BreakpointProps) {
  return <div className={cn(HIDE_ABOVE[above], className)} {...rest} />;
}

/* ── VisuallyHidden ────────────────────────────────────────────────────── */

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  /** Element to render (default `span`). */
  as?: 'span' | 'div';
  /** Reveal the content when it receives keyboard focus (skip links). */
  focusable?: boolean;
}

/**
 * Hides content visually while keeping it available to assistive tech.
 * With `focusable`, the element becomes visible again on focus — the pattern
 * for accessible "skip to content" links.
 */
export function VisuallyHidden({
  as = 'span',
  focusable = false,
  className,
  ...rest
}: VisuallyHiddenProps) {
  const Tag = as;
  return (
    <Tag
      className={cn(
        'sr-only',
        focusable &&
          'focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-modal focus:rounded-control focus:bg-surface-3 focus:px-3 focus:py-1.5 focus:text-sm focus:text-ink',
        className,
      )}
      {...rest}
    />
  );
}

/* ── Surface ───────────────────────────────────────────────────────────── */

export type MaterialRole =
  | 'ground'
  | 'panel'
  | 'card'
  | 'raised'
  | 'overlay'
  | 'chrome'
  | 'well'
  | 'control'
  | 'primary';

const ROLE_CLASS: Record<MaterialRole, string> = {
  ground: 'mat-ground',
  panel: 'mat-panel',
  card: 'mat-card',
  raised: 'mat-raised',
  overlay: 'mat-overlay',
  chrome: 'mat-chrome',
  well: 'mat-well',
  control: 'mat-control',
  primary: 'mat-primary',
};

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Which engine MATERIAL paints this box (default `card`). */
  material?: MaterialRole;
  /** Radius token: chip · control · card (default) · sheet. */
  radius?: 'chip' | 'control' | 'card' | 'sheet';
}

/**
 * A box painted by the active skin. Compose `Surface` + layout primitives to
 * invent app-specific widgets that automatically follow the current skin.
 */ export function Surface({
  material = 'card',
  radius = 'card',
  className,
  ...rest
}: SurfaceProps) {
  return (
    <div
      className={cn(
        ROLE_CLASS[material],
        {
          chip: 'rounded-chip',
          control: 'rounded-control',
          card: 'rounded-card',
          sheet: 'rounded-sheet',
        }[radius],
        className,
      )}
      {...rest}
    />
  );
}

/* Convenience one-liners for the common roles. */

export function Well({ className, ...rest }: SurfaceProps) {
  return <Surface material="well" className={className} {...rest} />;
}

export function Raised({ className, ...rest }: SurfaceProps) {
  return <Surface material="raised" className={className} {...rest} />;
}

export function Panel({ className, ...rest }: SurfaceProps) {
  return <Surface material="panel" className={className} {...rest} />;
}

export function Chrome({ className, ...rest }: SurfaceProps) {
  return <Surface material="chrome" className={className} {...rest} />;
}

export function Ground({ className, ...rest }: SurfaceProps) {
  return <Surface material="ground" className={className} {...rest} />;
}

/* ── Text / Heading ────────────────────────────────────────────────────── */

export type TextTone = 'ink' | 'ink-2' | 'ink-3' | 'ink-4';
export type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';

const TEXT_TONE = {
  ink: 'text-ink',
  'ink-2': 'text-ink-2',
  'ink-3': 'text-ink-3',
  'ink-4': 'text-ink-4',
} as const;

const TEXT_SIZE = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
} as const;

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode;
  /** Ink emphasis level (default `ink`). */
  tone?: TextTone;
  size?: TextSize;
  as?: 'p' | 'span';
}

/** Paragraph or inline span from theme tokens only. */
export function Text({ tone = 'ink', size = 'base', as = 'p', className, ...rest }: TextProps) {
  const Tag = as;
  return <Tag className={cn(TEXT_TONE[tone], TEXT_SIZE[size], className)} {...rest} />;
}

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  children?: ReactNode;
  /** 1–6, rendered as the matching hN tag (default 2). */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  tone?: TextTone;
}

const HEADING_SIZE: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: 'text-3xl font-bold tracking-tight',
  2: 'text-xl font-semibold tracking-tight',
  3: 'text-base font-medium',
  4: 'text-sm font-medium',
  5: 'text-sm font-normal',
  6: 'text-xs font-medium uppercase',
};

/** Themed heading. Styling follows the level, not hard-coded sizes. */
export function Heading({ level = 2, tone = 'ink', className, ...rest }: HeadingProps) {
  const Tag = `h${level}` as const;
  return <Tag className={cn(HEADING_SIZE[level], TEXT_TONE[tone], className)} {...rest} />;
}

export type DisplaySize = 'sm' | 'md' | 'lg';

const DISPLAY_SIZE = {
  sm: 'text-4xl font-bold tracking-tight',
  md: 'text-5xl font-bold tracking-tight',
  lg: 'text-6xl font-bold tracking-tight',
} as const;

export interface DisplayProps extends HTMLAttributes<HTMLHeadingElement> {
  children?: ReactNode;
  /** Display scale (default `md`). */
  size?: DisplaySize;
  tone?: TextTone;
  as?: 'h1' | 'h2' | 'p' | 'span';
}

/** Oversized hero text, larger than `Heading` level 1. */
export function Display({
  size = 'md',
  tone = 'ink',
  as = 'h1',
  className,
  ...rest
}: DisplayProps) {
  const Tag = as;
  return <Tag className={cn(DISPLAY_SIZE[size], TEXT_TONE[tone], className)} {...rest} />;
}

export type SubtitleSize = 'sm' | 'md';

const SUBTITLE_SIZE = {
  sm: 'text-base',
  md: 'text-lg',
} as const;

export interface SubtitleProps extends HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode;
  /** Subtitle scale (default `md`). */
  size?: SubtitleSize;
  tone?: TextTone;
  as?: 'p' | 'span' | 'h2' | 'h3';
}

/** Supporting line beneath a title — medium weight, secondary ink by default. */
export function Subtitle({
  size = 'md',
  tone = 'ink-2',
  as = 'p',
  className,
  ...rest
}: SubtitleProps) {
  const Tag = as;
  return (
    <Tag className={cn(SUBTITLE_SIZE[size], 'font-medium', TEXT_TONE[tone], className)} {...rest} />
  );
}
