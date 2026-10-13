import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { NumberInput } from '../components/controls/NumberInput';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

function button(container: HTMLElement, label: string): HTMLButtonElement {
  const el = container.querySelector(`button[aria-label="${label}"]`);
  if (!el) throw new Error(`no ${label} button`);
  return el as HTMLButtonElement;
}

describe('NumberInput', () => {
  test('shows the current value on a spinbutton', () => {
    const { container, unmount } = render(
      createElement(NumberInput, { value: 7, onValueChange: () => {} }),
    );
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('role')).toBe('spinbutton');
    expect(input.value).toBe('7');
    expect(input.getAttribute('aria-valuenow')).toBe('7');
    unmount();
  });

  test('the stepper buttons emit value ± step', () => {
    const calls: number[] = [];
    const { container, unmount } = render(
      createElement(NumberInput, {
        value: 5,
        step: 2,
        onValueChange: (v: number) => calls.push(v),
      }),
    );
    act(() => fire(button(container, 'Increase'), 'click'));
    act(() => fire(button(container, 'Decrease'), 'click'));
    expect(calls).toEqual([7, 3]);
    unmount();
  });

  test('clamps to max and disables the increase button at the bound', () => {
    const calls: number[] = [];
    const { container, unmount } = render(
      createElement(NumberInput, {
        value: 4,
        max: 5,
        step: 2,
        onValueChange: (v: number) => calls.push(v),
      }),
    );
    act(() => fire(button(container, 'Increase'), 'click'));
    expect(calls).toEqual([5]);

    const bounded = render(
      createElement(NumberInput, { value: 5, max: 5, onValueChange: () => {} }),
    );
    expect(button(bounded.container, 'Increase').disabled).toBe(true);
    unmount();
    bounded.unmount();
  });

  test('disabled disables both steppers and the field', () => {
    const { container, unmount } = render(
      createElement(NumberInput, { value: 1, disabled: true, onValueChange: () => {} }),
    );
    expect(button(container, 'Increase').disabled).toBe(true);
    expect(button(container, 'Decrease').disabled).toBe(true);
    expect((container.querySelector('input') as HTMLInputElement).disabled).toBe(true);
    unmount();
  });
});
