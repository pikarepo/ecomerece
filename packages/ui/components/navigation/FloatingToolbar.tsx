/** @jsxImportSource react */

import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

/**
 * Contextual toolbars (todo/09 batch 59): a floating (positioned) toolbar, a
 * bubble menu for text selections, and a compact inline toolbar.
 * Builds on `Toolbar`; `mat-*` + theme token utilities only.
 */

export type ToolbarPlacement = 'top' | 'bottom';

export interface FloatingToolbarProps {
  open?: boolean;
  x?: number;
  y?: number;
  placement?: ToolbarPlacement;
  children?: ReactNode;
  label?: string;
  className?: string;
}

export function FloatingToolbar({
  open = true,
  x,
  y,
  placement = 'top',
  children,
  label = 'Floating toolbar',
  className,
}: FloatingToolbarProps) {
  if (!open) return null;
  return (
    <div
      role="toolbar"
      aria-label={label}
      data-placement={placement}
      style={
        x != null || y != null
          ? {
              position: 'fixed',
              left: x,
              top: y,
              transform: placement === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
            }
          : undefined
      }
      className={cn(
        'mat-overlay z-50 inline-flex items-center gap-0.5 rounded-control p-1 shadow-lg',
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface BubbleMenuProps {
  open?: boolean;
  x?: number;
  y?: number;
  children?: ReactNode;
  label?: string;
  className?: string;
}

export function BubbleMenu({
  open = true,
  x,
  y,
  children,
  label = 'Text actions',
  className,
}: BubbleMenuProps) {
  if (!open) return null;
  return (
    <div
      role="toolbar"
      aria-label={label}
      data-bubble-menu=""
      style={x != null || y != null ? { position: 'fixed', left: x, top: y } : undefined}
      onMouseDown={(e) => e.preventDefault()}
      className={cn(
        'mat-overlay z-50 inline-flex items-center gap-0.5 rounded-control p-1 shadow-lg',
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface InlineToolbarProps {
  children?: ReactNode;
  label?: string;
  className?: string;
}

export function InlineToolbar({
  children,
  label = 'Inline toolbar',
  className,
}: InlineToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label={label}
      className={cn(
        'mat-well inline-flex items-center gap-0.5 rounded-control border border-line/30 p-0.5',
        className,
      )}
    >
      {children}
    </div>
  );
}
