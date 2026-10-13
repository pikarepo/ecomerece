import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type BannerTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BannerProps {
  title: ReactNode;
  description?: ReactNode;
  tone?: BannerTone;
  action?: ReactNode;
  className?: string;
}

// system skin: rule form (tinted fill at /10, hairline edge); a skin may
// restyle the panel (E.6 #5) — tone stays semantics, never decoration
const toneBorders = {
  success: 'bg-success/10 border border-success/20',
  warning: 'bg-warning/10 border border-warning/20',
  danger: 'bg-danger/10 border border-danger/20',
  info: 'bg-info/10 border border-info/20',
  neutral: 'bg-surface-3 border border-line/10',
} as const;

const toneDots = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  neutral: 'bg-line/30',
} as const;

export function Banner({ title, description, tone = 'neutral', action, className }: BannerProps) {
  return (
    <div
      role="status"
      className={cn('flex items-start gap-3 rounded-card p-4', toneBorders[tone], className)}
    >
      <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', toneDots[tone])} />
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="mt-0.5 text-sm text-ink-2">{description}</p>}
      </div>
      {action && <div className="ml-auto shrink-0">{action}</div>}
    </div>
  );
}
