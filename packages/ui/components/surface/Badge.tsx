/** @jsxImportSource react */
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

const badgeTones = {
  neutral: 'bg-surface-3 text-ink-2',
  accent: 'bg-accent/12 text-accent',
  success: 'bg-success/12 text-success',
  warning: 'bg-warning/12 text-warning',
  danger: 'bg-danger/12 text-danger',
  info: 'bg-info/12 text-info',
} as const;

export interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-chip px-2 py-0.5 font-mono text-xs font-medium',
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export interface ChipProps extends BadgeProps {
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

export function Chip({ children, tone = 'neutral', dot, className }: ChipProps) {
  return (
    <span
      className={cn(
        // Level-2 content, static: no mat-control (no hover step, no shadow);
        // radius steps DOWN to chip inside rows/cards (§12)
        'bg-surface-3 inline-flex items-center gap-1.5 rounded-chip px-3 py-1 text-xs font-medium text-ink-2',
        className,
      )}
    >
      {dot && <span className={cn('size-1.5 rounded-full', dotTones[tone])} />}
      {children}
    </span>
  );
}

export function Tag({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-chip px-2.5 py-1 text-xs font-medium',
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export interface StatusDotProps {
  tone?: Tone;
  label?: ReactNode;
  className?: string;
}

const dotTones = {
  neutral: 'bg-line/30',
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
} as const;

export function StatusDot({ tone = 'neutral', label, className }: StatusDotProps) {
  if (label === undefined) {
    return (
      <span
        aria-hidden="true"
        className={cn('size-2 shrink-0 rounded-full', dotTones[tone], className)}
      />
    );
  }
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs text-ink-2', className)}>
      <span aria-hidden="true" className={cn('size-2 shrink-0 rounded-full', dotTones[tone])} />
      {label}
    </span>
  );
}
