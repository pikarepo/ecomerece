/** @jsxImportSource react */
/**
 * Perf-audit behaviour test for the `/design` section harness
 * (`apps/web/app/design/Section.tsx`):
 *
 *  1. off-screen sections must NOT mount their children initially (skeleton
 *     only — this is what cut design.html from 935 KB → 115 KB);
 *  2. an IntersectionObserver callback near the viewport mounts them;
 *  3. `content-visibility: auto` is applied while off-screen and dropped once
 *     the section is in view, so paint containment can never clip a visible
 *     demo (fixed overlays, tooltips, sticky bars stay normal on screen);
 *  4. without IntersectionObserver support the section falls back to mounting
 *     content immediately (never a permanently empty gallery).
 *
 * The harness stubs IntersectionObserver (happy-dom ships none) and drives it
 * manually, asserting DOM state after each step.
 */
import { afterAll, describe, expect, test } from 'bun:test';
import type { ReactElement } from 'react';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

type Entry = { isIntersecting: boolean; target: Element };
type IOCallback = (entries: Entry[], io: unknown) => void;
type Observer = {
  cb: IOCallback;
  targets: Element[];
  observe(target: Element): void;
  disconnect(): void;
};

function installIntersectionObserver(): Observer[] {
  const created: Observer[] = [];
  const Impl = function (this: Observer, cb: IOCallback) {
    this.cb = cb;
    this.targets = [];
    this.observe = function (this: Observer, target: Element) {
      this.targets.push(target);
    };
    this.disconnect = () => {};
    created.push(this);
  } as unknown as new (
    cb: IOCallback,
    opts?: unknown,
  ) => unknown;
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = Impl;
  return created;
}

/** Render `ui` inside `act` and hand back the harness result (no non-null asserts). */
function renderSection(section: ReactElement): ReturnType<typeof render> {
  const rendered: Array<ReturnType<typeof render>> = [];
  act(() => {
    rendered.push(render(section));
  });
  const out = rendered[0];
  if (!out) throw new Error('render produced no result');
  return out;
}

describe('/design Section (deferred mount + conditional content-visibility)', () => {
  test('children stay a skeleton off-screen, mount on intersect, and shed content-visibility', async () => {
    const observers = installIntersectionObserver();
    const { Section } = await import('../../../apps/web/app/design/Section');

    const out = renderSection(
      <Section title="Buttons" note="All variants.">
        <button type="button">Save changes</button>
      </Section>,
    );

    // 1. Not intersecting yet → skeleton, children not mounted, CV applied.
    expect(observers.length).toBe(1);
    const io = observers[0];
    expect(io.targets.length).toBe(1);
    const section = io.targets[0];
    act(() => io.cb([{ isIntersecting: false, target: section }], io));

    expect(out.container.textContent).not.toContain('Save changes');
    expect(section.getAttribute('style') ?? '').toContain('content-visibility: auto');
    expect(section.getAttribute('style') ?? '').toContain('contain-intrinsic-size');
    expect(section.querySelector('[aria-hidden="true"]')).not.toBeNull(); // skeleton

    // 2. Scrolls near the viewport → children mount, CV dropped (no clipping).
    act(() => io.cb([{ isIntersecting: true, target: section }], io));

    expect(out.container.textContent).toContain('Save changes');
    expect(section.getAttribute('style') ?? '').not.toContain('content-visibility');

    // 3. Scrolled away again → CV returns (render work skipped), content stays.
    act(() => io.cb([{ isIntersecting: false, target: section }], io));

    expect(out.container.textContent).toContain('Save changes');
    expect(section.getAttribute('style') ?? '').toContain('content-visibility: auto');

    act(() => out.unmount());
  });

  test('without IntersectionObserver the section mounts content immediately', async () => {
    const g = globalThis as unknown as { IntersectionObserver?: unknown };
    delete g.IntersectionObserver;
    const { Section } = await import('../../../apps/web/app/design/Section');

    const out = renderSection(
      <Section title="Fallback">
        <button type="button">Immediately visible</button>
      </Section>,
    );

    expect(out.container.textContent).toContain('Immediately visible');
    const section = out.container.querySelector('section');
    expect(section?.getAttribute('style') ?? '').not.toContain('content-visibility');

    act(() => out.unmount());
  });
});
