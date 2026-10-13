/** @jsxImportSource react */
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';
import { Div } from './Primitives';

export interface StickySidebarProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Sticky offset from the top edge (default `1rem`). */
  top?: string;
  /** Sticky offset from the bottom edge. */
  bottom?: string;
  /** Which axis to stick along (default `y`). */
  axis?: 'y' | 'x';
}

/**
 * Makes its child stick within the surrounding scroll area (sticky sidebar).
 * Pairs with a taller sibling column via `self-start` in flex/grid layouts.
 */
export function StickySidebar({
  top = '1rem',
  bottom,
  axis = 'y',
  className,
  style,
  ...rest
}: StickySidebarProps) {
  return (
    <div
      className={cn('sticky self-start', axis === 'x' && 'left-0', className)}
      style={{
        top: axis === 'y' ? top : undefined,
        bottom,
        ...style,
      }}
      {...rest}
    />
  );
}

export interface TocItem {
  id: string;
  label: ReactNode;
}

export interface StickyTocProps {
  items: TocItem[];
  /** Currently active section id (highlighted). */
  activeId?: string;
  title?: ReactNode;
  /** Sticky offset from the top edge (default `2rem`). */
  top?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

/**
 * Sticky table of contents: a nav of anchor links that follows the reader down
 * a long document. The active section is highlighted via `activeId`.
 */
export function StickyToc({
  items,
  activeId,
  title,
  top = '2rem',
  onSelect,
  className,
}: StickyTocProps) {
  return (
    <nav
      aria-label="Table of contents"
      className={cn('sticky self-start', className)}
      style={{ top }}
    >
      {title && (
        <Div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-3">{title}</Div>
      )}
      <ul className="flex flex-col gap-1 border-l border-line/10">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active ? 'true' : undefined}
                onClick={onSelect ? () => onSelect(item.id) : undefined}
                className={cn(
                  '-ml-px block border-l-2 py-1 pl-3 text-sm transition-colors duration-skin ease-skin',
                  active
                    ? 'border-accent font-medium text-ink'
                    : 'border-transparent text-ink-3 hover:border-line/40 hover:text-ink',
                  focusRing(),
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

export interface StickyCtaBarProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Action element (button) shown on the trailing edge. */
  action?: ReactNode;
  /** Which edge to pin to (default `bottom`). */
  position?: 'bottom' | 'top';
}

/**
 * Sticky call-to-action bar that pins to an edge of its container (e.g. an
 * add-to-cart bar that follows the user down a product page).
 */
export function StickyCtaBar({
  children,
  action,
  position = 'bottom',
  className,
  ...rest
}: StickyCtaBarProps) {
  return (
    <div
      data-position={position}
      className={cn(
        'mat-chrome sticky z-raised flex items-center justify-between gap-4 border-line/10 px-4 py-3',
        position === 'bottom' ? 'bottom-0 border-t' : 'top-0 border-b',
        className,
      )}
      {...rest}
    >
      <div className="min-w-0 text-sm text-ink-2">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
