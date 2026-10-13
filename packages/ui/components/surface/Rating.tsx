/** @jsxImportSource react */
import { Star } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

export interface RatingProps {
  value: number;
  max?: number;
  onValueChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const starSize = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
} as const;

export function Rating({
  value,
  max = 5,
  onValueChange,
  readOnly = false,
  size = 'md',
  label = 'Rating',
  className,
}: RatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const interactive = !readOnly && typeof onValueChange === 'function';

  if (!interactive) {
    return (
      <span
        className={cn('inline-flex items-center gap-0.5', className)}
        role="img"
        aria-label={`${value} out of ${max}`}
      >
        {Array.from({ length: max }, (_, i) => (
          <Star
            key={i}
            aria-hidden="true"
            className={cn(starSize[size], i < value ? 'fill-current text-warning' : 'text-ink-4')}
          />
        ))}
      </span>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('inline-flex items-center gap-0.5', className)}
      onMouseLeave={() => setHover(null)}
    >
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => {
        const filled = (hover ?? value) >= star;
        return (
          // biome-ignore lint/a11y/useSemanticElements: a star rating is a custom radio group, not a set of native inputs
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
            onPointerOver={() => setHover(star)}
            onClick={() => onValueChange?.(star)}
            className={cn(
              'rounded-chip transition-transform duration-skin ease-skin active:scale-90',
              focusRing(),
            )}
          >
            <Star
              className={cn(starSize[size], filled ? 'fill-current text-warning' : 'text-ink-4')}
            />
          </button>
        );
      })}
    </div>
  );
}
