/** @jsxImportSource react */
import { describe, expect, it } from 'bun:test';
import { useState } from 'react';
import { Table, type TableColumn } from '../components/data/Table';
import { act, fire, registerDom, render } from './_dom';

registerDom();

type Row = { id: number; name: string; qty: number };
const rows: Row[] = [
  { id: 1, name: 'Alpha', qty: 10 },
  { id: 2, name: 'Beta', qty: 20 },
  { id: 3, name: 'Gamma', qty: 30 },
];
const columns: Array<TableColumn<Row>> = [
  { key: 'name', header: 'Name', cell: (r) => r.name, sortKey: 'name' },
  { key: 'qty', header: 'Qty', cell: (r) => r.qty, align: 'right', sortKey: 'qty' },
];

function Harness({
  onSort,
  sort,
}: {
  onSort?: (key: string, dir: 'asc' | 'desc') => void;
  sort?: { key: string; direction: 'asc' | 'desc' };
}) {
  const [keys, setKeys] = useState<Array<string | number>>([]);
  return (
    <div>
      <span data-testid="count">{keys.length}</span>
      <Table
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        selectedKeys={keys}
        onSelectedKeysChange={setKeys}
        bulkBar={(sel, clear) => (
          <button type="button" onClick={clear}>
            {sel.length} selected
          </button>
        )}
        summary={['Total', 60]}
        onSort={onSort}
        sort={sort}
      />
    </div>
  );
}

const boxes = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('input[type="checkbox"]')) as HTMLInputElement[];

describe('batch 17 table add-ons', () => {
  it('selects all rows and shows the bulk bar', () => {
    const { container } = render(<Harness />);
    act(() => fire(boxes(container)[0], 'click'));
    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('3');
    expect(container.textContent).toContain('3 selected');
    const clear = Array.from(container.querySelectorAll('button')).find((b) =>
      (b.textContent ?? '').includes('selected'),
    ) as HTMLButtonElement;
    act(() => fire(clear, 'click'));
    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('0');
  });

  it('toggles a single row with the row checkbox', () => {
    const { container } = render(<Harness />);
    // boxes[0] = header select-all, boxes[1] = first row
    act(() => fire(boxes(container)[1], 'click'));
    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('1');
    expect(boxes(container)[1].checked).toBe(true);
  });

  it('renders a summary row in tfoot', () => {
    const { container } = render(<Harness />);
    const tfoot = container.querySelector('tfoot');
    expect(tfoot?.textContent).toContain('Total');
    expect(tfoot?.textContent).toContain('60');
  });

  it('emits sort direction from header chevrons', () => {
    const calls: Array<[string, string]> = [];
    const { container } = render(<Harness onSort={(k, d) => calls.push([k, d])} />);
    const buttons = Array.from(container.querySelectorAll('th button')) as HTMLButtonElement[];
    act(() => fire(buttons[0], 'click'));
    expect(calls[0]).toEqual(['name', 'asc']);

    // active asc → next click toggles to desc
    const { container: c2 } = render(
      <Harness sort={{ key: 'name', direction: 'asc' }} onSort={(k, d) => calls.push([k, d])} />,
    );
    const b2 = Array.from(c2.querySelectorAll('th button')) as HTMLButtonElement[];
    act(() => fire(b2[0], 'click'));
    expect(calls[calls.length - 1]).toEqual(['name', 'desc']);
  });
});
