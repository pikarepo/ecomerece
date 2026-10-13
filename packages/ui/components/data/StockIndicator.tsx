/** @jsxImportSource react */
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';

export type StockLevel = 'in-stock' | 'low-stock' | 'out-of-stock' | 'preorder';

const levelStyles: Record<StockLevel, { dot: string; text: string }> = {
  'in-stock': { dot: 'bg-success', text: 'text-success' },
  'low-stock': { dot: 'bg-warning', text: 'text-warning' },
  'out-of-stock': { dot: 'bg-danger', text: 'text-danger' },
  preorder: { dot: 'bg-info', text: 'text-info' },
};

const defaultLabels: Record<StockLevel, string> = {
  'in-stock': 'In stock',
  'low-stock': 'Low stock',
  'out-of-stock': 'Out of stock',
  preorder: 'Pre-order',
};

export interface StockIndicatorProps extends ComponentPropsWithoutRef<'span'> {
  level: StockLevel;
  /** Optional remaining count appended for `low-stock`/`in-stock`. */
  count?: number;
  /** Override the default label entirely. */
  label?: string;
}

/**
 * Stock/availability indicator (DESIGN.md Appendix E.5, batch 18). Dot + label
 * using status tokens; the dot does not rely on colour alone (label is present).
 */
export function StockIndicator({ level, count, label, className, ...props }: StockIndicatorProps) {
  const { dot, text } = levelStyles[level];
  const text0 = label ?? defaultLabels[level];
  const withCount =
    count !== undefined && (level === 'low-stock' || level === 'in-stock')
      ? `${text0} · ${count} left`
      : text0;

  return (
    <span
      role="status"
      className={cn('inline-flex items-center gap-1.5 text-xs font-medium', text, className)}
      {...props}
    >
      <span aria-hidden className={cn('size-2 shrink-0 rounded-full', dot)} />
      {withCount}
    </span>
  );
}
