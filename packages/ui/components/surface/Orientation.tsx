/** @jsxImportSource react */
import { type HTMLAttributes, type ReactNode, useEffect, useState } from 'react';
import { cn } from '../../lib/cn';

export type OrientationValue = 'portrait' | 'landscape';

function currentOrientation(): OrientationValue {
  if (typeof window === 'undefined') return 'portrait';
  return window.innerHeight >= window.innerWidth ? 'portrait' : 'landscape';
}

/**
 * Returns the current viewport orientation, updating on resize / device
 * rotation. Uses width vs. height, so it works without `matchMedia` support.
 */
export function useOrientation(): OrientationValue {
  const [orientation, setOrientation] = useState<OrientationValue>(currentOrientation);

  useEffect(() => {
    const update = () => setOrientation(currentOrientation());
    update();
    window.addEventListener('resize', update);
    const media =
      typeof window.matchMedia === 'function' ? window.matchMedia('(orientation: portrait)') : null;
    media?.addEventListener?.('change', update);
    return () => {
      window.removeEventListener('resize', update);
      media?.removeEventListener?.('change', update);
    };
  }, []);

  return orientation;
}

export interface OrientationProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Rendered in portrait; falls back to `children`. */
  portrait?: ReactNode;
  /** Rendered in landscape; falls back to `children`. */
  landscape?: ReactNode;
  /** Controlled orientation. When omitted, tracks the viewport. */
  orientation?: OrientationValue;
}

/**
 * Renders different content per orientation and always mirrors the current
 * orientation onto `data-orientation`. Pass `orientation` to control it (tests,
 * Storybook) or `portrait`/`landscape` to branch without a media query.
 */
export function Orientation({
  children,
  portrait,
  landscape,
  orientation,
  className,
  ...rest
}: OrientationProps) {
  const tracked = useOrientation();
  const value = orientation ?? tracked;

  let content: ReactNode = children;
  if (value === 'portrait' && portrait !== undefined) content = portrait;
  else if (value === 'landscape' && landscape !== undefined) content = landscape;

  return (
    <div data-orientation={value} className={cn(className)} {...rest}>
      {content}
    </div>
  );
}
