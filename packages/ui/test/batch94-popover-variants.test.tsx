/** @jsxImportSource react */

import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { Popover } from '../components/overlay/Popover';
import { MegaDropdown, QuickViewPanel } from '../components/overlay/PopoverVariants';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

const trigger = createElement('button', { type: 'button' }, 'Open');

function wrapOf(container: HTMLElement): HTMLElement {
  return container.firstElementChild as HTMLElement;
}

function panelOf(container: HTMLElement): HTMLElement | null {
  return container.querySelector('[role="menu"]');
}

describe('Popover triggers & arrow (batch 94)', () => {
  test('click mode keeps the baseline toggle', () => {
    const { container, unmount } = render(
      createElement(Popover, { trigger, content: createElement('p', null, 'Click content') }),
    );
    const btn = container.querySelector('button') as HTMLElement;
    act(() => fire(btn, 'click'));
    expect(panelOf(container)?.textContent).toContain('Click content');
    expect(wrapOf(container).querySelector('span')?.getAttribute('aria-expanded')).toBe('true');
    act(() => fire(btn, 'click'));
    expect(panelOf(container)).toBeNull();
    unmount();
  });

  test('Escape and outside clicks close', () => {
    const { container, unmount } = render(
      createElement(Popover, { trigger, content: createElement('p', null, 'Body') }),
    );
    const btn = container.querySelector('button') as HTMLElement;
    act(() => fire(btn, 'click'));
    act(() => fire(document, 'keydown', { key: 'Escape' }));
    expect(panelOf(container)).toBeNull();
    act(() => fire(btn, 'click'));
    act(() => fire(document.body, 'mousedown'));
    expect(panelOf(container)).toBeNull();
    unmount();
  });

  test('hover mode opens on mouseover and closes on mouseout', () => {
    const { container, unmount } = render(
      createElement(Popover, {
        trigger,
        triggerOn: 'hover',
        content: createElement('p', null, 'Hover content'),
      }),
    );
    const btn = container.querySelector('button') as HTMLElement;
    act(() => fire(btn, 'mouseover'));
    expect(panelOf(container)?.textContent).toContain('Hover content');
    expect(wrapOf(container).querySelector('span')?.getAttribute('aria-expanded')).toBe('true');
    act(() => fire(btn, 'mouseout'));
    expect(panelOf(container)).toBeNull();
    unmount();
  });

  test('focus mode opens on focus and closes when focus leaves', () => {
    const { container, unmount } = render(
      createElement(Popover, {
        trigger,
        triggerOn: 'focus',
        content: createElement('p', null, 'Focus content'),
      }),
    );
    const btn = container.querySelector('button') as HTMLElement;
    act(() => fire(btn, 'focusin'));
    expect(panelOf(container)?.textContent).toContain('Focus content');
    act(() => fire(wrapOf(container), 'focusout'));
    expect(panelOf(container)).toBeNull();
    unmount();
  });

  test('arrow renders rotated on the trigger edge for both sides', () => {
    const bottom = render(
      createElement(Popover, {
        trigger,
        triggerOn: 'hover',
        arrow: true,
        content: createElement('p', null, 'Arrowed'),
      }),
    );
    act(() => fire(bottom.container.querySelector('button') as HTMLElement, 'mouseover'));
    const arrowBottom = panelOf(bottom.container)?.querySelector('.rotate-45');
    expect(arrowBottom).not.toBeNull();
    expect((arrowBottom as HTMLElement).className).toContain('-top-1');
    bottom.unmount();

    const top = render(
      createElement(Popover, {
        trigger,
        triggerOn: 'hover',
        arrow: true,
        side: 'top',
        content: createElement('p', null, 'Arrowed'),
      }),
    );
    act(() => fire(top.container.querySelector('button') as HTMLElement, 'mouseover'));
    const arrowTop = panelOf(top.container)?.querySelector('.rotate-45');
    expect((arrowTop as HTMLElement).className).toContain('-bottom-1');
    top.unmount();
  });
});

describe('MegaDropdown (batch 94)', () => {
  test('renders columns, links and footer and wires item selects', () => {
    let picked = '';
    const { container, unmount } = render(
      createElement(MegaDropdown, {
        trigger: createElement('button', { type: 'button' }, 'Products'),
        footer: createElement('span', null, 'See the whole catalog'),
        columns: [
          {
            id: 'c1',
            title: 'Shop',
            items: [
              { id: 'i1', label: 'Laptops', href: '/laptops', description: 'Portable machines' },
              {
                id: 'i2',
                label: 'Phones',
                onSelect: () => {
                  picked = 'phones';
                },
              },
            ],
          },
          {
            id: 'c2',
            title: 'Explore',
            items: [{ id: 'i3', label: 'Deals' }],
          },
        ],
      }),
    );
    act(() => fire(container.querySelector('button') as HTMLElement, 'mouseover'));
    const panel = panelOf(container);
    expect(panel).not.toBeNull();
    expect(panel?.className).toContain('min-w-[420px]');
    const text = panel?.textContent ?? '';
    expect(text).toContain('Shop');
    expect(text).toContain('Explore');
    expect(text).toContain('Laptops');
    expect(text).toContain('Portable machines');
    expect(text).toContain('See the whole catalog');
    const anchor = panel?.querySelector('a');
    expect(anchor?.getAttribute('href')).toBe('/laptops');
    const phoneBtn = panel?.querySelectorAll('button')[0] as HTMLElement;
    act(() => fire(phoneBtn, 'click'));
    expect(picked).toBe('phones');
    unmount();
  });
});

describe('QuickViewPanel (batch 94)', () => {
  test('peeks summary, meta pairs and actions with an arrow', () => {
    let acted = 0;
    const { container, unmount } = render(
      createElement(QuickViewPanel, {
        trigger: createElement('button', { type: 'button' }, 'Aurora Chair'),
        title: 'Aurora Chair',
        subtitle: 'Ergonomics · In stock',
        description: 'A light task chair with a breathable back.',
        media: createElement('img', { src: '/chair.jpg', alt: 'Aurora Chair' }),
        meta: [
          { id: 'm1', label: 'Price', value: '$249' },
          { id: 'm2', label: 'Rating', value: '4.8' },
        ],
        actions: createElement(
          'button',
          {
            type: 'button',
            onClick: () => {
              acted += 1;
            },
          },
          'Add to cart',
        ),
      }),
    );
    act(() => fire(container.querySelector('button') as HTMLElement, 'mouseover'));
    const panel = panelOf(container);
    expect(panel).not.toBeNull();
    expect(panel?.className).toContain('w-72');
    expect(panel?.querySelector('.rotate-45')).not.toBeNull();
    const text = panel?.textContent ?? '';
    expect(text).toContain('Aurora Chair');
    expect(text).toContain('Ergonomics · In stock');
    expect(text).toContain('A light task chair with a breathable back.');
    expect(text).toContain('Price');
    expect(text).toContain('$249');
    expect(text).toContain('4.8');
    const img = panel?.querySelector('img');
    expect(img?.getAttribute('alt')).toBe('Aurora Chair');
    const action = panel?.querySelectorAll('button')[0] as HTMLElement;
    act(() => fire(action, 'click'));
    expect(acted).toBe(1);
    act(() => fire(document.body, 'mousedown'));
    expect(panelOf(container)).toBeNull();
    unmount();
  });
});
