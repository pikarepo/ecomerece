import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Portal } from '../../lib/Portal';
import { useOverlay } from '../../lib/useOverlay';

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
  /**
   * Render as a centred modal from md: up instead of a full-width bottom sheet,
   * per DESIGN.md §21.10 — never stretch a bottom sheet across desktop.
   */
  md?: 'modal' | 'panel';
}

export function BottomSheet({
  open,
  onClose,
  title,
  description,
  children,
  className,
  md,
}: BottomSheetProps) {
  const { containerRef } = useOverlay({ open, onClose });

  return (
    <Portal>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: decorative backdrop; Escape handled by useOverlay */}
      <div
        role="presentation"
        onClick={onClose}
        data-open={open}
        className={cn(
          'fixed inset-0 z-modal flex items-end justify-center bg-black/50',
          'opacity-0 pointer-events-none transition-opacity duration-skin ease-skin-exit',
          'data-[open=true]:opacity-100 data-[open=true]:pointer-events-auto',
          md === 'modal' && 'items-end md:tall:items-center md:tall:p-4',
          md === 'panel' && 'items-end md:tall:items-stretch md:tall:justify-end',
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
            'mat-overlay flex w-full flex-col rounded-t-sheet',
            'pb-[max(1.25rem,env(safe-area-inset-bottom))] p-5',
            'translate-y-full transition-transform duration-skin-slow ease-skin',
            'max-h-[85dvh] overflow-auto',
            'data-[open=true]:translate-y-0',
            md === 'modal' &&
              'md:tall:max-w-md md:tall:translate-y-full md:tall:scale-95 md:tall:opacity-0 md:tall:data-[open=true]:translate-y-0 md:tall:data-[open=true]:scale-100 md:tall:data-[open=true]:opacity-100',
            md === 'panel' && 'md:tall:w-full md:tall:max-w-md md:tall:rounded-l-sheet',
            className,
          )}
        >
          <div className="mx-auto -mt-1 h-1 w-10 shrink-0 rounded-full bg-line/20" />
          {(title || description) && (
            <div className="mt-4">
              {title && <h2 className="text-xl font-semibold tracking-tight">{title}</h2>}
              {description && <p className="mt-1 text-sm text-ink-2">{description}</p>}
            </div>
          )}
          {children && <div className="mt-4">{children}</div>}
        </div>
      </div>
    </Portal>
  );
}
