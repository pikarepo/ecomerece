/** @jsxImportSource react */

import { afterAll, describe, expect, it } from 'bun:test';
import { Home } from 'lucide-react';
import { AccordionNav, MiniSidebar, MultiLevelSidebar } from '../components/navigation';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

const tree = [
  {
    id: 'mail',
    label: 'Mail',
    children: [
      { id: 'inbox', label: 'Inbox', badge: 3 },
      { id: 'sent', label: 'Sent' },
    ],
  },
  { id: 'settings', label: 'Settings' },
];

const flat = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'orders', label: 'Orders', badge: 2 },
];

describe('batch 74 side-nav variants', () => {
  it('MultiLevelSidebar auto-opens the path to the active leaf', () => {
    const { container, unmount } = render(
      <MultiLevelSidebar items={tree} value="inbox" onChange={() => {}} />,
    );
    const group = container.querySelector('button[aria-expanded]') as HTMLElement;
    expect(group.getAttribute('aria-expanded')).toBe('true');
    expect(group.textContent).toContain('Mail');
    const current = container.querySelector('[aria-current="page"]') as HTMLElement;
    expect(current.textContent).toContain('Inbox');
    // only leaves carry aria-current
    const currents = container.querySelectorAll('[aria-current="page"]');
    expect(currents.length).toBe(1);
    unmount();
  });

  it('MultiLevelSidebar group toggles open/closed and reports leaves', () => {
    let picked = '';
    const { container, unmount } = render(
      <MultiLevelSidebar items={tree} value="settings" onChange={(id) => (picked = id)} />,
    );
    // settings is active, so mail is collapsed
    const group = container.querySelector('button[aria-expanded]') as HTMLElement;
    expect(group.getAttribute('aria-expanded')).toBe('false');
    act(() => fire(group, 'click'));
    expect(group.getAttribute('aria-expanded')).toBe('true');
    const sent = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Sent'),
    ) as HTMLElement;
    act(() => fire(sent, 'click'));
    expect(picked).toBe('sent');
    unmount();
  });

  it('MultiLevelSidebar honours controlled expanded + disabled items', () => {
    const { container, unmount } = render(
      <MultiLevelSidebar
        items={[{ id: 'g', label: 'Group', children: [{ id: 'x', label: 'X', disabled: true }] }]}
        value="none"
        onChange={() => {}}
        expanded={['g']}
        onExpandedChange={() => {}}
      />,
    );
    const leaf = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('X'),
    ) as HTMLButtonElement;
    expect(leaf.disabled).toBe(true);
    unmount();
  });

  it('MiniSidebar collapses to icon-only (aria-label + title tooltip)', () => {
    const { container, unmount } = render(
      <MiniSidebar items={flat} value="home" onChange={() => {}} />,
    );
    expect(container.textContent).toContain('Home');
    const toggle = container.querySelector('button[aria-label="Toggle sidebar"]') as HTMLElement;
    act(() => fire(toggle, 'click'));
    // collapsed: labels hidden, item keeps an accessible name
    const item = container.querySelector('button[aria-label="Home"]') as HTMLElement;
    expect(item).not.toBeNull();
    expect(item.getAttribute('title')).toBe('Home');
    expect(container.textContent).not.toContain('Orders');
    unmount();
  });

  it('MiniSidebar reports selection and marks the active row', () => {
    let picked = '';
    const { container, unmount } = render(
      <MiniSidebar items={flat} value="home" onChange={(id) => (picked = id)} />,
    );
    const orders = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Orders'),
    ) as HTMLElement;
    act(() => fire(orders, 'click'));
    expect(picked).toBe('orders');
    expect(container.querySelector('[aria-current="page"]')?.textContent).toContain('Home');
    unmount();
  });

  it('AccordionNav toggles groups and marks the active item', () => {
    let picked = '';
    const { container, unmount } = render(
      <AccordionNav
        groups={[
          {
            id: 'g1',
            label: 'Group 1',
            items: [
              { id: 'a1', label: 'A1' },
              { id: 'a2', label: 'A2' },
            ],
          },
          { id: 'g2', label: 'Group 2', items: [{ id: 'b1', label: 'B1' }] },
        ]}
        value="a1"
        onChange={(id) => (picked = id)}
      />,
    );
    const nav = container.querySelector('nav') as HTMLElement;
    expect(nav.getAttribute('aria-label')).toBe('Section navigation');
    const headers = Array.from(
      container.querySelectorAll('button[aria-expanded]'),
    ) as HTMLElement[];
    expect(headers.length).toBe(2);
    expect(headers[0].getAttribute('aria-expanded')).toBe('false');
    act(() => fire(headers[0], 'click'));
    expect(headers[0].getAttribute('aria-expanded')).toBe('true');
    const a2 = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('A2'),
    ) as HTMLElement;
    act(() => fire(a2, 'click'));
    expect(picked).toBe('a2');
    unmount();
  });

  it('AccordionNav single-open closes the previous group (allowMultiple off)', () => {
    const { container, unmount } = render(
      <AccordionNav
        groups={[
          { id: 'g1', label: 'Group 1', items: [{ id: 'a1', label: 'A1' }] },
          { id: 'g2', label: 'Group 2', items: [{ id: 'b1', label: 'B1' }] },
        ]}
        value="none"
        onChange={() => {}}
        defaultOpen={['g1']}
      />,
    );
    const headers = Array.from(
      container.querySelectorAll('button[aria-expanded]'),
    ) as HTMLElement[];
    expect(headers[0].getAttribute('aria-expanded')).toBe('true');
    act(() => fire(headers[1], 'click'));
    expect(headers[0].getAttribute('aria-expanded')).toBe('false');
    expect(headers[1].getAttribute('aria-expanded')).toBe('true');
    unmount();
  });

  it('AccordionNav respects allowMultiple and disabled items', () => {
    const { container, unmount } = render(
      <AccordionNav
        groups={[
          { id: 'g1', label: 'Group 1', items: [{ id: 'a1', label: 'A1' }] },
          {
            id: 'g2',
            label: 'Group 2',
            items: [{ id: 'b1', label: 'B1', disabled: true }],
          },
        ]}
        value="none"
        onChange={() => {}}
        allowMultiple
        defaultOpen={['g1', 'g2']}
      />,
    );
    const headers = Array.from(
      container.querySelectorAll('button[aria-expanded]'),
    ) as HTMLElement[];
    expect(headers[0].getAttribute('aria-expanded')).toBe('true');
    expect(headers[1].getAttribute('aria-expanded')).toBe('true');
    const b1 = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('B1'),
    ) as HTMLButtonElement;
    expect(b1.disabled).toBe(true);
    unmount();
  });
});
