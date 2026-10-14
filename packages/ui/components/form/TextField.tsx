/** @jsxImportSource react */

import { CircleAlert, Info } from 'lucide-react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef, useId, useState } from 'react';
import { cn } from '../../lib/cn';

/**
 * TextField — the variant-rich input (todo/09 batch 43): outlined · filled ·
 * underlined · borderless · inset, optional floating label, leading/trailing
 * slots, inline badge, character counter and helper/error/tooltip text.
 * `mat-*` + theme token utilities only.
 */

export type TextFieldVariant = 'outlined' | 'filled' | 'underlined' | 'borderless' | 'inset';
export type TextFieldSize = 'sm' | 'md' | 'lg';

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  variant?: TextFieldVariant;
  size?: TextFieldSize;
  label?: string;
  /** Float the label into the field once focused/filled (needs `label`). */
  floating?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  /** Inline badge rendered after the input (e.g. a unit or domain). */
  badge?: ReactNode;
  /** Show a `used/max` character counter (requires `maxLength`). */
  showCount?: boolean;
  hint?: string;
  error?: string;
  tooltip?: string;
  invalid?: boolean;
  wrapperClassName?: string;
}

const SIZE: Record<TextFieldSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-3.5 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
};

function variantClasses(variant: TextFieldVariant) {
  switch (variant) {
    case 'filled':
      return 'mat-well border border-transparent focus-within:ring-2 focus-within:ring-accent';
    case 'underlined':
      return 'border-0 border-b border-line/40 rounded-none focus-within:border-accent';
    case 'borderless':
      return 'border-0 bg-transparent focus-within:ring-0';
    case 'inset':
      return 'mat-well border border-line/20 shadow-inner focus-within:ring-2 focus-within:ring-accent';
    default:
      return 'mat-raised border border-line/30 focus-within:ring-2 focus-within:ring-accent';
  }
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    variant = 'outlined',
    size = 'md',
    label,
    floating = false,
    leading,
    trailing,
    badge,
    showCount = false,
    hint,
    error,
    tooltip,
    invalid,
    disabled,
    className,
    wrapperClassName,
    id,
    maxLength,
    value,
    defaultValue,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [count, setCount] = useState(String(value ?? defaultValue ?? '').length);
  const isInvalid = invalid || Boolean(error);
  const float = floating && Boolean(label);

  const describedBy = [error ? `${inputId}-error` : null, hint && !error ? `${inputId}-hint` : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cn('block', wrapperClassName)}>
      {label && !float && (
        <label
          htmlFor={inputId}
          className={cn(
            'mb-1.5 flex items-center gap-1 text-sm font-medium',
            disabled && 'text-ink-4',
          )}
        >
          {label}
          {tooltip && <TooltipHint text={tooltip} />}
        </label>
      )}
      <div
        className={cn(
          'relative flex items-center gap-2 transition-all duration-skin ease-skin',
          isInvalid && 'ring-2 ring-danger',
          disabled && 'opacity-60',
          variantClasses(variant),
          SIZE[size],
          float && 'pt-5',
        )}
      >
        {leading && <span className="shrink-0 text-ink-3">{leading}</span>}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy || undefined}
          placeholder={float ? ' ' : rest.placeholder}
          onChange={(e) => {
            setCount(e.target.value.length);
            rest.onChange?.(e);
          }}
          className={cn(
            'min-w-0 flex-1 bg-transparent text-ink placeholder:text-ink-4 focus:outline-none disabled:cursor-not-allowed disabled:text-ink-4',
            className,
          )}
          {...rest}
        />
        {badge && (
          <span className="shrink-0 rounded-full bg-surface-1 px-2 py-0.5 text-xs text-ink-2">
            {badge}
          </span>
        )}
        {trailing && <span className="shrink-0 text-ink-3">{trailing}</span>}
        {float && (
          <label
            htmlFor={inputId}
            className="pointer-events-none absolute left-3.5 top-1.5 text-xs text-ink-3 transition-all duration-skin ease-skin"
          >
            {label}
          </label>
        )}
      </div>
      {(showCount || error || hint) && (
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span>
            {error ? (
              <span
                id={`${inputId}-error`}
                role="alert"
                className="flex items-center gap-1 text-xs text-danger"
              >
                <CircleAlert className="size-3.5" aria-hidden />
                {error}
              </span>
            ) : hint ? (
              <span id={`${inputId}-hint`} className="text-xs text-ink-3">
                {hint}
              </span>
            ) : null}
          </span>
          {showCount && maxLength != null && (
            <span className="shrink-0 text-xs tabular-nums text-ink-3">
              {count}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

function TooltipHint({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex text-ink-3">
      <Info className="size-3.5" aria-hidden />
      <span className="sr-only">{text}</span>
      <span
        role="tooltip"
        className="mat-overlay pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-control px-2 py-1 text-xs text-ink shadow-lg group-hover:block"
      >
        {text}
      </span>
    </span>
  );
}
