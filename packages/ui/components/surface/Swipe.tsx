/** @jsxImportSource react */
import {
  type HTMLAttributes,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useRef,
  useState,
} from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface SwipeableProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Fired once a swipe passes `threshold` on the dominant axis. */
  onSwipe?: (direction: SwipeDirection) => void;
  /** Minimum travel in px to count as a swipe (default 40). */
  threshold?: number;
  disabled?: boolean;
}

/**
 * Reports directional swipe gestures (`left`/`right`/`up`/`down`) via pointer
 * events. A swipe is recognised only when its primary axis dominates.
 */
export function Swipeable({
  children,
  onSwipe,
  threshold = 40,
  disabled = false,
  className,
  ...rest
}: SwipeableProps) {
  const start = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    start.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const s = start.current;
    start.current = null;
    if (!s || disabled || !onSwipe) return;
    const dx = event.clientX - s.x;
    const dy = event.clientY - s.y;
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;
    if (Math.abs(dx) >= Math.abs(dy)) onSwipe(dx < 0 ? 'left' : 'right');
    else onSwipe(dy < 0 ? 'up' : 'down');
  };

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      className={cn('touch-pan-y', className)}
      {...rest}
    />
  );
}

export type SwipeActionTone = 'default' | 'danger';

export interface SwipeAction {
  label: string;
  icon?: ReactNode;
  tone?: SwipeActionTone;
  onAction?: () => void;
}

const TONE: Record<SwipeActionTone, string> = {
  default: 'bg-accent text-accent-ink',
  danger: 'bg-danger text-accent-ink',
};

export interface SwipeActionsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onAction'> {
  children?: ReactNode;
  /** Actions revealed on swipe (each occupies one 4.5rem slot). */
  actions: SwipeAction[];
  /** Drag distance (px) that latches the row open (default 48). */
  threshold?: number;
  disabled?: boolean;
}

const SLOT = 72;

/**
 * List row that swipes left to reveal trailing actions (delete, archive, …).
 * The row latches open past `threshold`; tapping an action runs it and closes.
 */
export function SwipeActions({
  children,
  actions,
  threshold = 48,
  disabled = false,
  className,
  ...rest
}: SwipeActionsProps) {
  const [offset, setOffset] = useState(0);
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; base: number } | null>(null);
  const width = actions.length * SLOT;

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || actions.length === 0) return;
    start.current = { x: event.clientX, base: open ? -width : 0 };
    setDragging(true);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const s = start.current;
    if (!s) return;
    const raw = s.base + (event.clientX - s.x);
    setOffset(Math.max(-width, Math.min(0, raw)));
  };

  const onPointerUp = () => {
    if (!start.current) return;
    start.current = null;
    setDragging(false);
    const shouldOpen = offset <= -threshold;
    setOpen(shouldOpen);
    setOffset(shouldOpen ? -width : 0);
  };

  return (
    <div
      data-open={open ? 'true' : 'false'}
      data-dragging={dragging ? 'true' : 'false'}
      className={cn('relative overflow-hidden', className)}
      {...rest}
    >
      {actions.length > 0 && (
        <div className="absolute inset-y-0 right-0 flex" style={{ width }}>
          {actions.map((action) => (
            <button
              type="button"
              key={action.label}
              onClick={() => {
                action.onAction?.();
                setOpen(false);
                setOffset(0);
              }}
              style={{ width: SLOT }}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-xs font-medium',
                TONE[action.tone ?? 'default'],
                focusRing(),
              )}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        data-testid="swipe-row-content"
        className={cn(
          'relative mat-card',
          dragging ? 'transition-none' : 'transition-transform duration-skin ease-skin',
        )}
        style={{ transform: `translateX(${offset}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
