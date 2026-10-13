import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { DatePicker } from '../components/form/DatePicker';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

describe('DatePicker', () => {
  test('shows placeholder when no value selected', () => {
    const { container, unmount } = render(
      createElement(DatePicker, {
        value: null,
        onValueChange: () => {},
        placeholder: 'Pick a date',
      }),
    );
    expect(container.textContent).toContain('Pick a date');
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    unmount();
  });

  test('opens calendar on button click', () => {
    const { container, unmount } = render(
      createElement(DatePicker, { value: null, onValueChange: () => {} }),
    );
    const btn = container.querySelector('button[aria-haspopup="dialog"]') as HTMLButtonElement;
    act(() => btn.click());
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    expect(container.querySelector('[role="grid"]')).not.toBeNull();
    unmount();
  });

  test('selecting a day calls onValueChange with ISO date', () => {
    const calls: Array<string | null> = [];
    const { container, unmount } = render(
      createElement(DatePicker, { value: null, onValueChange: (v) => calls.push(v) }),
    );
    act(() =>
      (container.querySelector('button[aria-haspopup="dialog"]') as HTMLButtonElement).click(),
    );
    // click first numbered day cell
    const dayCells = container.querySelectorAll('[role="gridcell"]');
    expect(dayCells.length).toBeGreaterThan(0);
    act(() => (dayCells[0] as HTMLButtonElement).click());
    expect(calls.length).toBe(1);
    expect(calls[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    unmount();
  });

  test('displays formatted value on the trigger button', () => {
    const { container, unmount } = render(
      createElement(DatePicker, { value: '2025-06-15', onValueChange: () => {} }),
    );
    const btn = container.querySelector('button') as HTMLButtonElement;
    expect(btn.textContent).toContain('2025');
    unmount();
  });

  test('clear button removes the selected value', () => {
    const calls: Array<string | null> = [];
    const { container, unmount } = render(
      createElement(DatePicker, { value: '2025-06-15', onValueChange: (v) => calls.push(v) }),
    );
    act(() =>
      (container.querySelector('button[aria-haspopup="dialog"]') as HTMLButtonElement).click(),
    );
    const clearBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Clear',
    );
    expect(clearBtn).not.toBeUndefined();
    if (clearBtn) act(() => clearBtn.click());
    expect(calls).toContain(null);
    unmount();
  });
});
