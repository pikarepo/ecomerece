/** @jsxImportSource react */

/**
 * Floating navigation (todo/09 batch 71): dock, radial menu, hamburger,
 * off-canvas drawer and a fullscreen overlay menu.
 *
 * Markup contract: `mat-*` role classes + theme tokens only — never `--m-*`.
 */

import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';
import { Portal } from '../../lib/Portal';

/* ── Dock ─────────────────────────────────────────────────────────────── */

export interface DockItem {
  id: string;
  label: string;
  icon: ReactNode;
  onSelect?: () => void;
  active?: boolean;
}

export interface DockProps {
  items: DockItem[];
  /** Edge the dock floats on. Default "bottom". */
  edge?: 'bottom' | 'top';
  className?: string;
}

/**
 * macOS-style floating dock: a `mat-chrome` pill of icon buttons with a
 * hover-lift on each item (transform-only — the skin owns colour/shadow).
 */
export function Dock({ items, edge = 'bottom', className }: DockProps) {
  return (
    <nav
      aria-label="Dock"
      className={cn(
        'mat-chrome fixed left-1/2 z-40 flex -translate-x-1/2 items-end gap-1 rounded-full border border-line/20 px-2 py-1.5',
        edge === 'bottom' ? 'bottom-4' : 'top-4',
        className,
      )}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-label={item.label}
          aria-current={item.active ? 'page' : undefined}
          title={item.label}
          onClick={item.onSelect}
          className={cn(
            'grid size-11 place-items-center rounded-full text-ink-2 transition-transform duration-skin ease-skin',
            'hover:-translate-y-1.5 hover:text-ink active:scale-95',
            item.active && 'bg-accent/15 text-accent',
            focusRing(),
          )}
        >
          {item.icon}
        </button>
      ))}
    </nav>
  );
}

/* ── Radial menu ──────────────────────────────────────────────────────── */

export interface RadialMenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  onSelect?: () => void;
}

export interface RadialMenuProps {
  items: RadialMenuItem[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Menu radius in px. Default 96. */
  radius?: number;
  /** Label of the centre toggle button. */
  toggleLabel?: string;
  className?: string;
}

/**
 * Pie/radial menu: a centre toggle with items arranged on a circle.
 * Geometry (per-item translate) is inline style — colour stays in tokens.
 * Items are laid out over the top half-circle (bottom half is off-screen
 * for edge-mounted usage); spread from 180° to 0°.
 */
export function RadialMenu({
  items,
  open = false,
  onOpenChange,
  radius = 96,
  toggleLabel = 'Open menu',
  className,
}: RadialMenuProps) {
  const n = Math.max(items.length, 1);
  return (
    <div className={cn('relative inline-block', className)}>
      {items.map((item, i) => {
        const angle = Math.PI - (i * Math.PI) / Math.max(n - 1, 1);
        const x = Math.cos(angle) * radius;
        const y = -Math.sin(angle) * radius;
        return (
          <button
            key={item.id}
            type="button"
            aria-label={item.label}
            title={item.label}
            aria-hidden={!open}
            tabIndex={open ? 0 : -1}
            onClick={() => {
              item.onSelect?.();
              onOpenChange?.(false);
            }}
            style={{ transform: `translate(${x}px, ${y}px)` }}
            className={cn(
              'mat-control absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-ink transition-all duration-skin ease-skin',
              open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
              focusRing(),
            )}
          >
            {item.icon}
          </button>
        );
      })}
      <button
        type="button"
        aria-label={toggleLabel}
        aria-expanded={open}
        onClick={() => onOpenChange?.(!open)}
        className={cn(
          'mat-primary relative z-10 grid size-12 place-items-center rounded-full font-semibold text-accent-ink transition-transform duration-skin ease-skin active:scale-95',
          open && 'rotate-45',
          focusRing(),
        )}
      >
        <span aria-hidden className="text-xl leading-none">
          +
        </span>
      </button>
    </div>
  );
}

/* ── Hamburger ────────────────────────────────────────────────────────── */

export interface HamburgerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accessible name, e.g. "Open navigation". */
  label?: string;
  className?: string;
}

