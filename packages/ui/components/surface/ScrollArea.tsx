/** @jsxImportSource react */
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface ScrollAreaProps {
  children?: ReactNode;
  /** Max height the scroll area is capped at. Pass a Tailwind class like "max-h-80" or a CSS value. */
  maxHeight?: string;
  /** Direction to scroll. Default "vertical". */
  orientation?: 'vertical' | 'horizontal' | 'both';
  className?: string;
  /** Applied to the inner content wrapper. */
  contentClassName?: string;
}

export function ScrollArea({
  children,
  maxHeight,
  orientation = 'vertical',
  className,
  contentClassName,
}: ScrollAreaProps) {
  const overflowClass =
    orientation === 'vertical'
      ? 'overflow-y-auto overflow-x-hidden'
      : orientation === 'horizontal'
        ? 'overflow-x-auto overflow-y-hidden'
        : 'overflow-auto';

  // Tailwind utility passed directly if it looks like a class (starts with "max-h-" or "h-"),
  // otherwise we apply it as an inline style so callers can pass arbitrary CSS values.
  const isTailwindClass =
    maxHeight &&
    (maxHeight.startsWith('max-h-') ||
      maxHeight.startsWith('h-') ||
      maxHeight.startsWith('min-h-'));

  return (
    <div
      data-orientation={orientation}
      style={maxHeight && !isTailwindClass ? { maxHeight } : undefined}
      className={cn(
        'relative',
        overflowClass,
        // Custom scrollbar styling via Tailwind's arbitrary scrollbar utilities
        '[scrollbar-width:thin] [scrollbar-color:theme(colors.ink.DEFAULT/0.2)_transparent]',
        '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5',
        '[&::-webkit-scrollbar-track]:bg-transparent',
        '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-ink/20',
        '[&::-webkit-scrollbar-thumb:hover]:bg-ink/40',
        maxHeight && isTailwindClass ? maxHeight : '',
        className,
      )}
    >
      <div className={contentClassName}>{children}</div>
    </div>
  );
}
