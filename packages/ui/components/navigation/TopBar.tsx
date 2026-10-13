import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface TopBarProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}

export function TopBar({ title, subtitle, leading, trailing, className }: TopBarProps) {
  return (
    // floating chrome material — blur lives in the skin, not the markup (§14.1)
    <header className={cn('mat-chrome sticky top-0 z-sticky border-x-0 border-t-0', className)}>
      <div className="mx-auto flex min-h-14 max-w-shell items-center gap-3 px-4">
        {leading && <div className="shrink-0">{leading}</div>}
        <div className="min-w-0 flex-1">
          {title && (
            <p className="truncate text-base font-semibold tracking-tight short:text-sm">{title}</p>
          )}
          {subtitle && <p className="truncate text-xs text-ink-3 short:hidden">{subtitle}</p>}
        </div>
        {trailing && <div className="flex shrink-0 items-center gap-1">{trailing}</div>}
      </div>
    </header>
  );
}
