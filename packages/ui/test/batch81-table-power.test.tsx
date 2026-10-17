/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import { useState } from 'react';
import { cycleSort, Table, type TableColumn, type TableSort } from '../components/data/Table';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

type Row = { id: number; name: string; qty: number };
const rows: Row[] = [
  { id: 1, name: 'Alpha', qty: 10 },
  { id: 2, name: 'Beta', qty: 20 },
  { id: 3, name: 'Gamma', qty: 30 },
];
const columns: Array<TableColumn<Row>> = [
  { key: 'name', header: 'Name', cell: (r) => r.name, sortKey: 'name' },
  { key: 'qty', header: 'Qty', cell: (r) => r.qty, sortKey: 'qty', align: 'right' },
];

const ths = (el: HTMLElement) =>
  Array.from(el.querySelectorAll('thead th')) as HTMLTableCellElement[];
const bodyTds = (el: HTMLElement) =>
  Array.from(el.querySelectorAll('tbody td')) as HTMLTableCellElement[];

/** Dispatch a real MouseEvent (fire() builds a bare Event, which lacks shiftKey/clientX). */
function mouse(target: EventTarget, type: string, init: Record<string, unknown> = {}): void {
  const Ctor = (
    globalThis as unknown as { window: { MouseEvent: new (t: string, i?: unknown) => Event } }
  ).window.MouseEvent;
  target.dispatchEvent(new Ctor(type, { bubbles: true, cancelable: true, ...init }));
}

describe('batch 81 — merged cells', () => {
  it('applies colSpan to the header and body cells', () => {
    const cols: Array<TableColumn<Row>> = [
      { key: 'name', header: 'Name', cell: (r) => r.name, colSpan: 2 },
    ];
    const { container } = render(<Table columns={cols} rows={rows} rowKey={(r) => r.id} />);
    expect(ths(container)[0].colSpan).toBe(2);
    expect(bodyTds(container)[0].colSpan).toBe(2);
  });

  it('applies rowSpan to body cells', () => {
    const cols: Array<TableColumn<Row>> = [
      { key: 'name', header: 'Name', cell: (r) => r.name, rowSpan: 2 },
    ];
    const { container } = render(<Table columns={cols} rows={rows} rowKey={(r) => r.id} />);
    expect(bodyTds(container)[0].rowSpan).toBe(2);
  });
});

describe('batch 81 — frozen columns', () => {
  it('pins left and right columns with sticky + offsets', () => {
    const cols: Array<TableColumn<Row>> = [
      { key: 'name', header: 'Name', cell: (r) => r.name, frozen: 'left', width: 100 },
      { key: 'qty', header: 'Qty', cell: (r) => r.qty, frozen: 'right' },
    ];
    const { container } = render(<Table columns={cols} rows={rows} rowKey={(r) => r.id} />);
    const [leftTh, rightTh] = ths(container);
    expect(leftTh.className).toContain('sticky');
    expect(leftTh.className).toContain('left-0');
    expect(leftTh.style.left).toBe('0px');
    expect(rightTh.className).toContain('sticky');
    expect(rightTh.className).toContain('right-0');
    // body cells get an opaque background so content doesn't bleed through
    expect(bodyTds(container)[0].className).toContain('bg-surface-1');
  });

  it('accumulates offsets across multiple left-frozen columns', () => {
    const cols: Array<TableColumn<Row>> = [
      { key: 'name', header: 'Name', cell: (r) => r.name, frozen: 'left', width: 120 },
      { key: 'qty', header: 'Qty', cell: (r) => r.qty, frozen: 'left', width: 80 },
    ];
    const { container } = render(<Table columns={cols} rows={rows} rowKey={(r) => r.id} />);
    const [a, b] = ths(container);
    expect(a.style.left).toBe('0px');
    expect(b.style.left).toBe('120px');
  });
});

