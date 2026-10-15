/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import { useState } from 'react';
import {
  DateRangePresets,
  FacetedFilterPanel,
  FilterBuilder,
  SavedViews,
  SortBuilder,
} from '../components/data/FilterBuilder';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

const fields = [
  { id: 'name', label: 'Name' },
  { id: 'date', label: 'Date' },
];

const clickByText = (container: HTMLElement, text: string) =>
  Array.from(container.querySelectorAll('button'))
    .find((b) => b.textContent?.includes(text))
    ?.click();

describe('batch 69 search & filter', () => {
  it('SortBuilder toggles direction and removes rules', () => {
    const changes: { field: string; dir: string }[][] = [];
    const { container, unmount } = render(
      <SortBuilder
        fields={fields}
        value={[{ field: 'name', dir: 'asc' }]}
        onChange={(r) => changes.push(r as never)}
      />,
    );
    act(() =>
      (container.querySelector('[aria-label="Toggle to descending"]') as HTMLButtonElement).click(),
    );
    expect(changes[0]).toEqual([{ field: 'name', dir: 'desc' }]);
    act(() =>
      (container.querySelector('[aria-label="Remove sort 1"]') as HTMLButtonElement).click(),
    );
    expect(changes[1]).toEqual([]);
    unmount();
  });

  it('SortBuilder adds a rule', () => {
    const changes: { field: string; dir: string }[][] = [];
    const { container, unmount } = render(
      <SortBuilder fields={fields} value={[]} onChange={(r) => changes.push(r as never)} />,
    );
    act(() => clickByText(container, 'Add sort'));
    expect(changes[0]).toEqual([{ field: 'name', dir: 'asc' }]);
    unmount();
  });

  it('FilterBuilder adds and edits rows', () => {
    const changes: unknown[] = [];
    const { container, unmount } = render(
      <FilterBuilder fields={fields} value={[]} onChange={(r) => changes.push(r)} />,
    );
    act(() => clickByText(container, 'Add filter'));
    expect(changes[0]).toEqual([{ field: 'name', operator: 'is', value: '' }]);
    unmount();
  });

  it('SavedViews selects and deletes', () => {
    const picked: string[] = [];
    const removed: string[] = [];
    const { container, unmount } = render(
      <SavedViews
        views={[
          { id: 'a', name: 'Active', count: 3 },
          { id: 'b', name: 'Archived' },
        ]}
        activeId="a"
        onSelect={(id) => picked.push(id)}
        onDelete={(id) => removed.push(id)}
      />,
    );
    expect(container.textContent).toContain('Active');
    act(() =>
      (container.querySelector('button[aria-pressed="true"]') as HTMLButtonElement).click(),
    );
    act(() =>
      (container.querySelector('[aria-label="Remove Saved view b"]') as HTMLButtonElement)?.click(),
    );
    expect(picked).toEqual(['a']);
    expect(container.textContent).toContain('Active');
    unmount();
  });

  it('DateRangePresets selects a preset', () => {
    const picked: string[] = [];
    const { container, unmount } = render(
      <DateRangePresets active="7d" onSelect={(p) => picked.push(p)} />,
    );
    act(() => clickByText(container, 'This month'));
    expect(picked).toEqual(['month']);
    unmount();
  });

  it('FacetedFilterPanel toggles facets and clears', () => {
    const changes: Record<string, string[]>[] = [];
    let cleared = false;
    function Harness() {
      const [sel, setSel] = useState<Record<string, string[]>>({});
      return (
        <FacetedFilterPanel
          groups={[
            {
              id: 'status',
              label: 'Status',
              options: [
                { value: 'active', label: 'Active', count: 3 },
                { value: 'archived', label: 'Archived', count: 1 },
              ],
            },
          ]}
          selected={sel}
          onChange={(s) => {
            changes.push(s);
            setSel(s);
          }}
          onClear={() => {
            cleared = true;
            setSel({});
          }}
        />
      );
    }
    const { container, unmount } = render(<Harness />);
    act(() => (container.querySelector('input[type="checkbox"]') as HTMLInputElement).click());
    expect(changes[0]).toEqual({ status: ['active'] });
    act(() => clickByText(container, 'Clear all'));
    expect(cleared).toBe(true);
    unmount();
  });
});
