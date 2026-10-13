import { Check } from 'lucide-react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: ReactNode;
  indeterminate?: boolean;
}

export function Checkbox({
  checked,
  indeterminate = false,
  onCheckedChange,
  label,
  disabled,
  className,
  ...rest
}: CheckboxProps) {
  return (
    <label
      className={cn(
        'inline-flex cursor-pointer items-center gap-2.5',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <span className="relative flex h-5 w-5 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          aria-checked={indeterminate ? 'mixed' : checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className={cn(
            // chip role — the smallest radius; steps down per §12
            'peer h-5 w-5 appearance-none rounded-chip border-none transition-all duration-skin ease-skin',
            checked || indeterminate ? 'bg-accent' : 'bg-surface-3',
            focusRing(),
          )}
          {...rest}
        />
        {(checked || indeterminate) && (
          <Check
            className="pointer-events-none absolute left-0 top-0 size-5 p-1 text-accent-ink"
            strokeWidth={indeterminate ? 2 : 3}
          />
        )}
      </span>
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
}
