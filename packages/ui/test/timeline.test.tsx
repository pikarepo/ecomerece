import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { Timeline } from '../components/list/Timeline';
import { registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

const items = [
  { title: 'Ordered', timestamp: '09:00' },
  {
    title: 'Shipped',
    description: 'Left the warehouse',
    timestamp: '12:00',
    tone: 'success' as const,
  },
  { title: 'Packed', tone: 'warning' as const },
  { title: 'Delivered', active: true },
];

describe('Timeline', () => {
  test('renders every entry in order with title/description/timestamp', () => {
    const { container, unmount } = render(createElement(Timeline, { items }));
    expect(container.querySelectorAll('ol > li')).toHaveLength(4);
    expect(container.textContent).toContain('Shipped');
    expect(container.textContent).toContain('Left the warehouse');
    expect(container.textContent).toContain('12:00');
    unmount();
  });

  test('draws a connector only between entries (n-1)', () => {
    const { container, unmount } = render(createElement(Timeline, { items }));
    expect(container.querySelectorAll('[data-connector="true"]')).toHaveLength(3);
    unmount();
  });

  test('maps tone to the marker colour and active to the accent marker', () => {
    const { container, unmount } = render(createElement(Timeline, { items }));
    expect(container.querySelector('.bg-success')).not.toBeNull();
    expect(container.querySelector('.bg-warning')).not.toBeNull();
    expect(container.querySelector('.bg-accent')).not.toBeNull();
    unmount();
  });
});
