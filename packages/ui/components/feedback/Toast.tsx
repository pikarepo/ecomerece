/** @jsxImportSource react */
import { LoaderCircle, X } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '../../lib/cn';
import { Portal } from '../../lib/Portal';

export type ToastTone = 'neutral' | 'success' | 'warning' | 'danger';

/** Region the toast stack is pinned to. The provider default applies to every toast. */
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface Toast {
  id: string;
  message: ReactNode;
  tone?: ToastTone;
  /** Auto-dismiss delay. `0` (or any ≤ 0) keeps the toast until dismissed manually. */
  durationMs?: number;
  action?: { label: string; onAction: () => void };
  /** Renders a spinner instead of the tone dot. Loading toasts default to sticky. */
  loading?: boolean;
  /** Determinate progress 0–100; renders a bar under the message (clamped). */
  progress?: number;
  /** Collapses pushes sharing a key into one card (`+N` badge, latest message wins). */
  group?: string;
  /** Number of collapsed members for `group` (1 = no badge). Managed by `push`. */
  groupCount?: number;
  /** Per-toast region override; otherwise the provider `position` applies. */
  position?: ToastPosition;
}

export interface ToastInput {
  message: ReactNode;
  tone?: ToastTone;
  durationMs?: number;
  action?: { label: string; onAction: () => void };
  loading?: boolean;
  progress?: number;
  group?: string;
  position?: ToastPosition;
}

/** Labels for `promise()` — function variants receive the settled value/error. */
export interface PromiseToastLabels<T> {
  loading: ReactNode;
  success: ReactNode | ((data: T) => ReactNode);
  error: ReactNode | ((error: unknown) => ReactNode);
}

type PromiseOptions = { durationMs?: number };

interface ToastContextValue {
  /** Queue a toast; returns its id (sticky when `loading` and no explicit `durationMs`). */
  push: (toast: ToastInput) => string;
  /** Patch a toast in place. A `durationMs` in the patch re-arms auto-dismiss. */
  update: (id: string, patch: Partial<ToastInput>) => void;
  /** Remove a toast by id. */
  dismiss: (id: string) => void;
  /** Loading toast that settles to success/error; rejects with the original error. */
  promise: <T>(
    pending: Promise<T>,
    labels: PromiseToastLabels<T>,
    options?: PromiseOptions,
  ) => Promise<T>;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneDot: Record<ToastTone, string> = {
  neutral: 'bg-line/30',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

/** Region layout per position — mobile-first full-width strip, tightened at `sm:`. */
const REGION_CLASS: Record<ToastPosition, string> = {
  'top-left':
    'top-4 left-4 right-4 items-center [padding-top:env(safe-area-inset-top)] sm:left-6 sm:right-auto sm:top-6 sm:items-start',
  'top-center': 'top-4 left-4 right-4 items-center [padding-top:env(safe-area-inset-top)] sm:top-6',
  'top-right':
    'top-4 left-4 right-4 items-center [padding-top:env(safe-area-inset-top)] sm:left-auto sm:right-6 sm:top-6 sm:items-end',
  'bottom-left':
    'bottom-4 left-4 right-4 items-center [padding-bottom:env(safe-area-inset-bottom)] sm:left-6 sm:right-auto sm:bottom-6 sm:items-start',
  'bottom-center':
    'bottom-4 left-4 right-4 items-center [padding-bottom:env(safe-area-inset-bottom)]',
  'bottom-right':
    'bottom-4 left-4 right-4 items-center [padding-bottom:env(safe-area-inset-bottom)] sm:left-auto sm:right-6 sm:bottom-6 sm:items-end',
};

/** Clamp a progress value to the 0–100 range the bar/`aria-valuenow` expect. */
export function clampProgress(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function labelOf<T>(value: ReactNode | ((x: T) => ReactNode), settled: T): ReactNode {
  return typeof value === 'function' ? (value as (x: T) => ReactNode)(settled) : value;
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const tone = toast.tone ?? 'neutral';
  const progress = typeof toast.progress === 'number' ? clampProgress(toast.progress) : null;
  const extra = (toast.groupCount ?? 1) - 1;
  return (
    <div
      role="status"
      aria-live="polite"
      className="mat-overlay overflow-hidden rounded-card px-5 py-3"
    >
      <div className="flex items-center gap-3">
        {toast.loading ? (
          <LoaderCircle className="size-4 shrink-0 animate-spin text-accent" aria-hidden="true" />
        ) : (
          <span className={cn('size-2 shrink-0 rounded-full', toneDot[tone])} />
        )}
        <p className="min-w-0 flex-1 text-sm">{toast.message}</p>
        {extra > 0 && (
          <span className="shrink-0 rounded-chip bg-surface-3 px-1.5 py-0.5 font-mono text-xs text-ink-2">
            +{extra}
            <span className="sr-only"> more in this group</span>
          </span>
        )}
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action?.onAction();
              onDismiss(toast.id);
            }}
            className="ml-2 shrink-0 text-xs font-medium text-accent"
          >
            {toast.action.label}
          </button>
        )}
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => onDismiss(toast.id)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-3 transition-all duration-skin ease-skin hover:bg-surface-3 hover:text-ink"
        >
          <X className="size-4" />
        </button>
      </div>
      {progress !== null && (
        <div className="mt-2 flex items-center gap-2">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-line/30"
          >
            <span
              className="block h-full rounded-full bg-accent transition-[width] duration-skin ease-skin"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="shrink-0 font-mono text-xs tabular-nums text-ink-3">{progress}%</span>
        </div>
      )}
    </div>
  );
}

