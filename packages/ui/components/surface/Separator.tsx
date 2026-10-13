/** @jsxImportSource react */
import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  /** Decorative separators are hidden from AT (default). Set false for a real
   *  semantic `separator` when it groups content. */
  decorative?: boolean;
}

export function Separator({
  orientation = 'horizontal',
  decorative = true,
  className,
  ...rest
}: SeparatorProps) {
  const aria = decorative
    ? ({ role: 'presentation' } as const)
    : ({ role: 'separator', 'aria-orientation': orientation } as const);

  return (
    <div
      {...aria}
      className={cn(
        'shrink-0 bg-line/12',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px self-stretch',
        className,
      )}
      {...rest}
    />
  );
}
