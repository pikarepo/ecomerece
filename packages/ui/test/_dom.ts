import { beforeEach } from 'bun:test';
import { Window } from 'happy-dom';
import { act, createElement, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

export { act };

/**
 * Task 02-D harness — a tiny happy-dom + React render surface for behaviour
 * tests (no browser, no @testing-library). Call `installDom()` in every test
 * file that touches DOM.
 *
 * happy-dom fills in document/Element/Event/CSS/localStorage/MutationObserver
 * and queued rAF; viewport is forced to 800×600 so the blur governor resolves
 * a 3-surface budget.
 */

let win: Window;

/** Marks events created by `dispatchDomEvent` so the harness can tell its own
 * dispatches from happy-dom's automatic ones (see installDom). */
const LINK_EVENT = Symbol('harness-link-event');

/**
 * Bun does NOT isolate `globalThis` between test files (files share workers),
 * so DOM globals installed here would leak into sibling files (e.g.
 * `capabilities.test.ts` asserts server-safety). Install snapshots the prior
 * values once; `restoreDom()` puts them back, to be called in `afterAll`.
 */
const GLOBAL_KEYS: ReadonlyArray<string> = [
  'window',
  'document',
  'HTMLElement',
  'HTMLDivElement',
  'HTMLLinkElement',
  'Node',
  'Element',
  'Event',
  'EventTarget',
  'MutationObserver',
  'getComputedStyle',
  'CSS',
  'localStorage',
  'requestAnimationFrame',
  'cancelAnimationFrame',
];

let installed = false;
const snapshot = new Map<string, unknown>();

export function installDom(): void {
  win = new Window({ url: 'http://localhost/' });
  const g = globalThis as unknown as Record<string, unknown>;
  if (!installed) {
    for (const key of GLOBAL_KEYS) snapshot.set(key, g[key]);
    snapshot.set('IS_REACT_ACT_ENVIRONMENT', g.IS_REACT_ACT_ENVIRONMENT);
  }
  for (const key of GLOBAL_KEYS) {
    g[key] = (win as unknown as Record<string, unknown>)[key];
  }
  // React's act() requires this flag; without it renders fail immediately.
  g.IS_REACT_ACT_ENVIRONMENT = true;
  Object.defineProperty(win, 'innerWidth', { value: 800, configurable: true });
  Object.defineProperty(win, 'innerHeight', { value: 600, configurable: true });
  // happy-dom does not ship CSS, so ANY <link rel="stylesheet"> it connects to
  // the head fires a synchronous `error` (enableCSSFileLoading is off). The
  // skin hook's onerror would then remove the very link we are testing. In a
  // real browser that event is asynchronous, so swallow happy-dom's synthetic
  // link load/error noise and only let OUR explicit dispatches through.
  //
  // NB: the prototype that actually owns `dispatchEvent` is the one elements
  // inherit from (`win.EventTarget` is a different facade class), so walk the
  // chain from `win.HTMLElement.prototype`.
  let dispatchProto: any = (win.HTMLElement as any).prototype;
  while (dispatchProto && !Object.hasOwn(dispatchProto, 'dispatchEvent')) {
    dispatchProto = Object.getPrototypeOf(dispatchProto);
  }
  const originalDispatch: ((event: Event) => boolean) | undefined = dispatchProto?.dispatchEvent;
  if (dispatchProto && originalDispatch) {
    dispatchProto.dispatchEvent = function (this: EventTarget, event: Event) {
      const onLink = this.constructor?.name === 'HTMLLinkElement';
      const synthetic = onLink && (event.type === 'load' || event.type === 'error');
      if (synthetic && !(event as any)[LINK_EVENT]) {
        return true;
      }
      return originalDispatch.call(this, event);
    };
  }
  installed = true;
}

/** Undo `installDom()` — restores pre-existing globals so they cannot leak
 * into other test files that share this worker. Call in `afterAll`. */
export function restoreDom(): void {
  if (!installed) return;
  const g = globalThis as unknown as Record<string, unknown>;
  for (const key of GLOBAL_KEYS) {
    if (snapshot.has(key)) {
      const prev = snapshot.get(key);
      if (prev === undefined) delete g[key];
      else g[key] = prev;
    }
  }
  const actFlag = snapshot.get('IS_REACT_ACT_ENVIRONMENT');
  if (actFlag === undefined) delete g.IS_REACT_ACT_ENVIRONMENT;
  else g.IS_REACT_ACT_ENVIRONMENT = actFlag;
  snapshot.clear();
  installed = false;
}

/** Register `installDom()` before every test in the file. */
export function registerDom(): void {
  beforeEach(() => {
    installDom();
  });
}

/** Await N animation frames so rAF-scheduled work (governor scans) runs. */
export async function flushFrames(n = 1): Promise<void> {
  for (let i = 0; i < n; i++) {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }
}

/** A 50×50 rect fully inside the 800×600 viewport. */
export function inViewRect(): DOMRect {
  return {
    x: 10,
    y: 10,
    top: 10,
    bottom: 60,
    left: 10,
    right: 60,
    width: 50,
    height: 50,
    toJSON: () => ({}),
  } as DOMRect;
}

/** A rect fully outside the viewport. */
export function outOfViewRect(): DOMRect {
  return {
    x: -100,
    y: -100,
    top: -100,
    bottom: -60,
    left: -100,
    right: -60,
    width: 40,
    height: 40,
    toJSON: () => ({}),
  } as DOMRect;
}

export type RenderHookResult<T> = {
  latest: () => T;
  rerender: () => void;
  unmount: () => void;
};

/**
 * Render `useHook()` into a React root and expose the latest value.
 * Every state change the hook makes is flushed by `act`.
 */
export function renderHook<T>(useHook: () => T): RenderHookResult<T> {
  let latest!: T;
  let root: Root;
  let container: HTMLDivElement;

  function element() {
    // Keep this harness free of JSX: Bun transpiles test JSX from the CWD's
    // tsconfig, and the root one maps jsxImportSource to hono/jsx, which would
    // produce Hono nodes React cannot render. createElement() is unambiguous.
    const Comp = () => {
      latest = useHook();
      return null;
    };
    return createElement(Comp, null);
  }

  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
    root.render(element());
  });

  return {
    latest: () => latest,
    rerender: () => {
      act(() => root.render(element()));
    },
    unmount: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
}

