/** @jsxImportSource react */

import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Minus, Plus } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode, RefObject } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

/**
 * Navigation/stepper buttons (todo/09 batch 55): arrow/chevron buttons, a
 * +/- stepper pair, and a scroll button that nudges a scroll container.
 * `mat-*` + theme token utilities only.
 */

type Size = 'sm' | 'md' | 'lg';
type Variant = 'primary' | 'secondary' | 'ghost';

const VARIANT: Record<Variant, string> = {
  primary: 'mat-primary text-accent-ink',
  secondary: 'mat-control text-ink',
  ghost: 'text-ink-2 hover:bg-surface-3 hover:text-ink',
};

const SIZE: Record<Size, string> = {
  sm: 'size-8 text-sm',
  md: 'size-10 text-base',
  lg: 'size-12 text-lg',
};

const BASE =
  'inline-flex shrink-0 select-none items-center justify-center rounded-control transition-all duration-skin ease-skin disabled:pointer-events-none disabled:opacity-60';

export type ArrowDirection = 'left' | 'right' | 'up' | 'down';

const ARROW_ICON: Record<ArrowDirection, typeof ChevronLeft> = {
  left: ChevronLeft,
  right: ChevronRight,
  up: ChevronUp,
  down: ChevronDown,
};

export interface ArrowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  direction: ArrowDirection;
  /** Accessible label (defaults to "Scroll {direction}"). */
  label?: string;
  variant?: Variant;
  size?: Size;
  /** Optional custom width (e.g., "2rem" or 32). */
  width?: string | number;
  /** Optional custom height (e.g., "2rem" or 32). */
  height?: string | number;
}

export function ArrowButton({
  direction,
  label,
  variant = 'secondary',
  size = 'md',
  width,
  height,
  className,
  ...rest
}: ArrowButtonProps) {
  const Icon = ARROW_ICON[direction];
  return (
    <button
      type="button"
      aria-label={label ?? `Scroll ${direction}`}
      className={cn(BASE, VARIANT[variant], SIZE[size], focusRing(), className)}
      style={(width !== undefined || height !== undefined) ? { width, height } : undefined}
      {...rest}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}

export interface StepperButtonsProps {
  value: number;
  onValueChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  size?: Size;
  variant?: Variant;
  disabled?: boolean;
  /** Optional value readout rendered between the two buttons. */
  children?: ReactNode;
  /** Accessible label for the group. */
  label?: string;
  className?: string;
  decrementLabel?: string;
  incrementLabel?: string;
}

export function StepperButtons({
  value,
  onValueChange,
  step = 1,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY,
  size = 'md',
  variant = 'secondary',
  disabled = false,
  children,
  label = 'Stepper',
  className,
  decrementLabel = 'Decrease',
  incrementLabel = 'Increase',
}: StepperButtonsProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const atMin = value <= min;
  const atMax = value >= max;
  return (
    <div
      role="toolbar"
      aria-label={label}
      className={cn('inline-flex items-center gap-1', className)}
    >
      <button
        type="button"
        aria-label={decrementLabel}
        disabled={disabled || atMin}
        onClick={() => onValueChange(clamp(value - step))}
        className={cn(BASE, VARIANT[variant], SIZE[size], focusRing())}
      >
        <Minus className="size-4" aria-hidden />
      </button>
      {children != null && (
        <span className="min-w-8 text-center text-sm font-medium tabular-nums text-ink">
          {children}
        </span>
      )}
      <button
        type="button"
        aria-label={incrementLabel}
        disabled={disabled || atMax}
        onClick={() => onValueChange(clamp(value + step))}
        className={cn(BASE, VARIANT[variant], SIZE[size], focusRing())}
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}

export interface ScrollButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  direction?: ArrowDirection;
  /** Scroll container; omit to scroll the window. */
  target?: RefObject<HTMLElement | null>;
  /** Distance in px per activation (default 240). */
  amount?: number;
  label?: string;
}

export function ScrollButton({
  direction = 'down',
  target,
  amount = 240,
  label,
  onClick,
  className,
  ...rest
}: ScrollButtonProps) {
  const horizontal = direction === 'left' || direction === 'right';
  const sign = direction === 'left' || direction === 'up' ? -1 : 1;
  return (
    <ArrowButton
      direction={direction}
      label={label ?? `Scroll ${direction}`}
      className={className}
      onClick={(e) => {
        onClick?.(e);
        const el = target?.current;
        if (el) {
          el.scrollBy({ [horizontal ? 'left' : 'top']: sign * amount, behavior: 'smooth' });
        } else if (typeof window !== 'undefined') {
          window.scrollBy({ [horizontal ? 'left' : 'top']: sign * amount, behavior: 'smooth' });
        }
      }}
      {...rest}
    />
  );
}
