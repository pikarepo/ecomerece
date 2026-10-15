/** @jsxImportSource react */

import { afterAll, describe, expect, it } from 'bun:test';
import {
  ClosableTabs,
  DocumentTabs,
  DraggableTabs,
  OverflowTabs,
  StickyTabs,
} from '../components/navigation';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

const tabLabels = (root: HTMLElement) =>
  Array.from(root.querySelectorAll('[role="tab"]')).map((t) => t.textContent);

describe('batch 72 tabs variants', () => {
  it('StickyTabs pins the base tablist in a sticky chrome bar', () => {
    let picked = '';
    const { container, unmount } = render(
      <StickyTabs
        offset={64}
        value="a"
        onChange={(v) => (picked = v)}
        items={[
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' },
        ]}
      />,
    );
    const bar = container.firstElementChild as HTMLElement;
    expect(bar.className).toContain('sticky');
    expect(bar.style.top).toBe('64px');
    expect(bar.querySelector('[role="tablist"]')).not.toBeNull();
    const tabs = container.querySelectorAll('[role="tab"]');
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    act(() => fire(tabs[1], 'click'));
    expect(picked).toBe('b');
    unmount();
  });

  it('ClosableTabs closes via the per-tab button (custom accessible name)', () => {
    const closed: string[] = [];
    const { container, unmount } = render(
      <ClosableTabs
        value="a"
        onChange={() => {}}
        onClose={(v) => closed.push(v)}
        closeLabel="Close tab"
        items={[
          { value: 'a', label: 'Home' },
          { value: 'b', label: 'Docs', closable: false },
        ]}
      />,
    );
    const closeBtns = container.querySelectorAll('button[aria-label="Close tab"]');
    expect(closeBtns.length).toBe(1); // Docs is closable: false
    act(() => fire(closeBtns[0], 'click'));
    expect(closed).toEqual(['a']);
    unmount();
  });

  it('ClosableTabs renames on double-click + Enter, and Escape cancels', () => {
    const renames: string[] = [];
    const { container, unmount } = render(
      <ClosableTabs
        value="a"
        onChange={() => {}}
        onClose={() => {}}
        editable
        onRename={(_v, label) => renames.push(label)}
        items={[
          { value: 'a', label: 'Home' },
          { value: 'b', label: 'Docs' },
        ]}
      />,
    );
    const homeTab = container.querySelectorAll('[role="tab"]')[0];
    act(() => fire(homeTab, 'dblclick'));
    const input = container.querySelector('input[aria-label="Rename Home"]') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.value).toBe('Home');
    act(() => {
      input.value = 'Start';
      fire(input, 'input');
    });
    act(() => fire(input, 'keydown', { key: 'Escape' }));
    expect(renames).toEqual([]); // cancelled
    expect(container.querySelector('input')).toBeNull();

    const homeTab2 = container.querySelectorAll('[role="tab"]')[0];
    act(() => fire(homeTab2, 'dblclick'));
    const input2 = container.querySelector('input[aria-label="Rename Home"]') as HTMLInputElement;
    act(() => {
      input2.value = 'Dashboard';
      fire(input2, 'input');
    });
    act(() => fire(input2, 'keydown', { key: 'Enter' }));
    expect(renames).toEqual(['Dashboard']);
    expect(container.querySelector('input')).toBeNull();
    unmount();
  });

  it('DraggableTabs reorders on drag-drop and reports indices', () => {
    const orders: Array<[number, number]> = [];
    const { container, unmount } = render(
      <DraggableTabs
        value="a"
        onChange={() => {}}
        onReorder={(from, to) => orders.push([from, to])}
        items={[
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' },
          { value: 'c', label: 'Gamma' },
        ]}
      />,
    );
    expect(tabLabels(container)).toEqual(['Alpha', 'Beta', 'Gamma']);
    const alpha = container.querySelectorAll('[role="tab"]')[0];
    const gamma = container.querySelectorAll('[role="tab"]')[2];
    act(() => fire(alpha, 'dragstart'));
    act(() => fire(gamma, 'drop'));
    expect(tabLabels(container)).toEqual(['Beta', 'Gamma', 'Alpha']);
    expect(orders).toEqual([[0, 2]]);
    unmount();
  });

  it('DraggableTabs reorders with Alt+Arrow on the focused tab', () => {
    const orders: Array<[number, number]> = [];
    const { container, unmount } = render(
      <DraggableTabs
        value="a"
        onChange={() => {}}
        onReorder={(from, to) => orders.push([from, to])}
        items={[
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' },
          { value: 'c', label: 'Gamma' },
        ]}
      />,
    );
    const gamma = container.querySelectorAll('[role="tab"]')[2];
    act(() => fire(gamma, 'keydown', { key: 'ArrowLeft', altKey: true }));
    expect(tabLabels(container)).toEqual(['Alpha', 'Gamma', 'Beta']);
    expect(orders).toEqual([[2, 1]]);
    unmount();
  });

  it('OverflowTabs keeps the active tab inline and moves the rest into the More menu', () => {
    let picked = '';
    const { container, unmount } = render(
      <OverflowTabs
        maxVisible={3}
        value="e"
        onChange={(v) => (picked = v)}
        items={[
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' },
          { value: 'c', label: 'Gamma' },
          { value: 'd', label: 'Delta' },
          { value: 'e', label: 'Epsilon' },
        ]}
      />,
    );
    const inline = tabLabels(container);
    expect(inline.length).toBe(3);
    expect(inline).toContain('Epsilon'); // active always visible
    const more = container.querySelector('button[aria-haspopup="menu"]') as HTMLButtonElement;
    expect(more.getAttribute('aria-expanded')).toBe('false');
    act(() => fire(more, 'click'));
    expect(more.getAttribute('aria-expanded')).toBe('true');
    const menuItems = container.querySelectorAll('[role="menuitem"]');
    const menuLabels = Array.from(menuItems).map((m) => m.textContent);
    expect(menuLabels.length).toBe(2);
    expect(menuLabels).toContain('Gamma'); // pushed out of the head
    const gammaItem = Array.from(menuItems).find((m) => m.textContent === 'Gamma');
    act(() => fire(gammaItem as Element, 'click'));
    expect(picked).toBe('c');
    expect(more.getAttribute('aria-expanded')).toBe('false'); // Dropdown closes itself
    unmount();
  });

  it('OverflowTabs renders no More trigger while everything fits', () => {
    const { container, unmount } = render(
      <OverflowTabs
        maxVisible={6}
        value="a"
        onChange={() => {}}
        items={[
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' },
        ]}
      />,
    );
    expect(container.querySelector('button[aria-haspopup="menu"]')).toBeNull();
    expect(tabLabels(container).length).toBe(2);
    unmount();
  });

  it('DocumentTabs renders browser chrome (traffic lights), icons and close buttons', () => {
    const closed: string[] = [];
    const ICON = <span data-testid="ico">📄</span>;
    const { container, unmount } = render(
      <DocumentTabs
        chrome="browser"
        value="a"
        onChange={() => {}}
        onClose={(v) => closed.push(v)}
        items={[
          { value: 'a', label: 'index.ts', icon: ICON },
          { value: 'b', label: 'styles.css' },
        ]}
      />,
    );
    const dots = container.querySelectorAll('span[aria-hidden] > span.rounded-full');
    expect(dots.length).toBe(3);
    const tabs = container.querySelectorAll('[role="tab"]');
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
    const closeBtns = container.querySelectorAll('button[aria-label^="Close "]');
    expect(closeBtns.length).toBe(2);
    act(() => fire(closeBtns[1], 'click'));
    expect(closed).toEqual(['b']);
    unmount();
  });

  it('DocumentTabs workspace chrome wraps icons in a chip', () => {
    const { container, unmount } = render(
      <DocumentTabs
        chrome="workspace"
        value="a"
        onChange={() => {}}
        onClose={() => {}}
        items={[{ value: 'a', label: 'Inbox', icon: <span aria-hidden>✉</span> }]}
      />,
    );
    const tab = container.querySelector('[role="tab"]') as HTMLElement;
    expect(tab.querySelector('.rounded-chip')).not.toBeNull();
    expect(container.querySelectorAll('button[aria-label^="Close "]').length).toBe(1);
    unmount();
  });
});
