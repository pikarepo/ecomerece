/** @jsxImportSource react */
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type HeatRamp = 'accent' | 'success' | 'warning' | 'danger' | 'diverging';

export interface HeatCellProps {
  /** Value mapped onto the intensity scale. */
  value: number;
  /** Lower bound of the scale. Default 0. */
  min?: number;
  /** Upper bound of the scale. Default 1. */
  max?: number;
  /** Sequential hue, or `diverging` (sign-based green/red). */
  ramp?: HeatRamp;
  /** Custom display formatter. Defaults to `String(value)`. */
  format?: (value: number) => string;
  /** Override the rendered content. */
  children?: ReactNode;
  /** Accessible name. Default "Heat cell". */
  label?: string;
  className?: string;
}

/** Normalise `value` into the 0–1 intensity of its scale. */
export function heatIntensity(value: number, min = 0, max = 1): number {
  if (max === min) return value > min ? 1 : 0;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

const SEQUENTIAL: Record<Exclude<HeatRamp, 'diverging'>, string[]> = {
  accent: ['bg-accent/10', 'bg-accent/20', 'bg-accent/30', 'bg-accent/40', 'bg-accent/50'],
  success: ['bg-success/10', 'bg-success/20', 'bg-success/30', 'bg-success/40', 'bg-success/50'],
  warning: ['bg-warning/10', 'bg-warning/20', 'bg-warning/30', 'bg-warning/40', 'bg-warning/50'],
  danger: ['bg-danger/10', 'bg-danger/20', 'bg-danger/30', 'bg-danger/40', 'bg-danger/50'],
};
const POSITIVE = SEQUENTIAL.success;
const NEGATIVE = SEQUENTIAL.danger;

/**
 * Tailwind role class for a heat cell — role + opacity bucket only (no raw
 * theme tokens, per the 02-E §1 markup contract). Diverging picks success for
 * non-negative values and danger for negatives.
 */
export function heatClass(ramp: HeatRamp, value: number, min = 0, max = 1): string {
  const intensity =
    ramp === 'diverging'
      ? Math.min(1, Math.abs(value) / Math.max(Math.abs(min), Math.abs(max), 1e-9))
      : heatIntensity(value, min, max);
  const steps = ramp === 'diverging' ? (value < 0 ? NEGATIVE : POSITIVE) : SEQUENTIAL[ramp];
  const level = Math.min(steps.length - 1, Math.max(0, Math.floor(intensity * steps.length)));
  return steps[level];
}

/**
 * Heat cell (todo/09 §F batch 82) — a value whose background intensity encodes
 * magnitude on a colour ramp. For dense tables, calendars and matrix grids.
 */
export function HeatCell({
  value,
  min = 0,
  max = 1,
  ramp = 'accent',
  format,
  children,
  label,
  className,
}: HeatCellProps) {
  const aria = `${label ?? 'Heat cell'}: ${format ? format(value) : value} (${ramp})`;
  return (
    <span
      role="img"
      aria-label={aria}
      className={cn(
        'inline-flex min-w-[2.5rem] items-center justify-center rounded-chip px-2 py-0.5 text-xs font-medium text-ink',
        heatClass(ramp, value, min, max),
        className,
      )}
    >
      {children ?? (format ? format(value) : String(value))}
    </span>
  );
}
