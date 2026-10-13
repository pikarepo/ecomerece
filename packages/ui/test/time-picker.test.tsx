import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { TimePicker } from '../components/form/TimePicker';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

function selects(container: HTMLElement): HTMLSelectElement[] {
  return Array.from(container.querySelectorAll('select'));
}

describe('TimePicker', () => {
  test('renders hour and minute selects in 24h mode', () => {
    const { container, unmount } = render(
      createElement(TimePicker, { value: '14:30', onValueChange: () => {} }),
    );
    const ss = selects(container);
    expect(ss).toHaveLength(2);
    // hour select should show 14, minute 30
    expect(ss[0].value).toBe('14');
    expect(ss[1].value).toBe('30');
    unmount();
  });

  test('renders 3 selects in 12h mode (hour, minute, AM/PM)', () => {
    const { container, unmount } = render(
      createElement(TimePicker, { value: '14:00', onValueChange: () => {}, hour12: true }),
    );
    expect(selects(container)).toHaveLength(3);
    // 14:00 is 2 PM
    const [hour, , ampm] = selects(container);
    expect(hour.value).toBe('2');
    expect(ampm.value).toBe('PM');
    unmount();
  });

  test('changing hour calls onValueChange with updated time', () => {
    const calls: Array<string | null> = [];
    const { container, unmount } = render(
      createElement(TimePicker, { value: '10:15', onValueChange: (v) => calls.push(v) }),
    );
    const hourSel = selects(container)[0];
    hourSel.value = '9';
    act(() => hourSel.dispatchEvent(new Event('input', { bubbles: true })));
    expect(calls[calls.length - 1]).toBe('09:15');
    unmount();
  });

  test('minuteStep controls option granularity', () => {
    const { container, unmount } = render(
      createElement(TimePicker, { value: '00:00', onValueChange: () => {}, minuteStep: 15 }),
    );
    const minuteSel = selects(container)[1];
    const opts = Array.from(minuteSel.options).map((o) => Number(o.value));
    expect(opts).toEqual([0, 15, 30, 45]);
    unmount();
  });

  test('disabled makes all selects disabled', () => {
    const { container, unmount } = render(
      createElement(TimePicker, { value: '00:00', onValueChange: () => {}, disabled: true }),
    );
    for (const s of selects(container)) expect(s.disabled).toBe(true);
    unmount();
  });
});
