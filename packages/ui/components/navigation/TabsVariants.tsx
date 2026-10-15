/** @jsxImportSource react */

/**
 * Tabs variants (todo/09 batch 72): sticky, closable/editable, draggable,
 * overflow ("More" menu) and browser/document/workspace chrome tabs.
 *
 * The base `Tabs` (underline / skin-pill via `--r-control`) stays untouched in
 * `./Tabs.tsx` and is reused by `StickyTabs`/`OverflowTabs`.
 * Markup contract: `mat-*` role classes + theme tokens only — never `--m-*`.
 */

import { type ReactNode, useRef, useState } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';
import { useClickAway } from '../../lib/hooks';
import { Dropdown } from '../overlay/Dropdown';
import { type TabItem, Tabs } from './Tabs';

/** Shared tab-button skin (mirrors the base `Tabs` underline treatment). */
const TAB_BASE =
  'relative rounded-control px-4 py-2.5 text-sm font-medium transition-all duration-skin ease-skin';
const TAB_IDLE = 'text-ink-2 hover:text-ink disabled:text-ink-4';
const TAB_ACTIVE =
  'text-ink after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-chip after:bg-accent';
const TAB_AFTER = 'after:transition-colors after:duration-skin after:ease-skin';

/* ── Sticky ───────────────────────────────────────────────────────────── */

export interface StickyTabsProps<T extends string = string> {
  items: Array<TabItem<T>>;
  value: T;
  onChange: (value: T) => void;
  /** Sticky offset from the viewport top, in px. Default 0. */
  offset?: number;
  /** Class for the sticky wrapper. */
  className?: string;
  /** Class passed through to the inner `Tabs` list. */
  listClassName?: string;
}

/** Base `Tabs` pinned in a `sticky` chrome bar (border-bottom strip). */
export function StickyTabs<T extends string = string>({
  items,
  value,
  onChange,
  offset = 0,
  className,
  listClassName,
}: StickyTabsProps<T>) {
  return (
    <div
      className={cn('sticky z-30 mat-chrome border-b border-line/20', className)}
      style={{ top: offset }}
    >
      <Tabs items={items} value={value} onChange={onChange} className={cn('px-2', listClassName)} />
    </div>
  );
}

/* ── Closable / editable ──────────────────────────────────────────────── */

export interface ClosableTabItem<T extends string = string> extends TabItem<T> {
  /** Show the close button for this tab. Default true. */
  closable?: boolean;
}

export interface ClosableTabsProps<T extends string = string> {
  items: Array<ClosableTabItem<T>>;
  value: T;
  onChange: (value: T) => void;
  onClose: (value: T) => void;
  /** Double-click a tab's label to rename it (string labels only). */
  editable?: boolean;
  onRename?: (value: T, label: string) => void;
  /** Accessible name shared by every close button (e.g. "Close tab").
   *  Defaults to `Close <label>` per tab. */
  closeLabel?: string;
  className?: string;
}

/**
 * Tabs with a per-tab close button (two-sibling-button composition — no
 * nested buttons) and optional inline rename on double-click.
 */
export function ClosableTabs<T extends string = string>({
  items,
  value,
  onChange,
  onClose,
  editable,
  onRename,
  closeLabel,
  className,
}: ClosableTabsProps<T>) {
  const [editing, setEditing] = useState<T | null>(null);
  const [draft, setDraft] = useState('');

  const commit = (target: T) => {
    const next = draft.trim();
    const original = items.find((i) => i.value === target);
    setEditing(null);
    if (next && typeof original?.label === 'string' && next !== original.label) {
      onRename?.(target, next);
    }
  };

  return (
    <div role="tablist" aria-label="Tabs" className={cn('flex gap-1.5', className)}>
      {items.map((item) => {
        const active = item.value === value;
        const name = typeof item.label === 'string' ? item.label : 'tab';

        if (editing === item.value) {
          return (
            <span key={item.value} className="relative inline-flex items-center">
              <input
                ref={(el) => el?.focus()}
                aria-label={`Rename ${name}`}
                value={draft}
                onInput={(e) => setDraft(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commit(item.value);
                  } else if (e.key === 'Escape') {
                    setEditing(null);
                  }
                }}
                onBlur={() => commit(item.value)}
                className={cn(
                  'w-28 rounded-control border border-accent/40 bg-surface-1 px-2 py-1.5',
                  'text-sm text-ink outline-none',
                  focusRing(),
                )}
              />
            </span>
          );
        }

        return (
          <span key={item.value} className="relative inline-flex items-center gap-0.5">
            <button
              type="button"
              role="tab"
              aria-selected={active}
              disabled={item.disabled}
              onClick={() => onChange(item.value)}
              onDoubleClick={() => {
                if (editable && onRename && !item.disabled && typeof item.label === 'string') {
                  setDraft(item.label);
                  setEditing(item.value);
                }
              }}
              className={cn(TAB_BASE, TAB_AFTER, active ? TAB_ACTIVE : TAB_IDLE, focusRing())}
            >
              {item.label}
            </button>
            {item.closable !== false && (
              <button
                type="button"
                aria-label={closeLabel ?? `Close ${name}`}
                disabled={item.disabled}
                onClick={() => onClose(item.value)}
                className={cn(
                  'grid size-5 place-items-center rounded-full text-ink-3',
                  'transition-colors duration-skin ease-skin hover:bg-surface-3 hover:text-ink',
                  'disabled:opacity-40',
                  focusRing(),
                )}
              >
                <span aria-hidden>✕</span>
              </button>
            )}
          </span>
        );
      })}
    </div>
  );
}

