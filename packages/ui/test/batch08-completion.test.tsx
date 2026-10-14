/** @jsxImportSource react */
import { describe, expect, it } from 'bun:test';
import {
  BatteryIndicator,
  BusinessHours,
  businessStatus,
  ConnectionQuality,
  formatStopwatch,
  GaugeKPI,
  SaveStatus,
  Stopwatch,
  SyncStatus,
  Table,
} from '../components/data';
import { act, fire, registerDom, render } from './_dom';

registerDom();

const text = (el: Element | null) => el?.textContent ?? '';

describe('todo/08 completion — Stopwatch (batch 11)', () => {
  it('formats elapsed time as mm:ss.cc and h:mm:ss.cc', () => {
    expect(formatStopwatch(0)).toBe('00:00.00');
    expect(formatStopwatch(1234)).toBe('00:01.23');
    expect(formatStopwatch(65_000)).toBe('01:05.00');
    expect(formatStopwatch(3_661_000)).toBe('1:01:01.00');
    expect(formatStopwatch(-5)).toBe('00:00.00');
  });

  it('renders the readout and toggles start/pause + reset via controls', async () => {
    const { container } = render(<Stopwatch controls intervalMs={10} />);
    const timer = container.querySelector('[role="timer"]') as HTMLElement;
    expect(timer.textContent).toBe('00:00.00');

    const buttons = () => Array.from(container.querySelectorAll('button'));
    expect(buttons()[0].textContent).toBe('Start');

    // start → wall-clock elapsed advances
    act(() => fire(buttons()[0], 'click'));
    expect(buttons()[0].textContent).toBe('Pause');
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 60));
    });
    expect(timer.textContent).not.toBe('00:00.00');

    // pause → freezes
    act(() => fire(buttons()[0], 'click'));
    expect(buttons()[0].textContent).toBe('Start');
    const frozen = timer.textContent;
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 40));
    });
    expect(timer.textContent).toBe(frozen);

    // reset → back to zero
    act(() => fire(buttons()[1], 'click'));
    expect(timer.textContent).toBe('00:00.00');
  });
});

describe('todo/08 completion — BusinessHours (batch 11)', () => {
  const opts = { open: '09:00', close: '17:00', timezone: 'UTC' } as const;
  // 2026-10-14 is a Wednesday; 2026-10-17 a Saturday.

  it('is open during working hours and reports the closing time', () => {
    const status = businessStatus(new Date('2026-10-14T10:00:00Z'), opts);
    expect(status.open).toBe(true);
    expect(status.next).toBe('closes 5:00 PM');
  });

  it('is closed after hours and opens tomorrow', () => {
    const status = businessStatus(new Date('2026-10-14T18:00:00Z'), opts);
    expect(status.open).toBe(false);
    expect(status.next).toBe('opens tomorrow 9:00 AM');
  });

  it('is closed on weekends until the next workday', () => {
    const status = businessStatus(new Date('2026-10-17T12:00:00Z'), opts);
    expect(status.open).toBe(false);
    expect(status.next).toBe('opens Mon 9:00 AM');
  });

  it('opens today when called before opening time', () => {
    const status = businessStatus(new Date('2026-10-14T07:00:00Z'), opts);
    expect(status.open).toBe(false);
    expect(status.next).toBe('opens today 9:00 AM');
  });

  it('renders open + closed states with labels', () => {
    const open = render(
      <BusinessHours
        open="09:00"
        close="17:00"
        timezone="UTC"
        now={new Date('2026-10-14T10:00:00Z')}
      />,
    );
    expect(text(open.container)).toContain('Open');
    expect(text(open.container)).toContain('closes 5:00 PM');
    open.unmount();

    const closed = render(
      <BusinessHours
        open="09:00"
        close="17:00"
        timezone="UTC"
        now={new Date('2026-10-14T18:00:00Z')}
      />,
    );
    expect(text(closed.container)).toContain('Closed');
    expect(text(closed.container)).toContain('opens tomorrow');
    closed.unmount();
  });
});

