/** @jsxImportSource react */
import { ArrowUp } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';
import { StickyToc, type StickyTocProps, type TocItem } from '../surface/Sticky';

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

export interface ScrollProgressProps {
  /** Controlled progress `0..1`. When omitted, tracks window scroll. */
  value?: number;
  /** Edge to pin the bar to (default `top`). */
  position?: 'top' | 'bottom';
  className?: string;
}

/**
 * A thin progress bar that reflects how far the reader has scrolled through the
 * page. Pass `value` for a controlled bar, or let it track `window` scroll.
 */
export function ScrollProgress({ value, position = 'top', className }: ScrollProgressProps) {
  const [tracked, setTracked] = useState(0);

  useEffect(() => {
    if (value !== undefined) return;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const y = typeof window.scrollY === 'number' ? window.scrollY : doc.scrollTop;
      setTracked(max > 0 ? clamp01(y / max) : 0);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [value]);

  const progress = clamp01(value ?? tracked);
  return (
    <div
      role="progressbar"
      aria-label="Scroll progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      className={cn(
        'pointer-events-none fixed inset-x-0 z-modal h-0.5',
        position === 'top' ? 'top-0' : 'bottom-0',
        className,
      )}
    >
      <div
        className="h-full bg-accent transition-[width] duration-skin ease-skin"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}

export interface UseScrollSpyOptions {
  /** Pixels from the top that count as "reached" (default 0). */
  offset?: number;
}

/**
 * Tracks which of `ids` is currently the active section as the page scrolls.
 * Returns the id whose element was most recently scrolled past, or the first.
 */
export function useScrollSpy(ids: string[], options: UseScrollSpyOptions = {}) {
  const { offset = 0 } = options;
  const [active, setActive] = useState<string | undefined>(ids[0]);
  const key = ids.join(',');

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-scan only when the id list or offset changes
  useEffect(() => {
    const update = () => {
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top - offset <= 0) current = id;
      }
      setActive(current);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [key, offset]);

  return active;
}

export interface ScrollSpyProps extends Omit<StickyTocProps, 'activeId'> {
  items: TocItem[];
  /** Sticky offset used as the spy threshold (default `0`). */
  spyOffset?: number;
}

/** Sticky table of contents whose active item is tracked by scroll position. */
export function ScrollSpy({ items, spyOffset = 0, ...rest }: ScrollSpyProps) {
  const activeId = useScrollSpy(
    items.map((i) => i.id),
    { offset: spyOffset },
  );
  return <StickyToc {...rest} items={items} activeId={activeId} />;
}

export interface ScrollRevealProps {
  children?: ReactNode;
  /** Controlled visibility. When omitted, reveals when scrolled into view. */
  visible?: boolean;
  /** Keep the revealed state after the first intersection (default true). */
  once?: boolean;
  className?: string;
}

/**
 * Reveals its children (fade + slight rise) when they scroll into view, via
 * `IntersectionObserver`. Pass `visible` to control it directly.
 */
export function ScrollReveal({ children, visible, once = true, className }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const isVisible = visible ?? shown;

  useEffect(() => {
    if (visible !== undefined) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setShown(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setShown(false);
        }
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible, once]);

  return (
    <div
      ref={ref}
      data-visible={isVisible ? 'true' : 'false'}
      className={cn(
        'transition-all duration-skin ease-skin',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface ScrollToTopProps {
  /** Pixels scrolled before the button appears (default 400). */
  threshold?: number;
  /** Controlled visibility. When omitted, appears past `threshold`. */
  visible?: boolean;
  onClick?: () => void;
  label?: string;
  className?: string;
}

/**
 * Floating "back to top" button that fades in once the reader has scrolled
 * past `threshold`. Scrolls smoothly to the top unless `onClick` is provided.
 */
export function ScrollToTop({
  threshold = 400,
  visible,
  onClick,
  label = 'Back to top',
  className,
}: ScrollToTopProps) {
  const [past, setPast] = useState(false);
  const isVisible = visible ?? past;

  useEffect(() => {
    if (visible !== undefined) return;
    const update = () => setPast((window.scrollY || 0) > threshold);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [visible, threshold]);

  return (
    <button
      type="button"
      aria-label={label}
      data-visible={isVisible ? 'true' : 'false'}
      tabIndex={isVisible ? 0 : -1}
      onClick={() => {
        if (onClick) onClick();
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      className={cn(
        'mat-overlay fixed bottom-6 right-6 z-raised grid size-10 place-items-center rounded-full text-ink shadow-lg transition-all duration-skin ease-skin',
        isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
        focusRing(),
        className,
      )}
    >
      <ArrowUp className="size-4" />
    </button>
  );
}
