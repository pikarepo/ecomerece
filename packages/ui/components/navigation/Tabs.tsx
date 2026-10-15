/** @jsxImportSource react */

import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface TabItem<T extends string = string> {
  label: ReactNode;
  value: T;
  disabled?: boolean;
}

export interface TabsProps<T extends string = string> {
  items: Array<TabItem<T>>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function Tabs<T extends string = string>({
  items,
  value,
  onChange,
  className,
}: TabsProps<T>) {
  return (
    <div role="tablist" aria-label="Tabs" className={cn('flex gap-1.5', className)}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            className={cn(
              // system skin: quiet underline tab (E.6 #7). The `soft` skin's
              // pill radius comes free through --r-control.
              'relative rounded-control px-4 py-2.5 text-sm font-medium transition-all duration-skin ease-skin',
              active
                ? 'text-ink after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-chip after:bg-accent'
                : 'text-ink-2 hover:text-ink hover:after:bg-line/20 disabled:text-ink-4',
              'after:transition-colors after:duration-skin after:ease-skin focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
