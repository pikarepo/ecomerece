/** @jsxImportSource react */
import type { ComponentType, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface ListRowProps {
  icon?: ComponentType<{ className?: string }>;
  iconTone?: 'accent' | 'neutral' | 'danger' | 'success';
  title: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  className?: string;
}

const iconTones = {
  accent: 'bg-accent/12 text-accent',
  neutral: 'bg-surface-3 text-ink-2',
  danger: 'bg-danger/12 text-danger',
  success: 'bg-success/12 text-success',
} as const;

export function ListRow({
  icon: Icon,
  iconTone = 'neutral',
  title,
  description,
  trailing,
  onClick,
  disabled,
  selected,
  className,
}: ListRowProps) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left',
        'transition-all duration-skin ease-skin',
        onClick && 'cursor-pointer active:scale-[calc(1-(1-var(--press-scale))*0.3)]',
        disabled && 'pointer-events-none opacity-50',
        // hover moves a surface step, never hue (§13)
        selected ? 'bg-surface-3' : onClick && 'hover:bg-surface-3/60',
        className,
      )}
    >
      {Icon && (
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-chip',
            iconTones[iconTone],
          )}
        >
          <Icon className="size-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm font-medium', disabled && 'text-ink-4')}>{title}</p>
        {description && <p className="truncate text-xs text-ink-3">{description}</p>}
      </div>
      {trailing && <div className="ml-auto shrink-0">{trailing}</div>}
    </Comp>
  );
}

export interface GroupedListProps {
  children: ReactNode;
  className?: string;
  inset?: boolean;
}

export function GroupedList({ children, className, inset = false }: GroupedListProps) {
  return (
    <div
      className={cn(
        'mat-card divide-y divide-line/10 overflow-hidden rounded-card',
        inset && 'pl-12',
        className,
      )}
    >
      {children}
    </div>
  );
}
