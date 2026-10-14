/** @jsxImportSource react */
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../../lib/cn';

/* ── SyncStatus ─────────────────────────────────────────────────────────── */

export type SyncState = 'synced' | 'syncing' | 'offline' | 'error';

export interface SyncStatusProps extends ComponentPropsWithoutRef<'span'> {
  state: SyncState;
  /** Shown as a `<time>` suffix while synced. */
  lastSyncedAt?: Date | string | number;
  label?: string;
}

const SYNC_TEXT: Record<SyncState, string> = {
  synced: 'Synced',
  syncing: 'Syncing…',
  offline: 'Offline',
  error: 'Sync failed',
};

const SYNC_TONE: Record<SyncState, string> = {
  synced: 'bg-green-500',
  syncing: 'bg-accent animate-pulse',
  offline: 'bg-ink-3',
  error: 'bg-red-500',
};

/** Sync status indicator (todo/08 batch 18 status family). */
export function SyncStatus({ state, lastSyncedAt, label, className, ...props }: SyncStatusProps) {
  const stamped = state === 'synced' && lastSyncedAt != null;
  const d = stamped
    ? typeof lastSyncedAt === 'string' || typeof lastSyncedAt === 'number'
      ? new Date(lastSyncedAt)
      : lastSyncedAt
    : null;

  return (
    <span
      {...props}
      role="status"
      aria-live="polite"
      className={cn('inline-flex items-center gap-2 text-sm text-ink-2', className)}
    >
      <span aria-hidden className={cn('h-2 w-2 rounded-full', SYNC_TONE[state])} />
      <span className="font-medium text-ink">{label ?? SYNC_TEXT[state]}</span>
      {d && (
        <time dateTime={d.toISOString()} className="text-ink-3">
          {d.toISOString().substring(11, 19)}
        </time>
      )}
    </span>
  );
}

/* ── SaveStatus ─────────────────────────────────────────────────────────── */

export type SaveState = 'saved' | 'saving' | 'error' | 'idle';

export interface SaveStatusProps extends ComponentPropsWithoutRef<'span'> {
  state: SaveState;
  label?: string;
}

const SAVE_TEXT: Record<SaveState, string> = {
  saved: 'All changes saved',
  saving: 'Saving…',
  error: "Couldn't save changes",
  idle: 'No changes',
};

/** Document save-state line (todo/08 batch 18 status family). */
export function SaveStatus({ state, label, className, ...props }: SaveStatusProps) {
  const tone =
    state === 'error'
      ? 'text-red-600 dark:text-red-400'
      : state === 'saving'
        ? 'text-ink-3'
        : 'text-ink-2';
  return (
    <span
      {...props}
      role="status"
      aria-live="polite"
      className={cn('inline-flex items-center gap-2 text-sm', tone, className)}
    >
      <span
        aria-hidden
        className={cn(
          'h-2 w-2 rounded-full',
          state === 'saved' && 'bg-green-500',
          state === 'saving' && 'bg-accent animate-pulse',
          state === 'error' && 'bg-red-500',
          state === 'idle' && 'bg-ink-3',
        )}
      />
      {label ?? SAVE_TEXT[state]}
    </span>
  );
}

/* ── ConnectionQuality ──────────────────────────────────────────────────── */

export type ConnectionLevel = 'good' | 'fair' | 'poor' | 'offline';

export interface ConnectionQualityProps extends ComponentPropsWithoutRef<'span'> {
  level: ConnectionLevel;
  label?: string;
}

const LEVEL_BARS: Record<ConnectionLevel, number> = { good: 4, fair: 2, poor: 1, offline: 0 };
const LEVEL_TEXT: Record<ConnectionLevel, string> = {
  good: 'Strong',
  fair: 'Fair',
  poor: 'Weak',
  offline: 'Offline',
};
const BAR_HEIGHTS = ['h-2', 'h-3', 'h-4', 'h-5'];

/** Signal-bars connection indicator (todo/08 batch 18 status family). */
export function ConnectionQuality({ level, label, className, ...props }: ConnectionQualityProps) {
  const filled = LEVEL_BARS[level];
  return (
    <span
      {...props}
      role="img"
      aria-label={`Connection: ${label ?? LEVEL_TEXT[level]}`}
      className={cn('inline-flex items-center gap-2 text-sm text-ink-2', className)}
    >
      <span className="flex h-5 items-end gap-0.5" aria-hidden>
        {BAR_HEIGHTS.map((height, i) => (
          <span
            key={height}
            className={cn('w-1 rounded-full', height, i < filled ? 'bg-accent' : 'bg-surface-3')}
          />
        ))}
      </span>
      {label ?? LEVEL_TEXT[level]}
    </span>
  );
}

/* ── BatteryIndicator ───────────────────────────────────────────────────── */

export interface BatteryIndicatorProps extends ComponentPropsWithoutRef<'span'> {
  /** Charge level 0–100 (clamped). */
  level: number;
  charging?: boolean;
  showLabel?: boolean;
  label?: string;
}

/** Battery level glyph (todo/08 batch 18 status family). */
export function BatteryIndicator({
  level,
  charging = false,
  showLabel = true,
  label,
  className,
  ...props
}: BatteryIndicatorProps) {
  const pct = Math.round(Math.min(100, Math.max(0, level)));
  const tone = pct <= 20 ? 'bg-red-500' : pct <= 50 ? 'bg-amber-500' : 'bg-green-500';
  const text = label ?? `${pct}%${charging ? ' · Charging' : ''}`;

  return (
    <span
      {...props}
      role="img"
      aria-label={`Battery ${pct}%${charging ? ', charging' : ''}`}
      className={cn('inline-flex items-center gap-2 text-sm text-ink-2', className)}
    >
      <span
        className="relative inline-flex h-3.5 w-8 items-center rounded-[3px] border border-line/60 p-[2px]"
        aria-hidden
      >
        <span
          className={cn('h-full rounded-[1px] transition-all duration-skin', tone)}
          style={{ width: `${pct}%` }}
        />
        <span className="absolute -right-1 top-1/2 h-1.5 w-0.5 -translate-y-1/2 rounded-r bg-line/60" />
      </span>
      {showLabel && <span className="tabular-nums">{text}</span>}
    </span>
  );
}
