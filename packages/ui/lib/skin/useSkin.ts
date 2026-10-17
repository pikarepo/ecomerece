'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { supportsBackdropFilter, supportsWebgl2 } from './capabilities';
import type { Capability, Dimension } from './types';

export interface RegistryEntry {
  id: string;
  label: string;
  cost: 'low' | 'medium' | 'high';
  a11yTier: 'AA' | 'AA-with-fallback';
  dimension: Dimension;
  swatch: [string, string];
  /** Capability gate (§38.4) — derived from Skin.needs by the picker. */
  needs?: Capability[];
  /** Degraded-form skin id (real-3d-spec: webgl-slabs skins fall back to a 2D sibling). */
  fallback?: string;
}

export interface UseSkinResult {
  skin: string;
  setSkin: (id: string) => void;
  fidelity: 'auto' | 'high' | 'low';
  setFidelity: (f: 'auto' | 'high' | 'low') => void;
  /** true once client state has been synced from the document (avoid hydration mismatch). */
  ready: boolean;
}

const SKIN_ID_PATTERN = /^[a-z0-9-]{1,32}$/;

/*
 * Probes are shared + cached (lib/skin/capabilities.ts) so the whole app mints
 * at most one WebGL context. The memo here is just a per-capability map over
 * the shared probes.
 */
const capabilityCache = new Map<Capability, boolean>();

function supports(capability: Capability): boolean {
  const cached = capabilityCache.get(capability);
  if (cached !== undefined) return cached;

  const result = capability === 'backdrop-filter' ? supportsBackdropFilter() : supportsWebgl2();

  capabilityCache.set(capability, result);
  return result;
}

function documentSkin(fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  return document.documentElement.getAttribute('data-skin') || fallback;
}

function documentFidelity(fallback: 'auto' | 'high' | 'low'): 'auto' | 'high' | 'low' {
  if (typeof document === 'undefined') return fallback;
  const v = document.documentElement.getAttribute('data-fidelity');
  return v === 'low' || v === 'high' ? v : fallback;
}

/**
 * §38.4 — skin + fidelity runtime.
 *
 * Hydration rule: the FIRST render must equal the server HTML — the bootstrap
 * script (§38.2) already applied data-skin/data-fidelity to <html> before
 * paint, so we read from the DOM in a layout effect and flip `ready` then.
 * The control UI renders disabled until `ready` to avoid any mismatch.
 * Skin switches are instant (§9.6) and never remount the tree: they change
 * one attribute and swap one stylesheet AFTER the new CSS parsed.
 */
export function useSkin(
  registry: RegistryEntry[],
  { skinBase = '/skins/' }: { skinBase?: string } = {},
): UseSkinResult {
  const [skin, setSkinState] = useState<string>('system');
  const [fidelity, setFidelityState] = useState<'auto' | 'high' | 'low'>('auto');
  const [ready, setReady] = useState(false);
  // Monotonic token: only the newest in-flight swap may commit its result.
  const swapRef = useRef(0);

  // Sync once from the document the bootstrap already prepared — never from
  // localStorage directly in a state initializer (SSR would render a
  // different tree and React throws a hydration mismatch).
  useEffect(() => {
    setSkinState(documentSkin('system'));
    setFidelityState(documentFidelity('auto'));
    setReady(true);
  }, []);

  const setSkin = useCallback(
    (id: string) => {
      const entry = registry.find((r) => r.id === id);
      const next = entry?.id.match(SKIN_ID_PATTERN) ? id : 'system';
      const root = document.documentElement;

      // Any swap still in flight is now stale — invalidate and drop its link.
      const token = ++swapRef.current;
      document.getElementById('skin-css-next')?.remove();

      if (next === 'system') {
        root.removeAttribute('data-skin');
        root.removeAttribute('data-dimension');
        // A2 — the per-skin accent lives only while a skin is active.
        root.removeAttribute('data-accent');
        document.getElementById('skin-css')?.remove();
        try {
          localStorage.setItem('skin', 'system');
        } catch {}
        setSkinState('system');
        return;
      }

      // Already applied — don't re-fetch or repaint the same stylesheet.
      if (root.getAttribute('data-skin') === next && document.getElementById('skin-css')) {
        // self-heal: older sessions restored data-skin without data-accent (A2).
        root.setAttribute('data-accent', 'skin');
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${skinBase}${next}.css`;
      link.id = 'skin-css-next';
      link.onload = () => {
        // A newer swap started while this one loaded → discard the result.
        if (swapRef.current !== token) {
          link.remove();
          return;
        }
        // swap only after the new CSS is parsed → no unstyled frame
        document.getElementById('skin-css')?.remove();
        link.id = 'skin-css';
        root.setAttribute('data-skin', next);
        root.setAttribute('data-dimension', entry?.dimension ?? 'layered');
        // A2 — activate the skin's accentHint (compiled under
        // [data-skin="…"][data-accent="skin"]); inert for skins without one.
        root.setAttribute('data-accent', 'skin');
        try {
          localStorage.setItem('skin', next);
        } catch {}
        // §38.5 — warm the local cache so the next visit paints with no request.
        // The runtime is installed by the head bootstrap; absent in tests/SSR.
        try {
          (
            window as unknown as { __skinCacheRevalidate__?: (id: string) => void }
          ).__skinCacheRevalidate__?.(next);
        } catch {}
        setSkinState(next);
      };
      // A 404/network failure must not leave the UI in a half-applied state:
      // keep the current skin and abort the swap.
      link.onerror = () => {
        if (swapRef.current === token) swapRef.current++;
        link.remove();
      };
      document.head.appendChild(link);
    },
    [registry, skinBase],
  );

  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    if (fidelity === 'auto') root.removeAttribute('data-fidelity');
    else root.setAttribute('data-fidelity', fidelity);
    try {
      localStorage.setItem('fidelity', fidelity);
    } catch {}
  }, [fidelity, ready]);

  // Capability repair on mount (§38.2 note): an unsupported stored skin
  // falls back to its documented fallback — here always system.
  useEffect(() => {
    if (!ready) return;
    const stored = documentSkin('system');
    if (stored === 'system') return;
    const entry = registry.find((r) => r.id === stored);
    if (!entry) {
      setSkin('system');
      return;
    }
    const needed: Capability[] =
      entry.dimension === '3d'
        ? ['webgl2']
        : (entry.needs ?? (stored === 'glass' ? ['backdrop-filter'] : []));
    if (!needed.every(supports)) {
      setSkin(
        entry.fallback && entry.fallback !== 'self' && entry.fallback !== 'solid'
          ? entry.fallback
          : 'system',
      );
    }
  }, [ready, registry, setSkin]);

  return { skin, setSkin, fidelity, setFidelity: setFidelityState, ready };
}
