/** @jsxImportSource react */
import type { ComponentPropsWithoutRef } from 'react';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/cn';

export interface TimezoneClockProps extends ComponentPropsWithoutRef<'time'> {
  timezone?: string;
  formatOptions?: Intl.DateTimeFormatOptions;
  intervalMs?: number;
}

export function TimezoneClock({
  timezone,
  formatOptions,
  intervalMs = 1000,
  className,
  ...props
}: TimezoneClockProps) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  const label = now.toLocaleTimeString(undefined, {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    ...formatOptions,
  });

  return (
    <time dateTime={now.toISOString()} className={cn(className)} {...props}>
      {label}
    </time>
  );
}
