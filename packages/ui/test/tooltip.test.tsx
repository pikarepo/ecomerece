import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { Tooltip } from '../components/overlay/Tooltip';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

const child = createElement('button', { type: 'button' }, 'Hover me');

function wrapper(container: HTMLElement): HTMLElement {
  return container.firstElementChild as HTMLElement;
}

describe('Tooltip', () => {
  test('is hidden until pointer-over, then exposes a labelled tooltip', () => {
    const { container, unmount } = render(
      createElement(Tooltip, { content: 'Add to cart' }, child),
    );
    expect(container.querySelector('[role="tooltip"]')).toBeNull();

    act(() => fire(wrapper(container), 'pointerover'));
    const tip = container.querySelector('[role="tooltip"]');
    expect(tip).not.toBeNull();
    expect(tip?.textContent).toBe('Add to cart');
    expect(wrapper(container).getAttribute('aria-describedby')).toBe(tip?.id ?? null);

    act(() => fire(wrapper(container), 'pointerout'));
    expect(container.querySelector('[role="tooltip"]')).toBeNull();
    unmount();
  });

  test('opens on focus and closes on Escape', () => {
    const { container, unmount } = render(createElement(Tooltip, { content: 'Hint' }, child));
    act(() => fire(wrapper(container), 'focusin'));
    expect(container.querySelector('[role="tooltip"]')).not.toBeNull();

    act(() => fire(wrapper(container), 'keydown', { key: 'Escape' }));
    expect(container.querySelector('[role="tooltip"]')).toBeNull();
    unmount();
  });
});
