/** @jsxImportSource react */
import { ArrowRight, Check, ChevronDown, GripVertical, ImageOff } from 'lucide-react';
import { type ReactNode, useId, useState } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

/* ── Horizontal ───────────────────────────────────────────────────────── */

export interface HorizontalCardProps {
  title: string;
  description?: string;
  media?: ReactNode;
  image?: string;
  mediaAlt?: string;
  href?: string;
  actions?: ReactNode;
  className?: string;
}

/** Card variant (todo/09 §F batch 86) — media beside content. */
export function HorizontalCard({
  title,
  description,
  media,
  image,
  mediaAlt,
  href,
  actions,
  className,
}: HorizontalCardProps) {
  const Body = (
    <>
      <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-surface-3 sm:h-auto sm:w-32">
        {media ??
          (image ? (
            <img
              src={image}
              alt={mediaAlt ?? ''}
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center text-ink-4">
              <ImageOff className="size-6" aria-hidden="true" />
            </span>
          ))}
      </div>
      <div className="min-w-0 flex-1 p-4">
        <h3 className="text-sm font-medium text-ink">{title}</h3>
        {description && <p className="mt-1 text-xs leading-relaxed text-ink-2">{description}</p>}
        {actions && <div className="mt-3 flex gap-2">{actions}</div>}
      </div>
    </>
  );
  const cls = cn('group mat-card flex overflow-hidden rounded-card', className);
  if (href) {
    return (
      <a href={href} className={cn(cls, focusRing())}>
        {Body}
      </a>
    );
  }
  return <article className={cls}>{Body}</article>;
}

/* ── Overlay image ────────────────────────────────────────────────────── */

const OVERLAY_HEIGHT = {
  sm: 'h-32',
  md: 'h-48',
  lg: 'h-64',
} as const;

export interface OverlayImageCardProps {
  title: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  href?: string;
  ctaLabel?: string;
  height?: keyof typeof OVERLAY_HEIGHT;
  className?: string;
}

/** Card variant (todo/09 §F batch 86) — text over an image scrim. */
export function OverlayImageCard({
  title,
  description,
  image,
  imageAlt,
  href,
  ctaLabel,
  height = 'md',
  className,
}: OverlayImageCardProps) {
  const inner = (
    <>
      {image ? (
        <img
          src={image}
          alt={imageAlt ?? ''}
          loading="lazy"
          className="absolute inset-0 size-full object-cover transition-transform duration-skin ease-skin group-hover:scale-105"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-ink-4">
          <ImageOff className="size-8" aria-hidden="true" />
        </span>
      )}
      <span aria-hidden="true" className="absolute inset-0 bg-ink/60" />
      <div className="relative flex h-full flex-col justify-end p-4">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {description && <p className="mt-1 text-xs leading-relaxed text-white/80">{description}</p>}
        {ctaLabel && (
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-white">
            {ctaLabel}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </span>
        )}
      </div>
    </>
  );
  const cls = cn(
    'group relative block overflow-hidden rounded-card bg-surface-3',
    OVERLAY_HEIGHT[height],
    className,
  );
  if (href) {
    return (
      <a href={href} className={cn(cls, focusRing())}>
        {inner}
      </a>
    );
  }
  return <article className={cls}>{inner}</article>;
}

/* ── Hover reveal ─────────────────────────────────────────────────────── */

export interface HoverRevealCardProps {
  title: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  href?: string;
  className?: string;
}

/** Card variant (todo/09 §F batch 86) — detail revealed on hover/focus. */
export function HoverRevealCard({
  title,
  description,
  image,
  imageAlt,
  href,
  className,
}: HoverRevealCardProps) {
  return (
    <article className={cn('group relative overflow-hidden rounded-card bg-surface-3', className)}>
      {image ? (
        <img
          src={image}
          alt={imageAlt ?? ''}
          loading="lazy"
          className="h-48 w-full object-cover transition-transform duration-skin ease-skin group-hover:scale-105"
        />
      ) : (
        <span className="flex h-48 w-full items-center justify-center text-ink-4">
          <ImageOff className="size-8" aria-hidden="true" />
        </span>
      )}
      <div className="absolute inset-0 flex flex-col justify-end bg-ink/70 p-4 opacity-0 transition-opacity duration-skin ease-skin group-hover:opacity-100 group-focus-within:opacity-100">
        <h3 className="text-sm font-semibold text-white">
          {href ? (
            <a href={href} className={cn('after:absolute after:inset-0', focusRing())}>
              {title}
            </a>
          ) : (
            title
          )}
        </h3>
        {description && <p className="mt-1 text-xs leading-relaxed text-white/80">{description}</p>}
      </div>
    </article>
  );
}

/* ── Flip ─────────────────────────────────────────────────────────────── */

export interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  flipLabel?: string;
  className?: string;
}

