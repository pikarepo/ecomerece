/** @jsxImportSource react */

import type { ButtonHTMLAttributes, CSSProperties, PointerEvent } from 'react';
import { useState } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

/**
 * Effect buttons (todo/09 batch 38): ripple / magnetic / shimmer / glow.
 *
 * The visual identity of each effect is a SKIN decision: shimmer reads
 * `--m-<role>-sheen` and glow reads `--m-<role>-glow`, each with a token-based
 * fallback defined in `engine.css` (`.fx-btn`). Ripple paints with
 * `currentColor` and magnetic is a transform only — no component names a literal
 * colour or a raw theme token.
 */
export type ButtonEffect = 'ripple' | 'magnetic' | 'shimmer' | 'glow';
export type EffectMaterial =
  | 'primary'
  | 'control'
  | 'card'
  | 'raised'
  | 'panel'
  | 'overlay'
  | 'chrome'
  | 'well'
  | 'ground';
export type EffectVariant = 'primary' | 'secondary';

export interface EffectButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  effect: ButtonEffect;
  variant?: EffectVariant;
  /** Skin role whose `--m-<role>-sheen` / `--m-<role>-glow` tokens drive the effect. */
  material?: EffectMaterial;
  /** Magnetic max pointer offset in px (default 6). */
  strength?: number;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

let rippleId = 0;

const base =
  'fx-btn relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-control px-4 py-2 text-sm font-semibold transition-all duration-skin ease-skin disabled:pointer-events-none disabled:opacity-60';

const variantClass: Record<EffectVariant, string> = {
  primary: 'mat-primary text-accent-ink',
  secondary: 'mat-control text-ink',
};

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

const clampUnit = (v: number) => Math.max(-1, Math.min(1, v));

export function EffectButton({
  effect,
  variant = 'primary',
  material,
  strength = 6,
  className,
  children,
  onPointerDown,
  onPointerMove,
  onPointerLeave,
  style,
  ...rest
}: EffectButtonProps) {
  const role: EffectMaterial = material ?? (variant === 'primary' ? 'primary' : 'control');
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [offset, setOffset] = useState<{ x: number; y: number } | null>(null);

  const fxStyle = { ...style } as Record<string, string | number | undefined>;
  if (effect === 'shimmer') {
    // fallback gradient lives in engine.css (.fx-btn) so markup keeps `--m-*` indirection only
    fxStyle['--m-fx-sheen'] = `var(--m-${role}-sheen, var(--m-fx-sheen-fallback))`;
  }
  if (effect === 'glow') {
    fxStyle['--m-fx-glow-color'] = `var(--m-${role}-glow, var(--m-fx-glow-fallback))`;
  }
  if (effect === 'magnetic' && offset) {
    fxStyle.transform = `translate3d(${offset.x}px, ${offset.y}px, 0)`;
  }

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (effect === 'ripple') {
      const rect = e.currentTarget.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) || 48;
      setRipples((list) => [
        ...list,
        {
          id: rippleId++,
          x: (e.clientX || rect.left) - rect.left - size / 2,
          y: (e.clientY || rect.top) - rect.top - size / 2,
          size,
        },
      ]);
    }
    onPointerDown?.(e);
  };

  const handlePointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (effect === 'magnetic' && !prefersReducedMotion()) {
      const rect = e.currentTarget.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const nx = clampUnit((e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2));
        const ny = clampUnit((e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2));
        setOffset({ x: nx * strength, y: ny * strength });
      }
    }
    onPointerMove?.(e);
  };

  const handlePointerLeave = (e: PointerEvent<HTMLButtonElement>) => {
    if (effect === 'magnetic') setOffset({ x: 0, y: 0 });
    onPointerLeave?.(e);
  };

  return (
    <button
      type="button"
      className={cn(
        base,
        variantClass[variant],
        effect === 'glow' && 'fx-glow',
        effect !== 'magnetic' && 'active:scale-[var(--press-scale)]',
        focusRing(),
        className,
      )}
      style={fxStyle as CSSProperties}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...rest}
    >
      {effect === 'shimmer' && <span aria-hidden className="fx-shimmer absolute inset-0" />}
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden
          data-fx-ripple=""
          className="fx-ripple"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
          onAnimationEnd={() => setRipples((list) => list.filter((item) => item.id !== r.id))}
        />
      ))}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  );
}

export type EffectButtonWrapperProps = Omit<EffectButtonProps, 'effect'>;

export function RippleButton(props: EffectButtonWrapperProps) {
  return <EffectButton effect="ripple" {...props} />;
}

export function MagneticButton(props: EffectButtonWrapperProps) {
  return <EffectButton effect="magnetic" {...props} />;
}

export function ShimmerButton(props: EffectButtonWrapperProps) {
  return <EffectButton effect="shimmer" {...props} />;
}

export function GlowButton(props: EffectButtonWrapperProps) {
  return <EffectButton effect="glow" {...props} />;
}
