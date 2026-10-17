/** @jsxImportSource react */
import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import {
  AlphabetIndexList,
  ChatList,
  ChecklistList,
  ContactList,
  InfiniteList,
  NestedList,
  NotificationList,
  PlaylistList,
  ReorderableList,
  SearchResults,
  StickyHeaderList,
  SwipeList,
  TodoList,
} from '../components/list/Lists';
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

describe('ChatList', () => {
  test('renders conversations with time and unread count', () => {
    let selected = '';
    const { container, unmount } = render(
      createElement(ChatList, {
        messages: [
          { id: 'a', name: 'Ada', message: 'Ship it?', time: '2m', unread: 3 },
          { id: 'b', name: 'Alan', message: 'On it', time: '1h' },
        ],
        onSelect: (id: string) => {
          selected = id;
        },
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Ada');
    expect(text).toContain('Ship it?');
    expect(text).toContain('2m');
    expect(text).toContain('3');
    const first = container.querySelector('button') as HTMLButtonElement;
    act(() => fire(first, 'click'));
    expect(selected).toBe('a');
    unmount();
  });
});

describe('ContactList', () => {
  test('renders contacts with mail links', () => {
    let selected = '';
    const { container, unmount } = render(
      createElement(ContactList, {
        contacts: [{ id: 'c1', name: 'Ada', subtitle: 'Eng', email: 'ada@example.com' }],
        onSelect: (id: string) => {
          selected = id;
        },
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Ada');
    expect(text).toContain('Eng');
    expect(container.querySelector('a[href="mailto:ada@example.com"]')).not.toBeNull();
    const name = container.querySelector('button') as HTMLButtonElement;
    act(() => fire(name, 'click'));
    expect(selected).toBe('c1');
    unmount();
  });
});

describe('NotificationList', () => {
  test('renders notifications with unread marker', () => {
    let selected = '';
    const { container, unmount } = render(
      createElement(NotificationList, {
        items: [
          { id: 'n1', title: 'Deploy done', description: 'All green', time: '1m', unread: true },
        ],
        onSelect: (id: string) => {
          selected = id;
        },
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Deploy done');
    expect(text).toContain('All green');
    expect(container.querySelector('[aria-label="unread"]')).not.toBeNull();
    const button = container.querySelector('button') as HTMLButtonElement;
    act(() => fire(button, 'click'));
    expect(selected).toBe('n1');
    unmount();
  });
});

describe('ChecklistList', () => {
  test('toggles a checklist item', () => {
    let toggled = '';
    const { container, unmount } = render(
      createElement(ChecklistList, {
        items: [
          { id: 'k1', label: 'Buy milk', done: false },
          { id: 'k2', label: 'Walk dog', done: true },
        ],
        onToggle: (id: string) => {
          toggled = id;
        },
      }),
    );
    expect(container.textContent).toContain('Buy milk');
    const first = container.querySelector('input') as HTMLInputElement;
    act(() => mouse(first, 'click'));
    expect(toggled).toBe('k1');
    unmount();
  });
});

describe('TodoList', () => {
  test('shows priority, due and toggles done', () => {
    let toggled = '';
    let added = 0;
    const { container, unmount } = render(
      createElement(TodoList, {
        items: [{ id: 't1', label: 'Review PR', priority: 'high', due: 'Today', done: false }],
        onToggle: (id: string) => {
          toggled = id;
        },
        onAdd: () => {
          added += 1;
        },
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Review PR');
    expect(text).toContain('high');
    expect(text).toContain('Today');
    const toggle = container.querySelector('[aria-pressed]') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    act(() => fire(toggle, 'click'));
    expect(toggled).toBe('t1');
    const add = Array.from(container.querySelectorAll('button')).at(-1) as HTMLButtonElement;
    act(() => fire(add, 'click'));
    expect(added).toBe(1);
    unmount();
  });
});

describe('PlaylistList', () => {
  test('renders tracks with now-playing indicator', () => {
    let selected = '';
    const { container, unmount } = render(
      createElement(PlaylistList, {
        tracks: [
          { id: 's1', title: 'Intro', artist: 'Rivers', duration: '1:02', playing: true },
          { id: 's2', title: 'Deep Dive', artist: 'Rivers', duration: '3:44' },
        ],
        onSelect: (id: string) => {
          selected = id;
        },
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Intro');
    expect(text).toContain('Rivers');
    expect(text).toContain('3:44');
    const first = container.querySelector('button') as HTMLButtonElement;
    act(() => fire(first, 'click'));
    expect(selected).toBe('s1');
    unmount();
  });
});

describe('SearchResults', () => {
  test('highlights the query and shows type + url', () => {
    let selected = '';
    const { container, unmount } = render(
      createElement(SearchResults, {
        query: 'react',
        items: [
          {
            id: 'r1',
            title: 'React basics',
            snippet: 'Learn react fast',
            url: '/docs/react',
            type: 'Docs',
          },
        ],
        onSelect: (id: string) => {
          selected = id;
        },
      }),
    );
    const marks = container.querySelectorAll('mark');
    expect(marks.length).toBe(2);
    expect(marks[0]?.textContent).toBe('React');
    expect(marks[1]?.textContent).toBe('react');
    expect(container.querySelector('a, span')?.tagName).toBeTruthy();
    const button = container.querySelector('button') as HTMLButtonElement;
    act(() => fire(button, 'click'));
    expect(selected).toBe('r1');
    unmount();
  });
});

describe('StickyHeaderList', () => {
  test('renders sticky group headers', () => {
    const { container, unmount } = render(
      createElement(StickyHeaderList, {
        groups: [
          { label: 'Today', items: [createElement('div', { key: 'a' }, 'Meeting')] },
          { label: 'Later', items: [createElement('div', { key: 'b' }, 'Review')] },
        ],
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Today');
    expect(text).toContain('Meeting');
    expect(text).toContain('Later');
    const headers = container.querySelectorAll('h4');
    expect(headers[0]?.className).toContain('sticky');
    unmount();
  });
});

describe('AlphabetIndexList', () => {
  test('groups by first letter with a jump rail', () => {
    let selected = '';
    const { container, unmount } = render(
      createElement(AlphabetIndexList, {
        items: [
          { id: 'z1', name: 'Zoe' },
          { id: 'a1', name: 'Ada' },
          { id: 'a2', name: 'Alan' },
        ],
        onSelect: (id: string) => {
          selected = id;
        },
      }),
    );
    const headers = Array.from(container.querySelectorAll('h4')).map((h) => h.textContent);
    expect(headers).toEqual(['A', 'Z']);
    expect(container.querySelector('nav[aria-label="Jump to letter"]')).not.toBeNull();
    const ada = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Ada',
    ) as HTMLButtonElement;
    act(() => fire(ada, 'click'));
    expect(selected).toBe('a1');
    unmount();
  });
});

describe('SwipeList', () => {
  test('renders swipe actions and fires complete/delete', () => {
    let completed = '';
    let deleted = '';
    const { container, unmount } = render(
      createElement(SwipeList, {
        items: [{ id: 's1', title: 'Inbox zero', description: '3 left' }],
        onComplete: (id: string) => {
          completed = id;
        },
        onDelete: (id: string) => {
          deleted = id;
        },
      }),
    );
    const complete = container.querySelector(
      '[aria-label="Complete Inbox zero"]',
    ) as HTMLButtonElement;
    const del = container.querySelector('[aria-label="Delete Inbox zero"]') as HTMLButtonElement;
    act(() => fire(complete, 'click'));
    act(() => fire(del, 'click'));
    expect(completed).toBe('s1');
    expect(deleted).toBe('s1');
    unmount();
  });
});

describe('ReorderableList', () => {
  test('moves an item down and reports the new order', () => {
    let order: string[] = [];
    const { container, unmount } = render(
      createElement(ReorderableList, {
        items: [
          { id: 'r1', label: 'Alpha' },
          { id: 'r2', label: 'Beta' },
          { id: 'r3', label: 'Gamma' },
        ],
        onReorder: (next: { id: string; label: string }[]) => {
          order = next.map((n) => n.label);
        },
      }),
    );
    const upButtons = container.querySelectorAll('[aria-label^="Move"]');
    expect(upButtons.length).toBe(6);
    const alphaDown = container.querySelector(
      '[aria-label="Move Alpha down"]',
    ) as HTMLButtonElement;
    expect(alphaDown.disabled).toBe(false);
    act(() => fire(alphaDown, 'click'));
    expect(order).toEqual(['Beta', 'Alpha', 'Gamma']);
    unmount();
  });

  test('disables up on the first row and down on the last', () => {
    const { container, unmount } = render(
      createElement(ReorderableList, {
        items: [
          { id: 'r1', label: 'Only' },
          { id: 'r2', label: 'Two' },
        ],
      }),
    );
    expect(
      (container.querySelector('[aria-label="Move Only up"]') as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(
      (container.querySelector('[aria-label="Move Two down"]') as HTMLButtonElement).disabled,
    ).toBe(true);
    unmount();
  });
});

describe('InfiniteList', () => {
  test('renders items and a load-more control', () => {
    let loads = 0;
    const { container, unmount } = render(
      createElement(InfiniteList, {
        items: [createElement('div', { key: 'a' }, 'Row one')],
        hasMore: true,
        loading: false,
        onLoadMore: () => {
          loads += 1;
        },
      }),
    );
    expect(container.textContent).toContain('Row one');
    const button = container.querySelector('button') as HTMLButtonElement;
    expect(button.textContent).toContain('Load more');
    act(() => fire(button, 'click'));
    expect(loads).toBe(1);
    unmount();
  });

  test('hides the control when there is no more', () => {
    const { container, unmount } = render(
      createElement(InfiniteList, { items: [createElement('div', { key: 'a' }, 'Only')] }),
    );
    expect(container.querySelector('button')).toBeNull();
    unmount();
  });
});

describe('NestedList', () => {
  test('renders nested labels and collapses on toggle', () => {
    const { container, unmount } = render(
      createElement(NestedList, {
        nodes: [
          {
            id: 'n1',
            label: 'Root',
            children: [{ id: 'n2', label: 'Child' }],
          },
        ],
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Root');
    expect(text).toContain('Child');
    const toggle = container.querySelector('[aria-label="Collapse Root"]') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    act(() => fire(toggle, 'click'));
    expect(container.textContent).not.toContain('Child');
    unmount();
  });
});
