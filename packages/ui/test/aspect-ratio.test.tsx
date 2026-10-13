import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { AspectRatio } from '../components/surface/AspectRatio';
import { registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

describe('AspectRatio', () => {
  test('renders children inside the inner container', () => {
    const { container, unmount } = render(
      createElement(AspectRatio, null, createElement('img', { alt: 'test' })),
    );
    expect(container.querySelector('img')).not.toBeNull();
    unmount();
  });

  test('default 16/9 ratio sets paddingBottom ≈ 56.25%', () => {
    const { container, unmount } = render(createElement(AspectRatio, null, 'content'));
    const outer = container.firstElementChild as HTMLElement;
    // JS: (1 / (16/9)) * 100 = 56.25 exactly → no trailing zeros
    expect(outer.style.paddingBottom).toBe('56.25%');
    unmount();
  });

  test('custom ratio=1 sets paddingBottom 100%', () => {
    const { container, unmount } = render(createElement(AspectRatio, { ratio: 1 }, 'content'));
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.style.paddingBottom).toBe('100%');
    unmount();
  });

  test('data-ratio attribute reflects the provided ratio', () => {
    const { container, unmount } = render(createElement(AspectRatio, { ratio: 4 / 3 }, 'content'));
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.getAttribute('data-ratio')).toBeTruthy();
    unmount();
  });
});
