/** @jsxImportSource react */

import {
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

/**
 * Confirmation affordances (todo/09 batch 40): hold-to-confirm, swipe-to-confirm
 * and double-click-to-confirm. Each performs a deliberate gesture before firing
 * `onConfirm`, guarding against accidental destructive taps. Fills use theme
 * token utilities only and the accent role for the confirm colour.
 */

type Variant = 'primary' | 'secondary' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANT: Record<Variant, string> = {
  primary: 'mat-primary text-accent-ink',
  secondary: 'mat-control text-ink',
  danger: 'bg-danger text-accent-ink',
};

const SIZE: Record<Size, string> = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base',
};

const BUTTON_BASE =
  'relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-control font-semibold transition-all duration-skin ease-skin disabled:pointer-events-none disabled:opacity-60';

/* ── Hold to confirm ────────────────────────────────────────────────────── */

export interface HoldToConfirmButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Fired once the button has been held for `duration` ms. */
  onConfirm?: () => void;
  /** Hold time in ms (default 1200). */
  duration?: number;
  variant?: Variant;
  size?: Size;
  /** Shown while the hold is in progress (defaults to children). */
  holdingLabel?: React.ReactNode;
  /** Shown after a completed hold (defaults to children). */
  confirmedLabel?: React.ReactNode;
}

const TICK_MS = 50;

export function HoldToConfirmButton({
  onConfirm,
  duration = 1200,
  variant = 'danger',
  size = 'md',
  holdingLabel,
  confirmedLabel,
  disabled = false,
  className,
  children,
  ...rest
}: HoldToConfirmButtonProps) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const progressRef = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const step = TICK_MS / Math.max(1, duration);

  const stop = useCallback(() => {
    if (timer.current != null) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    stop();
    progressRef.current = 0;
    setProgress(0);
    setHolding(false);
  }, [stop]);

  const start = useCallback(() => {
    if (timer.current != null) return;
    progressRef.current = 0;
    setProgress(0);
    setHolding(true);
    timer.current = setInterval(() => {
      progressRef.current = Math.min(1, progressRef.current + step);
      setProgress(progressRef.current);
      if (progressRef.current >= 1) {
        stop();
        setHolding(false);
        onConfirm?.();
      }
    }, TICK_MS);
  }, [onConfirm, step, stop]);

  useEffect(() => stop, [stop]);

  const release = () => {
    stop();
    if (progressRef.current < 1) cancel();
  };

  const confirmed = progress >= 1;
  const label = confirmed
    ? (confirmedLabel ?? children)
    : holding
      ? (holdingLabel ?? children)
      : children;

  return (
    <button
      type="button"
      disabled={disabled}
      data-holding={holding ? '' : undefined}
      data-confirmed={confirmed ? '' : undefined}
      className={cn(BUTTON_BASE, VARIANT[variant], SIZE[size], focusRing(), className)}
      onPointerDown={() => {
        if (!disabled) start();
      }}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      onKeyDown={(e) => {
        if ((e.key === ' ' || e.key === 'Enter') && !e.repeat && !disabled) start();
      }}
      onKeyUp={(e) => {
        if (e.key === ' ' || e.key === 'Enter') release();
      }}
      {...rest}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 bg-accent/25"
        style={{ width: `${Math.round(progress * 100)}%` }}
      />
      <span className="relative z-10 inline-flex items-center gap-2">{label}</span>
    </button>
  );
}

/* ── Swipe to confirm ───────────────────────────────────────────────────── */

export interface SwipeToConfirmProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onConfirm'> {
  /** Fired when the thumb is dragged past `threshold`. */
  onConfirm?: () => void;
  /** Fraction of the track (0–1) that counts as confirmed (default 0.9). */
  threshold?: number;
  disabled?: boolean;
  /** Accessible label for the draggable thumb. */
  thumbLabel?: string;
}

export function SwipeToConfirm({
  onConfirm,
  threshold = 0.9,
  disabled = false,
  thumbLabel = 'Drag to confirm',
  className,
  children,
  ...rest
}: SwipeToConfirmProps) {
  const track = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const [offset, setOffset] = useState(0);

  const maxOffset = () => {
    const rect = track.current?.getBoundingClientRect();
    if (!rect) return 1;
    return Math.max(1, rect.width - rect.height);
  };

  const onThumbDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (disabled) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onThumbMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragging.current || disabled) return;
    const rect = track.current?.getBoundingClientRect();
    if (!rect) return;
    const next = Math.max(0, Math.min(maxOffset(), e.clientX - rect.left - rect.height / 2));
    setOffset(next);
  };

  const settle = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (offset >= maxOffset() * threshold) {
      setOffset(maxOffset());
      onConfirm?.();
    } else {
      setOffset(0);
    }
  };

  return (
    <div
      ref={track}
      className={cn('mat-well relative h-12 overflow-hidden rounded-full', className)}
      {...rest}
    >
      <span className="relative z-10 flex h-full items-center justify-center px-14 text-sm font-medium text-ink-2">
        {children}
      </span>
      <button
        type="button"
        aria-label={thumbLabel}
        disabled={disabled}
        onPointerDown={onThumbDown}
        onPointerMove={onThumbMove}
        onPointerUp={settle}
        onPointerCancel={settle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onConfirm?.();
          }
        }}
        style={{ transform: `translateX(${offset}px)` }}
        className={cn(
          'absolute top-1 left-1 z-20 flex size-10 items-center justify-center rounded-full',
          'mat-primary text-accent-ink transition-transform duration-skin ease-skin',
          'disabled:pointer-events-none disabled:opacity-60',
          focusRing(),
        )}
      >
        <span aria-hidden>→</span>
      </button>
    </div>
  );
}

/* ── Double-click to confirm ────────────────────────────────────────────── */

export interface DoubleClickToConfirmProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Fired on the second click within `timeout` ms. */
  onConfirm?: () => void;
  /** Max gap in ms between the two clicks (default 400). */
  timeout?: number;
  variant?: Variant;
  size?: Size;
  /** Label shown between the first and second click. */
  armedLabel?: React.ReactNode;
}

export function DoubleClickToConfirm({
  onConfirm,
  timeout = 400,
  variant = 'danger',
  size = 'md',
  armedLabel,
  disabled = false,
  className,
  children,
  onClick,
  ...rest
}: DoubleClickToConfirmProps) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timer.current != null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => clear, [clear]);

  return (
    <button
      type="button"
      disabled={disabled}
      data-armed={armed ? '' : undefined}
      className={cn(BUTTON_BASE, VARIANT[variant], SIZE[size], focusRing(), className)}
      onClick={(e) => {
        onClick?.(e);
        if (disabled) return;
        if (armed) {
          clear();
          setArmed(false);
          onConfirm?.();
          return;
        }
        setArmed(true);
        timer.current = setTimeout(() => {
          setArmed(false);
          timer.current = null;
        }, timeout);
      }}
      {...rest}
    >
      <span className="relative z-10 inline-flex items-center gap-2">
        {armed && armedLabel ? armedLabel : children}
      </span>
    </button>
  );
}
