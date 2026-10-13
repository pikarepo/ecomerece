/** @jsxImportSource react */
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface StatTileProps extends ComponentPropsWithoutRef<'div'> {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  trend?: 'up' | 'down' | 'flat';
}

export function StatTile({ label, value, hint, trend, className, ...props }: StatTileProps) {
  const trendCls =
    trend === 'up'
      ? 'text-green-600 dark:text-green-400'
      : trend === 'down'
        ? 'text-red-600 dark:text-red-400'
        : 'text-ink-3';

  return (
    <div
      {...props}
      className={cn('mat-card rounded-card p-4 flex flex-col gap-1', className)}
      role="status"
    >
      <span className="text-sm text-ink-3">{label}</span>
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
      {hint && <span className={cn('text-xs', trendCls)}>{hint}</span>}
    </div>
  );
}
