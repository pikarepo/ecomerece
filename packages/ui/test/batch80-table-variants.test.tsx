/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import { useState } from 'react';
import { Table, type TableColumn } from '../components/data/Table';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

type Row = { id: number; name: string; qty: number; children?: Row[] };
const rows: Row[] = [
  { id: 1, name: 'Alpha', qty: 10 },
  { id: 2, name: 'Beta', qty: 20 },
  { id: 3, name: 'Gamma', qty: 30 },
];
const columns: Array<TableColumn<Row>> = [
  { key: 'name', header: 'Name', cell: (r) => r.name },
  { key: 'qty', header: 'Qty', cell: (r) => r.qty, align: 'right' },
];

const trs = (el: HTMLElement) =>
  Array.from(el.querySelectorAll('tbody tr')) as HTMLTableRowElement[];
const tds = (tr: HTMLTableRowElement) => Array.from(tr.querySelectorAll('td')) as HTMLElement[];
const expandButtons = (el: HTMLElement) =>
  Array.from(el.querySelectorAll('button[aria-expanded]')) as HTMLButtonElement[];

describe('batch 80 table variants', () => {
  it('stripes alternating body rows', () => {
    const { container } = render(
      <Table columns={columns} rows={rows} rowKey={(r) => r.id} striped />,
    );
    const body = trs(container);
    expect(body[0].className).not.toContain('bg-surface-2/40');
    expect(body[1].className).toContain('bg-surface-2/40');
    expect(body[2].className).not.toContain('bg-surface-2/40');
  });

  it('does not stripe a selected row', () => {
    const { container } = render(
      <Table
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        striped
        selectedKeys={[2]}
        onSelectedKeysChange={() => {}}
      />,
    );
    expect(trs(container)[1].className).not.toContain('bg-surface-2/40');
    expect(trs(container)[1].className).toContain('bg-accent/5');
  });

  it('borders the table and every cell', () => {
    const { container } = render(
      <Table columns={columns} rows={rows} rowKey={(r) => r.id} bordered />,
    );
    expect(container.querySelector('table')?.className).toContain('border');
    expect(tds(trs(container)[0])[0].className).toContain('border-r');
    expect((container.querySelector('th') as HTMLElement).className).toContain('border-r');
  });

  it('renders borderlessly with no chrome or dividers', () => {
    const { container } = render(
      <Table columns={columns} rows={rows} rowKey={(r) => r.id} borderless bordered />,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).not.toContain('mat-card');
    expect(container.querySelector('tbody')?.className).not.toContain('divide-y');
    expect(container.querySelector('table')?.className).not.toContain('border-line/10');
  });

  it('hovers rows even without onRowClick when hoverable', () => {
    const { container } = render(
      <Table columns={columns} rows={rows} rowKey={(r) => r.id} hoverable />,
    );
    expect(trs(container)[0].className).toContain('hover:bg-surface-3');
  });

  it('separates body rows into cards', () => {
    const { container } = render(
      <Table columns={columns} rows={rows} rowKey={(r) => r.id} cardRows />,
    );
    expect(container.querySelector('table')?.className).toContain('border-separate');
    expect(tds(trs(container)[0])[0].className).toContain('bg-surface-2');
  });

  it('stacks rows into label/value cards when responsive=stack', () => {
    const { container } = render(
      <Table columns={columns} rows={rows} rowKey={(r) => r.id} responsive="stack" />,
    );
    expect(container.querySelector('table')?.className).toContain('block md:table');
    expect(container.querySelector('thead')?.className).toContain('hidden md:table-header-group');
    const cell = tds(trs(container)[0])[0];
    expect(cell.className).toContain('flex items-center justify-between');
    const label = Array.from(cell.querySelectorAll('span')).find(
      (s) => s.textContent === 'Name',
    ) as HTMLElement;
    expect(label.className).toContain('md:hidden');
    expect(cell.textContent).toContain('Alpha');
  });

  it('renders a master-detail row and toggles it open', () => {
    const { container } = render(
      <Table
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        renderDetail={(r) => <div data-testid={`detail-${r.id}`}>Detail for {r.name}</div>}
      />,
    );
    expect(container.querySelector('[data-testid="detail-1"]')).toBeNull();
    expect(expandButtons(container)[0].getAttribute('aria-expanded')).toBe('false');
    act(() => fire(expandButtons(container)[0], 'click'));
    expect(container.querySelector('[data-testid="detail-1"]')?.textContent).toContain('Alpha');
    expect(expandButtons(container)[0].getAttribute('aria-expanded')).toBe('true');
    act(() => fire(expandButtons(container)[0], 'click'));
    expect(container.querySelector('[data-testid="detail-1"]')).toBeNull();
  });

  it('honours defaultExpandedKeys for master-detail', () => {
    const { container } = render(
      <Table
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        defaultExpandedKeys={[2]}
        renderDetail={(r) => <div data-testid={`detail-${r.id}`}>{r.name}</div>}
      />,
    );
    expect(container.querySelector('[data-testid="detail-2"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="detail-1"]')).toBeNull();
  });

  it('reports expanded keys when controlled', () => {
    const calls: Array<Array<string | number>> = [];
    const { container } = render(
      <Table
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        expandedKeys={[]}
        onExpandedKeysChange={(keys) => calls.push(keys)}
        renderDetail={(r) => <div>{r.name}</div>}
      />,
    );
    act(() => fire(expandButtons(container)[1], 'click'));
    expect(calls[0]).toEqual([2]);
  });

  it('does not trigger row clicks from the expand toggle', () => {
    const clicked: number[] = [];
    const { container } = render(
      <Table
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        onRowClick={(r) => clicked.push(r.id)}
        renderDetail={(r) => <div>{r.name}</div>}
      />,
    );
    act(() => fire(expandButtons(container)[0], 'click'));
    expect(clicked).toEqual([]);
  });

  it('renders nested rows indented and revealed on expand', () => {
    const tree: Row[] = [
      { id: 1, name: 'Root', qty: 1 },
      { id: 2, name: 'Other', qty: 2 },
    ];
    const sub: Row[] = [
      { id: 10, name: 'Child A', qty: 5 },
      { id: 11, name: 'Child B', qty: 6 },
    ];
    const { container } = render(
      <Table
        columns={columns}
        rows={tree}
        rowKey={(r) => r.id}
        getSubRows={(r) => (r.id === 1 ? sub : undefined)}
      />,
    );
    expect(container.textContent).not.toContain('Child A');
    expect(expandButtons(container).length).toBe(1);
    act(() => fire(expandButtons(container)[0], 'click'));
    expect(container.textContent).toContain('Child A');
    expect(container.textContent).toContain('Child B');
    const childRow = trs(container).find((tr) =>
      tr.textContent?.includes('Child A'),
    ) as HTMLTableRowElement;
    const childToggleCell = tds(childRow)[0];
    expect(childToggleCell.style.paddingLeft).toBe('16px');
  });

  it('hides select and expand controls when stacking on mobile', () => {
    const { container } = render(
      <Table
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        responsive="stack"
        selectedKeys={[]}
        onSelectedKeysChange={() => {}}
        renderDetail={(r) => <div>{r.name}</div>}
      />,
    );
    const firstCell = tds(trs(container)[0])[0];
    expect(firstCell.className).toContain('hidden md:table-cell');
  });

  it('keeps existing behaviour when no variants are set', () => {
    const { container } = render(
      <Table columns={columns} rows={rows} rowKey={(r) => r.id} onRowClick={() => {}} />,
    );
    expect(trs(container).length).toBe(3);
    expect(container.querySelector('table')?.className).toContain('min-w-[640px]');
    expect(trs(container)[0].className).toContain('cursor-pointer');
    expect(trs(container)[0].className).not.toContain('striped');
  });
});

function ControlledHarness() {
  const [keys, setKeys] = useState<Array<string | number>>([]);
  return (
    <Table
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      expandedKeys={keys}
      onExpandedKeysChange={setKeys}
      renderDetail={(r) => <div data-testid={`c-${r.id}`}>{r.name}</div>}
    />
  );
}

describe('batch 80 controlled expansion harness', () => {
  it('opens and closes via controlled state', () => {
    const { container } = render(<ControlledHarness />);
    act(() => fire(expandButtons(container)[0], 'click'));
    expect(container.querySelector('[data-testid="c-1"]')).not.toBeNull();
    act(() => fire(expandButtons(container)[0], 'click'));
    expect(container.querySelector('[data-testid="c-1"]')).toBeNull();
  });
});
