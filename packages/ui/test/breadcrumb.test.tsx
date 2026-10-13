import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { Breadcrumb } from '../components/navigation/Breadcrumb';
import { registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

const items = [
  { label: 'Home', href: '/' },
  { label: 'Catalog', href: '/catalog' },
  { label: 'Shoes' },
];

describe('Breadcrumb', () => {
  test('renders a labelled nav with an ordered list of crumbs', () => {
    const { container, unmount } = render(createElement(Breadcrumb, { items }));
    expect(container.querySelector('nav')?.getAttribute('aria-label')).toBe('Breadcrumb');
    expect(container.querySelectorAll('ol > li')).toHaveLength(3);
    expect(container.querySelectorAll('li a')).toHaveLength(2);
    unmount();
  });

  test('marks the last crumb as the current page (plain text, not a link)', () => {
    const { container, unmount } = render(createElement(Breadcrumb, { items }));
    const current = container.querySelector('[aria-current="page"]');
    expect(current?.textContent).toBe('Shoes');
    expect(current?.tagName).toBe('SPAN');
    unmount();
  });

  test('links the earlier crumbs and draws n-1 separators', () => {
    const { container, unmount } = render(createElement(Breadcrumb, { items }));
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/', '/catalog']);
    expect(container.querySelectorAll('svg')).toHaveLength(2);
    unmount();
  });

  test('honours a custom aria-label', () => {
    const { container, unmount } = render(
      createElement(Breadcrumb, { items: [{ label: 'Solo' }], 'aria-label': 'You are here' }),
    );
    expect(container.querySelector('nav')?.getAttribute('aria-label')).toBe('You are here');
    unmount();
  });
});
