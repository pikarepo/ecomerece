import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { Link } from '../components/navigation/Link';
import { registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

describe('Link', () => {
  test('renders an anchor with children', () => {
    const { container, unmount } = render(createElement(Link, { href: '/about' }, 'About'));
    const a = container.querySelector('a');
    expect(a).not.toBeNull();
    expect(a?.textContent).toContain('About');
    expect(a?.getAttribute('href')).toBe('/about');
    unmount();
  });

  test('external link adds rel="noopener noreferrer" automatically', () => {
    const { container, unmount } = render(
      createElement(Link, { href: 'https://example.com', target: '_blank' }, 'External'),
    );
    const a = container.querySelector('a') as HTMLAnchorElement;
    expect(a.getAttribute('rel')).toContain('noopener');
    expect(a.getAttribute('rel')).toContain('noreferrer');
    unmount();
  });

  test('external link shows the external icon by default', () => {
    const { container, unmount } = render(
      createElement(Link, { href: 'https://example.com', target: '_blank' }, 'Ext'),
    );
    expect(container.querySelector('svg')).not.toBeNull();
    unmount();
  });

  test('showExternal=false suppresses the icon', () => {
    const { container, unmount } = render(
      createElement(
        Link,
        { href: 'https://example.com', target: '_blank', showExternal: false },
        'Ext',
      ),
    );
    expect(container.querySelector('svg')).toBeNull();
    unmount();
  });

  test('variant prop applies different class', () => {
    const { container: c1, unmount: u1 } = render(
      createElement(Link, { variant: 'subtle' }, 'Subtle'),
    );
    const { container: c2, unmount: u2 } = render(
      createElement(Link, { variant: 'underline' }, 'Underline'),
    );
    expect(c1.querySelector('a')?.className).toContain('text-ink-2');
    expect(c2.querySelector('a')?.className).toContain('underline');
    u1();
    u2();
  });
});
