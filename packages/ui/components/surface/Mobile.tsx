/** @jsxImportSource react */
import { RefreshCw } from 'lucide-react';
import {
  type HTMLAttributes,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '../../lib/cn';

/* ── SafeArea ──────────────────────────────────────────────────────────── */

export type SafeAreaEdge = 'top' | 'right' | 'bottom' | 'left';

const INSET: Record<SafeAreaEdge, string> = {
  top: 'paddingTop',
  right: 'paddingRight',
  bottom: 'paddingBottom',
  left: 'paddingLeft',
};

export interface SafeAreaProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Edges to inset (default all). */
  edges?: SafeAreaEdge[];
}

/**
 * Pads its content inside the device safe area (notch / home indicator) using
 * `env(safe-area-inset-*)`. Falls back to `0px` where the env var is unset.
 */
export function SafeArea({
  edges = ['top', 'right', 'bottom', 'left'],
  className,
  style,
  ...rest
}: SafeAreaProps) {
  const insets: Record<string, string> = {};
  for (const edge of edges) {
    insets[INSET[edge]] = `env(safe-area-inset-${edge}, 0px)`;
  }
  return (
    <div
      data-edges={edges.join(',')}
      className={cn(className)}
      style={{ ...insets, ...style }}
      {...rest}
    />
  );
}

/* ── KeyboardAvoidingView ──────────────────────────────────────────────── */

export type KeyboardBehavior = 'padding' | 'height';

export interface KeyboardAvoidingViewProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** How to make room (default `padding`). */
  behavior?: KeyboardBehavior;
  /** Controlled keyboard height in px. When omitted, tracks `visualViewport`. */
  offset?: number;
}

/**
 * Makes room for the on-screen keyboard by tracking `window.visualViewport` and
 * applying the keyboard height as bottom padding (or a max-height reduction).
 * Pass `offset` to control the reserved space directly.
 */
export function KeyboardAvoidingView({
  behavior = 'padding',
  offset,
  className,
  style,
  ...rest
}: KeyboardAvoidingViewProps) {
  const [tracked, setTracked] = useState(0);

  useEffect(() => {
    if (offset !== undefined) return;
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!vv) return;
    const update = () => {
      const overlap = window.innerHeight - vv.height - vv.offsetTop;
      setTracked(Math.max(0, overlap));
    };
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [offset]);

  const reserved = Math.max(0, offset ?? tracked);
  const sizing =
    behavior === 'padding'
      ? { paddingBottom: reserved }
      : { maxHeight: `calc(100% - ${reserved}px)` };
  return (
    <div className={cn('flex flex-col', className)} style={{ ...sizing, ...style }} {...rest} />
  );
}

/* ── PullToRefresh ─────────────────────────────────────────────────────── */

export interface PullToRefreshProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Called when the pull passes `threshold`. May return a promise. */
  onRefresh?: () => void | Promise<void>;
  /** Pull distance (px) that triggers a refresh (default 64). */
  threshold?: number;
  disabled?: boolean;
}

/**
 * Touch container that triggers `onRefresh` when the user drags down past
 * `threshold`, showing a spinner while the returned promise settles.
 */
export function PullToRefresh({
  children,
  onRefresh,
  threshold = 64,
  disabled = false,
  className,
  ...rest
}: PullToRefreshProps) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const start = useRef<number | null>(null);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || refreshing) return;
    start.current = event.clientY;
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (start.current === null) return;
    const dy = event.clientY - start.current;
    setPull(dy > 0 ? Math.min(dy, threshold * 1.5) : 0);
  };

  const end = () => {
    if (start.current === null) return;
    const shouldRefresh = pull >= threshold && !refreshing;
    start.current = null;
    setPull(0);
    if (shouldRefresh && onRefresh) {
      const result = onRefresh();
      if (result && typeof result.then === 'function') {
        setRefreshing(true);
        result.finally(() => setRefreshing(false));
      }
    }
  };

  return (
    <div
      data-pull={Math.round(pull)}
      data-refreshing={refreshing ? 'true' : 'false'}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
      className={cn('relative', className)}
      {...rest}
    >
      <div
        aria-hidden={pull === 0 && !refreshing}
        className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-center overflow-hidden text-ink-3"
        style={{ height: pull }}
      >
        <RefreshCw className={cn('size-4', refreshing && 'animate-spin')} />
      </div>
      <div style={{ transform: `translateY(${pull}px)` }}>{children}</div>
    </div>
  );
}
