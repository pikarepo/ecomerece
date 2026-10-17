/** @jsxImportSource react */

import { afterAll, describe, expect, it } from 'bun:test';
import { Home, Plus, Search, Settings, ShoppingBag } from 'lucide-react';
import { BottomTabBarFAB, FloatingBottomNav } from '../components/navigation';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

const tabs = [
  { icon: Home, label: 'Home', value: 'home' },
  { icon: Search, label: 'Search', value: 'search' },
  { icon: ShoppingBag, label: 'Orders', value: 'orders', badge: 2 },
  { icon: Settings, label: 'Settings', value: 'settings' },
];

const create = { icon: Plus, label: 'Create', onClick: () => {} };

function fabIndex(container: HTMLElement): number {
  return Array.from(container.querySelectorAll('button')).findIndex(
    (b) => b.getAttribute('aria-label') === 'Create',
  );
}

describe('batch 75 bottom nav variants', () => {
  it('BottomTabBarFAB centres the FAB and keeps tab semantics', () => {
    const { container, unmount } = render(
      <BottomTabBarFAB items={tabs} value="search" onChange={() => {}} action={create} />,
    );
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(5); // 4 tabs + FAB
    expect(fabIndex(container)).toBe(2); // after the first two tabs
    const nav = container.querySelector('nav') as HTMLElement;
    expect(nav.getAttribute('aria-label')).toBe('Primary navigation');
    const current = container.querySelector('[aria-current="page"]') as HTMLElement;
    expect(current.textContent).toContain('Search');
    unmount();
  });

  it('BottomTabBarFAB honours fabPosition start/end', () => {
    const { container: start } = render(
      <BottomTabBarFAB
        items={tabs}
        value="home"
        onChange={() => {}}
        action={create}
        fabPosition="start"
      />,
    );
    expect(fabIndex(start)).toBe(0);

    const { container: end } = render(
      <BottomTabBarFAB
        items={tabs}
        value="home"
        onChange={() => {}}
        action={create}
        fabPosition="end"
      />,
    );
    expect(fabIndex(end)).toBe(4);
  });

  it('BottomTabBarFAB fires tab + FAB handlers and shows badges', () => {
    let picked = '';
    let created = 0;
    const { container, unmount } = render(
      <BottomTabBarFAB
        items={tabs}
        value="home"
        onChange={(v) => (picked = v)}
        action={{ icon: Plus, label: 'Create', onClick: () => created++, badge: 3 }}
      />,
    );
    const buttons = Array.from(container.querySelectorAll('button')) as HTMLElement[];
    const orders = buttons.find((b) => b.textContent?.includes('Orders')) as HTMLElement;
    act(() => fire(orders, 'click'));
    expect(picked).toBe('orders');
    const fab = buttons.find((b) => b.getAttribute('aria-label') === 'Create') as HTMLElement;
    act(() => fire(fab, 'click'));
    expect(created).toBe(1);
    expect(container.textContent).toContain('2'); // tab badge
    expect(container.textContent).toContain('3'); // FAB badge
    unmount();
  });

  it('BottomTabBarFAB raised toggles the notch lift', () => {
    const { container: lifted } = render(
      <BottomTabBarFAB items={tabs} value="home" onChange={() => {}} action={create} />,
    );
    const fabLifted = Array.from(lifted.querySelectorAll('button')).find(
      (b) => b.getAttribute('aria-label') === 'Create',
    ) as HTMLElement;
    expect(fabLifted.className).toContain('-mt-7');

    const { container: flat } = render(
      <BottomTabBarFAB
        items={tabs}
        value="home"
        onChange={() => {}}
        action={create}
        raised={false}
      />,
    );
    const fabFlat = Array.from(flat.querySelectorAll('button')).find(
      (b) => b.getAttribute('aria-label') === 'Create',
    ) as HTMLElement;
    expect(fabFlat.className).not.toContain('-mt-7');
  });

  it('FloatingBottomNav is an icon-only pill by default (native tooltips)', () => {
    const { container, unmount } = render(
      <FloatingBottomNav items={tabs} value="home" onChange={() => {}} />,
    );
    const nav = container.querySelector('nav') as HTMLElement;
    expect(nav.getAttribute('aria-label')).toBe('Primary navigation');
    const home = container.querySelector('button[aria-label="Home"]') as HTMLElement;
    expect(home).not.toBeNull();
    expect(home.getAttribute('title')).toBe('Home');
    expect(container.textContent).not.toContain('Settings');
    unmount();
  });

  it('FloatingBottomNav labels mode shows text and drops duplicate aria-label', () => {
    const { container, unmount } = render(
      <FloatingBottomNav items={tabs} value="home" onChange={() => {}} labels />,
    );
    expect(container.textContent).toContain('Home');
    expect(container.textContent).toContain('Settings');
    const home = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Home'),
    ) as HTMLElement;
    expect(home.getAttribute('aria-label')).toBeNull();
    unmount();
  });

  it('FloatingBottomNav reports selection and renders an optional FAB', () => {
    let picked = '';
    let created = 0;
    const { container, unmount } = render(
      <FloatingBottomNav
        items={tabs}
        value="home"
        onChange={(v) => (picked = v)}
        action={{ icon: Plus, label: 'New order', onClick: () => created++ }}
      />,
    );
    const orders = container.querySelector('button[aria-label="Orders"]') as HTMLElement;
    act(() => fire(orders, 'click'));
    expect(picked).toBe('orders');
    const fab = container.querySelector('button[aria-label="New order"]') as HTMLElement;
    expect(fab).not.toBeNull();
    act(() => fire(fab, 'click'));
    expect(created).toBe(1);
    expect(container.querySelector('[aria-current="page"]')?.getAttribute('aria-label')).toBe(
      'Home',
    );
    unmount();
  });
});
