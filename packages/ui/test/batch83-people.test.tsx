import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { Avatar, getInitials } from '../components/surface/Avatar';
import { AvatarGroup, Byline, NameRole, TeamStack } from '../components/surface/People';
import { registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

const people = [
  { name: 'Alex Chen' },
  { name: 'Mia Okafor' },
  { name: 'Sam Rivera' },
  { name: 'Nina Patel' },
  { name: 'Leo Kim' },
  { name: 'Ada Lovelace' },
];

describe('Avatar', () => {
  test('renders initials fallback with the name as label', () => {
    const { container, unmount } = render(createElement(Avatar, { name: 'Alex Chen' }));
    const root = container.firstElementChild as HTMLElement;
    expect(root.textContent).toBe('AC');
    expect(root.getAttribute('aria-label')).toBe('Alex Chen');
    unmount();
  });

  test('renders an image with alt when src is set', () => {
    const { container, unmount } = render(
      createElement(Avatar, { src: '/a.png', name: 'Alex Chen' }),
    );
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('/a.png');
    expect(img.getAttribute('alt')).toBe('Alex Chen');
    unmount();
  });

  test('adds a presence dot and appends status to the label', () => {
    const { container, unmount } = render(
      createElement(Avatar, { name: 'Alex Chen', status: 'busy' }),
    );
    expect(container.querySelector('.bg-danger')).not.toBeNull();
    const root = container.firstElementChild as HTMLElement;
    expect(root.querySelector('.bg-danger')).not.toBeNull();
    const labelled = container.querySelector('[aria-label]') as HTMLElement;
    expect(labelled.getAttribute('aria-label')).toBe('Alex Chen, busy');
    unmount();
  });

  test('online status maps to the success tone', () => {
    const { container, unmount } = render(
      createElement(Avatar, { name: 'Alex Chen', status: 'online' }),
    );
    expect(container.querySelector('.bg-success')).not.toBeNull();
    unmount();
  });

  test('renders an overlay badge', () => {
    const { container, unmount } = render(
      createElement(Avatar, { name: 'Alex Chen', badge: createElement('span', null, '✓') }),
    );
    expect(container.textContent).toContain('✓');
    unmount();
  });

  test('getInitials takes the first two words', () => {
    expect(getInitials('Ada Lovelace')).toBe('AL');
    expect(getInitials('madonna')).toBe('M');
    expect(getInitials('  Grace Brewster Hopper ')).toBe('GB');
  });
});

describe('AvatarGroup', () => {
  test('shows max avatars then a +N overflow chip', () => {
    const { container, unmount } = render(createElement(AvatarGroup, { people, max: 4 }));
    expect(container.textContent).toContain('+2');
    unmount();
  });

  test('uses `total` for the remainder count', () => {
    const { container, unmount } = render(
      createElement(AvatarGroup, { people, max: 3, total: 40 }),
    );
    expect(container.textContent).toContain('+37');
    unmount();
  });

  test('renders no overflow chip when all fit and exposes a label', () => {
    const { container, unmount } = render(
      createElement(AvatarGroup, { people: people.slice(0, 2) }),
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('aria-label')).toBe('Avatar group — 2 people');
    expect(container.textContent).not.toContain('+');
    unmount();
  });
});

describe('TeamStack', () => {
  test('renders each member with name and role', () => {
    const { container, unmount } = render(
      createElement(TeamStack, {
        members: [{ name: 'Alex Chen', role: 'Designer' }],
      }),
    );
    expect(container.textContent).toContain('Alex Chen');
    expect(container.textContent).toContain('Designer');
    unmount();
  });

  test('collapses the overflow into a +N tile', () => {
    const { container, unmount } = render(createElement(TeamStack, { members: people, max: 4 }));
    expect(container.textContent).toContain('+2');
    unmount();
  });

  test('hides names when showNames is false', () => {
    const { container, unmount } = render(
      createElement(TeamStack, { members: people.slice(0, 1), showNames: false }),
    );
    expect(container.textContent).not.toContain('Alex Chen');
    unmount();
  });
});

describe('NameRole', () => {
  test('renders name, role and an avatar', () => {
    const { container, unmount } = render(
      createElement(NameRole, {
        name: 'Alex Chen',
        role: 'Staff Engineer',
        avatar: { name: 'Alex Chen' },
      }),
    );
    expect(container.textContent).toContain('Alex Chen');
    expect(container.textContent).toContain('Staff Engineer');
    expect(container.textContent).toContain('AC');
    unmount();
  });

  test('links the name when href is given', () => {
    const { container, unmount } = render(
      createElement(NameRole, { name: 'Alex Chen', href: '/u/alex' }),
    );
    const a = container.querySelector('a') as HTMLAnchorElement;
    expect(a.getAttribute('href')).toBe('/u/alex');
    unmount();
  });
});

describe('Byline', () => {
  test('renders prefix, author, role and date with a separator', () => {
    const { container, unmount } = render(
      createElement(Byline, {
        prefix: 'By',
        author: 'Alex Chen',
        role: 'Staff Writer',
        date: 'Mar 3, 2026',
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('By');
    expect(text).toContain('Alex Chen');
    expect(text).toContain('Staff Writer');
    expect(text).toContain('·');
    expect(text).toContain('Mar 3, 2026');
    unmount();
  });

  test('renders an author avatar and links the name', () => {
    const { container, unmount } = render(
      createElement(Byline, {
        author: 'Alex Chen',
        href: '/authors/alex',
        avatar: { name: 'Alex Chen' },
      }),
    );
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/authors/alex');
    expect(container.textContent).toContain('AC');
    unmount();
  });
});
