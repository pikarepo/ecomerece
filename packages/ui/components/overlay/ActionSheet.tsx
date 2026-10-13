import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { BottomSheet } from './BottomSheet';

export interface ActionSheetOption {
  label: ReactNode;
  onSelect: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

export interface ActionSheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  options: ActionSheetOption[];
  cancelLabel?: string;
}

export function ActionSheet({
  open,
  onClose,
  title,
  description,
  options,
  cancelLabel = 'Cancel',
}: ActionSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      md="modal"
      className="sm:max-w-sm"
    >
      <div className="mat-card divide-y divide-line/10 overflow-hidden rounded-card">
        {options.map((option, index) => (
          <button
            key={index}
            type="button"
            disabled={option.disabled}
            onClick={() => {
              option.onSelect();
              onClose();
            }}
            className={cn(
              'flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left text-sm transition-all duration-skin ease-skin',
              option.danger ? 'text-danger hover:bg-danger/10' : 'hover:bg-surface-3',
              option.disabled && 'pointer-events-none text-ink-4',
            )}
          >
            {option.icon && <span className="shrink-0 text-ink-3">{option.icon}</span>}
            <span className="min-w-0 flex-1 truncate">{option.label}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="mat-control mt-3 flex min-h-11 w-full items-center justify-center rounded-control px-4 text-sm font-medium transition-all duration-skin ease-skin active:scale-[var(--press-scale)]"
      >
        {cancelLabel}
      </button>
    </BottomSheet>
  );
}