describe('batch 81 — resizable columns', () => {
  it('emits a new width while dragging the header handle', () => {
    const sizes: Array<[string, number]> = [];
    const cols: Array<TableColumn<Row>> = [
      { key: 'name', header: 'Name', cell: (r) => r.name, width: 100 },
      { key: 'qty', header: 'Qty', cell: (r) => r.qty },
    ];
    const { container } = render(
      <Table
        columns={cols}
        rows={rows}
        rowKey={(r) => r.id}
        resizable
        onResize={(k, w) => sizes.push([k, w])}
      />,
    );
    const handle = container.querySelector('[data-testid="resize-name"]') as HTMLElement;
    expect(handle).not.toBeNull();
    act(() => mouse(handle, 'pointerdown', { clientX: 100 }));
    act(() => mouse(window, 'pointermove', { clientX: 160 }));
    expect(sizes.at(-1)).toEqual(['name', 160]);
    // width is applied to the header cell
    expect(ths(container)[0].style.width).toBe('160px');
  });

  it('clamps the width to a minimum', () => {
    const sizes: number[] = [];
    const cols: Array<TableColumn<Row>> = [
      { key: 'name', header: 'Name', cell: (r) => r.name, width: 100 },
    ];
    const { container } = render(
      <Table
        columns={cols}
        rows={rows}
        rowKey={(r) => r.id}
        resizable
        onResize={(_k, w) => sizes.push(w)}
      />,
    );
    const handle = container.querySelector('[data-testid="resize-name"]') as HTMLElement;
    act(() => mouse(handle, 'pointerdown', { clientX: 100 }));
    act(() => mouse(window, 'pointermove', { clientX: 0 }));
    expect(sizes.at(-1)).toBe(48);
  });
});

describe('batch 81 — reorderable rows', () => {
  it('reorders by dragging a row onto another', () => {
    const calls: Array<[number, number]> = [];
    const { container } = render(
      <Table
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        reorderable
        onReorder={(f, t) => calls.push([f, t])}
      />,
    );
    const trs = Array.from(container.querySelectorAll('tbody tr')) as HTMLElement[];
    act(() => fire(trs[0], 'dragstart'));
    act(() => fire(trs[2], 'drop'));
    expect(calls[0]).toEqual([0, 2]);
  });

  it('reorders with the keyboard on the grip', () => {
    const calls: Array<[number, number]> = [];
    const { container } = render(
      <Table
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        reorderable
        onReorder={(f, t) => calls.push([f, t])}
      />,
    );
    const grip = container.querySelector('[data-testid="reorder-1"]') as HTMLElement;
    expect(grip.getAttribute('aria-label')).toBe('Drag to reorder');
    act(() => fire(grip, 'keydown', { key: 'ArrowDown' }));
    expect(calls[0]).toEqual([0, 1]);
  });
});

