/** @jsxImportSource react */

import { afterAll, describe, expect, it } from 'bun:test';
import { Github, Instagram, Twitter } from 'lucide-react';
import { Button } from '../components/controls/Button';
import { FatFooter, MegaFooter, SocialBar, StickyFooter } from '../components/navigation';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

const social = [
  { label: 'GitHub', href: 'https://github.com/aeroforge', icon: Github },
  { label: 'Twitter', href: 'https://twitter.com/aeroforge', icon: Twitter },
  { label: 'Instagram', href: 'https://instagram.com/aeroforge', icon: Instagram },
];

const columns = [
  {
    title: 'Shop',
    links: [
      { label: 'New in', href: '/new' },
      { label: 'Sale', href: '/sale', external: true },
    ],
  },
  { title: 'Company', links: [{ label: 'About', href: '/about' }] },
];

describe('batch 76 footers', () => {
  it('SocialBar is a labelled nav of external icon links', () => {
    const { container, unmount } = render(<SocialBar links={social} />);
    const nav = container.querySelector('nav[aria-label="Social links"]') as HTMLElement;
    expect(nav).not.toBeNull();
    const links = container.querySelectorAll('a');
    expect(links.length).toBe(3);
    const first = links[0] as HTMLAnchorElement;
    expect(first.getAttribute('aria-label')).toBe('GitHub');
    expect(first.getAttribute('title')).toBe('GitHub');
    expect(first.getAttribute('target')).toBe('_blank');
    expect(first.getAttribute('rel')).toContain('noopener');
    unmount();
  });

  it('MegaFooter renders brand, columns, newsletter, social, legal', () => {
    const { container, unmount } = render(
      <MegaFooter
        brand={<span>Aeroforge</span>}
        columns={columns}
        newsletter={<input aria-label="Email address" />}
        social={social}
        legal="© 2026 Aeroforge"
        legalLinks={[{ label: 'Privacy', href: '/privacy' }]}
      />,
    );
    expect(container.querySelector('footer')).not.toBeNull();
    expect(container.textContent).toContain('Aeroforge');
    expect(container.textContent).toContain('© 2026 Aeroforge');
    expect(container.textContent).toContain('Privacy');
    // column titles render as h6 headings, links as list items
    const heading = container.querySelector('h6') as HTMLElement;
    expect(heading.textContent).toBe('Shop');
    expect(container.querySelectorAll('ul li').length).toBe(3);
    expect(container.querySelector('input[aria-label="Email address"]')).not.toBeNull();
    expect(container.querySelector('nav[aria-label="Social links"]')).not.toBeNull();
    unmount();
  });

  it('MegaFooter marks external links and clears them otherwise', () => {
    const { container, unmount } = render(<MegaFooter columns={columns} />);
    const anchors = Array.from(container.querySelectorAll('a')) as HTMLAnchorElement[];
    const sale = anchors.find((a) => a.textContent === 'Sale') as HTMLAnchorElement;
    const about = anchors.find((a) => a.textContent === 'About') as HTMLAnchorElement;
    expect(sale.getAttribute('target')).toBe('_blank');
    expect(sale.getAttribute('rel')).toContain('noopener');
    expect(about.getAttribute('target')).toBeNull();
    unmount();
  });

  it('FatFooter leads with an oversized wordmark', () => {
    const { container, unmount } = render(
      <FatFooter
        brand="Aeroforge"
        tagline="Built for the long haul."
        columns={columns}
        social={social}
        legal="Made in Tokyo"
      />,
    );
    const wordmark = container.querySelector('.text-4xl') as HTMLElement;
    expect(wordmark.textContent).toBe('Aeroforge');
    expect(container.textContent).toContain('Built for the long haul.');
    expect(container.textContent).toContain('Made in Tokyo');
    expect(container.querySelector('nav[aria-label="Social links"]')).not.toBeNull();
    unmount();
  });

  it('StickyFooter is pinned, and dismiss fires only when wired', () => {
    let dismissed = 0;
    const { container, unmount } = render(
      <StickyFooter actions={<Button size="sm">Accept</Button>} onDismiss={() => dismissed++}>
        We use cookies to improve your experience.
      </StickyFooter>,
    );
    const footer = container.querySelector('footer') as HTMLElement;
    expect(footer.className).toContain('sticky');
    expect(footer.className).toContain('bottom-0');
    expect(footer.textContent).toContain('We use cookies');
    expect(footer.textContent).toContain('Accept');
    const dismiss = container.querySelector('button[aria-label="Dismiss"]') as HTMLElement;
    expect(dismiss).not.toBeNull();
    act(() => fire(dismiss, 'click'));
    expect(dismissed).toBe(1);
    unmount();
  });

  it('StickyFooter omits the dismiss button when no handler is given', () => {
    const { container, unmount } = render(<StickyFooter>Just a bar</StickyFooter>);
    expect(container.querySelector('button[aria-label="Dismiss"]')).toBeNull();
    expect(container.querySelector('button')).toBeNull();
    unmount();
  });
});
