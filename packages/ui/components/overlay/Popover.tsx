import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/cn';

export interface PopoverProps {
  trigger: ReactNode;
  content: ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
  side?: 'bottom' | 'top';
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
    <div ref={wrapRef} className="relative inline-block">
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
          {content}
        </div>
      )}
    </div>
  );
}
