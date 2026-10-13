/** @jsxImportSource react */
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface HoverCardProps extends Omit<ComponentPropsWithoutRef<'div'>, 'content'> {
  trigger: ReactNode;
  content: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function HoverCard({ trigger, content, side = 'top', className, ...props }: HoverCardProps) {
  const pos =
    side === 'right'
      ? 'left-full top-1/2 -translate-y-1/2 ml-2'
      : side === 'left'
        ? 'right-full top-1/2 -translate-y-1/2 mr-2'
        : side === 'bottom'
          ? 'left-1/2 top-full -translate-x-1/2 mt-2'
          : 'left-1/2 bottom-full -translate-x-1/2 mb-2';

  return (
    <div {...props} className={cn('group relative inline-block', className)}>
      {trigger}
      <div
        className={cn(
          'pointer-events-none absolute z-50 opacity-0 transition-opacity duration-skin ease-skin group-hover:opacity-100 group-focus-within:opacity-100',
          'mat-overlay rounded-card px-3 py-2 text-sm text-ink shadow-sm',
          pos,
        )}
        role="tooltip"
      >
        {content}
      </div>
    </div>
  );
}
