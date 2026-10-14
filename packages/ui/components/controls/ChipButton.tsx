/** @jsxImportSource react */

import { X } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

/**
 * Chip-button family (todo/09 batch 42): interactive variants of the static
 * `Chip`/`Tag` — filter, choice, suggestion, tab and input chips. Selection
 * swaps the `mat-control` role for `mat-primary`; removal uses a composition of
 * two sibling buttons (never a button nested in a button). Tokens only.
 */
export type ChipVariant = 'chip' | 'filter' | 'choice' | 'suggestion' | 'tab' | 'input';

export interface ChipButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Interaction flavour; `choice` is a radio, `tab` a tab, the rest toggle. */
  variant?: ChipVariant;
  /** Selected state for the toggle flavours (controlled). */
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  /** Leading adornment (avatar, dot, check icon). */
  leading?: ReactNode;
  /** Render a trailing remove button (uses the two-button composition). */
  removable?: boolean;
  onRemove?: () => void;
  removeLabel?: string;
}

const BASE =
  'inline-flex select-none items-center gap-1.5 rounded-chip text-xs font-medium transition-all duration-skin ease-skin disabled:pointer-events-none disabled:opacity-60';
const SURFACE = {
  selected: 'mat-primary text-accent-ink',
  unselected: 'mat-control text-ink-2 hover:text-ink',
} as const;

function a11yProps(variant: ChipVariant, selected: boolean): Record<string, unknown> {
  if (variant === 'choice') return { role: 'radio', 'aria-checked': selected };
  if (variant === 'tab') return { role: 'tab', 'aria-selected': selected };
  if (variant === 'input') return {};
  return { 'aria-pressed': selected };
}

export function ChipButton({
  variant = 'filter',
  selected = false,
  onSelectedChange,
  leading,
  removable = false,
  onRemove,
  removeLabel = 'Remove',
  disabled = false,
  className,
  children,
  onClick,
  ...rest
}: ChipButtonProps) {
  const surface = SURFACE[selected ? 'selected' : 'unselected'];

  if (!removable) {
    return (
      <button
        type="button"
        disabled={disabled}
        className={cn(BASE, surface, 'px-3 py-1', focusRing(), className)}
        onClick={(e) => {
          onClick?.(e);
          if (!disabled) onSelectedChange?.(!selected);
        }}
        {...a11yProps(variant, selected)}
        {...rest}
      >
        {leading}
        {children}
      </button>
    );
  }

  return (
    <span className={cn(BASE, surface, 'py-1 pr-1 pl-3', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          onClick?.(e);
          if (!disabled && variant !== 'input') onSelectedChange?.(!selected);
        }}
        className="inline-flex items-center gap-1.5 text-inherit focus-visible:outline-none"
        {...a11yProps(variant, selected)}
      >
        {leading}
        {children}
      </button>
      <button
        type="button"
        aria-label={removeLabel}
        disabled={disabled}
        onClick={() => onRemove?.()}
        className={cn(
          'inline-flex size-5 items-center justify-center rounded-full text-ink-3 hover:bg-surface-3 hover:text-ink',
          focusRing(),
        )}
      >
        <X className="size-3" aria-hidden />
      </button>
    </span>
  );
}

export type ChipDerivativeProps = Omit<ChipButtonProps, 'variant'>;

export function FilterChip(props: ChipDerivativeProps) {
  return <ChipButton variant="filter" {...props} />;
}

export function ChoiceChip(props: ChipDerivativeProps) {
  return <ChipButton variant="choice" {...props} />;
}

export function SuggestionChip(props: ChipDerivativeProps) {
  return <ChipButton variant="suggestion" {...props} />;
}

export function TabChip(props: ChipDerivativeProps) {
  return <ChipButton variant="tab" {...props} />;
}

export interface InputChipProps extends Omit<ChipButtonProps, 'variant' | 'onSelectedChange'> {
  onRemove?: () => void;
}

export function InputChip({ removable = true, ...props }: InputChipProps) {
  return <ChipButton variant="input" removable={removable} {...props} />;
}
