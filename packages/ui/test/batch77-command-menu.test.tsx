/** @jsxImportSource react */

import { afterAll, describe, expect, it } from 'bun:test';
import { Settings, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import type { CommandGroup, CommandItem } from '../components/navigation';
import { CommandMenu } from '../components/navigation';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

const quickActions: CommandItem[] = [
  { id: 'quick-new-order', label: 'New order', icon: ShoppingBag, shortcut: ['⌘', 'O'] },
];

const groups: CommandGroup[] = [
  {
    id: 'go-to',
    label: 'Go to',
    items: [
      { id: 'dashboard', label: 'Dashboard', keywords: ['home', 'overview'] },
      { id: 'orders', label: 'Orders', keywords: ['purchases'] },
      { id: 'settings', label: 'Settings', icon: Settings, disabled: true },
    ],
  },
];

function dialogEl(): HTMLElement {
  return document.body.querySelector('[role="dialog"]') as HTMLElement;
}

function inputEl(): HTMLInputElement {
  return document.body.querySelector('[role="combobox"]') as HTMLInputElement;
}

function optionEls(): HTMLElement[] {
  return Array.from(document.body.querySelectorAll('[role="option"]')) as HTMLElement[];
}

function optionText(): string[] {
  return optionEls().map((el) => el.textContent ?? '');
}

function type(query: string): void {
  act(() => {
    const el = inputEl();
    el.value = query;
    fire(el, 'input');
  });
}

describe('batch 77 command menu', () => {
  it('renders nothing while closed', () => {
    const { unmount } = render(
      <CommandMenu open={false} onOpenChange={() => {}} groups={groups} />,
    );
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();
    unmount();
  });

  it('is a modal dialog listing quick actions, then recents, then groups', () => {
    const { unmount } = render(
      <CommandMenu
        open
        onOpenChange={() => {}}
        quickActions={quickActions}
        groups={groups}
        recentSearches={['Dark mode']}
        onClearRecentSearches={() => {}}
      />,
    );
    const panel = dialogEl();
    expect(panel.getAttribute('aria-modal')).toBe('true');
    expect(panel.getAttribute('aria-label')).toBe('Command menu');

    const box = inputEl();
    expect(box.getAttribute('role')).toBe('combobox');
    expect(box.getAttribute('aria-expanded')).toBe('true');
    const listbox = panel.querySelector('[role="listbox"]') as HTMLElement;
    expect(box.getAttribute('aria-controls')).toBe(listbox.id);
    expect(box.getAttribute('aria-activedescendant')).toContain('-quick-new-order');

    const texts = optionText();
    expect(texts).toHaveLength(6);
    expect(texts[0]).toContain('New order');
    expect(texts[1]).toContain('Dark mode');
    expect(texts[2]).toContain('Clear recent searches');
    expect(texts[3]).toContain('Dashboard');

    expect(panel.textContent).toContain('Quick actions');
    expect(panel.textContent).toContain('Recent searches');
    expect(panel.textContent).toContain('Go to');
    unmount();
  });

  it('filters live by label and keywords, dropping empty groups', () => {
    const { unmount } = render(
      <CommandMenu
        open
        onOpenChange={() => {}}
        quickActions={quickActions}
        groups={groups}
        recentSearches={['Dark mode']}
      />,
    );
    type('purchases');
    expect(optionText()).toEqual(['Orders']);
    const panelText = dialogEl().textContent ?? '';
    expect(panelText).toContain('Go to');
    expect(panelText).not.toContain('Quick actions');
    expect(panelText).not.toContain('Recent searches');
    expect(panelText).not.toContain('Dark mode');
    unmount();
  });

  it('ArrowDown moves the active option and Enter runs it then closes', () => {
    let selected = 0;
    let closed = 0;
    const wired = groups.map((group) => ({
      ...group,
      items: group.items.map((item) =>
        item.id === 'dashboard' ? { ...item, onSelect: () => selected++ } : item,
      ),
    }));
    const { unmount } = render(
      <CommandMenu
        open
        onOpenChange={(next) => {
          if (!next) closed++;
        }}
        quickActions={quickActions}
        groups={wired}
      />,
    );
    expect(inputEl().getAttribute('aria-activedescendant')).toContain('-quick-new-order');

    act(() => fire(inputEl(), 'keydown', { key: 'ArrowDown' }));
    expect(inputEl().getAttribute('aria-activedescendant')).toContain('-dashboard');
    const activeOption = document.body.querySelector(
      '[role="option"][aria-selected="true"]',
    ) as HTMLElement;
    expect(activeOption.id).toContain('-dashboard');

    act(() => fire(inputEl(), 'keydown', { key: 'Enter' }));
    expect(selected).toBe(1);
    expect(closed).toBe(1);
    unmount();
  });

  it('Enter with no active result submits the trimmed query as free text', () => {
    const submits: string[] = [];
    let closed = 0;
    const { unmount } = render(
      <CommandMenu
        open
        onOpenChange={(next) => {
          if (!next) closed++;
        }}
        groups={groups}
        onSubmitQuery={(search) => submits.push(search)}
        emptyText="Nothing found"
      />,
    );
    type('  zzz  ');
    expect(dialogEl().textContent).toContain('Nothing found');
    act(() => fire(inputEl(), 'keydown', { key: 'Enter' }));
    expect(submits).toEqual(['zzz']);
    expect(closed).toBe(1);
    unmount();
  });

  it('Escape dismisses the palette from anywhere on the page', () => {
    function Harness() {
      const [open, setOpen] = useState(true);
      return <CommandMenu open={open} onOpenChange={setOpen} groups={groups} />;
    }
    const { unmount } = render(<Harness />);
    expect(dialogEl()).not.toBeNull();
    act(() => fire(document, 'keydown', { key: 'Escape' }));
    expect(dialogEl()).toBeNull();
    unmount();
  });

  it('an outside mousedown dismisses the palette', () => {
    function Harness() {
      const [open, setOpen] = useState(true);
      return <CommandMenu open={open} onOpenChange={setOpen} groups={groups} />;
    }
    const { unmount } = render(<Harness />);
    expect(dialogEl()).not.toBeNull();
    act(() => fire(document.body, 'mousedown'));
    expect(dialogEl()).toBeNull();
    unmount();
  });

  it('shows recent searches only while the query is empty', () => {
    const { unmount } = render(
      <CommandMenu open onOpenChange={() => {}} groups={groups} recentSearches={['Dark mode']} />,
    );
    expect(dialogEl().textContent).toContain('Dark mode');
    type('dashboard');
    expect(dialogEl().textContent).not.toContain('Dark mode');
    type('');
    expect(dialogEl().textContent).toContain('Dark mode');
    unmount();
  });

  it('clearing recent searches runs the handler and keeps the palette open', () => {
    let closed = 0;
    function Harness() {
      const [recent, setRecent] = useState(['Dark mode']);
      return (
        <CommandMenu
          open
          onOpenChange={(next) => {
            if (!next) closed++;
          }}
          groups={groups}
          recentSearches={recent}
          onClearRecentSearches={() => setRecent([])}
        />
      );
    }
    const { unmount } = render(<Harness />);
    const clear = optionEls().find((el) =>
      (el.textContent ?? '').includes('Clear recent searches'),
    );
    expect(clear).toBeDefined();
    act(() => fire(clear as HTMLElement, 'click'));
    expect(closed).toBe(0);
    expect(dialogEl()).not.toBeNull();
    expect(dialogEl().textContent).not.toContain('Recent searches');
    unmount();
  });

  it('ignores pointer and keyboard selection on disabled items', () => {
    let hit = 0;
    let closed = 0;
    const wired = groups.map((group) => ({
      ...group,
      items: group.items.map((item) =>
        item.id === 'settings' ? { ...item, onSelect: () => hit++ } : item,
      ),
    }));
    const { unmount } = render(
      <CommandMenu
        open
        onOpenChange={(next) => {
          if (!next) closed++;
        }}
        quickActions={quickActions}
        groups={wired}
      />,
    );
    const settings = optionEls().find((el) => el.id.endsWith('-settings')) as HTMLElement;
    expect(settings.getAttribute('aria-disabled')).toBe('true');
    act(() => fire(settings, 'click'));
    expect(hit).toBe(0);

    act(() => fire(inputEl(), 'keydown', { key: 'ArrowDown' }));
    act(() => fire(inputEl(), 'keydown', { key: 'ArrowDown' }));
    act(() => fire(inputEl(), 'keydown', { key: 'ArrowDown' }));
    expect(inputEl().getAttribute('aria-activedescendant')).toContain('-settings');
    act(() => fire(inputEl(), 'keydown', { key: 'Enter' }));
    expect(hit).toBe(0);
    expect(closed).toBe(0);
    unmount();
  });

  it('spells out keyboard hints in the footer and shortcuts on the item', () => {
    const { unmount } = render(
      <CommandMenu open onOpenChange={() => {}} quickActions={quickActions} groups={groups} />,
    );
    const panel = dialogEl();
    const hintBar = panel.querySelector('.border-t') as HTMLElement;
    expect(hintBar.textContent).toContain('Navigate');
    expect(hintBar.textContent).toContain('Select');
    expect(hintBar.textContent).toContain('Close');
    expect(hintBar.querySelectorAll('kbd').length).toBe(4);

    const first = optionEls()[0] as HTMLElement;
    expect(first.getAttribute('aria-keyshortcuts')).toBe('Meta+O');
    const chips = Array.from(first.querySelectorAll('kbd')).map((chip) => chip.textContent);
    expect(chips).toEqual(['⌘', 'O']);
    unmount();
  });
});
