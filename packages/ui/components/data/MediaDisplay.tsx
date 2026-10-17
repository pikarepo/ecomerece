/** @jsxImportSource react */

import type { LucideIcon } from 'lucide-react';
import {
  ChevronDown,
  ChevronUp,
  Download,
  Film,
  Headphones,
  Heart,
  ImageOff,
  ListMusic,
  Music,
  Pause,
  Play,
  X,
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';
import { MediaControls } from '../controls/MediaControls';
import { Badge } from '../surface/Badge';

/**
 * Media display surfaces (todo/09 §F batch 92): thumbnail grid, poster,
 * playlist/podcast rows, now-playing bar, lyrics and play queue.
 * `mat-*` + root theme tokens only — no raw theme tokens in markup.
 */

/** Format seconds as `m:ss` (e.g. `fmtTime(125)` → `2:05`). */
export function fmtTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return `${m}:${rest.toString().padStart(2, '0')}`;
}

/** Shared small round icon-button shell for row actions. */
const ROW_BTN =
  'flex size-8 shrink-0 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-surface-3 hover:text-ink disabled:pointer-events-none disabled:opacity-40';

/** Compact variant for dense queue rows. */
const TINY_BTN =
  'flex size-7 shrink-0 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-surface-3 hover:text-ink disabled:pointer-events-none disabled:opacity-40';

/* ── Artwork helper ───────────────────────────────────────────────────── */

function Art({
  src,
  alt,
  fallback: Fallback,
  iconClass = 'size-6',
  className,
}: {
  src?: string;
  alt: string;
  fallback: LucideIcon;
  iconClass?: string;
  className?: string;
}) {
  if (src) {
    return <img src={src} alt={alt} loading="lazy" className={cn('object-cover', className)} />;
  }
  return (
    <span
      aria-hidden="true"
      className={cn('flex items-center justify-center bg-surface-3 text-ink-4', className)}
    >
      <Fallback className={iconClass} />
    </span>
  );
}

/* ── Thumbnail grid ───────────────────────────────────────────────────── */

export interface MediaThumb {
  id: string;
  label: string;
  src?: string;
  /** Duration overlay, e.g. `4:32`. */
  duration?: string;
  playing?: boolean;
}

export interface ThumbnailGridProps {
  items: MediaThumb[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  /** Fixed column count; omit for the responsive 2 → 3 → 4 default. */
  columns?: 2 | 3 | 4 | 6;
  className?: string;
}

const THUMB_COLS = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  6: 'grid-cols-6',
} as const;

