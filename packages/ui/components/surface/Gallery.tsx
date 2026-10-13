/** @jsxImportSource react */
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

/* ── Mosaic grid ───────────────────────────────────────────────────────── */

export interface MosaicGridProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Number of equal columns (default 4). */
  columns?: number;
  /** Row height (default `8rem`). */
  rowHeight?: string;
  /** Grid gap (default `1rem`). */
  gap?: string;
}

/**
 * A grid of equal tracks whose items may span several tracks — the classic
 * mosaic/blog layout. Pair with `MosaicItem` for per-item spans.
 */
export function MosaicGrid({
  columns = 4,
  rowHeight = '8rem',
  gap = '1rem',
  className,
  style,
  ...rest
}: MosaicGridProps) {
  return (
    <div
      className={cn('grid', className)}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gridAutoRows: rowHeight,
        gap,
        ...style,
      }}
      {...rest}
    />
  );
}

export interface MosaicItemProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Columns to span (default 1). */
  colSpan?: number;
  /** Rows to span (default 1). */
  rowSpan?: number;
}

/** A single mosaic tile that spans `colSpan` columns and `rowSpan` rows. */
export function MosaicItem({
  colSpan = 1,
  rowSpan = 1,
  className,
  style,
  ...rest
}: MosaicItemProps) {
  return (
    <div
      className={cn(className)}
      style={{ gridColumn: `span ${colSpan}`, gridRow: `span ${rowSpan}`, ...style }}
      {...rest}
    />
  );
}

/* ── Bento ─────────────────────────────────────────────────────────────── */

export interface BentoProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Number of columns (default 4). */
  columns?: number;
  /** Height of one row (default `7rem`). */
  rowHeight?: string;
  /** Grid gap (default `1rem`). */
  gap?: string;
}

/**
 * Bento-box grid: fixed-height tracks with explicitly placed cells. Unlike the
 * auto-flowing `MosaicGrid`, cells pick their start line via `BentoCell`.
 */
export function Bento({
  columns = 4,
  rowHeight = '7rem',
  gap = '1rem',
  className,
  style,
  ...rest
}: BentoProps) {
  return (
    <div
      className={cn('grid', className)}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gridAutoRows: rowHeight,
        gap,
        ...style,
      }}
      {...rest}
    />
  );
}

export interface BentoCellProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Column start line (1-based). Omit to auto-place. */
  col?: number;
  /** Row start line (1-based). Omit to auto-place. */
  row?: number;
  /** Columns to span (default 1). */
  colSpan?: number;
  /** Rows to span (default 1). */
  rowSpan?: number;
}

/** An explicitly placed cell inside a `Bento` grid. */
export function BentoCell({
  col,
  row,
  colSpan,
  rowSpan,
  className,
  style,
  ...rest
}: BentoCellProps) {
  const gridColumn =
    col !== undefined ? `${col} / span ${colSpan ?? 1}` : colSpan ? `span ${colSpan}` : undefined;
  const gridRow =
    row !== undefined ? `${row} / span ${rowSpan ?? 1}` : rowSpan ? `span ${rowSpan}` : undefined;
  return <div className={cn(className)} style={{ gridColumn, gridRow, ...style }} {...rest} />;
}

/* ── Masonry board (Pinterest style) ───────────────────────────────────── */

export interface MasonryBoardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Number of columns (default 3). */
  columns?: 2 | 3 | 4;
  /** Column gap (default `1rem`). */
  gap?: string;
}

/**
 * Pinterest-style masonry board built on CSS multi-column. Children keep their
 * natural height and avoid breaking across columns.
 */
export function MasonryBoard({
  columns = 3,
  gap = '1rem',
  className,
  style,
  ...rest
}: MasonryBoardProps) {
  return (
    <div
      className={cn('[&>*]:break-inside-avoid [&>*]:mb-4', className)}
      style={{ columnCount: columns, columnGap: gap, ...style }}
      {...rest}
    />
  );
}

/* ── Justified gallery ─────────────────────────────────────────────────── */

export interface JustifiedImage {
  src: string;
  alt: string;
  /** Width ÷ height (default 1). */
  aspect?: number;
}

export interface JustifiedGalleryProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  items: JustifiedImage[];
  /** Target row height in pixels (default 180). */
  rowHeight?: number;
  /** Gap between tiles (default `0.5rem`). */
  gap?: string;
  onSelect?: (item: JustifiedImage, index: number) => void;
}

/**
 * A justified gallery: tiles share a row height and flex-grow in proportion to
 * their aspect ratio, so each row fills the available width edge to edge.
 */
export function JustifiedGallery({
  items,
  rowHeight = 180,
  gap = '0.5rem',
  onSelect,
  className,
  style,
  ...rest
}: JustifiedGalleryProps) {
  return (
    <div className={cn('flex flex-wrap', className)} style={{ gap, ...style }} {...rest}>
      {items.map((item, index) => {
        const aspect = item.aspect ?? 1;
        const tileStyle = {
          flexGrow: aspect,
          flexBasis: `${rowHeight * aspect}px`,
          height: rowHeight,
        };
        const image = (
          <img
            key={item.src}
            src={item.src}
            alt={item.alt}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        );
        return onSelect ? (
          <button
            type="button"
            key={item.src}
            style={tileStyle}
            onClick={() => onSelect(item, index)}
            className={cn(
              'relative min-w-0 overflow-hidden rounded-control bg-surface-3',
              focusRing(),
            )}
          >
            {image}
          </button>
        ) : (
          <div
            key={item.src}
            style={tileStyle}
            className="relative min-w-0 overflow-hidden rounded-control bg-surface-3"
          >
            {image}
          </div>
        );
      })}
    </div>
  );
}
