/** @jsxImportSource react */
import {
  AArrowDown,
  AArrowUp,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Maximize,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useId, useState } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';
import { Button } from '../controls/Button';

interface ToolButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
}

function ToolButton({ label, onClick, disabled, children }: ToolButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-control text-ink-3',
        'transition-colors duration-skin ease-skin hover:text-ink',
        'disabled:pointer-events-none disabled:text-ink-4',
        focusRing(),
      )}
    >
      {children}
    </button>
  );
}

import { Badge } from '../surface/Badge';
import type { TocItem } from '../surface/Sticky';

/* ── Document preview ─────────────────────────────────────────────────── */

export interface DocumentPreviewProps {
  title: ReactNode;
  /** Current page (1-based). */
  page?: number;
  pageCount?: number;
  /** Zoom percentage (e.g. `100`). */
  zoom?: number;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onDownload?: () => void;
  onFullscreen?: () => void;
  /** Page body; falls back to a placeholder sheet. */
  children?: ReactNode;
  className?: string;
}

export function DocumentPreview({
  title,
  page = 1,
  pageCount = 1,
  zoom = 100,
  onPrevPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
  onDownload,
  onFullscreen,
  children,
  className,
}: DocumentPreviewProps) {
  return (
    <section
      className={cn('mat-card flex flex-col overflow-hidden rounded-card', className)}
      aria-label={`Document preview: ${typeof title === 'string' ? title : 'document'}`}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-line/10 px-3 py-2">
        <FileText className="size-4 shrink-0 text-ink-3" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{title}</span>
        <div className="flex items-center gap-1">
          <ToolButton label="Previous page" onClick={onPrevPage} disabled={page <= 1}>
            <ChevronLeft className="size-4" aria-hidden="true" />
          </ToolButton>
          <span className="px-1 text-xs tabular-nums text-ink-3">
            {page} / {pageCount}
          </span>
          <ToolButton label="Next page" onClick={onNextPage} disabled={page >= pageCount}>
            <ChevronRight className="size-4" aria-hidden="true" />
          </ToolButton>
        </div>
        <div className="flex items-center gap-1">
          <ToolButton label="Zoom out" onClick={onZoomOut}>
            <ZoomOut className="size-4" aria-hidden="true" />
          </ToolButton>
          <span className="w-10 text-center text-xs tabular-nums text-ink-3">{zoom}%</span>
          <ToolButton label="Zoom in" onClick={onZoomIn}>
            <ZoomIn className="size-4" aria-hidden="true" />
          </ToolButton>
        </div>
        <div className="flex items-center gap-1">
          <ToolButton label="Download" onClick={onDownload}>
            <Download className="size-4" aria-hidden="true" />
          </ToolButton>
          <ToolButton label="Fullscreen" onClick={onFullscreen}>
            <Maximize className="size-4" aria-hidden="true" />
          </ToolButton>
        </div>
      </div>
      <div className="flex justify-center bg-surface-2 p-4">
        <div className="flex aspect-[3/4] w-full max-w-md items-center justify-center rounded-sm bg-canvas shadow-md">
          {children ?? (
            <div className="flex flex-col items-center gap-2 text-ink-3">
              <FileText className="size-10" aria-hidden="true" />
              <span className="text-sm">Page {page}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── Document thumbnails ──────────────────────────────────────────────── */

export interface DocumentPage {
  id: string;
  label?: ReactNode;
}

export interface DocumentThumbnailsProps {
  pages: DocumentPage[];
  activeId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export function DocumentThumbnails({
  pages,
  activeId,
  onSelect,
  className,
}: DocumentThumbnailsProps) {
  return (
    <ul className={cn('flex gap-2 overflow-x-auto p-2', className)} aria-label="Document pages">
      {pages.map((p, index) => {
        const active = p.id === activeId;
        return (
          <li key={p.id} className="shrink-0">
            <button
              type="button"
              aria-current={active ? 'true' : undefined}
              onClick={onSelect ? () => onSelect(p.id) : undefined}
              className={cn(
                'flex w-20 flex-col gap-1 rounded-sm p-0.5',
                focusRing(),
                active && 'ring-2 ring-accent',
              )}
            >
              <span className="flex aspect-[3/4] items-center justify-center rounded-sm bg-surface-2">
                <FileText className="size-5 text-ink-4" aria-hidden="true" />
              </span>
              <span className="truncate text-center text-xs text-ink-3">
                {p.label ?? `Page ${index + 1}`}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ── Annotation pins ──────────────────────────────────────────────────── */

export interface AnnotationPin {
  id: string;
  /** Horizontal position, 0–100 (%). */
  x: number;
  /** Vertical position, 0–100 (%). */
  y: number;
  label: ReactNode;
  note?: ReactNode;
}

export interface AnnotationPinsProps {
  src?: string;
  alt: string;
  pins: AnnotationPin[];
  activeId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export function AnnotationPins({
  src,
  alt,
  pins,
  activeId,
  onSelect,
  className,
}: AnnotationPinsProps) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2', className)}>
      <div className="relative overflow-hidden rounded-card bg-surface-2">
        {src ? (
          <img src={src} alt={alt} className="block h-full w-full object-cover" />
        ) : (
          <div className="aspect-video w-full" role="img" aria-label={alt} />
        )}
        {pins.map((pin, index) => (
          <button
            key={pin.id}
            type="button"
            aria-label={`Annotation ${index + 1}: ${
              typeof pin.label === 'string' ? pin.label : ''
            }`.trim()}
            aria-current={pin.id === activeId ? 'true' : undefined}
            onClick={onSelect ? () => onSelect(pin.id) : undefined}
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            className={cn(
              'absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-semibold text-accent-ink',
              pin.id === activeId ? 'bg-accent ring-4 ring-accent/30' : 'bg-accent',
              focusRing({ className: 'rounded-full' }),
            )}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <ol className="flex flex-col gap-2" aria-label="Annotations">
        {pins.map((pin, index) => (
          <li
            key={pin.id}
            className={cn(
              'rounded-sm border border-line/10 p-3',
              pin.id === activeId && 'border-accent/40 bg-accent/5',
            )}
          >
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="flex size-5 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-ink"
              >
                {index + 1}
              </span>
              <span className="text-sm font-medium text-ink">{pin.label}</span>
            </div>
            {pin.note && <p className="mt-1 pl-7 text-sm text-ink-3">{pin.note}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ── Version history ──────────────────────────────────────────────────── */

export interface DocumentVersion {
  id: string;
  label: ReactNode;
  author: ReactNode;
  date: ReactNode;
  size?: ReactNode;
  note?: ReactNode;
  current?: boolean;
}

export interface VersionHistoryProps {
  versions: DocumentVersion[];
  onDownload?: (id: string) => void;
  onRestore?: (id: string) => void;
  className?: string;
}

export function VersionHistory({
  versions,
  onDownload,
  onRestore,
  className,
}: VersionHistoryProps) {
  return (
    <ol className={cn('flex flex-col', className)} aria-label="Version history">
      {versions.map((v, index) => {
        const last = index === versions.length - 1;
        return (
          <li key={v.id} className="relative flex gap-3 pb-4 last:pb-0">
            <span aria-hidden="true" className="relative flex w-4 shrink-0 justify-center">
              {!last && <span className="absolute top-3 -bottom-1 w-px bg-line/15" />}
              <span
                className={cn(
                  'mt-1 size-2.5 rounded-full ring-4 ring-surface-1',
                  v.current ? 'bg-accent' : 'bg-ink-4',
                )}
              />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-ink">{v.label}</span>
                {v.current && <Badge tone="accent">Current</Badge>}
                {v.size && <span className="text-xs text-ink-4">{v.size}</span>}
              </div>
              <p className="mt-0.5 text-xs text-ink-3">
                {v.author} · {v.date}
              </p>
              {v.note && <p className="mt-1 text-sm text-ink-3">{v.note}</p>}
              {(onDownload || onRestore) && (
                <div className="mt-2 flex gap-2">
                  {onDownload && (
                    <Button size="sm" variant="secondary" onClick={() => onDownload(v.id)}>
                      Download
                    </Button>
                  )}
                  {onRestore && !v.current && (
                    <Button size="sm" variant="ghost" onClick={() => onRestore(v.id)}>
                      Restore
                    </Button>
                  )}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ── Diff view ────────────────────────────────────────────────────────── */

export interface DiffLine {
  left?: string;
  right?: string;
}

export interface DiffViewProps {
  lines: DiffLine[];
  leftTitle?: ReactNode;
  rightTitle?: ReactNode;
  className?: string;
}

type DiffStatus = 'added' | 'removed' | 'changed' | 'unchanged';

function diffStatus(line: DiffLine): DiffStatus {
  if (line.left === undefined) return 'added';
  if (line.right === undefined) return 'removed';
  return line.left === line.right ? 'unchanged' : 'changed';
}

const cellTone: Record<DiffStatus, string> = {
  added: 'bg-success/12',
  removed: 'bg-danger/12',
  changed: 'bg-warning/12',
  unchanged: '',
};

export function DiffView({
  lines,
  leftTitle = 'Before',
  rightTitle = 'After',
  className,
}: DiffViewProps) {
  return (
    <div className={cn('mat-card overflow-hidden rounded-card', className)}>
      <div className="grid grid-cols-2 border-b border-line/10">
        <div className="border-r border-line/10 px-3 py-2 text-xs font-medium uppercase tracking-wide text-ink-3">
          {leftTitle}
        </div>
        <div className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-ink-3">
          {rightTitle}
        </div>
      </div>
      <div className="font-mono text-xs leading-6">
        {lines.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-ink-3">No differences</div>
        ) : (
          lines.map((line, index) => {
            const status = diffStatus(line);
            return (
              <div key={index} className="grid grid-cols-2">
                <div
                  className={cn(
                    'flex gap-2 overflow-x-auto border-r border-line/10 px-3',
                    status === 'added' ? '' : cellTone[status],
                  )}
                >
                  <span
                    className="w-6 shrink-0 select-none text-right text-ink-4"
                    aria-hidden="true"
                  >
                    {line.left === undefined ? '' : index + 1}
                  </span>
                  <span className="whitespace-pre text-ink">{line.left ?? ''}</span>
                </div>
                <div className={cn('flex gap-2 overflow-x-auto px-3', cellTone[status])}>
                  <span
                    className="w-6 shrink-0 select-none text-right text-ink-4"
                    aria-hidden="true"
                  >
                    {line.right === undefined ? '' : index + 1}
                  </span>
                  <span className="whitespace-pre text-ink">{line.right ?? ''}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ── Reader mode ──────────────────────────────────────────────────────── */

export interface ReaderModeProps {
  title?: ReactNode;
  byline?: ReactNode;
  children: ReactNode;
  /** Reading progress, 0–100. */
  progress?: number;
  /** Initial body size step (1–4). */
  defaultSize?: ReaderSize;
  onSizeChange?: (size: ReaderSize) => void;
  className?: string;
}

export type ReaderSize = 1 | 2 | 3 | 4;

const readerText: Record<ReaderSize, string> = {
  1: 'text-sm',
  2: 'text-base',
  3: 'text-lg',
  4: 'text-xl',
};

export function ReaderMode({
  title,
  byline,
  children,
  progress = 0,
  defaultSize = 2,
  onSizeChange,
  className,
}: ReaderModeProps) {
  const [size, setSize] = useState<ReaderSize>(defaultSize);
  const articleId = useId();

  function change(next: ReaderSize) {
    setSize(next);
    onSizeChange?.(next);
  }

  return (
    <article
      className={cn('mat-card overflow-hidden rounded-card', className)}
      aria-labelledby={title ? articleId : undefined}
    >
      <div
        role="progressbar"
        aria-label="Reading progress"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1 w-full bg-surface-2"
      >
        <div
          className="h-full bg-accent transition-[width] duration-skin ease-skin"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      <div className="flex items-center justify-between gap-3 border-b border-line/10 px-4 py-2">
        <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-3">
          <BookOpen className="size-4" aria-hidden="true" />
          Reading
        </span>
        <div className="flex items-center gap-1">
          <ToolButton
            label="Decrease text size"
            onClick={() => change(Math.max(1, size - 1) as ReaderSize)}
            disabled={size <= 1}
          >
            <AArrowDown className="size-4" aria-hidden="true" />
          </ToolButton>
          <ToolButton
            label="Increase text size"
            onClick={() => change(Math.min(4, size + 1) as ReaderSize)}
            disabled={size >= 4}
          >
            <AArrowUp className="size-4" aria-hidden="true" />
          </ToolButton>
        </div>
      </div>
      <div className="mx-auto max-w-prose px-5 py-6">
        {title && (
          <h2 id={articleId} className="mb-1 text-xl font-semibold text-ink">
            {title}
          </h2>
        )}
        {byline && <p className="mb-4 text-sm text-ink-3">{byline}</p>}
        <div className={cn('leading-relaxed text-ink-2', readerText[size])}>{children}</div>
      </div>
    </article>
  );
}

/* ── TOC panel ────────────────────────────────────────────────────────── */

export interface TocPanelProps {
  items: TocItem[];
  activeId?: string;
  title?: ReactNode;
  /** Allow the panel to collapse (default `false`). */
  collapsible?: boolean;
  defaultOpen?: boolean;
  onSelect?: (id: string) => void;
  className?: string;
}

export function TocPanel({
  items,
  activeId,
  title = 'On this page',
  collapsible = false,
  defaultOpen = true,
  onSelect,
  className,
}: TocPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <nav aria-label="Table of contents" className={cn('mat-card rounded-card p-3', className)}>
      {collapsible ? (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'flex w-full items-center justify-between gap-2 text-left text-sm font-medium text-ink',
            focusRing(),
          )}
        >
          {title}
          <ChevronDown
            className={cn('size-4 text-ink-3 transition-transform', open && 'rotate-180')}
            aria-hidden="true"
          />
        </button>
      ) : (
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-3">{title}</p>
      )}
      <ul
        id={panelId}
        className={cn('flex flex-col gap-1', collapsible && (open ? 'mt-2' : 'hidden'))}
      >
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active ? 'true' : undefined}
                onClick={onSelect ? () => onSelect(item.id) : undefined}
                className={cn(
                  'block rounded-sm px-2 py-1 text-sm',
                  focusRing(),
                  active ? 'bg-accent/10 font-medium text-ink' : 'text-ink-3 hover:text-ink',
                )}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
