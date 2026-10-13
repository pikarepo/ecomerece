/** @jsxImportSource react */
import type { ComponentPropsWithoutRef } from 'react';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/cn';

export interface CountdownProps extends ComponentPropsWithoutRef<'span'> {
  target: Date | string | number;
  onComplete?: () => void;
  formatter?: (ms: number) => string;
  intervalMs?: number;
}

export function Countdown({
  target,
  onComplete,
  formatter,
  intervalMs = 1000,
  className,
  ...props
}: CountdownProps) {
  const [ms, setMs] = useState<number>(() => {
    const t = typeof target === 'string' || typeof target === 'number' ? new Date(target) : target;
    return Math.max(0, t.getTime() - Date.now());
  });

  useEffect(() => {
    const t = typeof target === 'string' || typeof target === 'number' ? new Date(target) : target;
    const id = setInterval(() => {
      const remaining = Math.max(0, t.getTime() - Date.now());
      setMs(remaining);
      if (remaining === 0) {
        clearInterval(id);
        onComplete?.();
      }
    }, intervalMs);
    return () => clearInterval(id);
  }, [target, intervalMs, onComplete]);

  const label = formatter ? formatter(ms) : `${Math.floor(ms / 1000)}s`;

  return (
    <span className={cn(className)} {...props}>
      {label}
    </span>
  );
}
