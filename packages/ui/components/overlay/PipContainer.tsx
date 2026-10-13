/** @jsxImportSource react */
import { Maximize2, Minimize2, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { IconButton } from '../controls/Button';

export type PipCorner = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

const CORNER: Record<PipCorner, string> = {
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
};

export interface PipContainerProps {
  children?: ReactNode;
  /** Which viewport corner the mini panel sits in (default bottom-right). */
  corner?: PipCorner;
  label?: ReactNode;
  /** Controlled expanded state; when true the panel grows. */
  expanded?: boolean;
  onToggle?: (next: boolean) => void;
  onClose?: () => void;
  className?: string;
}

/**
 * A picture-in-picture style mini container (Every Layout "PiP container"):
 * a small persistent panel docked to a viewport corner that can expand or be
 * dismissed. Video/thumbnail content goes in `children`.
 */
export function PipContainer({
  children,
  corner = 'bottom-right',
  label,
  expanded = false,
  onToggle,
  onClose,
  className,
}: PipContainerProps) {
  return (
    <div
      data-expanded={expanded}
      className={cn(
        'mat-overlay fixed z-modal overflow-hidden rounded-sheet',
        CORNER[corner],
        expanded ? 'w-80' : 'w-48',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 p-2">
        <span className="truncate text-xs font-medium text-ink-2">{label}</span>
        <div className="flex items-center gap-1">
          {onToggle && (
            <IconButton
              label={expanded ? 'Collapse panel' : 'Expand panel'}
              onClick={() => onToggle(!expanded)}
              className="h-6 w-6"
            >
              {expanded ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
            </IconButton>
          )}
          {onClose && (
            <IconButton label="Close panel" onClick={onClose} className="h-6 w-6">
              <X className="size-3.5" />
            </IconButton>
          )}
        </div>
      </div>
      <div className="bg-black/20 p-2">{children}</div>
    </div>
  );
}
