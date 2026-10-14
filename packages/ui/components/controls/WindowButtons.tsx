/** @jsxImportSource react */

import { ChevronDown, Maximize, Minimize, Minus, Square, X } from 'lucide-react';
import type { ButtonHTMLAttributes, RefObject } from 'react';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

/**
 * Window & panel chrome buttons (todo/09 batch 56): expand/collapse toggle,
 * fullscreen toggle, and a minimize/maximize/close control cluster.
 * `mat-*` + theme token utilities only.
 */

const BASE =
  'inline-flex shrink-0 select-none items-center justify-center rounded-control transition-all duration-skin ease-skin disabled:pointer-events-none disabled:opacity-60';
const GHOST = 'text-ink-2 hover:bg-surface-3 hover:text-ink';
const SIZE = { sm: 'size-7', md: 'size-9', lg: 'size-11' } as const;
type Size = keyof typeof SIZE;

export interface ExpandCollapseButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onToggle'> {
  expanded: boolean;
  onToggle?: (expanded: boolean) => void;
  size?: Size;
  label?: string;
  collapsedLabel?: string;
  expandedLabel?: string;
}

export function ExpandCollapseButton({
  expanded,
  onToggle,
  size = 'md',
  label,
  collapsedLabel = 'Expand',
  expandedLabel = 'Collapse',
  className,
  ...rest
}: ExpandCollapseButtonProps) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-label={label ?? (expanded ? expandedLabel : collapsedLabel)}
      data-state={expanded ? 'expanded' : 'collapsed'}
      className={cn(BASE, GHOST, SIZE[size], focusRing(), className)}
      onClick={(e) => {
        rest.onClick?.(e);
        onToggle?.(!expanded);
      }}
      {...rest}
    >
      <ChevronDown
        className={cn(
          'size-4 transition-transform duration-skin ease-skin',
          expanded && 'rotate-180',
        )}
        aria-hidden
      />
    </button>
  );
}

export interface FullscreenButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Element to fullscreen; omit to use `document.documentElement`. */
  target?: RefObject<HTMLElement | null>;
  size?: Size;
  onFullscreenChange?: (fullscreen: boolean) => void;
}

export function FullscreenButton({
  target,
  size = 'md',
  onFullscreenChange,
  className,
  ...rest
}: FullscreenButtonProps) {
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handler = () => {
      const active = Boolean(document.fullscreenElement);
      setFullscreen(active);
      onFullscreenChange?.(active);
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [onFullscreenChange]);

  return (
    <button
      type="button"
      aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      aria-pressed={fullscreen}
      className={cn(BASE, GHOST, SIZE[size], focusRing(), className)}
      onClick={(e) => {
        rest.onClick?.(e);
        if (typeof document === 'undefined') return;
        const el = target?.current ?? document.documentElement;
        if (!document.fullscreenElement) {
          void (
            el as HTMLElement & { requestFullscreen?: () => Promise<void> }
          ).requestFullscreen?.();
        } else {
          void document.exitFullscreen?.();
        }
      }}
      {...rest}
    >
      {fullscreen ? (
        <Minimize className="size-4" aria-hidden />
      ) : (
        <Maximize className="size-4" aria-hidden />
      )}
    </button>
  );
}

export interface WindowControlsProps {
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  /** Render macOS-style coloured dots instead of icon buttons. */
  traffic?: boolean;
  size?: Size;
  label?: string;
  className?: string;
}

export function WindowControls({
  onMinimize,
  onMaximize,
  onClose,
  traffic = false,
  size = 'md',
  label = 'Window controls',
  className,
}: WindowControlsProps) {
  if (traffic) {
    const dot = 'size-3 rounded-full transition-transform duration-skin ease-skin hover:scale-110';
    return (
      <div
        role="toolbar"
        aria-label={label}
        className={cn('inline-flex items-center gap-2', className)}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className={cn(dot, 'bg-danger', focusRing())}
        />
        <button
          type="button"
          aria-label="Minimize"
          onClick={onMinimize}
          className={cn(dot, 'bg-warning', focusRing())}
        />
        <button
          type="button"
          aria-label="Maximize"
          onClick={onMaximize}
          className={cn(dot, 'bg-success', focusRing())}
        />
      </div>
    );
  }

  return (
    <div
      role="toolbar"
      aria-label={label}
      className={cn('inline-flex items-center gap-0.5', className)}
    >
      <button
        type="button"
        aria-label="Minimize"
        onClick={onMinimize}
        className={cn(BASE, GHOST, SIZE[size], focusRing())}
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Maximize"
        onClick={onMaximize}
        className={cn(BASE, GHOST, SIZE[size], focusRing())}
      >
        <Square className="size-3.5" aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className={cn(
          BASE,
          'text-ink-2 hover:bg-danger hover:text-danger-ink',
          SIZE[size],
          focusRing(),
        )}
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
