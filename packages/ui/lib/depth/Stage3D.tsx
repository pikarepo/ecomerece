'use client';

import { type ReactNode, useEffect, useRef } from 'react';

export interface Stage3DProps {
  children: ReactNode;
  className?: string;
  /** called on webglcontextlost with the skin's 2D fallback id */
  onFallback?: (fallbackSkinId: string) => void;
}

export function Stage3D({ children, className, onFallback }: Stage3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const fbRef = useRef(onFallback);
  fbRef.current = onFallback; // keep latest w/o re-init

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let stop: { dispose(): void } | null = null;
    let cancelled = false;

    import('./slabEngine')
      .then(({ createSlabEngine }) => {
        if (!cancelled) {
          stop = createSlabEngine(el, (id) => fbRef.current?.(id));
        }
      })
      .catch(() => {}); // three not installed → pure 2D

    return () => {
      cancelled = true;
      stop?.dispose();
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
