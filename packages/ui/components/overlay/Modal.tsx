import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Portal } from '../../lib/Portal';
import { useOverlay } from '../../lib/useOverlay';
import { IconButton } from '../controls/Button';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  closeButtonLabel?: string;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
} as const;

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  size = 'md',
  closeButtonLabel = 'Close',
}: ModalProps) {
  const { containerRef } = useOverlay({ open, onClose });

  return (
    <Portal>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: decorative backdrop; Escape handled by useOverlay */}
      <div
        role="presentation"
        onClick={onClose}
        data-open={open}
        className={cn(
          'fixed inset-0 z-modal flex items-center justify-center bg-black/55 p-4',
          'opacity-0 pointer-events-none transition-opacity duration-skin ease-skin-exit',
          'data-[open=true]:opacity-100 data-[open=true]:pointer-events-auto',
        )}
      >
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-hidden={!open}
          inert={!open || undefined}
          aria-label={typeof title === 'string' ? title : undefined}
          data-open={open}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'mat-overlay w-full rounded-sheet p-6',
            'scale-95 opacity-0 transition-all duration-skin ease-skin',
            'data-[open=true]:scale-100 data-[open=true]:opacity-100',
            sizes[size],
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {title && <h2 className="text-xl font-semibold tracking-tight">{title}</h2>}
              {description && <p className="mt-1 text-sm text-ink-2">{description}</p>}
            </div>
            <IconButton label={closeButtonLabel} onClick={onClose} className="-m-2 h-9 w-9">
              <X className="size-4" />
            </IconButton>
          </div>
          {children && <div className="mt-4">{children}</div>}
          {footer && <div className="mt-5 flex gap-2">{footer}</div>}
        </div>
      </div>
    </Portal>
  );
}
