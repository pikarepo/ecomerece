/** @jsxImportSource react */
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/cn';

export type StatusLevel = 'good' | 'warn' | 'bad' | 'neutral';

export interface StatusLightsProps {
  /** Which light is active. `neutral` mutes all three. */
  level: StatusLevel;
  size?: 'sm' | 'md';
  orientation?: 'row' | 'column';
  /** Accessible name. Default "Status". */
  label?: string;
  className?: string;
}

const LIGHT_ORDER: Exclude<StatusLevel, 'neutral'>[] = ['bad', 'warn', 'good'];
const LIGHT_ON: Record<Exclude<StatusLevel, 'neutral'>, string> = {
  bad: 'bg-danger',
  warn: 'bg-warning',
  good: 'bg-success',
};
const DOT_SIZE = { sm: 'size-2', md: 'size-2.5' } as const;

/**
 * Traffic-light status triplet (todo/09 §F batch 82). Only the active light is
 * coloured — the others are muted, so status is never conveyed by colour alone.
 */
export function StatusLights({
  level,
  size = 'sm',
  orientation = 'row',
  label,
  className,
}: StatusLightsProps) {
  return (
    <span
      role="img"
      aria-label={`${label ?? 'Status'}: ${level}`}
      className={cn(
        'inline-flex gap-1',
        orientation === 'column' ? 'flex-col' : 'flex-row',
        className,
      )}
    >
      {LIGHT_ORDER.map((light) => {
        const on = level === light;
        return (
          <span
            key={light}
            aria-hidden="true"
            className={cn(
              'rounded-full transition-colors',
              DOT_SIZE[size],
              on ? LIGHT_ON[light] : 'bg-line/25',
            )}
          />
        );
      })}
    </span>
  );
}

export type TrendDirection = 'up' | 'down' | 'flat';
export type TrendTone = 'success' | 'danger' | 'neutral' | 'accent';

export interface TrendArrowProps {
  direction: TrendDirection;
  /** Numeric delta shown beside the arrow. */
  value?: number;
  /** Append a percent sign to the formatted value. */
  percent?: boolean;
  /** Set false when an increase is undesirable (e.g. churn). Default true. */
  upIsGood?: boolean;
  /** Override the default tone. */
  tone?: TrendTone;
  /** Accessible name. Default derived from direction + value. */
  label?: string;
  className?: string;
}

const TREND_ICON = { up: TrendingUp, down: TrendingDown, flat: Minus } as const;
const TONE_CLASS: Record<TrendTone, string> = {
  success: 'text-success',
  danger: 'text-danger',
  neutral: 'text-ink-3',
  accent: 'text-accent',
};

/** Format a signed delta, e.g. `formatDelta(12.4, true)` → `"+12.4%"`. */
export function formatDelta(value: number, percent = false): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  const n = Math.abs(value);
  const formatted = Number.isInteger(n) ? String(n) : n.toFixed(1);
  return `${sign}${formatted}${percent ? '%' : ''}`;
}

/**
 * Directional trend indicator (todo/09 §F batch 82) — an arrow plus an optional
 * signed delta. Tone defaults are outcome-aware (`upIsGood`).
 */
export function TrendArrow({
  direction,
  value,
  percent = false,
  upIsGood = true,
  tone,
  label,
  className,
}: TrendArrowProps) {
  const Icon = TREND_ICON[direction];
  const resolvedTone: TrendTone =
    tone ??
    (direction === 'flat' ? 'neutral' : (direction === 'up') === upIsGood ? 'success' : 'danger');
  const aria =
    label ?? `${direction}${value !== undefined ? ` ${formatDelta(value, percent)}` : ''}`;

  return (
    <span
      role="img"
      aria-label={aria}
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium',
        TONE_CLASS[resolvedTone],
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {value !== undefined && (
        <span className="font-mono tabular-nums">{formatDelta(value, percent)}</span>
      )}
    </span>
  );
}
