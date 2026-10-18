import { afterAll, describe, expect, test } from 'bun:test';
import {
  createSkinCache,
  hotSwapActiveSheet,
  revalidateSkinCss,
  skinCacheRuntimeScript,
} from '../lib/skin/skinCache';
import { registerDom, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

const sheetCount = (): number => document.querySelectorAll('#skin-css, [data-skin-sheet]').length;

/**
 * Regression suite for the reported `GET /skins/undefined.css` (todo/15).
 *
 * The head bootstrap sets `window.__skinCacheActive__` ONLY when a
 * non-system skin is active, but the §38.5 runtime registered its post-load
 * revalidate unconditionally — so every visit on the default skin fetched
 * `/skins/<undefined>.css`. The runtime must be inert without an active id,
 * and must reject invalid ids even when revalidate is called directly.
 */
function runRuntime(): void {
  // Executes the exact inline string the <head> receives.
  new Function(skinCacheRuntimeScript())();
}

async function settle(ms = 25): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

describe('skin cache head runtime (inline script)', () => {
  test('no active skin → zero requests (never /skins/undefined.css)', async () => {
    const calls: string[] = [];
    const original = globalThis.fetch;
    globalThis.fetch = ((input: RequestInfo | URL) => {
      calls.push(String(input));
      return Promise.resolve({ ok: false }) as Promise<Response>;
    }) as typeof fetch;

    try {
      delete (window as unknown as Record<string, unknown>).__skinCacheActive__;
      runRuntime();
      window.dispatchEvent(new Event('load'));
      await settle();
      window.dispatchEvent(new Event('load'));

      expect(calls).toEqual([]);
    } finally {
      globalThis.fetch = original;
    }
  });

  test('an active skin revalidates exactly that id once', async () => {
    const calls: string[] = [];
    const original = globalThis.fetch;
    globalThis.fetch = ((input: RequestInfo | URL) => {
      calls.push(String(input));
      return Promise.resolve({ ok: false }) as Promise<Response>;
    }) as typeof fetch;

    try {
      const w = window as unknown as Record<string, unknown>;
      w.__SKIN_BASE__ = '/skins/';
      w.__skinCacheActive__ = 'clay';
      runRuntime();
      window.dispatchEvent(new Event('load'));
      await settle();

      // happy-dom may fire `load` more than once; every request must target
      // exactly the active skin and nothing else.
      expect(calls.length).toBeGreaterThan(0);
      expect(new Set(calls)).toEqual(new Set(['/skins/clay.css']));
      expect(calls.some((u) => u.includes('undefined'))).toBe(false);
    } finally {
      globalThis.fetch = original;
      const w = window as unknown as Record<string, unknown>;
      delete w.__skinCacheActive__;
    }
  });

  test('direct revalidate with an undefined/invalid id is a no-op', async () => {
    const calls: string[] = [];
    const original = globalThis.fetch;
    globalThis.fetch = ((input: RequestInfo | URL) => {
      calls.push(String(input));
      return Promise.resolve({ ok: false }) as Promise<Response>;
    }) as typeof fetch;

    try {
      const w = window as unknown as Record<string, unknown>;
      w.__SKIN_BASE__ = '/skins/';
      // NO active id on purpose: the background refresh must stay inert so the
      // assertions below can only ever see fetches caused by these calls.
      delete w.__skinCacheActive__;
      runRuntime();
      window.dispatchEvent(new Event('load'));
      const revalidate = w.__skinCacheRevalidate__ as (id?: string) => void;

      revalidate(undefined);
      revalidate('');
      revalidate('../../etc/passwd');
      await settle();

      expect(calls).toEqual([]);
    } finally {
      globalThis.fetch = original;
      const w = window as unknown as Record<string, unknown>;
      delete w.__skinCacheActive__;
    }
  });

  test('inline revalidate always asks the server (cache: "no-cache")', async () => {
    const initSeen: RequestInit[] = [];
    const original = globalThis.fetch;
    globalThis.fetch = ((_input: RequestInfo | URL, init?: RequestInit) => {
      if (init) initSeen.push(init);
      return Promise.resolve({ ok: false }) as Promise<Response>;
    }) as typeof fetch;

    try {
      const w = window as unknown as Record<string, unknown>;
      w.__SKIN_BASE__ = '/skins/';
      w.__skinCacheActive__ = 'clay';
      runRuntime();
      document.documentElement.setAttribute('data-skin', 'clay');
      (w.__skinCacheRevalidate__ as (id?: string) => void)('clay');
      await settle();

      expect(initSeen.length).toBeGreaterThan(0);
      expect(initSeen.every((i) => i.cache === 'no-cache')).toBe(true);
    } finally {
      globalThis.fetch = original;
      delete (window as unknown as Record<string, unknown>).__skinCacheActive__;
      document.documentElement.removeAttribute('data-skin');
    }
  });

  test('inline revalidate replaces a stale <link> sheet (old skin cannot survive an install)', async () => {
    const NEW = '/* NEW BUILD */ [data-skin="clay"]{}';
    const original = globalThis.fetch;
    globalThis.fetch = ((_input: RequestInfo | URL) =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(NEW),
      }) as Promise<Response>) as typeof fetch;

    try {
      const w = window as unknown as Record<string, unknown>;
      w.__SKIN_BASE__ = '/skins/';
      w.__skinCacheActive__ = 'clay';
      runRuntime();

      // first-visit shape: a <link> occupies #skin-css
      document.documentElement.setAttribute('data-skin', 'clay');
      const link = document.createElement('link');
      link.id = 'skin-css';
      link.rel = 'stylesheet';
      link.href = '/skins/clay.css';
      link.setAttribute('data-skin-sheet', '');
      document.head.appendChild(link);
      expect(sheetCount()).toBe(1);

      (w.__skinCacheRevalidate__ as (id?: string) => void)('clay');
      await settle();

      const active = document.getElementById('skin-css');
      expect(active?.tagName).toBe('STYLE'); // link REPLACED, not left behind
      expect(active?.textContent).toBe(NEW);
      expect(sheetCount()).toBe(1); // exactly one sheet — no stale leftovers
    } finally {
      globalThis.fetch = original;
      document.getElementById('skin-css')?.remove();
      document.documentElement.removeAttribute('data-skin');
      delete (window as unknown as Record<string, unknown>).__skinCacheActive__;
    }
  });

  test('Install/Refresh (revalidateSkinCss) hot-swaps the ACTIVE skin and stores fresh CSS', async () => {
    const OLD = '/* OLD BUILD */';
    const NEW = '/* NEW BUILD */';
    const initSeen: RequestInit[] = [];
    const original = globalThis.fetch;
    globalThis.fetch = ((_input: RequestInfo | URL, init?: RequestInit) => {
      if (init) initSeen.push(init);
      return Promise.resolve({ ok: true, text: () => Promise.resolve(NEW) }) as Promise<Response>;
    }) as typeof fetch;

    try {
      const cache = createSkinCache(localStorage);
      cache.put('clay', OLD);
      document.documentElement.setAttribute('data-skin', 'clay');
      const style = document.createElement('style');
      style.id = 'skin-css';
      style.setAttribute('data-skin-sheet', '');
      style.textContent = OLD;
      document.head.appendChild(style);

      const ok = await revalidateSkinCss('/skins/clay.css', 'clay', cache);

      expect(ok).toBe(true);
      expect(initSeen.every((i) => i.cache === 'no-cache')).toBe(true); // freshness
      expect(cache.get('clay')?.css).toBe(NEW);
      expect(document.getElementById('skin-css')?.textContent).toBe(NEW); // LIVE sheet updated
      expect(sheetCount()).toBe(1);
    } finally {
      globalThis.fetch = original;
      document.getElementById('skin-css')?.remove();
      document.documentElement.removeAttribute('data-skin');
      localStorage.clear();
    }
  });

  test('installing an INACTIVE skin touches neither the cache of the active one nor the DOM', async () => {
    const OLD = '/* OLD BUILD */';
    const original = globalThis.fetch;
    globalThis.fetch = ((_input: RequestInfo | URL) =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve('/* fresh for neo */'),
      }) as Promise<Response>) as typeof fetch;

    try {
      const cache = createSkinCache(localStorage);
      document.documentElement.setAttribute('data-skin', 'clay');
      const style = document.createElement('style');
      style.id = 'skin-css';
      style.setAttribute('data-skin-sheet', '');
      style.textContent = OLD;
      document.head.appendChild(style);

      expect(await revalidateSkinCss('/skins/neo.css', 'neo', cache)).toBe(true);
      expect(cache.get('neo')?.css).toBe('/* fresh for neo */');
      expect(cache.get('clay')).toBeNull();
      expect(document.getElementById('skin-css')?.textContent).toBe(OLD); // active untouched
      expect(sheetCount()).toBe(1);
      expect(hotSwapActiveSheet('missing', 'x')).toBe(false);
    } finally {
      globalThis.fetch = original;
      document.getElementById('skin-css')?.remove();
      document.documentElement.removeAttribute('data-skin');
      localStorage.clear();
    }
  });
});
