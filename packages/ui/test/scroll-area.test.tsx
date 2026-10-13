import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { ScrollArea } from '../components/surface/ScrollArea';
import { registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

describe('ScrollArea', () => {
  test('renders children inside a scrollable container', () => {
    const { container, unmount } = render(
      createElement(ScrollArea, null, createElement('p', null, 'Hello scroll')),
    );
    expect(container.textContent).toContain('Hello scroll');
    unmount();
  });

  test('default orientation is vertical (overflow-y-auto)', () => {
    const { container, unmount } = render(
      createElement(ScrollArea, { orientation: 'vertical' }, 'content'),
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('data-orientation')).toBe('vertical');
    expect(root.className).toContain('overflow-y-auto');
    unmount();
  });

  test('horizontal orientation applies overflow-x-auto', () => {
    const { container, unmount } = render(
      createElement(ScrollArea, { orientation: 'horizontal' }, 'content'),
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('overflow-x-auto');
    unmount();
  });

  test('maxHeight Tailwind class is forwarded onto the root', () => {
    const { container, unmount } = render(
      createElement(ScrollArea, { maxHeight: 'max-h-80' }, 'content'),
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('max-h-80');
    unmount();
  });

  test('maxHeight CSS value is applied as inline style', () => {
    const { container, unmount } = render(
      createElement(ScrollArea, { maxHeight: '300px' }, 'content'),
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.maxHeight).toBe('300px');
    unmount();
  });
});
