/** @jsxImportSource react */
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';

export interface SLAIndicatorProps extends ComponentPropsWithoutRef<'span'> {
  status: 'ok' | 'warn' | 'breach';
  label?: string;
}

const map: Record<SLAIndicatorProps['status'], string> = {
  ok: 'bg-green-500',
  warn: 'bg-amber-500',
  breach: 'bg-red-500',
};

export function SLAIndicator({ status, label, className, ...props }: SLAIndicatorProps) {
  return (
    <span
      {...props}
      className={cn('inline-flex items-center gap-2 text-sm text-ink-2', className)}
      role="status"
    >
      <span className={cn('h-2 w-2 rounded-full', map[status])} aria-hidden />
      {label ?? status.toUpperCase()}
    </span>
  );
}
