/** @jsxImportSource react */
import { GripHorizontal, X } from 'lucide-react';
import {
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';
import { IconButton } from '../controls/Button';

export interface FloatingPanelProps {
  children?: ReactNode;
  title?: ReactNode;
  /** Initial top-left offset inside its positioned ancestor (default 24,24). */
  defaultPosition?: { x: number; y: number };
  /** Allow dragging by the header grip (default true). */
  draggable?: boolean;
  onClose?: () => void;
  widthClass?: string;
  className?: string;
}

/**
 * A floating panel that can be dragged by its header (Every Layout "Floating
 * panel"). Positioned absolutely inside the nearest positioned ancestor.
 */
export function FloatingPanel({
  children,
  title,
  defaultPosition = { x: 24, y: 24 },
  draggable = true,
  onClose,
  widthClass = 'w-72',
  className,
}: FloatingPanelProps) {
  const [pos, setPos] = useState(defaultPosition);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  useEffect(() => {
    if (!dragging) return;
    const move = (event: PointerEvent) => {
      const s = start.current;
      if (!s) return;
      setPos({ x: s.px + (event.clientX - s.x), y: s.py + (event.clientY - s.y) });
    };
    const up = () => setDragging(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [dragging]);

  const onGripDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!draggable) return;
    start.current = { x: event.clientX, y: event.clientY, px: pos.x, py: pos.y };
    setDragging(true);
  };

  return (
    <div
      data-dragging={dragging}
      style={{ left: pos.x, top: pos.y }}
      className={cn('mat-overlay absolute z-modal rounded-sheet', widthClass, className)}
    >
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="flex min-w-0 items-center gap-2">
          {draggable && (
            <button
              type="button"
              aria-label="Drag panel"
              onPointerDown={onGripDown}
              className={cn(
                'grid size-6 cursor-grab place-items-center rounded-chip text-ink-3 hover:text-ink active:cursor-grabbing',
                focusRing(),
              )}
            >
              <GripHorizontal className="size-4" />
            </button>
          )}
          {title && <span className="truncate text-sm font-medium text-ink">{title}</span>}
        </div>
        {onClose && (
          <IconButton label="Close panel" onClick={onClose} className="h-7 w-7">
            <X className="size-3.5" />
          </IconButton>
        )}
      </div>
      <div className="p-3 pt-0 text-sm text-ink-2">{children}</div>
    </div>
  );
}
