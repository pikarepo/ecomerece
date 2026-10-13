/** @jsxImportSource react */
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';

export interface DurationProps extends ComponentPropsWithoutRef<'span'> {
  ms: number;
  formatter?: (ms: number) => string;
  precision?: 's' | 'ms';
}

export function Duration({ ms, formatter, precision = 's', className, ...props }: DurationProps) {
  const value = Math.max(0, ms);
  const label = formatter
    ? formatter(value)
    : precision === 'ms'
      ? `${value}ms`
      : `${Math.round(value / 1000)}s`;

  return (
    <span className={cn(className)} {...props}>
      {label}
    </span>
  );
}
