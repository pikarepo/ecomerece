import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { Slider } from '../components/controls/Slider';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

const noop = () => {};

function inputOf(container: HTMLElement): HTMLInputElement {
  const el = container.querySelector('input[type="range"]');
  if (!el) throw new Error('no range input');
  return el as HTMLInputElement;
}

function thumbOf(container: HTMLElement): HTMLElement {
  const el = container.querySelector('span.mat-raised');
  if (!el) throw new Error('no thumb');
  return el as HTMLElement;
}

describe('Slider', () => {
  test('thumb is placed with the native thumb insets (no 0..100% drift)', () => {
    for (const [value, fraction] of [
      [0, '0'],
      [50, '0.5'],
      [100, '1'],
    ] as const) {
      const { container, unmount } = render(createElement(Slider, { value, onValueChange: noop }));
      const style = thumbOf(container).getAttribute('style') ?? '';
      expect(style).toContain(`calc(10px + ${fraction} * (100% - 20px))`);
      // constant inline transform keeps the Y-centering (no class can clobber it)
      expect(style).toContain('translate(-50%, -50%)');
      unmount();
    }
  });

  test('native thumb is sized to the visual thumb (same travel maths)', () => {
    const { container, unmount } = render(
      createElement(Slider, { value: 25, onValueChange: noop }),
    );
    const cls = inputOf(container).className;
    expect(cls).toContain('[&::-webkit-slider-thumb]:h-5');
    expect(cls).toContain('[&::-webkit-slider-thumb]:w-5');
    expect(cls).toContain('[&::-moz-range-thumb]:size-5');
    unmount();
  });

  test('flags dragging and drops the transition while the pointer is down', () => {
    const { container, unmount } = render(
      createElement(Slider, { value: 30, onValueChange: noop }),
    );
    const input = inputOf(container);
    const thumb = thumbOf(container);

    expect(thumb.getAttribute('data-dragging')).toBeNull();
    expect(thumb.className).toContain('transition-[left]');

    act(() => {
      fire(input, 'pointerdown');
    });
    expect(thumb.getAttribute('data-dragging')).toBe('true');
    expect(thumb.className).not.toContain('transition-[left]');

    act(() => {
      fire(input, 'pointerup');
    });
    expect(thumb.getAttribute('data-dragging')).toBeNull();
    expect(thumb.className).toContain('transition-[left]');
    unmount();
  });

  test('reflects the value prop and exposes it via showValue', () => {
    const { container, unmount } = render(
      createElement(Slider, { value: 55, onValueChange: noop, label: 'Volume', showValue: true }),
    );
    expect(inputOf(container).value).toBe('55');
    expect(container.textContent).toContain('Volume');
    expect(container.textContent).toContain('55');
    unmount();
  });

  test('disabled disables the input and dims the control', () => {
    const { container, unmount } = render(
      createElement(Slider, { value: 10, onValueChange: noop, disabled: true }),
    );
    expect(inputOf(container).disabled).toBe(true);
    expect((container.firstElementChild as HTMLElement).className).toContain('opacity-50');
    unmount();
  });
});
