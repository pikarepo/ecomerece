import { type LucideIcon, MoreHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { IconButton } from '../controls/Button';

export interface CardProps {
  title?: ReactNode;
  description?: ReactNode;
  headerIcon?: LucideIcon;
  onMenu?: () => void;
  menuLabel?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padding?: 'md' | 'lg' | 'none';
}

const paddingClasses = {
  md: 'p-4',
  lg: 'p-5',
  none: '',
} as const;

export function Card({
  title,
  description,
  headerIcon: HeaderIcon,
  onMenu,
  menuLabel = 'More options',
  action,
  children,
  className,
  padding = 'md',
}: CardProps) {
  return (
    <div className={cn('mat-card rounded-card', paddingClasses[padding], className)}>
      {(title || description || onMenu || action) && (
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {HeaderIcon && <HeaderIcon className="size-4 shrink-0 text-ink-3" />}
            <div className="min-w-0">
              {title && <p className="text-sm font-medium">{title}</p>}
              {description && <p className="mt-0.5 text-xs text-ink-3">{description}</p>}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {action}
            {onMenu && (
              <IconButton label={menuLabel} onClick={onMenu} className="-m-2 h-9 w-9">
                <MoreHorizontal className="size-4" />
              </IconButton>
            )}
          </div>
        </div>
      )}
      {children && (
        <div className={cn((title || description || onMenu || action) && 'mt-4')}>{children}</div>
      )}
    </div>
  );
}