export function ThumbnailGrid({
  items,
  selectedId,
  onSelect,
  columns,
  className,
}: ThumbnailGridProps) {
  return (
    <ul
      className={cn(
        'grid gap-3',
        columns ? THUMB_COLS[columns] : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
        className,
      )}
    >
      {items.map((item) => {
        const selected = item.id === selectedId;
        return (
          <li key={item.id}>
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect?.(item.id)}
              className={cn('flex w-full flex-col gap-1.5 text-left', focusRing())}
            >
              <span
                className={cn(
                  'relative block aspect-video overflow-hidden rounded-control bg-surface-3',
                  selected && 'ring-2 ring-accent',
                )}
              >
                <Art
                  src={item.src}
                  alt={item.label}
                  fallback={ImageOff}
                  className="absolute inset-0 size-full"
                />
                {item.playing && (
                  <span className="absolute left-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-accent text-accent-ink">
                    <Music className="size-3" aria-hidden="true" />
                    <span className="sr-only">Now playing</span>
                  </span>
                )}
                {item.duration && (
                  <span className="absolute bottom-1.5 right-1.5 rounded bg-ink/70 px-1.5 py-0.5 text-xs tabular-nums text-white">
                    {item.duration}
                  </span>
                )}
              </span>
              <span className="truncate text-xs text-ink-2">{item.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ── Poster ───────────────────────────────────────────────────────────── */

export interface PosterCardProps {
  title: string;
  meta?: string;
  src?: string;
  alt: string;
  badge?: string;
  onPlay?: () => void;
  className?: string;
}

/** 2:3 poster frame with a scrim caption (distinct from `MovieCard`, which is a content card). */
export function PosterCard({ title, meta, src, alt, badge, onPlay, className }: PosterCardProps) {
  return (
    <figure className={cn('relative overflow-hidden rounded-card bg-surface-3', className)}>
      <span className="block aspect-[2/3]">
        <Art
          src={src}
          alt={alt}
          fallback={Film}
          iconClass="size-10"
          className="absolute inset-0 size-full"
        />
      </span>
      <span aria-hidden="true" className="absolute inset-0 bg-ink/60" />
      <figcaption className="absolute inset-x-0 bottom-0 p-3">
        <p className="truncate text-sm font-semibold text-white">{title}</p>
        {meta && <p className="truncate text-xs text-white/80">{meta}</p>}
      </figcaption>
      {badge && (
        <Badge tone="accent" className="absolute left-2 top-2">
          {badge}
        </Badge>
      )}
      {onPlay && (
        <button
          type="button"
          aria-label={`Play ${title}`}
          onClick={onPlay}
          className={cn(
            'absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-accent text-accent-ink transition-transform hover:scale-105 active:scale-100',
            focusRing(),
          )}
        >
          <Play className="size-4 translate-x-px" aria-hidden="true" />
        </button>
      )}
    </figure>
  );
}

/* ── Playlist row ─────────────────────────────────────────────────────── */

export interface PlaylistRowProps {
  title: string;
  artist?: string;
  duration?: string;
  artworkSrc?: string;
  playing?: boolean;
  liked?: boolean;
  onPlay?: () => void;
  onLike?: () => void;
  className?: string;
}

/** Single playlist track row (composable; wrap in a `<ul>` when listing). */
export function PlaylistRow({
  title,
  artist,
  duration,
  artworkSrc,
  playing = false,
  liked = false,
  onPlay,
  onLike,
  className,
}: PlaylistRowProps) {
  return (
    <div className={cn('flex items-center gap-3 px-3 py-2', className)}>
      <span className="relative size-10 shrink-0 overflow-hidden rounded-control">
        <Art src={artworkSrc} alt={title} fallback={Music} className="size-full" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'flex items-center gap-1.5 truncate text-sm text-ink',
            playing && 'font-medium text-accent',
          )}
        >
          {playing && <Music className="size-3.5 shrink-0" aria-hidden="true" />}
          {title}
        </span>
        {artist && <span className="block truncate text-xs text-ink-3">{artist}</span>}
      </span>
      {duration && <span className="shrink-0 text-xs tabular-nums text-ink-3">{duration}</span>}
      {onLike && (
        <button
          type="button"
          aria-label={`Like ${title}`}
          aria-pressed={liked}
          onClick={onLike}
          className={cn(ROW_BTN, focusRing())}
        >
          <Heart className={cn('size-4', liked && 'fill-current text-danger')} aria-hidden="true" />
        </button>
      )}
      {onPlay && (
        <button
          type="button"
          aria-label={playing ? `Pause ${title}` : `Play ${title}`}
          onClick={onPlay}
          className={cn(
            'mat-primary flex size-8 shrink-0 items-center justify-center rounded-full text-accent-ink transition-transform active:scale-95',
            focusRing(),
          )}
        >
          {playing ? (
            <Pause className="size-3.5" aria-hidden="true" />
          ) : (
            <Play className="size-3.5 translate-x-px" aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
}

/* ── Podcast episode row ──────────────────────────────────────────────── */

export interface PodcastRowProps {
  title: string;
  show?: string;
  date?: string;
  duration?: string;
  /** Fraction listened, 0–1. Renders a progress line when > 0. */
  progress?: number;
  artworkSrc?: string;
  playing?: boolean;
  onPlay?: () => void;
  onDownload?: () => void;
  className?: string;
}

/** Podcast episode row with listen progress, play and download. */
export function PodcastRow({
  title,
  show,
  date,
  duration,
  progress,
  artworkSrc,
  playing = false,
  onPlay,
  onDownload,
  className,
}: PodcastRowProps) {
  const pct = Math.round(Math.min(1, Math.max(0, progress ?? 0)) * 100);
  const meta = [show, date].filter(Boolean).join(' · ');

  return (
    <div className={cn('flex items-center gap-3 px-3 py-2', className)}>
      <span className="relative size-12 shrink-0 overflow-hidden rounded-control">
        <Art src={artworkSrc} alt={title} fallback={Headphones} className="size-full" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'flex items-center gap-1.5 truncate text-sm text-ink',
            playing && 'font-medium text-accent',
          )}
        >
          {playing && <Music className="size-3.5 shrink-0" aria-hidden="true" />}
          {title}
        </span>
        {meta && <span className="block truncate text-xs text-ink-3">{meta}</span>}
        {pct > 0 && (
          <span className="mt-1.5 flex items-center gap-2">
            <span
              role="progressbar"
              aria-label={`Listen progress: ${title}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              className="h-1 flex-1 overflow-hidden rounded-full bg-surface-3"
            >
              <span
                aria-hidden="true"
                className="block h-full rounded-full bg-accent"
                style={{ width: `${pct}%` }}
              />
            </span>
            <span className="text-xs tabular-nums text-ink-3">{pct}%</span>
          </span>
        )}
      </span>
      {duration && <span className="shrink-0 text-xs tabular-nums text-ink-3">{duration}</span>}
      {onDownload && (
        <button
          type="button"
          aria-label={`Download ${title}`}
          onClick={onDownload}
          className={cn(ROW_BTN, focusRing())}
        >
          <Download className="size-4" aria-hidden="true" />
        </button>
      )}
      {onPlay && (
        <button
          type="button"
          aria-label={playing ? `Pause ${title}` : `Play ${title}`}
          onClick={onPlay}
          className={cn(
            'mat-primary flex size-8 shrink-0 items-center justify-center rounded-full text-accent-ink transition-transform active:scale-95',
            focusRing(),
          )}
        >
          {playing ? (
            <Pause className="size-3.5" aria-hidden="true" />
          ) : (
            <Play className="size-3.5 translate-x-px" aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
}

/* ── Now-playing bar ──────────────────────────────────────────────────── */

function SeekSlider({
  elapsed,
  duration,
  onSeek,
}: {
  elapsed: number;
  duration: number;
  onSeek?: (seconds: number) => void;
}) {
  const pct = duration > 0 ? Math.min(100, Math.max(0, (elapsed / duration) * 100)) : 0;
  const clamp = (s: number) => Math.min(duration, Math.max(0, s));

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={Math.max(0, Math.floor(duration))}
      aria-valuenow={Math.max(0, Math.floor(elapsed))}
      aria-valuetext={`${fmtTime(elapsed)} of ${fmtTime(duration)}`}
      onClick={(e) => {
        if (!onSeek || duration <= 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        if (rect.width <= 0) return;
        const ratio = (e.clientX - rect.left) / rect.width;
        onSeek(clamp(ratio * duration));
      }}
      onKeyDown={(e) => {
        if (!onSeek) return;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          e.preventDefault();
          onSeek(clamp(elapsed + 5));
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          e.preventDefault();
          onSeek(clamp(elapsed - 5));
        } else if (e.key === 'Home') {
          e.preventDefault();
          onSeek(0);
        } else if (e.key === 'End') {
          e.preventDefault();
          onSeek(duration);
        }
      }}
      className={cn(
        'relative h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-surface-3',
        focusRing(),
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 rounded-full bg-accent"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export interface NowPlayingBarProps {
  title: string;
  artist?: string;
  artworkSrc?: string;
  playing?: boolean;
  /** Current position, seconds. */
  elapsed: number;
  /** Total length, seconds. */
  duration: number;
  onPlayPause?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onSeek?: (seconds: number) => void;
  className?: string;
}

/** Mini player bar — reuses the batch-57 `MediaControls` transport. */
export function NowPlayingBar({
  title,
  artist,
  artworkSrc,
  playing = false,
  elapsed,
  duration,
  onPlayPause,
  onPrevious,
  onNext,
  onSeek,
  className,
}: NowPlayingBarProps) {
  return (
    <div
      className={cn(
        'mat-chrome flex items-center gap-4 rounded-card border border-line/10 px-4 py-3',
        className,
      )}
    >
      <span className="relative size-12 shrink-0 overflow-hidden rounded-control">
        <Art src={artworkSrc} alt={title} fallback={Music} className="size-full" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink">{title}</span>
        {artist && <span className="block truncate text-xs text-ink-3">{artist}</span>}
      </span>
      <MediaControls
        playing={playing}
        onPlayPause={onPlayPause}
        onPrevious={onPrevious}
        onNext={onNext}
        size="sm"
        label="Now playing controls"
      />
      <span className="hidden w-72 items-center gap-3 sm:flex">
        <span className="w-9 shrink-0 text-right text-xs tabular-nums text-ink-3">
          {fmtTime(elapsed)}
        </span>
        <SeekSlider elapsed={elapsed} duration={duration} onSeek={onSeek} />
        <span className="w-9 shrink-0 text-xs tabular-nums text-ink-3">{fmtTime(duration)}</span>
      </span>
    </div>
  );
}

/* ── Lyrics ───────────────────────────────────────────────────────────── */

export interface LyricLine {
  id: string;
  text: string;
  /** Optional timestamp for screen readers, milliseconds. */
  timeMs?: number;
}

export interface LyricsViewProps {
  lines: LyricLine[];
  activeId?: string;
  onLineClick?: (id: string) => void;
  label?: string;
  className?: string;
}

/** Scrolled lyrics with a marked active line (accent rail + `aria-current`, never colour-only). */
export function LyricsView({
  lines,
  activeId,
  onLineClick,
  label = 'Lyrics',
  className,
}: LyricsViewProps) {
  return (
    <section
      aria-label={label}
      className={cn('mat-well max-h-72 overflow-y-auto rounded-card p-4', className)}
    >
      <ul className="flex flex-col gap-1.5">
        {lines.map((line) => {
          const active = line.id === activeId;
          const body = (
            <span
              className={cn(
                'block border-l-2 py-0.5 pl-3 text-sm transition-colors',
                active ? 'border-accent font-medium text-ink' : 'border-transparent text-ink-3',
              )}
            >
              {line.text}
              {line.timeMs !== undefined && (
                <span className="sr-only"> at {fmtTime(line.timeMs / 1000)}</span>
              )}
            </span>
          );
          return (
            <li key={line.id} aria-current={active || undefined}>
              {onLineClick ? (
                <button
                  type="button"
                  onClick={() => onLineClick(line.id)}
                  className={cn('w-full text-left', focusRing())}
                >
                  {body}
                </button>
              ) : (
                body
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ── Queue panel ──────────────────────────────────────────────────────── */

export interface QueueItem {
  id: string;
  title: string;
  artist?: string;
  duration?: string;
}

export interface QueuePanelProps {
  items: QueueItem[];
  currentId?: string;
  title?: string;
  onSelect?: (id: string) => void;
  onMove?: (from: number, to: number) => void;
  onRemove?: (id: string) => void;
  onClear?: () => void;
  className?: string;
}

/** Play-queue panel: current track, reorder (up/down), remove and clear. */
export function QueuePanel({
  items,
  currentId,
  title = 'Queue',
  onSelect,
  onMove,
  onRemove,
  onClear,
  className,
}: QueuePanelProps) {
  return (
    <section aria-label={title} className={cn('mat-card overflow-hidden rounded-card', className)}>
      <header className="flex items-center justify-between gap-3 border-b border-line/10 px-4 py-3">
        <span className="flex items-center gap-2">
          <ListMusic className="size-4 text-ink-3" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          <span className="text-xs text-ink-3">{items.length} tracks</span>
        </span>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className={cn('text-xs font-medium text-accent hover:underline', focusRing())}
          >
            Clear
          </button>
        )}
      </header>
      {items.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-ink-3">Queue is empty</p>
      ) : (
        <ol className="divide-y divide-line/10">
          {items.map((item, i) => {
            const current = item.id === currentId;
            return (
              <li
                key={item.id}
                aria-current={current || undefined}
                className={cn('flex items-center gap-2 px-3 py-2', current && 'bg-accent/8')}
              >
                <span className="flex size-6 shrink-0 items-center justify-center text-xs text-ink-3">
                  {current ? <Music className="size-4 text-accent" aria-hidden="true" /> : i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => onSelect?.(item.id)}
                  className={cn('min-w-0 flex-1 text-left', focusRing())}
                >
                  <span className={cn('block truncate text-sm text-ink', current && 'font-medium')}>
                    {item.title}
                  </span>
                  {item.artist && (
                    <span className="block truncate text-xs text-ink-3">{item.artist}</span>
                  )}
                </button>
                {item.duration && (
                  <span className="shrink-0 text-xs tabular-nums text-ink-3">{item.duration}</span>
                )}
                {onMove && (
                  <>
                    <button
                      type="button"
                      aria-label={`Move ${item.title} up`}
                      disabled={i === 0}
                      onClick={() => onMove(i, i - 1)}
                      className={cn(TINY_BTN, focusRing())}
                    >
                      <ChevronUp className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${item.title} down`}
                      disabled={i === items.length - 1}
                      onClick={() => onMove(i, i + 1)}
                      className={cn(TINY_BTN, focusRing())}
                    >
                      <ChevronDown className="size-4" aria-hidden="true" />
                    </button>
                  </>
                )}
                {onRemove && (
                  <button
                    type="button"
                    aria-label={`Remove ${item.title}`}
                    onClick={() => onRemove(item.id)}
                    className={cn(TINY_BTN, focusRing())}
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