/** Card variant (todo/09 §F batch 86) — two faces toggled by a button. */
export function FlipCard({ front, back, flipLabel = 'Flip', className }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className={cn('flex flex-col gap-2 [perspective:1000px]', className)}>
      <div
        className={cn(
          'relative min-h-40 transition-transform duration-skin ease-skin [transform-style:preserve-3d]',
          flipped && '[transform:rotateY(180deg)]',
        )}
      >
        <div className="[backface-visibility:hidden]" aria-hidden={flipped}>
          {front}
        </div>
        <div
          className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]"
          aria-hidden={!flipped}
        >
          {back}
        </div>
      </div>
      <button
        type="button"
        aria-pressed={flipped}
        onClick={() => setFlipped((v) => !v)}
        className={cn(
          'self-start rounded-control px-3 py-1.5 text-xs font-medium text-ink-2 hover:bg-surface-3 hover:text-ink',
          focusRing(),
        )}
      >
        {flipLabel}
      </button>
    </div>
  );
}

/* ── Expandable ───────────────────────────────────────────────────────── */

export interface ExpandableCardProps {
  title: string;
  summary?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

/** Card variant (todo/09 §F batch 86) — collapsible body. */
export function ExpandableCard({
  title,
  summary,
  children,
  defaultOpen = false,
  className,
}: ExpandableCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <article className={cn('mat-card rounded-card', className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className={cn('flex w-full items-center justify-between gap-3 p-4 text-left', focusRing())}
      >
        <span className="min-w-0">
          <span className="block text-sm font-medium text-ink">{title}</span>
          {summary && <span className="mt-0.5 block text-xs text-ink-3">{summary}</span>}
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-ink-3 transition-transform duration-skin',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>
      <div id={id} hidden={!open} className="border-t border-line/20 p-4">
        {children}
      </div>
    </article>
  );
}

/* ── Selectable ───────────────────────────────────────────────────────── */

export interface SelectableCardProps {
  title: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  trailing?: ReactNode;
  className?: string;
}

/** Card variant (todo/09 §F batch 86) — checkbox-selectable option card. */
export function SelectableCard({
  title,
  description,
  selected,
  onSelect,
  disabled,
  trailing,
  className,
}: SelectableCardProps) {
  return (
    <label
      className={cn(
        'mat-card flex cursor-pointer items-start gap-3 rounded-card p-4 transition-colors',
        selected && 'ring-1 ring-accent',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={selected}
        disabled={disabled}
        onChange={() => onSelect()}
      />
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-chip border transition-colors',
          selected ? 'border-accent bg-accent text-accent-ink' : 'border-line/40',
        )}
      >
        {selected && <Check className="size-3.5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-ink">{title}</span>
        {description && <span className="mt-0.5 block text-xs text-ink-2">{description}</span>}
      </span>
      {trailing}
    </label>
  );
}

/* ── Draggable ────────────────────────────────────────────────────────── */

export interface DraggableCardProps {
  title: string;
  description?: string;
  dragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  dragLabel?: string;
  className?: string;
}

/** Card variant (todo/09 §F batch 86) — drag-to-reorder card with a grip. */
export function DraggableCard({
  title,
  description,
  dragging,
  onDragStart,
  onDragEnd,
  dragLabel = 'Drag to reorder',
  className,
}: DraggableCardProps) {
  const [internal, setInternal] = useState(false);
  const isDragging = dragging ?? internal;
  const handleEnd = () => {
    setInternal(false);
    onDragEnd?.();
  };
  return (
    <article
      draggable
      onDragStart={() => {
        setInternal(true);
        onDragStart?.();
      }}
      onDragEnd={handleEnd}
      className={cn(
        'mat-card flex items-center gap-3 rounded-card p-4',
        isDragging && 'opacity-60',
        className,
      )}
    >
      <span
        role="img"
        aria-label={dragLabel}
        className="inline-flex cursor-grab text-ink-3 active:cursor-grabbing"
      >
        <GripVertical className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-ink">{title}</span>
        {description && <span className="mt-0.5 block text-xs text-ink-2">{description}</span>}
      </span>
    </article>
  );
}

/* ── Stacked ──────────────────────────────────────────────────────────── */

export interface StackedCardsProps {
  items: ReactNode[];
  max?: number;
  label?: string;
  className?: string;
}

/** Card variant (todo/09 §F batch 86) — overlapping deck with +N overflow. */
export function StackedCards({ items, max = 3, label, className }: StackedCardsProps) {
  if (items.length === 0) return null;
  const [top, ...rest] = items;
  const hidden = Math.max(0, items.length - max);
  return (
    <ul className={cn('relative', className)} aria-label={label}>
      {rest.slice(0, Math.max(0, max - 1)).map((_, i) => (
        <li
          key={`peek-${i}`}
          aria-hidden="true"
          className={cn(
            'absolute inset-x-3 h-8 rounded-t-card mat-card',
            i === 0 ? '-top-3 z-[-1]' : '-top-1.5 z-[-2]',
          )}
        />
      ))}
      <li className="relative">{top}</li>
      {hidden > 0 && <li className="mt-2 pl-1 text-xs text-ink-3">+{hidden} more</li>}
    </ul>
  );
}
