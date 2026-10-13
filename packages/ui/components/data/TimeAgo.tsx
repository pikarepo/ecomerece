/** @jsxImportSource react */
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';

export interface TimeAgoProps extends ComponentPropsWithoutRef<'time'> {
  date: Date | string | number;
  formatter?: (date: Date) => string;
}

export function TimeAgo({ date, formatter, className, ...props }: TimeAgoProps) {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const label = formatter ? formatter(d) : d.toLocaleString();

  return (
    <time dateTime={d.toISOString()} className={cn(className)} {...props}>
      {label}
    </time>
  );
}
