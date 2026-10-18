/** @jsxImportSource react */
'use client';

import { cn } from '@ecomerece/ui';
import { useEffect, useRef, useState } from 'react';

/**
 * Design-gallery section (extracted from `page.tsx` for testability).
 *
 * Perf audit (phone + desktop): `/design` ships 89 sections / ~8k DOM nodes in
 * ONE client page. Two mechanisms keep it fast without changing what a visitor
 * sees on screen:
 *
 *  1. **Deferred mount** — a section's children render only once it comes
 *     within ~2 viewports (`IntersectionObserver` is probed in an effect, so
 *     SSR and the first client render paint the SAME deterministic skeleton —
 *     the hydration rule from the BusinessHours/InfiniteScrollLoader fixes).
 *     Above-the-fold sections mount on the observer's first callback.
 *  2. **content-visibility** — applied ONLY while the section is off-screen, so
 *     the browser skips style/layout/paint for far-away sections, while the
 *     paint containment that ships with it never touches a visible demo
 *     (fixed-position overlays, tooltips and sticky bars behave normally on
 *     screen). `contain-intrinsic-size: auto <h>` keeps the scrollbar stable
 *     and remembers a section's real height once it has rendered.
 */
export function Section({
  title,
  note,
  subtitle,
  children,
  className,
}: {
  title: string;
  note?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const sub = subtitle ?? note;
  const ref = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setMounted(true);
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setMounted(true);
            setInView(true);
          } else {
            setInView(false);
          }
        }
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={cn('mt-10', className)}
      style={inView ? undefined : { contentVisibility: 'auto', containIntrinsicSize: 'auto 420px' }}
    >
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {sub && <p className="mt-0.5 text-sm text-ink-2">{sub}</p>}
      <div className="mt-4">
        {mounted ? (
          children
        ) : (
          <div className="h-36 rounded-card bg-surface-2" aria-hidden="true" />
        )}
      </div>
    </section>
  );
}