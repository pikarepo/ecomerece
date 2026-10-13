/** @jsxImportSource react */
import type { CSSProperties } from 'react';
import { cn } from '../../lib/cn';

export interface DataBarProps {
  value: number;
  max?: number;
  tone?: 'accent' | 'success' | 'warning' | 'danger';
  /** Optional inline numeric readout rendered right of the track (font-mono). */
  showValue?: boolean;
  /** Accessible name; defaults to "Data bar". */
  label?: string;
  className?: string;
}

const toneClasses = {
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
} as const;

/**
 * Compact in-cell bar (§23): `mat-well` track + token fill. Keeps the header
 * baseline via `tabular-nums` when the optional readout is shown.
 */
export function DataBar({
  value,
  max = 100,
  tone = 'accent',
  showValue = false,
  label,
  className,
}: DataBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const fill = (
    <div
      className={cn(
        'h-full rounded-full transition-[width] duration-skin-slow ease-skin',
        toneClasses[tone],
      )}
      style={{ width: `${percent}%` } as CSSProperties}
    />
  );

  if (!showValue) {
    // Kit convention (SegmentedMeter): graphics get role=img + a descriptive
    // label that carries the numbers, so AT users still read the value.
    return (
      <div
        role="img"
        aria-label={label ? `${label}: ${value} of ${max}` : `Data bar: ${value} of ${max}`}
        className={cn('mat-well h-1.5 flex-1 overflow-hidden rounded-full', className)}
      >
        {fill}
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={label ? `${label}: ${value} of ${max}` : `Data bar: ${value} of ${max}`}
      className={cn('flex items-center gap-2', className)}
    >
      <div className="mat-well h-1.5 min-w-8 flex-1 overflow-hidden rounded-full">{fill}</div>
      <span className="shrink-0 font-mono text-xs tabular-nums text-ink-3">
        {Number(value).toLocaleString()}
      </span>
    </div>
  );
}
