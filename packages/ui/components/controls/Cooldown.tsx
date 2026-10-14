/** @jsxImportSource react */

import {
  type ButtonHTMLAttributes,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

/**
 * Timed buttons (todo/09 batch 41): a generic `CooldownButton`, the
 * `ResendCodeButton` built on it, and a mount-driven `CountdownButton`.
 *
 * They share one interval loop (`TICK_MS`) so the visible remaining time stays
 * consistent and the countdowns are cheap. Labels accept render functions so
 * screens can localise/format the remaining time. Uses `mat-*` + theme token
 * utilities only (markup-contract clean).
 */

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const VARIANT: Record<Variant, string> = {
  primary: 'mat-primary text-accent-ink',
  secondary: 'mat-control text-ink',
  ghost: 'text-ink-2 hover:bg-surface-3 hover:text-ink',
};

const SIZE: Record<Size, string> = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base',
};

const BUTTON_BASE =
  'relative inline-flex select-none items-center justify-center gap-2 rounded-control font-semibold transition-all duration-skin ease-skin disabled:pointer-events-none disabled:opacity-60';

const TICK_MS = 250;

const secondsLeft = (ms: number) => Math.ceil(ms / 1000);

/* ── Cooldown button ────────────────────────────────────────────────────── */

export interface CooldownButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Cooldown length in seconds after activation (default 30). */
  seconds?: number;
  /** Fired on activation, before the cooldown starts. */
  onActivate?: () => void;
  /** Renders the label while cooling; gets the whole seconds remaining. */
  cooldownLabel?: (secondsLeft: number) => ReactNode;
  variant?: Variant;
  size?: Size;
}

export function CooldownButton({
  seconds = 30,
  onActivate,
  cooldownLabel,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  className,
  children,
  onClick,
  ...rest
}: CooldownButtonProps) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const remainingRef = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current != null) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => stop, [stop]);

  const start = () => {
    stop();
    remainingRef.current = Math.max(0, seconds * 1000);
    if (remainingRef.current <= 0) return;
    setRemaining(remainingRef.current);
    timer.current = setInterval(() => {
      remainingRef.current -= TICK_MS;
      if (remainingRef.current <= 0) {
        stop();
        setRemaining(null);
      } else {
        setRemaining(remainingRef.current);
      }
    }, TICK_MS);
  };

  const cooling = remaining != null;
  const left = cooling ? secondsLeft(remaining) : 0;

  return (
    <button
      type="button"
      disabled={disabled || cooling}
      data-cooling={cooling ? '' : undefined}
      aria-live="polite"
      className={cn(BUTTON_BASE, VARIANT[variant], SIZE[size], focusRing(), className)}
      onClick={(e) => {
        onClick?.(e);
        if (disabled || cooling) return;
        onActivate?.();
        start();
      }}
      {...rest}
    >
      {cooling ? (cooldownLabel?.(left) ?? `${left}s`) : children}
    </button>
  );
}

/* ── Resend code button ─────────────────────────────────────────────────── */

export interface ResendCodeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onResend?: () => void;
  seconds?: number;
  /** Idle label (default "Resend code"). */
  resendLabel?: ReactNode;
  /** Cooling label renderer; defaults to "Resend in {s}s". */
  coolingLabel?: (secondsLeft: number) => ReactNode;
  variant?: Variant;
  size?: Size;
}

export function ResendCodeButton({
  onResend,
  seconds = 30,
  resendLabel = 'Resend code',
  coolingLabel,
  variant = 'secondary',
  size = 'md',
  ...rest
}: ResendCodeButtonProps) {
  return (
    <CooldownButton
      seconds={seconds}
      variant={variant}
      size={size}
      onActivate={onResend}
      cooldownLabel={coolingLabel ?? ((s) => `Resend in ${s}s`)}
      {...rest}
    >
      {resendLabel}
    </CooldownButton>
  );
}

/* ── Countdown button ───────────────────────────────────────────────────── */

export interface CountdownButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Seconds to count down from (default 5). */
  seconds?: number;
  /** Fired once the countdown reaches zero. */
  onComplete?: () => void;
  /** Renders the label while counting; gets the whole seconds remaining. */
  countdownLabel?: (secondsLeft: number) => ReactNode;
  variant?: Variant;
  size?: Size;
  /** Start automatically on mount (default true). */
  auto?: boolean;
}

export function CountdownButton({
  seconds = 5,
  onComplete,
  countdownLabel,
  variant = 'primary',
  size = 'md',
  auto = true,
  disabled = false,
  className,
  children,
  ...rest
}: CountdownButtonProps) {
  const active = auto && seconds > 0;
  const [remaining, setRemaining] = useState<number | null>(active ? seconds * 1000 : null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active) return;
    let left = seconds * 1000;
    const id = setInterval(() => {
      left -= TICK_MS;
      if (left <= 0) {
        clearInterval(id);
        setRemaining(null);
        onCompleteRef.current?.();
      } else {
        setRemaining(left);
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, [active, seconds]);

  const counting = remaining != null;
  const left = counting ? secondsLeft(remaining) : 0;

  return (
    <button
      type="button"
      disabled={disabled || counting}
      data-counting={counting ? '' : undefined}
      aria-live="polite"
      className={cn(BUTTON_BASE, VARIANT[variant], SIZE[size], focusRing(), className)}
      {...rest}
    >
      {counting ? (countdownLabel?.(left) ?? `${left}s`) : children}
    </button>
  );
}
