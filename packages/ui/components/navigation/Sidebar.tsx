import type { LucideIcon } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { isValidElement } from 'react';
import { cn } from '../../lib/cn';

export interface SidebarItem {
  leading?: ComponentType<{ className?: string }> | LucideIcon | ReactNode;
  label: string;
  value: string;
  badge?: number | string;
  disabled?: boolean;
}

export interface SidebarProps {
  items: SidebarItem[];
  value: string;
  onChange: (value: string) => void;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

function renderLeading(leading: SidebarItem['leading']): ReactNode {
  if (isValidElement(leading)) {
    return <span className="flex shrink-0 items-center">{leading}</span>;
  }
  if (
    typeof leading === 'function' ||
    (leading && typeof leading === 'object' && '$$typeof' in leading)
  ) {
    const Icon = leading as ComponentType<{ className?: string }>;
    return <Icon className="size-4 shrink-0 text-ink-3" />;
  }
  return <span className="flex shrink-0 items-center">{leading}</span>;
}

export function Sidebar({ items, value, onChange, header, footer, className }: SidebarProps) {
  return (
    <aside
      aria-label="Sidebar"
      className={cn(
        'mat-panel hidden w-64 shrink-0 flex-col overflow-y-auto',
        'md:tall:flex md:w-64 lg:w-72',
        className,
      )}
    >
      {header && <div className="px-4 py-4">{header}</div>}
      <nav className="flex-1 space-y-0.5 p-2">
        {items.map((item) => {
          const active = item.value === value;
          return (
            <button
              key={item.value}
              type="button"
              disabled={item.disabled}
              aria-current={active ? 'page' : undefined}
              onClick={() => onChange(item.value)}
              className={cn(
                'flex w-full min-h-11 items-center gap-3 rounded-control px-3 py-2 text-left text-sm transition-all duration-skin ease-skin',
                active
                  ? 'bg-surface-3 font-medium text-ink'
                  : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
                item.disabled && 'pointer-events-none opacity-50',
              )}
            >
              {renderLeading(item.leading)}
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={cn(
                    'shrink-0 rounded-chip px-1.5 py-0.5 font-mono text-[10px] font-medium',
                    active ? 'bg-accent/12 text-accent' : 'bg-surface-3 text-ink-3',
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      {footer && <div className="border-t border-line/10 p-3">{footer}</div>}
    </aside>
  );
}
