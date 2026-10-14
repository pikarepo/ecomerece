/** @jsxImportSource react */

import type { ButtonHTMLAttributes, CSSProperties } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

/**
 * Gradient border button (todo/09 batch 39).
 *
 * The 1px ring is painted from the active skin's role tokens — `--m-<role>-glow`
 * and `--m-<role>-edge` — with token fallbacks supplied by `engine.css`
 * (`.fx-gradbtn`). Markup never names a literal colour or raw theme token, so the
 * gradient follows whichever skin is active.
 */
export type GradientRole =
  | 'primary'
  | 'control'
  | 'card'
  | 'raised'
  | 'panel'
  | 'overlay'
  | 'chrome'
  | 'well'
  | 'ground';
export type GradientBorderVariant = 'primary' | 'secondary';
export type GradientBorderSize = 'sm' | 'md' | 'lg';

const sizes: Record<GradientBorderSize, string> = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base',
};

const variants: Record<GradientBorderVariant, string> = {
  primary: 'mat-primary text-accent-ink',
  secondary: 'mat-control text-ink',
};

export interface GradientBorderButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GradientBorderVariant;
  size?: GradientBorderSize;
  /** Skin role whose `--m-<role>-glow` / `--m-<role>-edge` tokens drive the ring. */
  material?: GradientRole;
}

export function GradientBorderButton({
  variant = 'primary',
  size = 'md',
  material,
  className,
  children,
  style,
  type = 'button',
  ...rest
}: GradientBorderButtonProps) {
  const role: GradientRole = material ?? (variant === 'primary' ? 'primary' : 'control');

  const gradStyle = { ...style } as Record<string, string | number | undefined>;
  gradStyle['--m-fx-grad-a'] = `var(--m-${role}-glow, var(--m-fx-grad-a-fallback))`;
  gradStyle['--m-fx-grad-b'] = `var(--m-${role}-edge, var(--m-fx-grad-b-fallback))`;

  return (
    <button
      type={type}
      className={cn(
        'fx-gradbtn inline-flex items-center justify-center gap-2 rounded-control font-semibold',
        'transition-all duration-skin ease-skin active:scale-[var(--press-scale)]',
        'disabled:pointer-events-none disabled:opacity-60',
        variants[variant],
        sizes[size],
        focusRing(),
        className,
      )}
      style={gradStyle as CSSProperties}
      {...rest}
    >
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  );
}
