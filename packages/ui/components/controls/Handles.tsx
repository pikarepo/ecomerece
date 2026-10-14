/** @jsxImportSource react */

import {
  Grip,
  GripHorizontal,
  GripVertical,
  MoveDiagonal,
  MoveHorizontal,
  MoveVertical,
} from 'lucide-react';
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  PointerEvent as ReactPointerEvent,
} from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

/**
 * Drag / resize / pull affordances (todo/09 batch 60): grip dots, drag
 * handles, resize handles (edge + corner) and a bottom-sheet pull handle.
 * `mat-*` + theme token utilities only.
 */

export type GripOrientation = 'vertical' | 'horizontal';

export interface GripProps extends HTMLAttributes<HTMLSpanElement> {
  orientation?: GripOrientation;
  className?: string;
}

export function GripDots({ orientation = 'vertical', className, ...rest }: GripProps) {
  const Icon = orientation === 'vertical' ? GripVertical : GripHorizontal;
  return (
    <span className={cn('inline-flex text-ink-3', className)} aria-hidden {...rest}>
      <Icon className="size-4" />
    </span>
  );
}

export interface DragHandleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  orientation?: GripOrientation;
  label?: string;
}

export function DragHandle({
  orientation = 'vertical',
  label = 'Drag to reorder',
  className,
  ...rest
}: DragHandleProps) {
  const Icon = orientation === 'vertical' ? GripVertical : GripHorizontal;
  return (
    <button
      type="button"
      aria-label={label}
      data-drag-handle=""
      className={cn(
        'inline-flex cursor-grab touch-none select-none items-center justify-center rounded-control p-1 text-ink-3 transition-colors duration-skin ease-skin hover:text-ink active:cursor-grabbing',
        focusRing(),
        className,
      )}
      {...rest}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}

export interface GripButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

/** A small 2×3 dot grip that is still a focusable button. */
export function GripButton({ label = 'Grip', className, ...rest }: GripButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'inline-flex cursor-grab touch-none select-none items-center justify-center rounded-control p-1 text-ink-3 transition-colors duration-skin ease-skin hover:text-ink active:cursor-grabbing',
        focusRing(),
        className,
      )}
      {...rest}
    >
      <Grip className="size-4" aria-hidden />
    </button>
  );
}

export type ResizeEdge = 'horizontal' | 'vertical' | 'corner';

export interface ResizeHandleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  edge?: ResizeEdge;
  label?: string;
  onResize?: (event: ReactPointerEvent<HTMLButtonElement>) => void;
}

export function ResizeHandle({
  edge = 'corner',
  label = 'Resize',
  onResize,
  className,
  ...rest
}: ResizeHandleProps) {
  const Icon =
    edge === 'horizontal' ? MoveHorizontal : edge === 'vertical' ? MoveVertical : MoveDiagonal;
  const cursor =
    edge === 'horizontal'
      ? 'cursor-ew-resize'
      : edge === 'vertical'
        ? 'cursor-ns-resize'
        : 'cursor-nwse-resize';
  return (
    <button
      type="button"
      aria-label={label}
      data-resize-edge={edge}
      onPointerDown={onResize}
      className={cn(
        'inline-flex touch-none items-center justify-center text-ink-3 transition-colors duration-skin ease-skin hover:text-ink',
        cursor,
        focusRing(),
        className,
      )}
      {...rest}
    >
      <Icon className="size-3.5" aria-hidden />
    </button>
  );
}

export interface PullHandleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

/** Bottom-sheet style pull handle (a small rounded pill). */
export function PullHandle({ label = 'Drag to resize', className, ...rest }: PullHandleProps) {
  return (
    <button
      type="button"
      aria-label={label}
      data-pull-handle=""
      className={cn(
        'flex w-full cursor-grab touch-none justify-center py-2 active:cursor-grabbing',
        focusRing(),
        className,
      )}
      {...rest}
    >
      <span className="h-1.5 w-10 rounded-full bg-line/50" />
    </button>
  );
}
