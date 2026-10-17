/** @jsxImportSource react */
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
  /** `xl` and `fullscreen` added with the batch-93 modal variants. */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  closeButtonLabel?: string;
  /** Sticky header/footer with a scrolling body when content overflows (batch 93). */
  scrollable?: boolean;
  /** Present as an edge-anchored drawer instead of a centred card (batch 93). */
  side?: 'left' | 'right';
  /**
   * Trap focus inside the dialog. Set `false` on a modal that has another
   * modal stacked above it, so Tab stays with the topmost one (batch 93).
   */
  trapFocus?: boolean;
  /**
   * Escape closes the dialog (default). Set `false` on a modal that has
   * another modal stacked above it, so Escape only closes the top one (batch 93).
   */
  closeOnEscape?: boolean;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  fullscreen: 'h-full w-full max-w-none',
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
  scrollable = false,
  side,
  trapFocus,
  closeOnEscape = true,
}: ModalProps) {
  const { containerRef } = useOverlay({ open, onClose, trapFocus, closeOnEscape });

  return (
    <Portal>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: decorative backdrop; Escape handled by useOverlay */}
      <div
        role="presentation"
        onClick={onClose}
        data-open={open}
        className={cn(
          'fixed inset-0 z-modal flex bg-black/55 p-4',
          side === 'right'
            ? 'justify-end'
            : side === 'left'
              ? 'justify-start'
              : 'items-center justify-center',
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
          data-side={side}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'mat-overlay w-full rounded-sheet p-6',
            'scale-95 opacity-0 transition-all duration-skin ease-skin',
            'data-[open=true]:scale-100 data-[open=true]:opacity-100',
            sizes[size],
            side && 'h-full',
            scrollable && 'flex max-h-full flex-col overflow-hidden',
            className,
          )}
        >
          <div className={cn('flex items-start justify-between gap-4', scrollable && 'flex-none')}>
            <div className="min-w-0">
              {title && <h2 className="text-xl font-semibold tracking-tight">{title}</h2>}
              {description && <p className="mt-1 text-sm text-ink-2">{description}</p>}
            </div>
            <IconButton label={closeButtonLabel} onClick={onClose} className="-m-2 h-9 w-9">
              <X className="size-4" />
            </IconButton>
          </div>
          {children && (
            <div className={cn('mt-4', scrollable && 'min-h-0 flex-1 overflow-y-auto')}>
              {children}
            </div>
          )}
          {footer && (
            <div className={cn('mt-5 flex gap-2', scrollable && 'flex-none')}>{footer}</div>
          )}
        </div>
      </div>
    </Portal>
  );
}
