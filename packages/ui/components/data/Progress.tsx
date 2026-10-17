/** @jsxImportSource react */
import type { CSSProperties } from 'react';
import { cn } from '../../lib/cn';

/** `linear` is the original baseline; the rest landed with batch 97. */
export type ProgressVariant = 'linear' | 'circular' | 'stepped' | 'indeterminate' | 'buffer';

export interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  tone?: 'accent' | 'success' | 'warning' | 'danger';
  /** Presentation (batch 97). Default `linear` keeps the baseline bar. */
  variant?: ProgressVariant;
  /** `stepped`: number of steps (default 5); `aria-valuenow` reports filled steps. */
  steps?: number;
  /** `buffer`: secondary “loaded” fill in the same unit as `value`, drawn behind. */
  buffer?: number;
  /** `circular`: show the percentage in the middle (default true). */
  showValue?: boolean;
  /** Accessible name. Default "Progress". */
  label?: string;
}

const toneClasses = {
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
} as const;

const toneSoft = {
  accent: 'bg-accent/30',
  success: 'bg-success/30',
  warning: 'bg-warning/30',
  danger: 'bg-danger/30',
} as const;

const toneStroke = {
  accent: 'stroke-accent',
  success: 'stroke-success',
  warning: 'stroke-warning',
  danger: 'stroke-danger',
} as const;

const CIRCUMFERENCE = 2 * Math.PI * 40; // circular svg: r=40

const clampPercent = (value: number, max: number) =>
  Math.min(100, Math.max(0, (value / Math.max(max, 1)) * 100));

// Progress + SegmentedMeter tracks = Level-1 well (§13; divergence E.6 #3 fixed)
export function Progress({
  value,
  max = 100,
  className,
  tone = 'accent',
  variant = 'linear',
  steps,
  buffer,
  showValue = true,
  label = 'Progress',
}: ProgressProps) {
  const percent = clampPercent(value, max);

  if (variant === 'circular') {
    return (
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        data-variant="circular"
        className={cn('relative inline-flex items-center justify-center', className)}
      >
        <svg viewBox="0 0 96 96" className="size-24 -rotate-90" aria-hidden="true">
          <circle cx="48" cy="48" r="40" fill="none" strokeWidth="8" className="stroke-line/20" />
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={CIRCUMFERENCE * (1 - percent / 100)}
            className={cn(
              'transition-[stroke-dashoffset] duration-skin-slow ease-skin',
              toneStroke[tone],
            )}
          />
        </svg>
        {showValue && (
          <span className="absolute font-mono text-sm tabular-nums">{Math.round(percent)}%</span>
        )}
      </div>
    );
  }

  if (variant === 'stepped') {
    const total = Math.max(1, Math.round(steps ?? 5));
    const filled = Math.min(total, Math.max(0, Math.round((value / Math.max(max, 1)) * total)));
    return (
      <div
        role="progressbar"
        aria-valuenow={filled}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={label}
        data-variant="stepped"
        className={cn('flex gap-1', className)}
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={cn(
              'h-2 min-w-0 flex-1 rounded-full',
              i < filled ? toneClasses[tone] : 'bg-line/15',
            )}
          />
        ))}
      </div>
    );
  }

  if (variant === 'indeterminate') {
    return (
      <div
        role="progressbar"
        aria-label={label}
        data-variant="indeterminate"
        className={cn('mat-well h-2 w-full overflow-hidden rounded-full', className)}
      >
        <div className={cn('h-full w-2/5 rounded-full fx-indeterminate', toneClasses[tone])} />
      </div>
    );
  }

  if (variant === 'buffer') {
    const bufferPercent = clampPercent(buffer ?? max, max);
    return (
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        data-variant="buffer"
        className={cn('mat-well relative h-2 w-full overflow-hidden rounded-full', className)}
      >
        <div
          aria-hidden="true"
          className={cn('absolute inset-y-0 left-0 rounded-full', toneSoft[tone])}
          style={{ width: `${bufferPercent}%` } as CSSProperties}
        />
        <div
          className={cn('relative h-full rounded-full', toneClasses[tone])}
          style={{ width: `${percent}%` } as CSSProperties}
        />
      </div>
    );
  }

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      data-variant="linear"
      className={cn('mat-well h-2 w-full overflow-hidden rounded-full', className)}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-skin-slow ease-skin',
          toneClasses[tone],
        )}
        style={{ width: `${percent}%` } as CSSProperties}
      />
    </div>
  );
}

export interface SegmentedMeterSegment {
  value: number;
  tone?: 'accent' | 'success' | 'warning' | 'danger';
  className?: string;
  label?: string;
}

export interface SegmentedMeterProps {
  segments: SegmentedMeterSegment[];
  total?: number;
  className?: string;
}

export function SegmentedMeter({ segments, total, className }: SegmentedMeterProps) {
  const sum = total ?? segments.reduce((acc, segment) => acc + segment.value, 0);
  const safeSum = Math.max(sum, 1);

  return (
    <div
      role="img"
      aria-label="Segmented meter"
      className={cn('mat-well flex h-2 overflow-hidden rounded-full', className)}
    >
      {segments.map((segment, index) => {
        const width = Math.max(0, (segment.value / safeSum) * 100);
        if (width <= 0) return null;
        return (
          <span
            key={index}
            title={segment.label}
            className={cn(
              'h-full',
              segment.tone ? toneClasses[segment.tone] : 'bg-line/15',
              segment.className,
            )}
            style={{ width: `${width}%` }}
          />
        );
      })}
    </div>
  );
}