/** Dispatch an `Event(type)` built by the active happy-dom window. */
export function dispatchDomEvent(target: EventTarget, type: string): void {
  const event = new win.Event(type) as unknown as Event & { [LINK_EVENT]: boolean };
  event[LINK_EVENT] = true;
  target.dispatchEvent(event);
}

export type RenderResult = {
  container: HTMLElement;
  rerender: (ui: ReactElement) => void;
  unmount: () => void;
};

/** Render a React element into a detached-into-body container and return it. */
export function render(ui: ReactElement): RenderResult {
  const container = document.createElement('div');
  document.body.appendChild(container);
  let root: Root;
  act(() => {
    root = createRoot(container);
    root.render(ui);
  });
  return {
    container,
    rerender: (next: ReactElement) => {
      act(() => root.render(next));
    },
    unmount: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
}

/**
 * Fire a bubbling DOM event that React's delegated listeners will see. Picks the
 * most specific happy-dom constructor so React's pointer handlers get a
 * `PointerEvent` instance (a bare `Event` is not enough on some paths).
 */
export function fire(target: EventTarget, type: string, init: Record<string, unknown> = {}): void {
  const w = win as unknown as {
    Event: new (t: string, i?: EventInit) => Event;
    PointerEvent?: new (t: string, i?: EventInit) => Event;
    KeyboardEvent?: new (t: string, i?: EventInit) => Event;
  };
  const Ctor =
    type.startsWith('pointer') && w.PointerEvent
      ? w.PointerEvent
      : type.startsWith('key') && w.KeyboardEvent
        ? w.KeyboardEvent
        : w.Event;
  target.dispatchEvent(new Ctor(type, { bubbles: true, cancelable: true, ...init } as EventInit));
}
