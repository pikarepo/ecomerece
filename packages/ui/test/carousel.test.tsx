import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { Carousel } from '../components/data/Carousel';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

const slides = [
  createElement('div', { key: '1' }, 'Slide 1'),
  createElement('div', { key: '2' }, 'Slide 2'),
  createElement('div', { key: '3' }, 'Slide 3'),
];

describe('Carousel', () => {
  test('renders the first slide as active and hides the rest', () => {
    const { container, unmount } = render(createElement(Carousel, { slides }));
    const active = container.querySelectorAll('[data-active="true"]');
    expect(active).toHaveLength(1);
    expect(active[0].textContent).toBe('Slide 1');
    unmount();
  });

  test('next arrow advances to the second slide', () => {
    const { container, unmount } = render(createElement(Carousel, { slides }));
    const next = container.querySelector('[aria-label="Next slide"]') as HTMLButtonElement;
    act(() => next.click());
    const active = container.querySelector('[data-active="true"]');
    expect(active?.textContent).toBe('Slide 2');
    unmount();
  });

  test('prev arrow wraps from first slide to last', () => {
    const { container, unmount } = render(createElement(Carousel, { slides }));
    const prev = container.querySelector('[aria-label="Previous slide"]') as HTMLButtonElement;
    act(() => prev.click());
    const active = container.querySelector('[data-active="true"]');
    expect(active?.textContent).toBe('Slide 3');
    unmount();
  });

  test('dot buttons jump to the correct slide', () => {
    const { container, unmount } = render(createElement(Carousel, { slides }));
    const dots = container.querySelectorAll('[role="tab"]');
    expect(dots).toHaveLength(3);
    act(() => (dots[2] as HTMLButtonElement).click());
    const active = container.querySelector('[data-active="true"]');
    expect(active?.textContent).toBe('Slide 3');
    unmount();
  });

  test('arrows and dots hidden when disabled via props', () => {
    const { container, unmount } = render(
      createElement(Carousel, { slides, arrows: false, dots: false }),
    );
    expect(container.querySelector('[aria-label="Next slide"]')).toBeNull();
    expect(container.querySelector('[role="tab"]')).toBeNull();
    unmount();
  });
});
