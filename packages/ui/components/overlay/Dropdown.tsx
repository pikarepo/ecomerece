/** @jsxImportSource react */

import type { ReactNode, RefObject } from 'react';
import { cn } from '../../lib/cn';

export interface DropdownItem {
  label: ReactNode;
  onSelect?: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  separator?: boolean;
}

export interface DropdownProps {
  open: boolean;
  onClose?: () => void;
  items: DropdownItem[];
  /**
   * Anchor element the menu positions underneath. Required when open.
   */
  triggerRef?: RefObject<HTMLElement | null>;
  className?: string;
  align?: 'start' | 'end';
}

export function Dropdown({
  open,
  onClose,
  items,
  triggerRef,
  className,
  align = 'start',
}: DropdownProps) {
  if (!open) return null;

  return (
    <div
      role="menu"
      className={cn(
        'mat-overlay min-w-[220px] overflow-hidden rounded-card p-1.5',
        'absolute mt-2',
        align === 'start' ? 'left-0' : 'right-0',
        triggerRef ? '' : 'relative',
        className,
      )}
    >
      {items.map((item, index) =>
        item.separator ? (
          <div key={index} className="my-1 h-px bg-line/10" />
        ) : (
          <button
            key={index}
            type="button"
            role="menuitem"
            disabled={item.disabled}
            onClick={(e) => {
              e.stopPropagation();
              item.onSelect?.();
              onClose?.();
            }}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-control px-3 py-2.5 text-left text-sm transition-all duration-skin ease-skin',
              item.danger ? 'text-danger hover:bg-danger/10' : 'hover:bg-surface-3',
              item.disabled && 'pointer-events-none text-ink-4',
            )}
          >
            {item.icon && <span className="text-ink-3">{item.icon}</span>}
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
          </button>
        ),
      )}
    </div>
  );
}
