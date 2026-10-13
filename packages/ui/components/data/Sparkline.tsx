/** @jsxImportSource react */
import { cn } from '../../lib/cn';

export interface SparklineProps {
  /** Series of non-negative (bar) or any-number (line) points. */
  data: number[];
  /** `line` draws a hairline polyline; `bar` draws one thin column per point. */
  variant?: 'line' | 'bar';
  tone?: 'accent' | 'success' | 'warning' | 'danger';
  /** Accessible equivalent of the graphic (guides do not show charts). */
  label?: string;
  className?: string;
}

const STROKE = {
  accent: 'stroke-accent',
  success: 'stroke-success',
  warning: 'stroke-warning',
  danger: 'stroke-danger',
} as const;

const FILL = {
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
} as const;

/**
 * Inline single-series chart for table cells / stat rows (§23): ink+accent
 * marks only, no grid, no axis — the container decides the material.
 */
export function Sparkline({
  data,
  variant = 'line',
  tone = 'accent',
  label,
  className,
}: SparklineProps) {
  const safe = data.length === 0 ? [0, 0] : data;
  const min = Math.min(...safe);
  const max = Math.max(...safe);
  const span = max - min || 1;

  if (variant === 'bar') {
    const peak = Math.max(...safe.map((v) => Math.abs(v)), 1);
    return (
      <div
        role="img"
        aria-label={label ?? 'Sparkline'}
        className={cn('flex items-end gap-px', className)}
      >
        {safe.map((value, index) => (
          <span
            key={index}
            className={cn('min-w-0.5 flex-1 rounded-t-chip', FILL[tone])}
            style={{ height: `${Math.max((Math.abs(value) / peak) * 100, 4)}%` }}
          />
        ))}
      </div>
    );
  }

  const points = safe
    .map((value, index) => {
      const x = (index / Math.max(safe.length - 1, 1)) * 100;
      const y = 100 - ((value - min) / span) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      role="img"
      aria-label={label ?? 'Sparkline'}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cn('block w-full', className)}
    >
      <polyline
        points={points}
        fill="none"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={STROKE[tone]}
      />
    </svg>
  );
}
