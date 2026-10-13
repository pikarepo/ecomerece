import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { Separator } from '../components/surface/Separator';
import { registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

describe('Separator', () => {
  test('defaults to a decorative horizontal hairline', () => {
    const { container, unmount } = render(createElement(Separator, {}));
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute('role')).toBe('presentation');
    expect(el.className).toContain('h-px');
    unmount();
  });

  test('vertical spans its parent', () => {
    const { container, unmount } = render(createElement(Separator, { orientation: 'vertical' }));
    const cls = (container.firstElementChild as HTMLElement).className;
    expect(cls).toContain('w-px');
    expect(cls).toContain('self-stretch');
    unmount();
  });

  test('non-decorative exposes separator role + orientation', () => {
    const { container, unmount } = render(
      createElement(Separator, { decorative: false, orientation: 'vertical' }),
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute('role')).toBe('separator');
    expect(el.getAttribute('aria-orientation')).toBe('vertical');
    unmount();
  });
});