describe('batch 81 — multi-sort', () => {
  function MultiHarness() {
    const [sorts, setSorts] = useState<TableSort[]>([]);
    return (
      <div>
        <span data-testid="sorts">{JSON.stringify(sorts)}</span>
        <Table
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          multiSort
          sorts={sorts}
          onSortsChange={setSorts}
        />
      </div>
    );
  }

  const readSorts = (container: HTMLElement) =>
    JSON.parse(
      container.querySelector('[data-testid="sorts"]')?.textContent ?? '[]',
    ) as TableSort[];

  it('appends a second clause on shift-click and ranks the columns', () => {
    const { container } = render(<MultiHarness />);
    const buttons = Array.from(container.querySelectorAll('th button')) as HTMLButtonElement[];
    act(() => mouse(buttons[0], 'click'));
    expect(readSorts(container)).toEqual([{ key: 'name', direction: 'asc' }]);
    act(() => mouse(buttons[1], 'click', { shiftKey: true }));
    expect(readSorts(container)).toEqual([
      { key: 'name', direction: 'asc' },
      { key: 'qty', direction: 'asc' },
    ]);
    // rank badges render for both clauses
    expect(buttons[0].textContent).toContain('1');
    expect(buttons[1].textContent).toContain('2');
  });

  it('cycles a plain click asc → desc → removed', () => {
    const { container } = render(<MultiHarness />);
    const buttons = Array.from(container.querySelectorAll('th button')) as HTMLButtonElement[];
    act(() => mouse(buttons[0], 'click'));
    act(() => mouse(buttons[0], 'click'));
    expect(readSorts(container)).toEqual([{ key: 'name', direction: 'desc' }]);
    act(() => mouse(buttons[0], 'click'));
    expect(readSorts(container)).toEqual([]);
  });

  it('removes a clause on a second shift-click', () => {
    const { container } = render(<MultiHarness />);
    const buttons = Array.from(container.querySelectorAll('th button')) as HTMLButtonElement[];
    act(() => mouse(buttons[1], 'click', { shiftKey: true }));
    expect(readSorts(container)).toEqual([{ key: 'qty', direction: 'asc' }]);
    act(() => mouse(buttons[1], 'click', { shiftKey: true }));
    expect(readSorts(container)).toEqual([{ key: 'qty', direction: 'desc' }]);
    act(() => mouse(buttons[1], 'click', { shiftKey: true }));
    expect(readSorts(container)).toEqual([]);
  });

  it('cycles a clause asc → desc → removed (pure helper)', () => {
    expect(cycleSort([], 'name', false)).toEqual([{ key: 'name', direction: 'asc' }]);
    expect(cycleSort([{ key: 'name', direction: 'asc' }], 'name', false)).toEqual([
      { key: 'name', direction: 'desc' },
    ]);
    expect(cycleSort([{ key: 'name', direction: 'desc' }], 'name', false)).toEqual([]);
    // append toggles just that key, leaving the others alone
    expect(cycleSort([{ key: 'name', direction: 'asc' }], 'qty', true)).toEqual([
      { key: 'name', direction: 'asc' },
      { key: 'qty', direction: 'asc' },
    ]);
    expect(cycleSort([{ key: 'qty', direction: 'asc' }], 'qty', true)).toEqual([
      { key: 'qty', direction: 'desc' },
    ]);
    expect(cycleSort([{ key: 'qty', direction: 'desc' }], 'qty', true)).toEqual([]);
  });
});

describe('batch 81 — editable cells', () => {
  const editableCols: Array<TableColumn<Row>> = [
    { key: 'name', header: 'Name', cell: (r) => r.name },
    { key: 'qty', header: 'Qty', cell: (r) => String(r.qty), editValue: (r) => String(r.qty) },
  ];

  it('opens an input on click and commits with Enter', () => {
    const edits: Array<[string | number, string, string]> = [];
    const { container } = render(
      <Table
        columns={editableCols}
        rows={rows}
        rowKey={(r) => r.id}
        editable
        onCellEdit={(rk, ck, v) => edits.push([rk, ck, v])}
      />,
    );
    const cell = container.querySelector('[data-testid="cell-1-name"]') as HTMLElement;
    expect(cell.tagName).toBe('BUTTON');
    act(() => fire(cell, 'click'));
    const input = container.querySelector('tbody input[type="text"]') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.value).toBe('Alpha');
    act(() => {
      input.value = 'Alpha Prime';
      fire(input, 'input');
    });
    act(() => fire(input, 'keydown', { key: 'Enter' }));
    expect(edits[0]).toEqual([1, 'name', 'Alpha Prime']);
    expect(container.querySelector('tbody input[type="text"]')).toBeNull();
  });

  it('discards the edit on Escape', () => {
    const edits: Array<unknown> = [];
    const { container } = render(
      <Table
        columns={editableCols}
        rows={rows}
        rowKey={(r) => r.id}
        editable
        onCellEdit={(rk, ck, v) => edits.push([rk, ck, v])}
      />,
    );
    const cell = container.querySelector('[data-testid="cell-2-qty"]') as HTMLElement;
    act(() => fire(cell, 'click'));
    const input = container.querySelector('tbody input[type="text"]') as HTMLInputElement;
    act(() => fire(input, 'keydown', { key: 'Escape' }));
    expect(edits).toEqual([]);
    expect(container.querySelector('tbody input[type="text"]')).toBeNull();
  });

  it('does not make a column editable when editable:false', () => {
    const cols: Array<TableColumn<Row>> = [
      { key: 'name', header: 'Name', cell: (r) => r.name, editable: false },
    ];
    const { container } = render(
      <Table columns={cols} rows={rows} rowKey={(r) => r.id} editable />,
    );
    expect(container.querySelector('[data-testid="cell-1-name"]')).toBeNull();
    expect(bodyTds(container)[0].tagName).not.toBe('BUTTON');
  });
});
