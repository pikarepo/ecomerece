/** @jsxImportSource react */

/**
 * Navigation history (todo/09 batch 78 §E). `HistoryDropdown` pairs a
 * browser-style back button with a menu of recent entries (mirrors the
 * `OverflowTabs` menu wiring: `triggerRef` + `Dropdown` + `useClickAway`), and
 * `RecentlyViewed` renders a compact rail of recently visited items.
 *
 * Both are presentational: the frontend history stack
 * (`packages/frontend/adapters/navigation/history stack.store.ts`) feeds
 * `entries` / `items` and receives selections back through callbacks.
 *
 * Markup contract: `mat-*` role classes + theme tokens only — never `--m-*`.
 */

import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, ChevronDown, Clock, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';
import { useClickAway } from '../../lib/hooks';
import { Dropdown, type DropdownItem } from '../overlay/Dropdown';
import { Link } from './Link';

const SPLIT_BUTTON_CLASS =
  'flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-sm text-ink-2 transition-colors duration-skin ease-skin hover:text-ink disabled:pointer-events-none disabled:text-ink-4';

/* ── Back + history dropdown ───────────────────────────────────────────── */

export interface HistoryEntry {
  id: string;
  label: string;
  /** Secondary text — a path, section or relative time. */
  hint?: string;
  icon?: LucideIcon;
  /** Destination URL; passed through to `onNavigate` for the consumer to route. */
  href?: string;
  onSelect?: () => void;
}

export interface HistoryDropdownProps {
  /** Recent entries, most recent first. */
  entries: HistoryEntry[];
  /** Arrow action (browser-style back). Disables the arrow when omitted. */
  onBack?: () => void;
  /** Accessible label for the back arrow. Default "Go back". */
  backLabel?: string;
  /** Accessible label for the history toggle. Default "History". */
  menuLabel?: string;
  /** Keep only the first N entries. Default 8. */
  max?: number;
  /** Controlled open state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Initial open state when uncontrolled. Default false. */
  defaultOpen?: boolean;
  align?: 'start' | 'end';
  /** Called with the chosen entry (after its own `onSelect`). */
  onNavigate?: (entry: HistoryEntry) => void;
  className?: string;
}

/**
 * Split control: a back arrow plus a chevron that opens a menu of the most
 * recent entries. The chevron disables itself when there is nothing to show.
 */
