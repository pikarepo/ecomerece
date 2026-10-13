import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { TreeView } from '../components/navigation/TreeView';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

const nodes = [
  {
    id: 'a',
    label: 'Animals',
    children: [
      { id: 'a1', label: 'Cat' },
      { id: 'a2', label: 'Dog' },
    ],
  },
  { id: 'b', label: 'Plants' },
];

describe('TreeView', () => {
  test('renders a tree with top-level nodes', () => {
    const { container, unmount } = render(createElement(TreeView, { nodes, selected: null }));
    expect(container.querySelector('[role="tree"]')).not.toBeNull();
    expect(container.querySelectorAll('[role="treeitem"]')).toHaveLength(2);
    unmount();
  });

  test('children hidden by default; clicking a parent expands it', () => {
    const { container, unmount } = render(createElement(TreeView, { nodes, selected: null }));
    expect(container.querySelectorAll('[role="treeitem"]')).toHaveLength(2);
    // click the button inside the first treeitem (Animals)
    const btn = container.querySelector('[role="treeitem"] button') as HTMLButtonElement;
    act(() => btn.click());
    // now 2 parents + 2 children
    expect(container.querySelectorAll('[role="treeitem"]')).toHaveLength(4);
    unmount();
  });

  test('defaultExpanded pre-opens nodes', () => {
    const { container, unmount } = render(
      createElement(TreeView, { nodes, selected: null, defaultExpanded: ['a'] }),
    );
    expect(container.querySelectorAll('[role="treeitem"]')).toHaveLength(4);
    unmount();
  });

  test('calls onSelect when a leaf is clicked', () => {
    const calls: string[] = [];
    const { container, unmount } = render(
      createElement(TreeView, {
        nodes,
        selected: null,
        defaultExpanded: ['a'],
        onSelect: (id: string) => calls.push(id),
      }),
    );
    const buttons = container.querySelectorAll('[role="treeitem"] button');
    // buttons[0]=Animals, buttons[1]=Cat, buttons[2]=Dog, buttons[3]=Plants
    act(() => (buttons[1] as HTMLButtonElement).click());
    expect(calls).toEqual(['a1']);
    unmount();
  });

  test('marks the selected node with aria-selected', () => {
    const { container, unmount } = render(
      createElement(TreeView, { nodes, selected: 'b', defaultExpanded: [] }),
    );
    const selected = container.querySelector('[aria-selected="true"]');
    expect(selected).not.toBeNull();
    unmount();
  });
});
