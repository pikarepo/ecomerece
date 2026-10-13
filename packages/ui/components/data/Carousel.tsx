/** @jsxImportSource react */
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type ReactNode, useCallback, useId, useState } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

export interface CarouselProps {
  slides: ReactNode[];
  /** Show prev/next arrow buttons. Default true. */
  arrows?: boolean;
  /** Show dot indicators. Default true. */
  dots?: boolean;
  className?: string;
  'aria-label'?: string;
}

export function Carousel({
  slides,
  arrows = true,
  dots = true,
  className,
  'aria-label': ariaLabel = 'Carousel',
}: CarouselProps) {
  const id = useId();
  const [index, setIndex] = useState(0);
  const count = slides.length;

  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);

  if (count === 0) return null;

  return (
    <section aria-label={ariaLabel} className={cn('relative w-full overflow-hidden', className)}>
      {/* slide track */}
      <div className="relative w-full">
        {slides.map((slide, i) => {
          return (
            <div
              key={`${id}-${i}`}
              data-slide-label={`Slide ${i + 1} of ${count}`}
              aria-hidden={i !== index}
              data-active={i === index ? 'true' : undefined}
              className={cn(
                'w-full transition-opacity duration-skin ease-skin',
                i === index ? 'block opacity-100' : 'hidden opacity-0',
              )}
            >
              {slide}
            </div>
          );
        })}
      </div>

      {/* arrows */}
      {arrows && count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={prev}
            className={cn(
              'mat-raised absolute left-2 top-1/2 -translate-y-1/2 rounded-control p-1.5',
              'transition-all duration-skin ease-skin active:scale-[var(--press-scale)]',
              focusRing(),
            )}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={next}
            className={cn(
              'mat-raised absolute right-2 top-1/2 -translate-y-1/2 rounded-control p-1.5',
              'transition-all duration-skin ease-skin active:scale-[var(--press-scale)]',
              focusRing(),
            )}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </>
      )}

      {/* dots */}
      {dots && count > 1 && (
        <div role="tablist" aria-label="Slides" className="mt-3 flex justify-center gap-1.5">
          {slides.map((_, i) => {
            return (
              <button
                key={`${id}-dot-${i}`}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  'size-2 rounded-full transition-all duration-skin ease-skin',
                  i === index ? 'w-4 bg-accent' : 'bg-ink-4 hover:bg-ink-3',
                  focusRing(),
                )}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
