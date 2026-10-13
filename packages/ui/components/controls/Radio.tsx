import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: ReactNode;
}

export function Radio({
  checked,
  onCheckedChange,
  label,
  disabled,
  className,
  ...rest
}: RadioProps) {
  return (
    <label
      className={cn(
        'inline-flex cursor-pointer items-center gap-2.5',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <input
          type="radio"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className={cn(
            'peer size-5 appearance-none rounded-full transition-all duration-skin ease-skin',
            checked ? 'bg-accent' : 'bg-surface-3',
            focusRing(),
          )}
          {...rest}
        />
        <span
          className={cn(
            'pointer-events-none absolute size-2.5 rounded-full bg-accent-ink transition-all duration-skin ease-skin',
            checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
          )}
        />
      </span>
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
}
