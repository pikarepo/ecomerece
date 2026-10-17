/** @jsxImportSource react */
import { cn } from '../../lib/cn';

export type BulletTone = 'accent' | 'success' | 'warning' | 'danger';

export interface BulletProps {
  /** Primary measure. */
  value: number;
  /** Target marker rendered as a vertical tick. */
  target?: number;
  /** Increasing qualitative band thresholds, e.g. `[60, 85]` → poor / ok / good. */
  ranges?: number[];
  /** Upper bound of the scale. Defaults to the max of value/target/ranges, min 100. */
  max?: number;
  tone?: BulletTone;
  /** Show the `value / target` numeric readout. */
  showValue?: boolean;
  /** Accessible name. Default "Bullet chart". */
  label?: string;
  className?: string;
}

const MEASURE: Record<BulletTone, string> = {
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

const BAND = ['bg-line/10', 'bg-line/20', 'bg-line/30'];

const clampPct = (n: number, max: number) => Math.max(0, Math.min(100, (n / max) * 100));

/**
 * Bullet chart (todo/09 §F batch 82) — a single measure against a target,
 * read within qualitative bands. Meant for dense rows and table cells.
 */
export function Bullet({
  value,
  target,
  ranges,
  max,
  tone = 'accent',
  showValue = false,
  label,
  className,
}: BulletProps) {
  const scaleMax = Math.max(100, value, target ?? 0, ranges?.at(-1) ?? 0, max ?? 0) || 100;
  const edges = [0, ...(ranges ?? []).filter((r) => r > 0 && r < scaleMax), scaleMax];
  const bands = edges.slice(0, -1).map((from, i) => ({
    left: clampPct(from, scaleMax),
    width: clampPct(edges[i + 1] - from, scaleMax),
  }));
  const measure = clampPct(value, scaleMax);
  const targetPct = target !== undefined ? clampPct(target, scaleMax) : undefined;

  const aria =
    `${label ?? 'Bullet chart'}: ${value}` +
    (target !== undefined ? ` of target ${target}` : '') +
    (ranges && ranges.length > 0 ? `, bands ${ranges.join('/')}` : '');

  return (
    <span role="img" aria-label={aria} className={cn('inline-flex items-center gap-2', className)}>
      <span
        aria-hidden="true"
        className="mat-well relative block h-2 min-w-[80px] flex-1 overflow-hidden rounded-full"
      >
        {bands.map((band, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={cn('absolute inset-y-0', BAND[Math.min(i, BAND.length - 1)])}
            style={{ left: `${band.left}%`, width: `${band.width}%` }}
          />
        ))}
        <span
          aria-hidden="true"
          className={cn('absolute inset-y-0 left-0 rounded-full', MEASURE[tone])}
          style={{ width: `${measure}%` }}
        />
        {targetPct !== undefined && (
          <span
            aria-hidden="true"
            className="absolute inset-y-0 w-0.5 -translate-x-1/2 rounded-full bg-ink"
            style={{ left: `${targetPct}%` }}
          />
        )}
      </span>
      {showValue && (
        <span className="font-mono text-xs tabular-nums text-ink-3">
          {value}
          {target !== undefined ? ` / ${target}` : ''}
        </span>
      )}
    </span>
  );
}
