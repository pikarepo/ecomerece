/** @jsxImportSource react */

import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';
import { Popover } from './Popover';

/**
 * Popover variants (todo/09 §G batch 94). Hover/focus triggers and the arrow
 * live as additive props on the baseline `Popover`; this file adds the
 * `MegaDropdown` (multi-column nav panel) and `QuickViewPanel` (peek card) —
 * both compose the baseline popover.
 */

/* ── Mega dropdown ────────────────────────────────────────────────────── */

export interface MegaMenuItem {
  id: string;
  label: string;
  /** Renders an anchor when present. */
  href?: string;
  description?: string;
  onSelect?: () => void;
}

export interface MegaMenuColumn {
  id: string;
  title?: string;
  items: MegaMenuItem[];
}

export interface MegaDropdownProps {
  trigger: ReactNode;
  columns: MegaMenuColumn[];
  /** Row under the columns (promo, links). */
  footer?: ReactNode;
  side?: 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
  /** Hover opens by default (nav mega-menu convention); click always toggles. */
  triggerOn?: 'hover' | 'click';
  className?: string;
}

const MEGA_COLS = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
} as const;

/** Wide multi-column navigation panel over the baseline `Popover` (batch 94). */
export function MegaDropdown({
  trigger,
  columns,
  footer,
  side = 'bottom',
  align = 'start',
  triggerOn = 'hover',
  className,
}: MegaDropdownProps) {
  const count = Math.min(Math.max(columns.length, 1), 4) as keyof typeof MEGA_COLS;
  return (
    <Popover
      trigger={trigger}
      triggerOn={triggerOn}
      side={side}
      align={align}
      className={cn('min-w-[420px] max-w-[560px] p-5', className)}
      content={
        <>
          <div className={cn('grid gap-x-6 gap-y-4', MEGA_COLS[count])}>
            {columns.map((column) => (
              <div key={column.id} className="min-w-0">
                {column.title && (
                  <p className="px-2.5 pb-1 text-xs font-semibold uppercase tracking-wide text-ink-4">
                    {column.title}
                  </p>
                )}
                <ul>
                  {column.items.map((item) => {
                    const cls = cn(
                      'block rounded-control px-2.5 py-2 text-sm text-ink-2',
                      'transition-colors hover:bg-surface-3 hover:text-ink',
                      focusRing(),
                    );
                    return (
                      <li key={item.id}>
                        {item.href ? (
                          <a
                            href={item.href}
                            onClick={item.onSelect ? () => item.onSelect?.() : undefined}
                            className={cls}
                          >
                            <span className="block truncate">{item.label}</span>
                            {item.description && (
                              <span className="block truncate text-xs text-ink-3">
                                {item.description}
                              </span>
                            )}
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={item.onSelect}
                            className={cn(cls, 'w-full text-left')}
                          >
                            <span className="block truncate">{item.label}</span>
                            {item.description && (
                              <span className="block truncate text-xs text-ink-3">
                                {item.description}
                              </span>
                            )}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          {footer && <div className="mt-4 border-t border-line/10 pt-3">{footer}</div>}
        </>
      }
    />
  );
}

/* ── Quick view / peek panel ──────────────────────────────────────────── */

export interface QuickViewMeta {
  id: string;
  label: string;
  value: ReactNode;
}

export interface QuickViewPanelProps {
  trigger: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Media slot (image, avatar, chart) above the text. */
  media?: ReactNode;
  description?: ReactNode;
  /** Compact label/value pairs. */
  meta?: QuickViewMeta[];
  /** Action row (buttons/links). */
  actions?: ReactNode;
  side?: 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
  /** Hover opens by default; click always toggles (and pins it open). */
  triggerOn?: 'hover' | 'click';
  className?: string;
}

/** Anchored peek card with summary + actions (batch 94) — interactive, unlike `HoverCard`. */
export function QuickViewPanel({
  trigger,
  title,
  subtitle,
  media,
  description,
  meta,
  actions,
  side = 'top',
  align = 'center',
  triggerOn = 'hover',
  className,
}: QuickViewPanelProps) {
  return (
    <Popover
      trigger={trigger}
      triggerOn={triggerOn}
      side={side}
      align={align}
      arrow
      className={cn('w-72 p-4', className)}
      content={
        <div>
          {media && <div className="mb-3 overflow-hidden rounded-control">{media}</div>}
          <p className="text-sm font-semibold text-ink">{title}</p>
          {subtitle && <p className="text-xs text-ink-3">{subtitle}</p>}
          {description && <p className="mt-2 text-sm text-ink-2">{description}</p>}
          {meta && meta.length > 0 && (
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
              {meta.map((m) => (
                <div key={m.id}>
                  <dt className="text-ink-4">{m.label}</dt>
                  <dd className="text-ink-2">{m.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {actions && <div className="mt-3 flex gap-2">{actions}</div>}
        </div>
      }
    />
  );
}
