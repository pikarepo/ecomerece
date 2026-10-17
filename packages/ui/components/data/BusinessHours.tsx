/** @jsxImportSource react */
import { type ComponentPropsWithoutRef, useEffect, useState } from 'react';
import { cn } from '../../lib/cn';

export interface BusinessHoursProps extends ComponentPropsWithoutRef<'span'> {
  /** Opening time, 24h `HH:MM`. */
  open: string;
  /** Closing time, 24h `HH:MM` — same day (overnight ranges unsupported). */
  close: string;
  /** IANA timezone id (default: the runtime's local zone). */
  timezone?: string;
  /** Working days, 0 = Sunday … 6 = Saturday. Default: Monday–Friday. */
  days?: number[];
  /** Frozen clock for deterministic rendering (tests, stories). */
  now?: Date;
  /** Label when open. Default `Open`. */
  openLabel?: string;
  /** Label when closed. Default `Closed`. */
  closedLabel?: string;
  /** Show the next transition (`closes 5:00 PM` / `opens Mon 9:00 AM`). */
  showNext?: boolean;
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const WEEKDAY_LABEL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Parse `HH:MM` into minutes-since-midnight (invalid input → 0). */
export function parseHm(time: string): number {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return 0;
  const h = Math.min(23, Number(match[1]));
  const m = Math.min(59, Number(match[2]));
  return h * 60 + m;
}

/** `17:00` → `5:00 PM` (locale-independent 12h clock). */
export function formatClock12(time: string): string {
  const minutes = parseHm(time);
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

interface ZonedNow {
  day: number;
  minutes: number;
}

/** Wall-clock weekday + minutes in the given timezone. */
function zonedNow(now: Date, timezone?: string): ZonedNow {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(now);
    let day = now.getDay();
    let hour = now.getHours();
    let minute = now.getMinutes();
    for (const part of parts) {
      if (part.type === 'weekday' && part.value in WEEKDAY_INDEX) day = WEEKDAY_INDEX[part.value];
      // Some ICU builds emit `24` for midnight under hourCycle h23/h24.
      else if (part.type === 'hour') hour = Number(part.value) % 24;
      else if (part.type === 'minute') minute = Number(part.value);
    }
    return { day, minutes: hour * 60 + minute };
  } catch {
    return { day: now.getDay(), minutes: now.getHours() * 60 + now.getMinutes() };
  }
}

export interface BusinessStatus {
  open: boolean;
  /** Human next-transition text, e.g. `closes 5:00 PM` / `opens Mon 9:00 AM`. */
  next?: string;
}

export interface BusinessHoursOptions {
  open: string;
  close: string;
  days?: number[];
  timezone?: string;
}

/** Pure open/closed computation — exported for tests. */
export function businessStatus(
  now: Date,
  { open, close, days = [1, 2, 3, 4, 5], timezone }: BusinessHoursOptions,
): BusinessStatus {
  const openMin = parseHm(open);
  const closeMin = parseHm(close);
  const { day, minutes } = zonedNow(now, timezone);
  const isWorkday = days.includes(day);

  if (isWorkday && minutes >= openMin && minutes < closeMin) {
    return { open: true, next: `closes ${formatClock12(close)}` };
  }

  // Before opening today, or after closing / weekend → find the next workday.
  const offset =
    isWorkday && minutes < openMin
      ? 0
      : ([1, 2, 3, 4, 5, 6, 7].find((o) => days.includes((day + o) % 7)) ?? 7);
  const nextDay = (day + offset) % 7;
  const when = offset === 0 ? 'today' : offset === 1 ? 'tomorrow' : WEEKDAY_LABEL[nextDay];
  return { open: false, next: `opens ${when} ${formatClock12(open)}` };
}

/** Deterministic first paint — matches the prerendered HTML so hydration is clean. */
const CLOSED_STATUS: BusinessStatus = { open: false };

/**
 * Open/closed business-hours status (todo/08 batch 11 completion).
 * Renders a status dot + `Open · closes 5:00 PM` style text.
 *
 * The live clock is read **after mount**, never during the server render: with
 * no `now` the first paint is always the deterministic closed state (identical
 * on server and client), and an effect swaps in the real status once we are
 * safely on the client. Passing a frozen `now` (tests, stories) computes
 * synchronously and skips the effect.
 */
export function BusinessHours({
  open,
  close,
  timezone,
  days,
  now,
  openLabel = 'Open',
  closedLabel = 'Closed',
  showNext = true,
  className,
  ...props
}: BusinessHoursProps) {
  const frozen = now !== undefined;
  const [live, setLive] = useState<BusinessStatus | null>(null);

  // Mount-only on purpose: re-running on every render would loop (inline
  // `days` arrays change identity every render and businessStatus returns a
  // fresh object each call).
  // biome-ignore lint/correctness/useExhaustiveDependencies: compute the live status once on mount
  useEffect(() => {
    setLive(businessStatus(new Date(), { open, close, days, timezone }));
  }, []);

  const status: BusinessStatus = frozen
    ? businessStatus(now, { open, close, days, timezone })
    : (live ?? CLOSED_STATUS);

  return (
    <span
      {...props}
      role="status"
      className={cn('inline-flex items-center gap-2 text-sm text-ink-2', className)}
    >
      <span
        aria-hidden
        className={cn('h-2 w-2 rounded-full', status.open ? 'bg-green-500' : 'bg-ink-3')}
      />
      <span className="font-medium text-ink">{status.open ? openLabel : closedLabel}</span>
      {showNext && status.next && <span className="text-ink-3">· {status.next}</span>}
    </span>
  );
}
