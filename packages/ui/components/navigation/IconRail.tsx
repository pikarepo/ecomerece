import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface RailItem {
  icon: LucideIcon;
  label: string;
  value: string;
}

export interface IconRailProps {
  items: RailItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function IconRail({ items, value, onChange, className }: IconRailProps) {
  return (
    <nav
      aria-label="Section navigation"
      className={cn(
        'mat-panel hidden w-[72px] shrink-0 flex-col items-center gap-2 py-4',
        'lg:flex',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
            title={item.label}
            onClick={() => onChange(item.value)}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-control transition-all duration-skin ease-skin',
              active ? 'bg-surface-3 text-ink' : 'text-ink-3 hover:bg-surface-2 hover:text-ink',
            )}
          >
            <item.icon className="size-5" aria-hidden="true" />
          </button>
        );
      })}
    </nav>
  );
}
