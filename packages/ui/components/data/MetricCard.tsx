/** @jsxImportSource react */
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface MetricCardProps {
  /** Small overline describing the metric ("Revenue", "Refund rate"). */
  label: string;
  /** Pre-formatted value ("£8,412", "2.4%") — the component never formats money itself. */
  value: string;
  /** Period-over-period percent; sign picks the arrows and the token tone. */
  trend?: number;
  /** Overtone for the whole card readout (defaults to the trend's sign). */
  tone?: 'success' | 'danger' | 'neutral';
  /** Comparison baseline text ("vs last month", target…). */
  comparison?: string;
  className?: string;
}

const TREND_TONE = {
  success: 'text-success',
  danger: 'text-danger',
  neutral: 'text-ink-3',
} as const;

/**
 * Key-metric tile (§23 "key metrics"): big number + trend arrow + comparison.
 * Material comes from the skin (`mat-card`); hierarchy from type tokens.
 */
export function MetricCard({ label, value, trend, tone, comparison, className }: MetricCardProps) {
  const resolved =
    tone ??
    (trend === undefined ? 'neutral' : trend > 0 ? 'success' : trend < 0 ? 'danger' : 'neutral');
  const trendTone = TREND_TONE[resolved];
  const Arrow = trend !== undefined && trend < 0 ? TrendingDown : TrendingUp;

  return (
    <div className={cn('mat-card rounded-card p-4', className)}>
      <p className="text-xs font-medium whitespace-nowrap text-ink-3">{label}</p>
      <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-ink sm:text-2xl">
        {value}
      </p>
      <div className="mt-1 flex min-h-5 items-center gap-1 text-xs">
        {trend !== undefined && (
          <span
            className={cn('inline-flex items-center gap-0.5 font-medium tabular-nums', trendTone)}
          >
            <Arrow className="size-3.5 shrink-0" aria-hidden="true" />
            {new Intl.NumberFormat(undefined, {
              signDisplay: 'always',
              maximumFractionDigits: 1,
            }).format(trend)}
            %
          </span>
        )}
        {comparison && <span className="truncate text-ink-3">{comparison}</span>}
      </div>
    </div>
  );
}
