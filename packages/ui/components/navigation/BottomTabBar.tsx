import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface BottomTabItem {
  label: ReactNode;
  icon: LucideIcon;
  activeIcon?: LucideIcon;
  value: string;
  badge?: number;
}

export interface BottomTabBarProps {
  items: BottomTabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function BottomTabBar({ items, value, onChange, className }: BottomTabBarProps) {
  return (
    <nav
      aria-label="Primary navigation"
      className={cn(
        'mat-chrome fixed inset-x-0 bottom-0 z-chrome flex items-center justify-around border-x-0 border-b-0 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]',
        'short:inset-x-auto short:inset-y-0 short:left-0 short:w-16 short:flex-col',
        'short:py-4',
        'md:tall:hidden',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        const Icon = active ? (item.activeIcon ?? item.icon) : item.icon;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 transition-all duration-skin ease-skin',
              active ? 'text-accent' : 'text-ink-3 hover:text-ink',
              'short:flex-row',
            )}
          >
            <span className="relative">
              <Icon className="size-5" aria-hidden="true" />
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={cn(
                    'absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 font-mono text-[10px] font-semibold text-accent-ink',
                    'short:static short:ml-1',
                  )}
                >
                  {item.badge}
                </span>
              )}
            </span>
            <span className="text-[10px] font-medium short:hidden">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
