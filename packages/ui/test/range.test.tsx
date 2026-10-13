import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { Range } from '../components/controls/Range';
import { registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

const noop = () => {};

function inputs(container: HTMLElement): HTMLInputElement[] {
  return Array.from(container.querySelectorAll('input[type="range"]'));
}

describe('Range', () => {
  test('renders two handles bound to the value tuple and clamped to each other', () => {
    const { container, unmount } = render(
      createElement(Range, { value: [20, 80], onValueChange: noop }),
    );
    const [low, high] = inputs(container);
    expect(low.value).toBe('20');
    expect(high.value).toBe('80');
    expect(low.max).toBe('80');
    expect(high.min).toBe('20');
    expect(low.getAttribute('aria-label')).toBe('Minimum');
    expect(high.getAttribute('aria-label')).toBe('Maximum');
    unmount();
  });

  test('positions both thumbs with the native-thumb insets (no 0..100% drift)', () => {
    const { container, unmount } = render(
      createElement(Range, { value: [20, 80], onValueChange: noop }),
    );
    const low = container.querySelector('[data-thumb="low"]') as HTMLElement;
    const high = container.querySelector('[data-thumb="high"]') as HTMLElement;
    expect(low.getAttribute('style')).toContain('calc(10px + 0.2 * (100% - 20px))');
    expect(high.getAttribute('style')).toContain('calc(10px + 0.8 * (100% - 20px))');
    unmount();
  });

  test('shows the low–high pair when showValue', () => {
    const { container, unmount } = render(
      createElement(Range, {
        value: [5, 65],
        onValueChange: noop,
        label: 'Price',
        showValue: true,
      }),
    );
    expect(container.textContent).toContain('Price');
    expect(container.textContent).toContain('5 – 65');
    unmount();
  });

  test('disabled disables both handles and dims the control', () => {
    const { container, unmount } = render(
      createElement(Range, { value: [0, 100], onValueChange: noop, disabled: true }),
    );
    for (const el of inputs(container)) expect(el.disabled).toBe(true);
    expect((container.firstElementChild as HTMLElement).className).toContain('opacity-50');
    unmount();
  });
});