describe('todo/08 completion — GaugeKPI (batch 12)', () => {
  it('renders label, readout and a descriptive accessible name', () => {
    const { container } = render(<GaugeKPI label="Health score" value={72} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('role')).toBe('img');
    expect(root.getAttribute('aria-label')).toBe('Health score: 72 of 100');
    expect(text(container)).toContain('72');
    expect(text(container)).toContain('Health score');
    expect(container.querySelector('svg path')).not.toBeNull();
  });

  it('clamps out-of-range values on the arc and honours format', () => {
    const { container } = render(
      <GaugeKPI label="Load" value={150} format={(v) => `${v}%`} hint="of 100" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('aria-label')).toBe('Load: 150% of 100');
    expect(text(container)).toContain('of 100');

    const zero = render(<GaugeKPI label="Empty" value={0} />);
    // value 0 → only the track path, no accent value path
    expect(zero.container.querySelectorAll('svg path').length).toBe(1);
    zero.unmount();
  });
});

describe('todo/08 completion — Table grouped headers (batch 17)', () => {
  it('renders a colgroup header row above the column headers', () => {
    const rows = [{ id: 1, name: 'Ada', role: 'Admin' }];
    const { container } = render(
      <Table
        columns={[
          { key: 'name', header: 'Name', cell: (r) => r.name },
          { key: 'role', header: 'Role', cell: (r) => r.role },
        ]}
        rows={rows}
        rowKey={(r) => r.id}
        columnGroups={[{ label: 'Identity', span: 2 }]}
      />,
    );
    const headRows = container.querySelectorAll('thead tr');
    expect(headRows.length).toBe(2);

    const groupCell = headRows[0].querySelector('th[scope="colgroup"]') as HTMLElement;
    expect(groupCell).not.toBeNull();
    expect(groupCell.getAttribute('colspan')).toBe('2');
    expect(groupCell.textContent).toBe('Identity');

    const columnCells = headRows[1].querySelectorAll('th');
    expect(columnCells.length).toBe(2);
    expect(columnCells[0].textContent).toBe('Name');
    expect(columnCells[1].textContent).toBe('Role');
  });

  it('omits the group row when columnGroups is absent', () => {
    const rows = [{ id: 1, name: 'Ada' }];
    const { container } = render(
      <Table
        columns={[{ key: 'name', header: 'Name', cell: (r) => r.name }]}
        rows={rows}
        rowKey={(r) => r.id}
      />,
    );
    expect(container.querySelectorAll('thead tr').length).toBe(1);
  });
});

describe('todo/08 completion — status family (batch 18)', () => {
  it('SyncStatus shows state text and is a polite status region', () => {
    const { container } = render(<SyncStatus state="syncing" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('role')).toBe('status');
    expect(root.getAttribute('aria-live')).toBe('polite');
    expect(text(container)).toContain('Syncing…');
  });

  it('SaveStatus surfaces the error copy', () => {
    const { container } = render(<SaveStatus state="error" />);
    expect(text(container)).toContain("Couldn't save changes");
    const saved = render(<SaveStatus state="saved" />);
    expect(text(saved.container)).toContain('All changes saved');
    saved.unmount();
  });

  it('ConnectionQuality fills bars per level and labels itself', () => {
    const { container } = render(<ConnectionQuality level="fair" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('aria-label')).toBe('Connection: Fair');
    expect(container.querySelectorAll('.bg-accent').length).toBe(2);

    const offline = render(<ConnectionQuality level="offline" />);
    expect(offline.container.querySelectorAll('.bg-accent').length).toBe(0);
    expect(text(offline.container)).toContain('Offline');
    offline.unmount();
  });

  it('BatteryIndicator clamps, tones by level and exposes the charge', () => {
    const { container } = render(<BatteryIndicator level={15} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('aria-label')).toBe('Battery 15%');
    expect(text(container)).toContain('15%');
    expect(container.querySelector('.bg-red-500')).not.toBeNull();

    const over = render(<BatteryIndicator level={250} charging />);
    expect((over.container.firstElementChild as HTMLElement).getAttribute('aria-label')).toBe(
      'Battery 100%, charging',
    );
    over.unmount();
  });
});
