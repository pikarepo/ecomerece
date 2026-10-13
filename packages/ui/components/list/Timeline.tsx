/** @jsxImportSource react */
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type TimelineTone = 'default' | 'success' | 'warning' | 'danger';

export interface TimelineItem {
  title: ReactNode;
  description?: ReactNode;
  timestamp?: ReactNode;
  tone?: TimelineTone;
  /** Emphasise this entry (accent marker) — e.g. "current step". */
  active?: boolean;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const toneDot: Record<TimelineTone, string> = {
  default: 'bg-ink-4',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

export function Timeline({ items, className }: TimelineProps) {
  return (
    <ol className={cn('flex flex-col', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <li key={index} className="relative flex gap-3 pb-5 last:pb-0">
            <span aria-hidden="true" className="relative flex w-4 shrink-0 justify-center">
              {!isLast && (
                <span className="absolute top-4 -bottom-1 w-px bg-line/15" data-connector="true" />
              )}
              <span
                className={cn(
                  'mt-1 size-2.5 rounded-full ring-4 ring-surface-1',
                  item.active ? 'bg-accent' : toneDot[item.tone ?? 'default'],
                )}
              />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className={cn('text-sm text-ink', isLast ? 'font-normal' : 'font-medium')}>
                  {item.title}
                </p>
                {item.timestamp && (
                  <span className="shrink-0 text-xs text-ink-3">{item.timestamp}</span>
                )}
              </div>
              {item.description && <p className="mt-0.5 text-sm text-ink-3">{item.description}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
