import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Portal } from '../../lib/Portal';
import { useOverlay } from '../../lib/useOverlay';
import { Button } from '../controls/Button';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  confirmLoading?: boolean;
  className?: string;
}

/**
 * Destructive confirmation per §24.1 — a modal on desktop. Use <BottomSheet>
 * directly if you need a phone-first sheet instead.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  confirmLoading = false,
  className,
}: ConfirmDialogProps) {
  const { containerRef } = useOverlay({ open, onClose });

  return (
    <Portal>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: decorative backdrop; Escape handled by useOverlay */}
      <div
        role="presentation"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        data-open={open}
        className={cn(
          'fixed inset-0 z-modal flex items-center justify-center bg-black/55 p-4',
          'opacity-0 pointer-events-none transition-opacity duration-skin ease-skin-exit',
          'data-[open=true]:opacity-100 data-[open=true]:pointer-events-auto',
        )}
      >
        <div
          ref={containerRef}
          role="alertdialog"
          aria-modal="true"
          aria-hidden={!open}
          inert={!open || undefined}
          aria-label={typeof title === 'string' ? title : undefined}
          data-open={open}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'mat-overlay w-full max-w-sm rounded-sheet p-6',
            'scale-95 opacity-0 transition-all duration-skin ease-skin',
            'data-[open=true]:scale-100 data-[open=true]:opacity-100',
            className,
          )}
        >
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          {description && <p className="mt-1 text-sm text-ink-2">{description}</p>}
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onClose} disabled={confirmLoading}>
              {cancelLabel}
            </Button>
            <Button
              variant={destructive ? 'destructive' : 'primary'}
              onClick={onConfirm}
              isLoading={confirmLoading}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
