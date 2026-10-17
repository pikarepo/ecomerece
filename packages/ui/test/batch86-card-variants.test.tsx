/** @jsxImportSource react */
import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import {
  DraggableCard,
  ExpandableCard,
  FlipCard,
  HorizontalCard,
  HoverRevealCard,
  OverlayImageCard,
  SelectableCard,
  StackedCards,
} from '../components/data/CardVariants';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

/** Dispatch a real MouseEvent (fire() builds a bare Event that misses React's checkbox onChange). */
function mouse(target: EventTarget, type: string, init: Record<string, unknown> = {}): void {
  const Ctor = (
    globalThis as unknown as { window: { MouseEvent: new (t: string, i?: unknown) => Event } }
  ).window.MouseEvent;
  target.dispatchEvent(new Ctor(type, { bubbles: true, cancelable: true, ...init }));
}

describe('HorizontalCard', () => {
  test('shows title and description in an article', () => {
    const { container, unmount } = render(
      createElement(HorizontalCard, { title: 'Inline', description: 'Side by side.' }),
    );
    expect(container.firstElementChild?.tagName).toBe('ARTICLE');
    const text = container.textContent ?? '';
    expect(text).toContain('Inline');
    expect(text).toContain('Side by side.');
    unmount();
  });

  test('renders a link root and an image when given', () => {
    const { container, unmount } = render(
      createElement(HorizontalCard, { title: 'Linked', image: '/x.png', href: '/x' }),
    );
    const root = container.firstElementChild as HTMLAnchorElement;
    expect(root.tagName).toBe('A');
    expect(root.getAttribute('href')).toBe('/x');
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/x.png');
    unmount();
  });
});

describe('OverlayImageCard', () => {
  test('shows title, description and cta over an image', () => {
    const { container, unmount } = render(
      createElement(OverlayImageCard, {
        title: 'Featured',
        description: 'Over the image.',
        ctaLabel: 'Explore',
        image: '/hero.jpg',
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Featured');
    expect(text).toContain('Over the image.');
    expect(text).toContain('Explore');
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/hero.jpg');
    unmount();
  });

  test('is a link when href is given', () => {
    const { container, unmount } = render(
      createElement(OverlayImageCard, { title: 'Go', href: '/go' }),
    );
    expect(container.firstElementChild?.tagName).toBe('A');
    unmount();
  });
});

describe('HoverRevealCard', () => {
  test('links the revealed title', () => {
    const { container, unmount } = render(
      createElement(HoverRevealCard, {
        title: 'Reveal',
        description: 'Hidden detail.',
        image: '/card.jpg',
        href: '/r',
      }),
    );
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/r');
    unmount();
  });
});

describe('FlipCard', () => {
  test('starts on the front face and flips on click', () => {
    const { container, unmount } = render(
      createElement(FlipCard, {
        front: createElement('div', null, 'Front face'),
        back: createElement('div', null, 'Back face'),
      }),
    );
    expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe('Back face');
    const button = container.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('aria-pressed')).toBe('false');
    act(() => fire(button, 'click'));
    expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe('Front face');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    unmount();
  });
});

describe('ExpandableCard', () => {
  test('collapses body and toggles via the header button', () => {
    const { container, unmount } = render(
      <ExpandableCard title="Details">Hidden content</ExpandableCard>,
    );
    const button = container.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(container.querySelector('[hidden]')).not.toBeNull();
    act(() => fire(button, 'click'));
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(container.querySelector('[hidden]')).toBeNull();
    unmount();
  });

  test('honours defaultOpen', () => {
    const { container, unmount } = render(
      <ExpandableCard title="Open" defaultOpen>
        Content
      </ExpandableCard>,
    );
    expect(container.querySelector('[hidden]')).toBeNull();
    unmount();
  });
});

describe('SelectableCard', () => {
  test('reflects selected state and calls onSelect', () => {
    let selects = 0;
    const { container, unmount } = render(
      createElement(SelectableCard, {
        title: 'Plan A',
        description: 'Basic',
        selected: false,
        onSelect: () => {
          selects += 1;
        },
      }),
    );
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input.checked).toBe(false);
    act(() => mouse(input, 'click'));
    expect(selects).toBe(1);
    unmount();
  });

  test('honours disabled', () => {
    const { container, unmount } = render(
      createElement(SelectableCard, {
        title: 'Off',
        selected: true,
        disabled: true,
        onSelect: () => {},
      }),
    );
    expect((container.querySelector('input') as HTMLInputElement).disabled).toBe(true);
    unmount();
  });
});

describe('DraggableCard', () => {
  test('is draggable with a labelled grip', () => {
    const { container, unmount } = render(
      createElement(DraggableCard, { title: 'Move me', dragLabel: 'Reorder' }),
    );
    expect(container.firstElementChild?.getAttribute('draggable')).toBe('true');
    expect(container.querySelector('[aria-label="Reorder"]')).not.toBeNull();
    expect(container.textContent).toContain('Move me');
    unmount();
  });
});

describe('StackedCards', () => {
  test('shows the top item and +N overflow', () => {
    const { container, unmount } = render(
      createElement(StackedCards, {
        label: 'Inbox',
        max: 2,
        items: [
          createElement('div', { key: 'a' }, 'Top'),
          createElement('div', { key: 'b' }, 'Two'),
          createElement('div', { key: 'c' }, 'Three'),
          createElement('div', { key: 'd' }, 'Four'),
        ],
      }),
    );
    const list = container.querySelector('ul');
    expect(list?.getAttribute('aria-label')).toBe('Inbox');
    expect(container.textContent).toContain('Top');
    expect(container.textContent).toContain('+2 more');
    unmount();
  });
});
