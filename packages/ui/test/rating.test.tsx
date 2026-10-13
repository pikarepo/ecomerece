import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { Rating } from '../components/surface/Rating';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

describe('Rating', () => {
  test('read-only renders a labelled image of the score', () => {
    const { container, unmount } = render(createElement(Rating, { value: 3, readOnly: true }));
    const el = container.querySelector('[role="img"]');
    expect(el?.getAttribute('aria-label')).toBe('3 out of 5');
    expect(container.querySelectorAll('svg').length).toBe(5);
    unmount();
  });

  test('interactive stars are radios and emit the picked score', () => {
    const calls: number[] = [];
    const { container, unmount } = render(
      createElement(Rating, { value: 0, onValueChange: (v: number) => calls.push(v) }),
    );
    const stars = container.querySelectorAll('button[role="radio"]');
    expect(stars.length).toBe(5);
    act(() => fire(stars[2] as HTMLElement, 'click'));
    expect(calls).toEqual([3]);
    unmount();
  });

  test('honours a custom max', () => {
    const { container, unmount } = render(
      createElement(Rating, { value: 1, max: 10, readOnly: true }),
    );
    expect(container.querySelectorAll('svg').length).toBe(10);
    unmount();
  });
});
