/** @jsxImportSource react */

import { afterAll, describe, expect, it } from 'bun:test';
import { Package, Settings } from 'lucide-react';
import type { HistoryEntry, RecentlyViewedItem } from '../components/navigation';
import { HistoryDropdown, RecentlyViewed } from '../components/navigation';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

const entries: HistoryEntry[] = [
  { id: 'orders', label: 'Orders', hint: '/orders', icon: Package },
  { id: 'settings', label: 'Settings', hint: '/settings', icon: Settings },
];

function menu(container: HTMLElement): HTMLElement | null {
  return container.querySelector('[role="menu"]');
}

function menuItems(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
}

function chevron(container: HTMLElement): HTMLButtonElement {
  return container.querySelector('[aria-haspopup="menu"]') as HTMLButtonElement;
}

function backButton(container: HTMLElement): HTMLButtonElement {
  return container.querySelector('[aria-label="Go back"]') as HTMLButtonElement;
}

async function click(el: Element) {
  await act(async () => {
    fire(el, 'click');
  });
}

describe('batch 78 history dropdown', () => {
  it('fires onBack from the arrow button', async () => {
    let backs = 0;
    const { container, unmount } = render(
      <HistoryDropdown entries={entries} onBack={() => backs++} />,
    );

    await click(backButton(container));

    expect(backs).toBe(1);
    unmount();
  });

  it('disables the arrow when onBack is missing', () => {
    const { container, unmount } = render(<HistoryDropdown entries={entries} />);
    expect(backButton(container).disabled).toBe(true);
    unmount();
  });

  it('renders nothing until the chevron is clicked', async () => {
    const { container, unmount } = render(<HistoryDropdown entries={entries} />);
    expect(menu(container)).toBeNull();

    await click(chevron(container));

    expect(chevron(container).getAttribute('aria-expanded')).toBe('true');
    expect(menuItems(container).map((el) => el.textContent)).toEqual([
      'Orders/orders',
      'Settings/settings',
    ]);
    unmount();
  });

  it('selects an entry and closes the menu', async () => {
    const selected: string[] = [];
    const navigated: string[] = [];
    const withHandlers: HistoryEntry[] = [
      { id: 'orders', label: 'Orders', onSelect: () => selected.push('orders') },
      { id: 'settings', label: 'Settings' },
    ];
    const { container, unmount } = render(
      <HistoryDropdown
        entries={withHandlers}
        onNavigate={(entry) => navigated.push(entry.id)}
        defaultOpen
      />,
    );

    await click(menuItems(container)[0] as Element);

    expect(selected).toEqual(['orders']);
    expect(navigated).toEqual(['orders']);
    expect(menu(container)).toBeNull();
    unmount();
  });

  it('disables the chevron when there is no history', () => {
    const { container, unmount } = render(<HistoryDropdown entries={[]} />);
    expect(chevron(container).disabled).toBe(true);
    unmount();
  });

  it('truncates the menu to `max` entries', async () => {
    const many: HistoryEntry[] = Array.from({ length: 5 }, (_, i) => ({
      id: `e${i}`,
      label: `Entry ${i}`,
    }));
    const { container, unmount } = render(<HistoryDropdown entries={many} max={2} defaultOpen />);

    expect(menuItems(container)).toHaveLength(2);
    unmount();
  });

  it('closes on Escape and on an outside pointerdown', async () => {
    const { container, unmount } = render(<HistoryDropdown entries={entries} defaultOpen />);
    expect(menu(container)).not.toBeNull();

    await act(async () => {
      fire(document, 'keydown', { key: 'Escape' });
    });
    expect(menu(container)).toBeNull();

    await click(chevron(container));
    expect(menu(container)).not.toBeNull();

    await act(async () => {
      fire(document.body, 'mousedown');
    });
    expect(menu(container)).toBeNull();
    unmount();
  });

  it('runs controlled open changes through onOpenChange', async () => {
    const changes: boolean[] = [];
    const { container, unmount } = render(
      <HistoryDropdown entries={entries} open={false} onOpenChange={(o) => changes.push(o)} />,
    );

    await click(chevron(container));

    expect(changes).toEqual([true]);
    expect(menu(container)).toBeNull();
    unmount();
  });
});

const rvItems: RecentlyViewedItem[] = [
  { id: 'a', label: 'Trail Runner', hint: '$120', href: '/products/trail-runner' },
  { id: 'b', label: 'Wool Socks', hint: '$18' },
  { id: 'c', label: 'Rain Shell', hint: '$240' },
];

describe('batch 78 recently viewed', () => {
  it('renders nothing when there are no items', () => {
    const { container, unmount } = render(<RecentlyViewed items={[]} />);
    expect(container.childElementCount).toBe(0);
    unmount();
  });

  it('renders a heading, hints and hrefs, truncating to `max`', () => {
    const { container, unmount } = render(
      <RecentlyViewed items={rvItems} max={2} onSelect={() => {}} />,
    );

    expect(container.querySelector('h3')?.textContent).toContain('Recently viewed');
    expect(container.querySelectorAll('li')).toHaveLength(2);
    expect(container.textContent).toContain('Trail Runner');
    expect(container.textContent).toContain('$120');
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/products/trail-runner');
    unmount();
  });

  it('reports the selected item and supports clearing', async () => {
    const picked: string[] = [];
    let clears = 0;
    const { container, unmount } = render(
      <RecentlyViewed
        items={rvItems}
        onSelect={(item) => picked.push(item.id)}
        onClear={() => clears++}
      />,
    );

    const buttons = Array.from(container.querySelectorAll('li button')) as HTMLElement[];
    await click(buttons[0] as Element);
    const clear = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Clear',
    ) as HTMLElement;
    await click(clear);

    expect(picked).toEqual(['b']);
    expect(clears).toBe(1);
    unmount();
  });

  it('switches to a stacked list layout', () => {
    const { container, unmount } = render(<RecentlyViewed items={rvItems} layout="list" />);
    const list = container.querySelector('ul') as HTMLElement;
    expect(list.className).toContain('flex-col');
    unmount();
  });
});
