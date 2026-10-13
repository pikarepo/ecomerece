import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface ListHeaderProps {
  title: ReactNode;
  trailing?: ReactNode;
  className?: string;
}

export function ListHeader({ title, trailing, className }: ListHeaderProps) {
  return (
    <div className={cn('mb-2 flex items-baseline justify-between gap-3 px-1', className)}>
      <p className="text-sm font-medium text-ink-2">{title}</p>
      {trailing && <div className="text-xs text-ink-3">{trailing}</div>}
    </div>
  );
}