export function HistoryDropdown({
  entries,
  onBack,
  backLabel = 'Go back',
  menuLabel = 'History',
  max = 8,
  open,
  onOpenChange,
  defaultOpen = false,
  align = 'start',
  onNavigate,
  className,
}: HistoryDropdownProps) {
  const controlled = open !== undefined;
  const [internal, setInternal] = useState(defaultOpen);
  const isOpen = controlled ? open : internal;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const setOpen = (next: boolean) => {
    if (!controlled) setInternal(next);
    onOpenChange?.(next);
  };

  useClickAway(rootRef, () => setOpen(false), isOpen);

  const visible = entries.slice(0, Math.max(0, max));
  const items: DropdownItem[] = visible.map((entry) => {
    const Icon = entry.icon;
    return {
      icon: Icon ? <Icon className="size-4" aria-hidden="true" /> : undefined,
      label: (
        <span className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 flex-1 truncate">{entry.label}</span>
          {entry.hint && <span className="shrink-0 text-xs text-ink-4">{entry.hint}</span>}
        </span>
      ),
      onSelect: () => {
        entry.onSelect?.();
        onNavigate?.(entry);
      },
    };
  });

  return (
    <div ref={rootRef} className={cn('relative inline-flex', className)}>
      <div className="mat-control inline-flex items-stretch overflow-hidden rounded-control">
        <button
          type="button"
          aria-label={backLabel}
          title={backLabel}
          onClick={onBack}
          disabled={!onBack}
          className={cn(SPLIT_BUTTON_CLASS, focusRing())}
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
        </button>
        <span className="my-2 w-px bg-line/20" aria-hidden="true" />
        <button
          ref={triggerRef}
          type="button"
          aria-label={menuLabel}
          title={menuLabel}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          disabled={visible.length === 0}
          onClick={() => setOpen(!isOpen)}
          className={cn(SPLIT_BUTTON_CLASS, focusRing())}
        >
          <ChevronDown
            className={cn(
              'size-4 shrink-0 transition-transform duration-skin ease-skin',
              isOpen && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </button>
      </div>
      <Dropdown
        open={isOpen}
        triggerRef={triggerRef}
        onClose={() => setOpen(false)}
        align={align}
        items={items}
      />
    </div>
  );
}

/* ── Recently viewed ───────────────────────────────────────────────────── */

export interface RecentlyViewedItem {
  id: string;
  label: string;
  /** Secondary line — price, category, relative time. */
  hint?: string;
  /** Thumbnail image URL; falls back to a clock icon. */
  thumbnail?: string;
  /** Destination URL. Renders an anchor instead of a button. */
  href?: string;
}

export interface RecentlyViewedProps {
  /** Recent items, most recent first. Renders nothing when empty. */
  items: RecentlyViewedItem[];
  /** Section heading. Default "Recently viewed". */
  title?: string;
  /** Keep only the first N items. Default 8. */
  max?: number;
  /** Show a clear button that calls this. Omit to hide it. */
  onClear?: () => void;
  /** Label for the clear button. Default "Clear". */
  clearLabel?: string;
  /** Horizontal scroll rail (default) or vertical list. */
  layout?: 'rail' | 'list';
  /** Called with the chosen item. */
  onSelect?: (item: RecentlyViewedItem) => void;
  className?: string;
}

const RV_ITEM_CLASS =
  'mat-control flex w-44 shrink-0 items-center gap-2.5 rounded-card p-2 text-left transition-all duration-skin ease-skin hover:brightness-110';

/**
 * Compact "recently viewed" section — a scrollable rail or a stacked list —
 * with an optional clear action. Returns `null` when there is nothing to show.
 */
export function RecentlyViewed({
  items,
  title = 'Recently viewed',
  max = 8,
  onClear,
  clearLabel = 'Clear',
  layout = 'rail',
  onSelect,
  className,
}: RecentlyViewedProps) {
  const visible = items.slice(0, Math.max(0, max));
  if (visible.length === 0) return null;

  return (
    <section aria-label={title} className={cn('min-w-0', className)}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-1.5 text-sm font-medium text-ink-2">
          <Clock className="size-4 shrink-0" aria-hidden="true" />
          {title}
        </h3>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className={cn(
              'inline-flex items-center gap-1 rounded-chip px-2 py-1 text-xs text-ink-3 transition-colors duration-skin ease-skin hover:text-ink',
              focusRing(),
            )}
          >
            <X className="size-3.5 shrink-0" aria-hidden="true" />
            {clearLabel}
          </button>
        )}
      </div>
      <ul
        className={cn(
          layout === 'rail' ? 'flex gap-2.5 overflow-x-auto pb-1' : 'flex flex-col gap-2',
        )}
      >
        {visible.map((item) => {
          const content = (
            <>
              <span className="mat-raised grid size-10 shrink-0 place-items-center overflow-hidden rounded-control text-ink-3">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt="" className="size-full object-cover" />
                ) : (
                  <Clock className="size-4" aria-hidden="true" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm text-ink">{item.label}</span>
                {item.hint && (
                  <span className="block truncate text-xs text-ink-4">{item.hint}</span>
                )}
              </span>
            </>
          );

          return (
            <li key={item.id} className={layout === 'list' ? 'min-w-0' : undefined}>
              {item.href ? (
                <Link
                  href={item.href}
                  variant="unstyled"
                  onClick={() => onSelect?.(item)}
                  className={cn(RV_ITEM_CLASS, layout === 'list' && 'w-full', focusRing())}
                >
                  {content}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelect?.(item)}
                  className={cn(RV_ITEM_CLASS, layout === 'list' && 'w-full', focusRing())}
                >
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
