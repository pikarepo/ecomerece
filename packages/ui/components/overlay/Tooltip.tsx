/** @jsxImportSource react */
import { type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { cn } from '../../lib/cn';

export interface TooltipProps {
  content: ReactNode;
  children?: ReactNode;
  side?: 'top' | 'bottom';
  /** Open delay in ms for hover; focus is always immediate. 0 = none. */
  delay?: number;
  className?: string;
}

export function Tooltip({ content, children, side = 'top', delay = 0, className }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  useEffect(
    () => () => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    },
    [],
  );

  const show = (immediate = false) => {
    clearTimer();
    if (immediate || delay <= 0) {
      setOpen(true);
      return;
    }
    timer.current = setTimeout(() => setOpen(true), delay);
  };

  const hide = () => {
    clearTimer();
    setOpen(false);
  };

  const sideClass = side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: tooltip trigger wrapper only listens for hover/focus to show the hint
    <span
      className="relative inline-flex"
      onPointerOver={() => show()}
      onPointerOut={hide}
      onFocus={() => show(true)}
      onBlur={hide}
      onKeyDown={(event) => {
        if (event.key === 'Escape') hide();
      }}
      aria-describedby={open ? id : undefined}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          id={id}
          className={cn(
            'mat-overlay pointer-events-none absolute left-1/2 z-overlay -translate-x-1/2 whitespace-nowrap',
            'rounded-chip px-2 py-1 text-xs text-ink shadow-md',
            sideClass,
            className,
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
