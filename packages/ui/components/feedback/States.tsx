import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center px-6 py-16 text-center', className)}
    >
      <span className="flex size-16 items-center justify-center rounded-full bg-surface-3">
        <Icon className="size-7 text-ink-3" aria-hidden="true" />
      </span>
      <p className="mt-4 text-xl font-semibold tracking-tight">{title}</p>
      {description && <p className="mt-1 max-w-[40ch] text-sm text-ink-2">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export interface ErrorStateProps {
  title?: ReactNode;
  description?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = "Couldn't load this",
  description = 'Something went wrong while loading. Check your connection and try again.',
  onRetry,
  retryLabel = 'Try again',
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center px-6 py-16 text-center', className)}
    >
      <span className="flex size-16 items-center justify-center rounded-full bg-danger/10">
        <span className="size-3 rounded-full bg-danger" aria-hidden="true" />
      </span>
      <p className="mt-4 text-xl font-semibold tracking-tight">{title}</p>
      {description && <p className="mt-1 max-w-[40ch] text-sm text-ink-2">{description}</p>}
      {onRetry && (
        <div className="mt-5">
          <button
            type="button"
            onClick={onRetry}
            className="mat-control inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-5 text-sm font-medium transition-all duration-skin ease-skin active:scale-[var(--press-scale)]"
          >
            {retryLabel}
          </button>
        </div>
      )}
    </div>
  );
}
