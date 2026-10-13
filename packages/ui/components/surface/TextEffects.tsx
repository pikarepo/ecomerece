/** @jsxImportSource react */
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type TextEffectRole =
  | 'primary'
  | 'control'
  | 'card'
  | 'ground'
  | 'panel'
  | 'raised'
  | 'overlay'
  | 'chrome'
  | 'well';

export interface GradientTextProps extends HTMLAttributes<HTMLHeadingElement> {
  children?: ReactNode;
  /**
   * Skin material that supplies the gradient. The sheen/bg come from the
   * skin's `--m-<role>-*` tokens, so the gradient is a skin-owned decision.
   */
  material?: TextEffectRole;
  as?: 'span' | 'h1' | 'h2' | 'p';
}

/**
 * Text painted with a skin role's sheen gradient (`background-clip: text`).
 * Never names a raw colour — the gradient resolves from `--m-<role>-sheen`.
 */
export function GradientText({
  material = 'primary',
  as = 'span',
  className,
  style,
  ...rest
}: GradientTextProps) {
  const Tag = as;
  return (
    <Tag
      data-effect="gradient"
      data-material={material}
      className={cn('bg-clip-text text-transparent', className)}
      style={{
        backgroundImage: `var(--m-${material}-sheen, none), var(--m-${material}-bg, currentColor)`,
        ...style,
      }}
      {...rest}
    />
  );
}

export interface OutlineTextProps extends HTMLAttributes<HTMLHeadingElement> {
  children?: ReactNode;
  /** Skin material that colours the stroke. */
  material?: TextEffectRole;
  /** Stroke width (default `1px`). */
  strokeWidth?: string;
  as?: 'span' | 'h1' | 'h2' | 'p';
}

/**
 * Transparent text with a skin-token stroke (`-webkit-text-stroke`). The stroke
 * colour comes from `--m-<role>-bg`, keeping it skin-owned.
 */
export function OutlineText({
  material = 'primary',
  strokeWidth = '1px',
  as = 'span',
  className,
  style,
  ...rest
}: OutlineTextProps) {
  const Tag = as;
  return (
    <Tag
      data-effect="outline"
      data-material={material}
      className={cn('text-transparent', className)}
      style={{
        WebkitTextStroke: `${strokeWidth} var(--m-${material}-bg, currentColor)`,
        ...style,
      }}
      {...rest}
    />
  );
}