/** Three-bar toggle that morphs into an X (pure CSS transform). */
export function Hamburger({
  open,
  onOpenChange,
  label = 'Toggle navigation',
  className,
}: HamburgerProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={open}
      onClick={() => onOpenChange(!open)}
      className={cn(
        'grid size-10 place-items-center rounded-control transition-colors duration-skin ease-skin hover:bg-surface-3',
        focusRing(),
        className,
      )}
    >
      <span className="relative block h-4 w-5">
        <span
          aria-hidden
          className={cn(
            'absolute left-0 block h-0.5 w-full rounded-full bg-current transition-all duration-skin ease-skin',
            open ? 'top-1/2 rotate-45' : 'top-0',
          )}
        />
        <span
          aria-hidden
          className={cn(
            'absolute top-1/2 left-0 block h-0.5 w-full rounded-full bg-current transition-all duration-skin ease-skin',
            open ? 'opacity-0' : 'opacity-100',
          )}
        />
        <span
          aria-hidden
          className={cn(
            'absolute left-0 block h-0.5 w-full rounded-full bg-current transition-all duration-skin ease-skin',
            open ? 'top-1/2 -rotate-45' : 'top-full',
          )}
        />
      </span>
    </button>
  );
}

/* ── Off-canvas ───────────────────────────────────────────────────────── */

export interface OffCanvasProps {
  open: boolean;
  onClose: () => void;
  /** Which edge the panel slides in from. Default "left". */
  side?: 'left' | 'right';
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Slide-in drawer with a scrim; Escape and scrim-click close it.
 * Rendered through `Portal` so it stacks above page chrome.
 */
export function OffCanvas({
  open,
  onClose,
  side = 'left',
  title,
  children,
  className,
}: OffCanvasProps) {
  if (!open) return null;
  return (
    <Portal>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: decorative scrim; Escape handled below */}
      <div
        className="fixed inset-0 z-50 bg-canvas/60 backdrop-blur-[2px]"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
        }}
        role="presentation"
      >
        <aside
          aria-label={typeof title === 'string' ? title : 'Navigation panel'}
          className={cn(
            'mat-chrome absolute top-0 flex h-full w-[min(320px,85vw)] flex-col gap-3 border-line/20 p-4',
            side === 'left' ? 'left-0 border-r' : 'right-0 border-l',
            className,
          )}
        >
          {title && <h2 className="text-base font-semibold text-ink">{title}</h2>}
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </aside>
      </div>
    </Portal>
  );
}

/* ── Fullscreen menu ──────────────────────────────────────────────────── */

export interface FullscreenMenuItem {
  id: string;
  label: string;
  href?: string;
  onSelect?: () => void;
}

export interface FullscreenMenuProps {
  open: boolean;
  onClose: () => void;
  items: FullscreenMenuItem[];
  /** Optional brand/headline at the top. */
  header?: ReactNode;
  className?: string;
}

/**
 * Viewport-covering overlay menu with large links (staggered CSS reveal).
 */
export function FullscreenMenu({ open, onClose, items, header, className }: FullscreenMenuProps) {
  if (!open) return null;
  return (
    <Portal>
      <div
        className={cn('mat-chrome fixed inset-0 z-50 flex flex-col p-6', className)}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
      >
        <div className="flex items-center justify-between">
          {header && <div className="text-base font-semibold text-ink">{header}</div>}
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className={cn(
              'ml-auto grid size-10 place-items-center rounded-control text-ink-2 hover:bg-surface-3 hover:text-ink',
              focusRing(),
            )}
          >
            ✕
          </button>
        </div>
        <nav aria-label="Overlay navigation" className="flex flex-1 flex-col justify-center gap-1">
          {items.map((item, i) => (
            <a
              key={item.id}
              href={item.href ?? '#'}
              onClick={() => {
                item.onSelect?.();
                onClose();
              }}
              style={{ animationDelay: `${i * 40}ms` }}
              className={cn(
                'rounded-control px-3 py-2 text-3xl font-semibold tracking-tight text-ink transition-colors duration-skin ease-skin',
                'hover:bg-surface-3 hover:text-accent focus-visible:bg-surface-3',
                'fx-menu-item',
                focusRing(),
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </Portal>
  );
}
