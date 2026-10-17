/** @jsxImportSource react */
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  disabled,
  className,
  'aria-label': ariaLabel,
  ...rest
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel ?? label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        // off = Level-1 well (inset in every skin); on = accent fill
        'mat-well flex h-7 w-12 shrink-0 items-center rounded-full px-1',
        'transition-all duration-skin ease-skin',
        checked ? 'justify-end bg-accent' : 'justify-start',
        disabled && 'pointer-events-none opacity-50',
        focusRing(),
        className,
      )}
      {...rest}
    >
      {/* thumb = Level-4 floating element; reads both themes (E.5 keeps the white thumb) */}
      <span className="block size-5 rounded-full bg-white shadow-sm" />
    </button>
  );
}
