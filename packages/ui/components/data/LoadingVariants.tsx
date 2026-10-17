/** @jsxImportSource react */
import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/cn';
import { Spinner, type SpinnerVariant } from './Spinner';

/* ───────────────────── infinite-scroll loader ───────────────────── */

export interface InfiniteScrollLoaderProps {
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  /**
   * `auto` fires `onLoadMore` via IntersectionObserver when the platform
   * supports it; falls back to a “Load more” button otherwise (and with
   * `trigger="button"` always) — so the control never dead-ends.
   */
  trigger?: 'auto' | 'button';
  /** Announced while loading. Default “Loading more…”. */
  label?: string;
  /** Text once `hasMore` is false. Default “You're all caught up”. */
  endLabel?: string;
  loadMoreLabel?: string;
  className?: string;
}

/**
 * Footer sentinel for infinite lists — distinct from batch-87's
 * `InfiniteList` (a full list container): this is the trailing piece you
 * append under any content.
 */
export function InfiniteScrollLoader({
  loading = false,
  hasMore = true,
  onLoadMore,
  trigger = 'auto',
  label = 'Loading more…',
  endLabel = "You're all caught up",
  loadMoreLabel = 'Load more',
  className,
}: InfiniteScrollLoaderProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // IO support is detected AFTER mount so the first paint (server + hydration)
  // is deterministic: SSR HTML and the client's first render both show the
  // button fallback; capable clients upgrade to the observer sentinel.
  const [ioSupported, setIoSupported] = useState(false);
  useEffect(() => {
    setIoSupported(typeof IntersectionObserver !== 'undefined');
  }, []);
  const auto = trigger === 'auto' && ioSupported && Boolean(onLoadMore);

  useEffect(() => {
    if (!auto || !hasMore || loading || !onLoadMore || !sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
      },
      { rootMargin: '200px 0px' },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [auto, hasMore, loading, onLoadMore]);

  if (!hasMore) {
    return (
      <div
        ref={sentinelRef}
        data-state="end"
        className={cn('flex items-center justify-center gap-2 py-6 text-sm text-ink-3', className)}
      >
        <Check className="size-4 shrink-0" aria-hidden="true" />
        <span>{endLabel}</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div ref={sentinelRef} data-state="loading" className={cn('py-2', className)}>
        <Spinner variant="dots" label={label} className="py-4" />
      </div>
    );
  }

  if (auto) {
    return (
      <div
        ref={sentinelRef}
        aria-hidden="true"
        data-state="sentinel"
        className={cn('h-px', className)}
      />
    );
  }

  return (
    <div ref={sentinelRef} data-state="idle" className={cn('flex justify-center py-4', className)}>
      <button
        type="button"
        onClick={onLoadMore}
        className="mat-control rounded-control px-4 py-2 text-sm font-medium text-ink"
      >
        {loadMoreLabel}
      </button>
    </div>
  );
}

/* ───────────────────── route transition bar ───────────────────── */

export interface RouteProgressBarProps {
  /** Show (and hold) the bar. Toggle `false` to collapse it away. */
  active: boolean;
  label?: string;
  className?: string;
}

/**
 * Thin top-of-viewport bar for route/async transitions (§21.10 pattern).
 * Stays mounted so `active` can animate in (`scale-x-100`) and back out
 * (`scale-x-0`); inactive is `aria-hidden`.
 */
export function RouteProgressBar({ active, label = 'Loading', className }: RouteProgressBarProps) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-hidden={!active}
      data-active={active}
      className={cn(
        'fixed left-0 top-0 z-toast h-0.5 w-full origin-left bg-accent transition-transform duration-skin ease-skin',
        active ? 'scale-x-100' : 'scale-x-0',
        className,
      )}
    />
  );
}

/* ───────────────────────── splash screen ───────────────────────── */

export interface SplashScreenProps {
  /** Controlled visibility (default shown). */
  open?: boolean;
  /** Brand/logo slot rendered above the title. */
  brand?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  /** Status line under the spinner; a string also names the live region. */
  status?: ReactNode;
  /** Spinner style (batch 97 variants). Default `orbit`. */
  variant?: SpinnerVariant;
  className?: string;
}

/**
 * Full-viewport boot/refresh screen: brand, optional copy and a spinner with
 * a polite live region (the nested `Spinner` owns `role="status"`). Controlled
 * by `open` — pair with your app's hydration/bootstrap signal.
 */
export function SplashScreen({
  open = true,
  brand,
  title = 'Loading',
  description,
  status,
  variant = 'orbit',
  className,
}: SplashScreenProps) {
  if (!open) return null;
  return (
    <div
      data-splash=""
      className={cn(
        'fixed inset-0 z-toast flex flex-col items-center justify-center gap-4 bg-canvas',
        className,
      )}
    >
      {brand && <div>{brand}</div>}
      {title && <p className="text-lg font-semibold">{title}</p>}
      {description && <p className="max-w-64 text-center text-sm text-ink-2">{description}</p>}
      <Spinner variant={variant} className="py-2" />
      {status && <p className="text-xs text-ink-3">{status}</p>}
    </div>
  );
}
