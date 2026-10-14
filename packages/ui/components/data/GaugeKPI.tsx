/** @jsxImportSource react */
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';

export interface GaugeKPIProps extends ComponentPropsWithoutRef<'div'> {
  label: string;
  value: number;
  min?: number;
  max?: number;
  /** Free-text under the readout, e.g. `of 100`. */
  hint?: string;
  /** Center readout formatter (default: trimmed number). */
  format?: (value: number) => string;
}

/* 270° arc gauge geometry: 120×100 box, center (60,60), r 44, opens at the
 * bottom. Marks follow DESIGN.md §23: solid ink/accent tokens, no gradients. */
const CX = 60;
const CY = 60;
const R = 44;
const START = -135; // degrees from 12 o'clock (clockwise positive)
const SWEEP = 270;

function polar(angleDeg: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180;
  return [CX + R * Math.sin(rad), CY - R * Math.cos(rad)];
}

function arcPath(from: number, to: number): string {
  const [x1, y1] = polar(from);
  const [x2, y2] = polar(to);
  const largeArc = Math.abs(to - from) > 180 ? 1 : 0;
  const sweep = to >= from ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${largeArc} ${sweep} ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

const TRACK_PATH = arcPath(START, START + SWEEP);

/**
 * Gauge KPI (todo/08 batch 12 completion — the open "gauge KPI" row).
 * Semicircular-plus arc meter with a big tabular readout; `role="img"` with a
 * descriptive label for assistive tech.
 */
export function GaugeKPI({
  label,
  value,
  min = 0,
  max = 100,
  hint,
  format,
  className,
  ...props
}: GaugeKPIProps) {
  const span = max - min || 1;
  const fraction = Math.min(1, Math.max(0, (value - min) / span));
  const valuePath = fraction > 0 ? arcPath(START, START + SWEEP * fraction) : null;
  const readout = format ? format(value) : String(value);

  return (
    <div
      {...props}
      className={cn('inline-flex flex-col items-center gap-1', className)}
      role="img"
      aria-label={`${label}: ${readout} of ${max}`}
    >
      <div className="relative w-32">
        <svg viewBox="0 0 120 100" className="w-full" aria-hidden focusable="false">
          <path
            d={TRACK_PATH}
            fill="none"
            stroke="currentColor"
            strokeWidth={10}
            strokeLinecap="round"
            className="text-surface-3"
          />
          {valuePath && (
            <path
              d={valuePath}
              fill="none"
              stroke="currentColor"
              strokeWidth={10}
              strokeLinecap="round"
              className="text-accent"
            />
          )}
        </svg>
        <div className="absolute inset-x-0 top-[60%] -translate-y-1/2 text-center">
          <span className="text-2xl font-semibold tabular-nums text-ink">{readout}</span>
        </div>
      </div>
      <span className="text-sm font-medium text-ink">{label}</span>
      {hint && <span className="text-xs text-ink-3">{hint}</span>}
    </div>
  );
}
