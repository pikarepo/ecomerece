/** @jsxImportSource react */
import type { FocusEvent, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/cn';

export interface PopoverProps {
  trigger: ReactNode;
  content: ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
  side?: 'bottom' | 'top';
  /** What opens the popover (batch 94). `click` keeps the baseline behaviour. */
  triggerOn?: 'click' | 'hover' | 'focus';
  /** Draw a small arrow pointing back at the trigger (batch 94). */
  arrow?: boolean;
}

function triggerProps(open: boolean, toggle: () => void) {
  return {
    onClick: toggle,
    'aria-haspopup': 'menu' as const,
    'aria-expanded': open,
  };
}

export function Popover({
  trigger,
  content,
  className,
  align = 'start',
  side = 'bottom',
  triggerOn = 'click',
  arrow = false,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (wrapRef.current?.contains(target) || popRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const alignClass =
    align === 'start' ? 'left-0' : align === 'end' ? 'right-0' : 'left-1/2 -translate-x-1/2';
  const sideClass = side === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2';

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: structural wrapper around the consumer's trigger; these handlers only open/close the panel (same pattern as Modal's backdrop)
    <div
      ref={wrapRef}
      className="relative inline-block"
      onMouseEnter={triggerOn === 'hover' ? () => setOpen(true) : undefined}
      onMouseLeave={triggerOn === 'hover' ? () => setOpen(false) : undefined}
      onFocus={triggerOn === 'focus' ? () => setOpen(true) : undefined}
      onBlur={
        triggerOn === 'focus'
          ? (event: FocusEvent<HTMLDivElement>) => {
              const next = event.relatedTarget as Node | null;
              if (!next || !wrapRef.current?.contains(next)) setOpen(false);
            }
          : undefined
      }
    >
      <span {...triggerProps(open, () => setOpen((v) => !v))}>{trigger}</span>
      {open && (
        <div
          ref={popRef}
          role="menu"
          className={cn(
            'mat-overlay absolute z-overlay min-w-[200px] rounded-card p-1.5',
            'transition-all duration-skin ease-skin',
            alignClass,
            sideClass,
            className,
          )}
        >
          {arrow && (
            <span
              aria-hidden="true"
              className={cn(
                'absolute size-2.5 rotate-45 mat-overlay',
                side === 'bottom' ? '-top-1' : '-bottom-1',
                align === 'start'
                  ? 'left-5'
                  : align === 'end'
                    ? 'right-5'
                    : 'left-1/2 -translate-x-1/2',
              )}
            />
          )}
          {content}
        </div>
      )}
    </div>
  );
}
