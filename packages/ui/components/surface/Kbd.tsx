/** @jsxImportSource react */
import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  size?: 'sm' | 'md';
}

export function Kbd({ size = 'md', className, children, ...rest }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center rounded-chip bg-surface-3 font-medium text-ink-2',
        'border border-line/15 border-b-2 border-b-line/20 font-mono',
        size === 'sm' ? 'h-5 min-w-5 px-1 text-[10px]' : 'h-6 min-w-6 px-1.5 text-xs',
        className,
      )}
      {...rest}
    >
      {children}
    </kbd>
  );
}
