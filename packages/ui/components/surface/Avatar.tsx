/** @jsxImportSource react */
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Presence dot pinned to the bottom-right corner. */
  status?: PresenceStatus;
  /** Small overlay (icon or label) pinned to the top-right corner. */
  badge?: ReactNode;
  className?: string;
}

const sizeClasses = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-9 text-xs',
  lg: 'size-11 text-sm',
  xl: 'size-14 text-base',
} as const;

const STATUS_TONE: Record<PresenceStatus, string> = {
  online: 'bg-success',
  away: 'bg-warning',
  busy: 'bg-danger',
  offline: 'bg-ink-3',
};

const STATUS_SIZE: Record<NonNullable<AvatarProps['size']>, string> = {
  xs: 'size-2',
  sm: 'size-2',
  md: 'size-2.5',
  lg: 'size-2.5',
  xl: 'size-3',
};

/** First two whitespace-separated words, first grapheme uppercased. */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function Avatar({ src, alt, name, size = 'md', status, badge, className }: AvatarProps) {
  const statusLabel = status ? `, ${status}` : '';
  const classes = cn(
    'inline-flex shrink-0 items-center justify-center rounded-full border border-line/10 bg-surface-4 object-cover font-semibold text-ink-2',
    sizeClasses[size],
    className,
  );

  const core = src ? (
    <img
      src={src}
      alt={alt ?? (name ? `${name}${statusLabel}` : '')}
      className={cn(classes, 'object-cover')}
    />
  ) : name ? (
    <span className={classes} role="img" aria-label={`${name}${statusLabel}`}>
      {getInitials(name)}
    </span>
  ) : (
    <span className={classes} aria-hidden="true" />
  );

  if (!status && !badge) return core;

  return (
    <span className="relative inline-flex">
      {core}
      {status && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-surface-1',
            STATUS_TONE[status],
            STATUS_SIZE[size],
          )}
        />
      )}
      {badge && (
        <span className="absolute -right-1 -top-1 inline-flex items-center justify-center">
          {badge}
        </span>
      )}
    </span>
  );
}