export function ToastProvider({
  children,
  position = 'bottom-right',
}: {
  children: ReactNode;
  position?: ToastPosition;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Synchronous mirror of `toasts` — `push` must see earlier pushes in the same
  // tick (group matching) without waiting for a re-render.
  const toastsRef = useRef<Toast[]>([]);
  const idRef = useRef(0);
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const commit = useCallback((updater: (prev: Toast[]) => Toast[]) => {
    toastsRef.current = updater(toastsRef.current);
    setToasts(toastsRef.current);
  }, []);

  const clearTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const dismiss = useCallback(
    (id: string) => {
      clearTimer(id);
      commit((prev) => prev.filter((toast) => toast.id !== id));
    },
    [clearTimer, commit],
  );

  /** Arm auto-dismiss; `duration <= 0` keeps the toast sticky. */
  const arm = useCallback(
    (id: string, duration: number) => {
      clearTimer(id);
      if (duration > 0) {
        timersRef.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }
    },
    [clearTimer, dismiss],
  );

  // Clear any pending timers when the provider unmounts.
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
    };
  }, []);

  const push = useCallback(
    (input: ToastInput): string => {
      const duration =
        input.durationMs ?? (input.loading ? 0 : input.action ? ACTION_DURATION : DEFAULT_DURATION);
      const grouped = input.group
        ? toastsRef.current.find((toast) => toast.group === input.group)
        : undefined;
      if (grouped) {
        const merged: Toast = {
          ...grouped,
          ...input,
          id: grouped.id,
          groupCount: (grouped.groupCount ?? 1) + 1,
        };
        commit((prev) => prev.map((toast) => (toast.id === grouped.id ? merged : toast)));
        arm(grouped.id, duration);
        return grouped.id;
      }
      const id = String(++idRef.current);
      const next: Toast = { ...input, id, groupCount: input.group ? 1 : undefined };
      commit((prev) => [...prev, next].slice(-3)); // never stack more than three (§21.12)
      arm(id, duration);
      return id;
    },
    [arm, commit],
  );

  const update = useCallback(
    (id: string, patch: Partial<ToastInput>) => {
      let found = false;
      commit((prev) =>
        prev.map((toast) => {
          if (toast.id !== id) return toast;
          found = true;
          return { ...toast, ...patch };
        }),
      );
      if (found && 'durationMs' in patch) arm(id, patch.durationMs ?? 0);
    },
    [arm, commit],
  );

  const promise = useCallback<ToastContextValue['promise']>(
    (pending, labels, options) => {
      const id = push({ message: labels.loading, tone: 'neutral', loading: true, durationMs: 0 });
      const settleMs = options?.durationMs ?? DEFAULT_DURATION;
      return pending.then(
        (data) => {
          update(id, {
            message: labelOf(labels.success, data),
            tone: 'success',
            loading: false,
            durationMs: settleMs,
          });
          return data;
        },
        (error) => {
          update(id, {
            message: labelOf(labels.error, error),
            tone: 'danger',
            loading: false,
            durationMs: settleMs,
          });
          throw error;
        },
      );
    },
    [push, update],
  );

  const value = useMemo(
    () => ({ push, update, dismiss, promise }),
    [push, update, dismiss, promise],
  );

  // One region per position in use; the provider default is always present.
  const positions = useMemo(() => {
    const set = new Set<ToastPosition>([position]);
    for (const toast of toasts) set.add(toast.position ?? position);
    return Array.from(set);
  }, [toasts, position]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Portal>
        {positions.map((region) => (
          <div
            key={region}
            data-toast-region=""
            data-position={region}
            className={cn(
              'pointer-events-none fixed z-toast flex flex-col gap-2',
              REGION_CLASS[region],
            )}
          >
            <div className="pointer-events-auto flex w-full max-w-sm flex-col gap-2 sm:w-auto">
              {toasts
                .filter((toast) => (toast.position ?? position) === region)
                .map((toast) => (
                  <ToastCard key={toast.id} toast={toast} onDismiss={dismiss} />
                ))}
            </div>
          </div>
        ))}
      </Portal>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}

const DEFAULT_DURATION = 4000;
const ACTION_DURATION = 8000;
