/** @jsxImportSource react */
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface IconTileProps {
  icon: LucideIcon;
  tone?: 'accent' | 'neutral' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const toneClasses = {
  accent: 'bg-accent/12 text-accent',
  neutral: 'bg-surface-3 text-ink-2',
  danger: 'bg-danger/12 text-danger',
  success: 'bg-success/12 text-success',
  warning: 'bg-warning/12 text-warning',
} as const;

// Tiles nest one role DOWN from the row that hosts them (§12 concentric rule)
const sizeClasses = {
  sm: 'size-8 rounded-chip [&>svg]:size-4',
  md: 'size-9 rounded-chip [&>svg]:size-4',
  lg: 'size-11 rounded-control [&>svg]:size-5',
} as const;

export function IconTile({ icon: Icon, tone = 'neutral', size = 'md', className }: IconTileProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        toneClasses[tone],
        sizeClasses[size],
        className,
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
    </span>
  );
}
