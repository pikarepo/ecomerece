/** @jsxImportSource react */
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

/** Visual styles added with batch 97. `ring` is the original baseline look. */
export type SpinnerVariant = 'ring' | 'dots' | 'bars' | 'pulse' | 'orbit';

export interface SpinnerProps {
  className?: string;
  label?: string;
  variant?: SpinnerVariant;
}

/** Stagger delays for the multi-element variants (ms). */
const DOT_DELAYS = [0, 150, 300];
const BAR_DELAYS = [0, 120, 240, 360];
const BAR_HEIGHTS = ['45%', '85%', '60%', '100%'];

export function Spinner({ className, label = 'Loading', variant = 'ring' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      data-variant={variant}
      className={cn('flex items-center justify-center py-8', className)}
    >
      {variant === 'dots' && (
        <span aria-hidden="true" className="flex items-center gap-1">
          {DOT_DELAYS.map((delay) => (
            <span
              key={delay}
              className="block size-2 animate-pulse rounded-full bg-accent"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
      )}
      {variant === 'bars' && (
        <span aria-hidden="true" className="flex h-6 items-center gap-1">
          {BAR_DELAYS.map((delay, i) => (
            <span
              key={delay}
              className="block w-1 animate-pulse rounded-full bg-accent"
              style={{ animationDelay: `${delay}ms`, height: BAR_HEIGHTS[i] }}
            />
          ))}
        </span>
      )}
      {variant === 'pulse' && (
        <span aria-hidden="true" className="block size-4 animate-pulse rounded-full bg-accent" />
      )}
      {variant === 'orbit' && (
        <span aria-hidden="true" className="relative block size-6 animate-spin">
          <span className="absolute left-1/2 top-0 block size-2 -translate-x-1/2 rounded-full bg-accent" />
        </span>
      )}
      {variant === 'ring' && (
        <Loader2 className="size-6 animate-spin text-accent" aria-hidden="true" />
      )}
      <span className="sr-only">{label}</span>
    </div>
  );
}
