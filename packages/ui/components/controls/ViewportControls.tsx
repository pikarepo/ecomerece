/** @jsxImportSource react */

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

/**
 * Viewport/transform controls (todo/09 batch 57): zoom in/out/reset, a pan
 * d-pad, and rotate left/right/reset. `mat-*` + theme token utilities only.
 */

const BTN =
  'inline-flex shrink-0 select-none items-center justify-center rounded-control text-ink-2 transition-all duration-skin ease-skin hover:bg-surface-3 hover:text-ink disabled:pointer-events-none disabled:opacity-60';
const SIZE = { sm: 'size-8', md: 'size-10' } as const;
type Size = keyof typeof SIZE;

export interface ZoomControlsProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Resets to this value (default 1). */
  resetValue?: number;
  size?: Size;
  label?: string;
  className?: string;
}

export function ZoomControls({
  value,
  onValueChange,
  min = 0.25,
  max = 4,
  step = 0.25,
  resetValue = 1,
  size = 'md',
  label = 'Zoom',
  className,
}: ZoomControlsProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, Number(n.toFixed(2))));
  const icon = size === 'sm' ? 'size-3.5' : 'size-4';
  return (
    <div
      role="toolbar"
      aria-label={label}
      className={cn('inline-flex items-center gap-0.5', className)}
    >
      <button
        type="button"
        aria-label="Zoom out"
        disabled={value <= min}
        onClick={() => onValueChange(clamp(value - step))}
        className={cn(BTN, SIZE[size], focusRing())}
      >
        <ZoomOut className={icon} aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Reset zoom"
        onClick={() => onValueChange(resetValue)}
        className={cn(
          BTN,
          'min-w-12 px-2 text-xs font-medium tabular-nums hover:bg-surface-3',
          focusRing(),
        )}
      >
        {Math.round(value * 100)}%
      </button>
      <button
        type="button"
        aria-label="Zoom in"
        disabled={value >= max}
        onClick={() => onValueChange(clamp(value + step))}
        className={cn(BTN, SIZE[size], focusRing())}
      >
        <ZoomIn className={icon} aria-hidden />
      </button>
    </div>
  );
}

export interface PanPadProps {
  /** Called with a normalised direction vector; sum is 0 or ±1 per axis. */
  onPan: (dx: number, dy: number) => void;
  size?: Size;
  label?: string;
  className?: string;
}

export function PanPad({ onPan, size = 'md', label = 'Pan', className }: PanPadProps) {
  const icon = size === 'sm' ? 'size-3.5' : 'size-4';
  const pad = cn(BTN, size === 'sm' ? 'size-8' : 'size-9', focusRing());
  const cell = 'flex items-center justify-center';
  return (
    <div
      role="toolbar"
      aria-label={label}
      className={cn('grid w-fit grid-cols-3 grid-rows-3 gap-0.5', className)}
    >
      <span />
      <button
        type="button"
        aria-label="Pan up"
        onClick={() => onPan(0, -1)}
        className={cn(cell, pad)}
      >
        <ArrowUp className={icon} aria-hidden />
      </button>
      <span />
      <button
        type="button"
        aria-label="Pan left"
        onClick={() => onPan(-1, 0)}
        className={cn(cell, pad)}
      >
        <ArrowLeft className={icon} aria-hidden />
      </button>
      <span />
      <button
        type="button"
        aria-label="Pan right"
        onClick={() => onPan(1, 0)}
        className={cn(cell, pad)}
      >
        <ArrowRight className={icon} aria-hidden />
      </button>
      <span />
      <button
        type="button"
        aria-label="Pan down"
        onClick={() => onPan(0, 1)}
        className={cn(cell, pad)}
      >
        <ArrowDown className={icon} aria-hidden />
      </button>
      <span />
    </div>
  );
}

export interface RotateControlProps {
  /** Rotation in degrees. */
  value: number;
  onValueChange: (degrees: number) => void;
  step?: number;
  size?: Size;
  label?: string;
  className?: string;
  showValue?: boolean;
}

export function RotateControl({
  value,
  onValueChange,
  step = 90,
  size = 'md',
  label = 'Rotate',
  className,
  showValue = true,
}: RotateControlProps) {
  const icon = size === 'sm' ? 'size-3.5' : 'size-4';
  const normalize = (d: number) => ((d % 360) + 360) % 360;
  return (
    <div
      role="toolbar"
      aria-label={label}
      className={cn('inline-flex items-center gap-0.5', className)}
    >
      <button
        type="button"
        aria-label="Rotate left"
        onClick={() => onValueChange(normalize(value - step))}
        className={cn(BTN, SIZE[size], focusRing())}
      >
        <RotateCcw className={icon} aria-hidden />
      </button>
      {showValue && (
        <span className="min-w-12 text-center text-xs font-medium tabular-nums text-ink">
          {normalize(value)}°
        </span>
      )}
      <button
        type="button"
        aria-label="Rotate right"
        onClick={() => onValueChange(normalize(value + step))}
        className={cn(BTN, SIZE[size], focusRing())}
      >
        <RotateCw className={icon} aria-hidden />
      </button>
    </div>
  );
}
