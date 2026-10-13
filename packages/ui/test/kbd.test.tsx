import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { Kbd } from '../components/surface/Kbd';
import { registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

describe('Kbd', () => {
  test('renders a semantic <kbd> with its content', () => {
    const { container, unmount } = render(createElement(Kbd, null, 'Esc'));
    const el = container.querySelector('kbd');
    expect(el).not.toBeNull();
    expect(el?.textContent).toBe('Esc');
    unmount();
  });

  test('size sm uses the compact metrics', () => {
    const { container, unmount } = render(createElement(Kbd, { size: 'sm' }, 'K'));
    expect((container.firstElementChild as HTMLElement).className).toContain('h-5');
    unmount();
  });
});