/* ── Draggable ────────────────────────────────────────────────────────── */

export interface DraggableTabsProps<T extends string = string> {
  items: Array<TabItem<T>>;
  value: T;
  onChange: (value: T) => void;
  /** Fires after a drag-drop or Alt+Arrow reorder: (fromIndex, toIndex). */
  onReorder?: (from: number, to: number) => void;
  className?: string;
}

/**
 * Reorderable tabs: HTML5 drag-and-drop plus a keyboard path
 * (Alt+ArrowLeft / Alt+ArrowRight on the focused tab). Order is kept
 * internally and stays in sync with `items` that appear/disappear.
 */
export function DraggableTabs<T extends string = string>({
  items,
  value,
  onChange,
  onReorder,
  className,
}: DraggableTabsProps<T>) {
  const [manual, setManual] = useState<Array<T> | null>(null);
  const [dragging, setDragging] = useState<T | null>(null);

  const values = items.map((i) => i.value);
  const order = manual
    ? [...manual.filter((v) => values.includes(v)), ...values.filter((v) => !manual.includes(v))]
    : values;

  const move = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= order.length || to >= order.length) return;
    const next = [...order];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setManual(next);
    onReorder?.(from, to);
  };

  return (
    <div role="tablist" aria-label="Tabs" className={cn('flex gap-1.5', className)}>
      {order.map((v) => {
        const item = items.find((i) => i.value === v);
        if (!item) return null;
        const active = v === value;
        return (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={item.disabled}
            draggable={!item.disabled}
            onClick={() => onChange(v)}
            onDragStart={(e) => {
              e.dataTransfer?.setData('text/plain', String(v));
              setDragging(v);
            }}
            onDragEnd={() => setDragging(null)}
            onDragOver={(e) => {
              if (dragging !== null) e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragging === null) return;
              move(order.indexOf(dragging), order.indexOf(v));
              setDragging(null);
            }}
            onKeyDown={(e) => {
              if (!e.altKey || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
              e.preventDefault();
              const from = order.indexOf(v);
              move(from, e.key === 'ArrowLeft' ? from - 1 : from + 1);
            }}
            className={cn(
              TAB_BASE,
              TAB_AFTER,
              active ? TAB_ACTIVE : TAB_IDLE,
              dragging === v && 'opacity-50',
              focusRing(),
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Overflow ─────────────────────────────────────────────────────────── */

export interface OverflowTabsProps<T extends string = string> {
  items: Array<TabItem<T>>;
  value: T;
  onChange: (value: T) => void;
  /** Max tabs shown inline before the rest move into the menu. Default 6. */
  maxVisible?: number;
  /** Label for the overflow trigger. Default "More". */
  moreLabel?: string;
  className?: string;
}

/**
 * Tab strip that collapses everything past `maxVisible` into a "More"
 * menu (`aria-haspopup`/`aria-expanded` trigger + `role="menu"`). The
 * active tab is always kept inline.
 */
export function OverflowTabs<T extends string = string>({
  items,
  value,
  onChange,
  maxVisible = 6,
  moreLabel = 'More',
  className,
}: OverflowTabsProps<T>) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useClickAway(wrapRef, () => setOpen(false), open);

  const limit = Math.max(Math.floor(maxVisible), 1);
  let visible = items;
  let rest: Array<TabItem<T>> = [];
  if (items.length > limit) {
    const head = items.slice(0, limit);
    const active = items.find((i) => i.value === value);
    visible =
      active && !head.some((i) => i.value === active.value)
        ? [...head.slice(0, Math.max(limit - 1, 0)), active]
        : head;
    const shown = new Set(visible.map((i) => i.value));
    rest = items.filter((i) => !shown.has(i.value));
  }

  return (
    <div ref={wrapRef} className={cn('flex items-center gap-1.5', className)}>
      <Tabs items={visible} value={value} onChange={onChange} className="min-w-0" />
      {rest.length > 0 && (
        <div className="relative">
          <button
            ref={triggerRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className={cn(TAB_BASE, TAB_IDLE, 'flex items-center gap-1', focusRing())}
          >
            {moreLabel}
            <span aria-hidden className="text-xs text-ink-3">
              ⋯
            </span>
            <span className="sr-only">{` ${rest.length} more`}</span>
          </button>
          <Dropdown
            open={open}
            triggerRef={triggerRef}
            onClose={() => setOpen(false)}
            align="end"
            items={rest.map((item) => ({
              label: item.label,
              disabled: item.disabled,
              onSelect: () => onChange(item.value),
            }))}
          />
        </div>
      )}
    </div>
  );
}

/* ── Browser / document / workspace chrome ────────────────────────────── */

export interface DocumentTabItem<T extends string = string> extends TabItem<T> {
  icon?: ReactNode;
  /** Show the close button for this tab (needs `onClose`). Default true. */
  closable?: boolean;
}

export interface DocumentTabsProps<T extends string = string> {
  items: Array<DocumentTabItem<T>>;
  value: T;
  onChange: (value: T) => void;
  onClose?: (value: T) => void;
  /**
   * Chrome style: `browser` (traffic-light dots), `document` (plain strip),
   * `workspace` (icons in chips). Default "document".
   */
  chrome?: 'browser' | 'document' | 'workspace';
  /** Accessible name shared by every close button. Defaults to `Close <label>`. */
  closeLabel?: string;
  className?: string;
}

/**
 * File-browser-style tab strip: raised active tab on a `mat-chrome` bar with
 * a bottom border, optional per-tab icon and close button.
 */
export function DocumentTabs<T extends string = string>({
  items,
  value,
  onChange,
  onClose,
  chrome = 'document',
  closeLabel,
  className,
}: DocumentTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label="Tabs"
      className={cn('mat-chrome flex items-end gap-1 border-b border-line/20 px-2 pt-2', className)}
    >
      {chrome === 'browser' && (
        <span aria-hidden className="mb-2.5 mr-2 flex gap-1.5">
          <span className="size-2.5 rounded-full bg-danger" />
          <span className="size-2.5 rounded-full bg-warning" />
          <span className="size-2.5 rounded-full bg-success" />
        </span>
      )}
      {items.map((item) => {
        const active = item.value === value;
        const name = typeof item.label === 'string' ? item.label : 'tab';
        const icon =
          item.icon && chrome === 'workspace' ? (
            <span
              aria-hidden
              className="grid size-4 place-items-center rounded-chip bg-surface-3 text-ink-3"
            >
              {item.icon}
            </span>
          ) : item.icon ? (
            <span aria-hidden className="text-ink-3">
              {item.icon}
            </span>
          ) : null;
        return (
          <span key={item.value} className="relative inline-flex items-center">
            <button
              type="button"
              role="tab"
              aria-selected={active}
              disabled={item.disabled}
              onClick={() => onChange(item.value)}
              className={cn(
                'flex items-center gap-2 rounded-t-control border border-b-0 px-3 py-2',
                'text-sm font-medium transition-colors duration-skin ease-skin',
                active
                  ? 'border-line/20 bg-surface-1 text-ink'
                  : 'border-transparent text-ink-2 hover:bg-surface-3 hover:text-ink disabled:text-ink-4',
                focusRing(),
              )}
            >
              {icon}
              {item.label}
            </button>
            {item.closable !== false && onClose && (
              <button
                type="button"
                aria-label={closeLabel ?? `Close ${name}`}
                disabled={item.disabled}
                onClick={() => onClose(item.value)}
                className={cn(
                  'absolute -right-1.5 -top-1.5 grid size-4.5 place-items-center rounded-full',
                  'border border-line/30 bg-surface-1 text-ink-3 shadow-sm',
                  'transition-colors duration-skin ease-skin hover:bg-surface-3 hover:text-ink',
                  'disabled:opacity-40',
                  focusRing(),
                )}
              >
                <span aria-hidden>✕</span>
              </button>
            )}
          </span>
        );
      })}
    </div>
  );
}
