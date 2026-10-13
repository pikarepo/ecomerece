/** @jsxImportSource react */
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';

export interface TimeDifferenceProps extends ComponentPropsWithoutRef<'span'> {
  start: Date | string | number;
  end: Date | string | number;
  formatter?: (ms: number) => string;
}

export function TimeDifference({
  start,
  end,
  formatter,
  className,
  ...props
}: TimeDifferenceProps) {
  const s = typeof start === 'string' || typeof start === 'number' ? new Date(start) : start;
  const e = typeof end === 'string' || typeof end === 'number' ? new Date(end) : end;
  const ms = Math.max(0, e.getTime() - s.getTime());
  const label = formatter ? formatter(ms) : `${ms}ms`;

  return (
    <span className={cn(className)} {...props}>
      {label}
    </span>
  );
}
