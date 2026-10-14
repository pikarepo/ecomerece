/** @jsxImportSource react */
import type { ComponentPropsWithoutRef } from 'react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/cn';

/**
 * Stopwatch (todo/08 batch 11 completion). Wall-clock accurate (Date.now
 * deltas, no tick drift); optional Start/Pause + Reset buttons.
 */
export interface StopwatchProps extends Omit<ComponentPropsWithoutRef<'span'>, 'onChange'> {
  /** Controlled running state. When omitted the component self-manages. */
  running?: boolean;
  /** Start running on mount when `controls` is also on. */
  autoStart?: boolean;
  /** Initial elapsed in ms (default 0). */
  initialMs?: number;
  /** Tick interval in ms (default 50). */
  intervalMs?: number;
  /** Custom readout (default: `formatStopwatch`). */
  formatter?: (ms: number) => string;
  /** Render the Start/Pause + Reset buttons. */
  controls?: boolean;
  /** Fired with the current ms on every tick. */
  onChange?: (ms: number) => void;
  /** Fired when the running state changes. */
  onRunningChange?: (running: boolean) => void;
}

const DEFAULT_FORMAT = (ms: number) => {
  const total = Math.max(0, ms);
  const h = Math.floor(total / 3600000);
  const m = Math.floor((total % 3600000) / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const cs = Math.floor((total % 1000) / 10);
  if (h > 0)
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
};

/**
 * Format elapsed ms as `mm:ss.cc` (or `h:mm:ss.cc` when >= 1 hour).
 */
export function formatStopwatch(ms: number): string {
  return DEFAULT_FORMAT(ms);
}

export function Stopwatch({
  running: controlledRunning,
  autoStart = false,
  initialMs = 0,
  intervalMs = 50,
  formatter = DEFAULT_FORMAT,
  controls = false,
  onChange,
  onRunningChange,
  className,
}: StopwatchProps) {
  const [running, setRunning] = useState<boolean>(false);
  const [ms, setMs] = useState<number>(initialMs);
  const startRef = useRef<number>(0);
  const savedRef = useRef<number>(initialMs);
  const rafRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isControlled = controlledRunning !== undefined;

  useEffect(() => {
    const want = isControlled ? controlledRunning : autoStart;
    if (want && !running && savedRef.current === initialMs) {
      setRunning(true);
      startRef.current = Date.now();
      savedRef.current = initialMs;
      onRunningChange?.(true);
    }
  }, [isControlled, onRunningChange, running, initialMs, controlledRunning, autoStart]);

  useEffect(() => {
    if (!running) {
      if (rafRef.current) {
        clearInterval(rafRef.current);
        rafRef.current = null;
      }
      return;
    }
    startRef.current = Date.now() - savedRef.current;
    rafRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.max(0, now - startRef.current);
      setMs(elapsed);
      onChange?.(elapsed);
    }, intervalMs);
    return () => {
      if (rafRef.current) {
        clearInterval(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [running, onChange, intervalMs]);

  function start() {
    if (!isControlled) {
      const elapsed = ms;
      savedRef.current = elapsed;
      startRef.current = Date.now() - elapsed;
      setRunning(true);
      onRunningChange?.(true);
    } else {
      startRef.current = Date.now() - savedRef.current;
      onRunningChange?.(true);
    }
  }

  function pause() {
    if (isControlled) {
      savedRef.current = ms;
      onRunningChange?.(false);
      return;
    }
    savedRef.current = ms;
    setRunning(false);
    onRunningChange?.(false);
  }

  function reset() {
    const next = 0;
    if (!isControlled) {
      savedRef.current = next;
      startRef.current = Date.now();
      setMs(next);
      onChange?.(next);
    } else {
      savedRef.current = next;
      onChange?.(next);
    }
  }

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span role="timer" aria-label={`Elapsed ${formatter(ms)}`}>
        <span className="tabular-nums text-2xl font-semibold">{formatter(ms)}</span>
      </span>
      {controls && (
        <span className="ml-2 inline-flex gap-1">
          <button
            type="button"
            className={cn(
              'mat-control rounded-control px-3 text-sm focusRing active:scale-[var(--press-scale)]',
              running ? 'bg-ink-2 text-ink' : 'bg-surface-2 text-ink',
            )}
            onClick={running ? pause : start}
          >
            {running ? 'Pause' : 'Start'}
          </button>
          <button
            type="button"
            className="mat-control rounded-control px-3 text-sm focusRing active:scale-[var(--press-scale)] bg-surface-2 text-ink"
            onClick={reset}
          >
            Reset
          </button>
        </span>
      )}
    </div>
  );
}
