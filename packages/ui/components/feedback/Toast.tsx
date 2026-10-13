import { X } from 'lucide-react';
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

export interface Toast {
  id: string;
  message: ReactNode;
  tone?: ToastTone;
  durationMs?: number;
  action?: { label: string; onAction: () => void };
}

export interface ToastInput {
  message: ReactNode;
  tone?: ToastTone;
  durationMs?: number;
  action?: { label: string; onAction: () => void };
}

interface ToastContextValue {
  push: (toast: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneDot: Record<ToastTone, string> = {
  neutral: 'bg-line/30',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

const DEFAULT_DURATION = 4000;
const ACTION_DURATION = 8000;

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const tone = toast.tone ?? 'neutral';
  return (
    <div
      role="status"
      aria-live="polite"
      className="mat-overlay flex items-center gap-3 rounded-card px-5 py-3"
    >
      <span className={cn('size-2 shrink-0 rounded-full', toneDot[tone])} />
      <p className="min-w-0 flex-1 text-sm">{toast.message}</p>
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
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

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
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    },
    [clearTimer],
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
    (input: ToastInput) => {
      const id = String(++idRef.current);
      const duration = input.action ? ACTION_DURATION : (input.durationMs ?? DEFAULT_DURATION);
      setToasts((prev) => {
        const next = [...prev, { ...input, id }];
        return next.slice(-3); // never stack more than three (§21.12)
      });
      clearTimer(id);
      timersRef.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      );
    },
    [clearTimer, dismiss],
  );

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Portal>
        <div
          className={cn(
            'fixed bottom-4 left-4 right-4 z-toast flex flex-col items-center gap-2',
            'sm:left-auto sm:right-6 sm:bottom-6 sm:items-end',
            '[padding-bottom:env(safe-area-inset-bottom)]',
            'pointer-events-none',
          )}
        >
          <div className="pointer-events-auto flex w-full max-w-sm flex-col gap-2 sm:w-auto">
            {toasts.map((toast) => (
              <ToastCard key={toast.id} toast={toast} onDismiss={dismiss} />
            ))}
          </div>
        </div>
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
