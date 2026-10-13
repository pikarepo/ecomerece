/** @jsxImportSource react */
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type ToolbarOrientation = 'horizontal' | 'vertical';

export interface ToolbarProps {
  children?: ReactNode;
  orientation?: ToolbarOrientation;
  /** Accessible label for the toolbar region. */
  'aria-label'?: string;
  className?: string;
}

export interface ToolbarButtonProps {
  children?: ReactNode;
  onClick?: () => void;
  pressed?: boolean;
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
}

export interface ToolbarSeparatorProps {
  orientation?: ToolbarOrientation;
  className?: string;
}

export function Toolbar({
  children,
  orientation = 'horizontal',
  'aria-label': ariaLabel,
  className,
}: ToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label={ariaLabel}
      aria-orientation={orientation}
      data-orientation={orientation}
      className={cn(
        'mat-raised inline-flex items-center gap-0.5 rounded-control p-1',
        orientation === 'vertical' && 'flex-col',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ToolbarButton({
  children,
  onClick,
  pressed,
  disabled = false,
  'aria-label': ariaLabel,
  className,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      role={pressed !== undefined ? 'button' : undefined}
      aria-pressed={pressed}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      data-pressed={pressed ? 'true' : undefined}
      className={cn(
        'flex items-center justify-center rounded-chip px-2.5 py-1.5 text-sm',
        'transition-all duration-skin ease-skin focus:outline-none',
        pressed ? 'mat-primary font-medium' : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
        disabled && 'cursor-not-allowed opacity-50',
        // focusRing inlined to avoid import for a simple internal subcomponent
        'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function ToolbarSeparator({ orientation = 'horizontal', className }: ToolbarSeparatorProps) {
  const isVertical = orientation === 'vertical';
  return (
    <hr
      aria-orientation={isVertical ? 'horizontal' : 'vertical'}
      className={cn(
        'shrink-0 border-0 bg-line/20',
        isVertical ? 'h-px w-full my-0.5' : 'h-5 w-px mx-0.5',
        className,
      )}
    />
  );
}
