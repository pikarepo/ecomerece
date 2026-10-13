/** @jsxImportSource react */
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

/**
 * v3.0 (DESIGN.md §35/§42): components name a ROLE; the active skin decides
 * the look. No `dark:`, no literal radii/shadows/durations.
 */
const base =
  'inline-flex items-center justify-center gap-2 rounded-control text-sm transition-all duration-skin ease-skin active:scale-[var(--press-scale)] disabled:pointer-events-none';

const variants = {
  primary: cn(
    // role = primary: the skin owns fill/edge/shadow; do not restate a bg color
    'mat-primary rounded-control font-semibold text-accent-ink',
    'disabled:bg-surface-3 disabled:text-ink-4 disabled:shadow-none',
  ),
  secondary: cn('mat-control font-medium text-ink', 'disabled:text-ink-4 disabled:shadow-none'),
  ghost: cn('font-medium text-ink-2 hover:bg-surface-3 hover:text-ink', 'disabled:text-ink-4'),
  danger: cn('font-semibold text-danger hover:bg-danger/10', 'disabled:text-ink-4'),
  destructive: cn(
    'mat-control bg-danger font-semibold text-accent-ink hover:brightness-105',
    'disabled:bg-surface-3 disabled:text-ink-4 disabled:shadow-none',
  ),
} as const;

const sizes = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base',
  icon: 'h-11 w-11 p-0',
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  isLoading?: boolean;
  loadingText?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  loadingText,
  fullWidth = false,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        focusRing(),
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {isLoading ? (
        <>
          <Loader2 className="size-4 shrink-0 animate-spin" />
          <span>{(loadingText ?? children) !== null && (loadingText ?? children)}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function IconButton({ label, className, children, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'mat-control flex h-11 w-11 shrink-0 items-center justify-center rounded-control text-ink-2',
        'transition-all duration-skin ease-skin hover:text-ink active:scale-[var(--press-scale)]',
        focusRing(),
        'disabled:pointer-events-none disabled:text-ink-4',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
