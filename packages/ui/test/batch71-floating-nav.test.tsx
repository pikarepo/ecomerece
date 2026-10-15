/** @jsxImportSource react */

import { afterAll, describe, expect, it } from 'bun:test';
import { Dock, FullscreenMenu, Hamburger, OffCanvas, RadialMenu } from '../components/navigation';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

const ICON = <span aria-hidden>•</span>;

describe('batch 71 floating nav', () => {
  it('Dock renders labelled icon buttons with an active page marker', () => {
    let clicks = 0;
    const { container, unmount } = render(
      <Dock
        items={[
          { id: 'home', label: 'Home', icon: ICON, onSelect: () => clicks++ },
          { id: 'search', label: 'Search', icon: ICON, active: true },
          { id: 'cart', label: 'Cart', icon: ICON },
        ]}
      />,
    );
    const nav = container.querySelector('nav');
    expect(nav?.getAttribute('aria-label')).toBe('Dock');
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(3);
    expect(buttons[0].getAttribute('aria-label')).toBe('Home');
    expect(buttons[1].getAttribute('aria-current')).toBe('page');
    expect(buttons[2].getAttribute('aria-current')).toBeNull();
    act(() => fire(buttons[0], 'click'));
    expect(clicks).toBe(1);
    unmount();
  });

  it('RadialMenu hides items until the centre toggle opens it', () => {
    const toggles: boolean[] = [];
    let picks = 0;
    const ui = (open: boolean) => (
      <RadialMenu
        open={open}
        onOpenChange={(next) => toggles.push(next)}
        items={[
          { id: 'a', label: 'Alpha', icon: ICON, onSelect: () => picks++ },
          { id: 'b', label: 'Beta', icon: ICON },
        ]}
      />
    );
    const { container, rerender, unmount } = render(ui(false));
    const toggle = container.querySelector('button[aria-label="Open menu"]') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    const items = container.querySelectorAll(
      'button[aria-label="Alpha"], button[aria-label="Beta"]',
    );
    expect(items.length).toBe(2);
    for (const item of items) {
      expect(item.getAttribute('aria-hidden')).toBe('true');
      expect(item.getAttribute('tabindex')).toBe('-1');
    }
    act(() => fire(toggle, 'click'));
    expect(toggles).toEqual([true]);
    rerender(ui(true));
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    const alpha = container.querySelector('button[aria-label="Alpha"]') as HTMLButtonElement;
    expect(alpha.getAttribute('aria-hidden')).toBe('false');
    expect(alpha.getAttribute('tabindex')).toBe('0');
    act(() => fire(alpha, 'click'));
    expect(picks).toBe(1);
    expect(toggles).toEqual([true, false]);
    unmount();
  });

  it('Hamburger reports the next open state on activation', () => {
    const seen: boolean[] = [];
    const { container, unmount } = render(
      <Hamburger open={false} onOpenChange={(next) => seen.push(next)} label="Open navigation" />,
    );
    const btn = container.querySelector('button') as HTMLButtonElement;
    expect(btn.getAttribute('aria-label')).toBe('Open navigation');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    act(() => fire(btn, 'click'));
    expect(seen).toEqual([true]);
    unmount();
  });

  it('OffCanvas closes on scrim click and on Escape', () => {
    let closed = 0;
    const { unmount } = render(
      <OffCanvas open onClose={() => closed++} title="Filters">
        <p>Panel body</p>
      </OffCanvas>,
    );
    // Portal renders into document.body.
    const aside = document.body.querySelector('aside') as HTMLElement;
    expect(aside.getAttribute('aria-label')).toBe('Filters');
    expect(aside.textContent).toContain('Panel body');
    const scrim = aside.parentElement as HTMLElement;
    act(() => fire(scrim, 'click'));
    expect(closed).toBe(1);
    act(() => fire(scrim, 'keydown', { key: 'Escape' }));
    expect(closed).toBe(2);
    // Closed → nothing mounted.
    unmount();
    const { unmount: unmountClosed, container: closedBox } = render(
      <OffCanvas open={false} onClose={() => {}}>
        <p>hidden</p>
      </OffCanvas>,
    );
    expect(closedBox.querySelector('aside')).toBeNull();
    expect(document.body.querySelector('aside')).toBeNull();
    unmountClosed();
  });

  it('FullscreenMenu is a modal dialog with staggered fx-menu-item links', () => {
    const picks: string[] = [];
    let closed = 0;
    const { unmount } = render(
      <FullscreenMenu
        open
        onClose={() => closed++}
        header="Acme"
        items={[
          { id: 'shop', label: 'Shop', onSelect: () => picks.push('shop') },
          { id: 'about', label: 'About' },
        ]}
      />,
    );
    const dialog = document.body.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    const links = dialog.querySelectorAll('nav a') as NodeListOf<HTMLAnchorElement>;
    expect(links.length).toBe(2);
    expect(links[0].className).toContain('fx-menu-item');
    expect(links[0].style.animationDelay).toBe('0ms');
    expect(links[1].style.animationDelay).toBe('40ms');
    act(() => fire(links[0], 'click'));
    expect(picks).toEqual(['shop']);
    expect(closed).toBe(1);
    const closeBtn = dialog.querySelector('button[aria-label="Close menu"]') as HTMLButtonElement;
    act(() => fire(closeBtn, 'click'));
    expect(closed).toBe(2);
    unmount();
    // Closed → no dialog in the DOM.
    const { unmount: off } = render(<FullscreenMenu open={false} onClose={() => {}} items={[]} />);
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();
    off();
  });
});
