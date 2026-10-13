import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { OTP } from '../components/form/OTP';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

function inputs(container: HTMLElement): HTMLInputElement[] {
  return Array.from(container.querySelectorAll('input[type="text"]'));
}

describe('OTP', () => {
  test('renders `length` digit inputs', () => {
    const { container, unmount } = render(
      createElement(OTP, { length: 4, value: '', onValueChange: () => {} }),
    );
    expect(inputs(container)).toHaveLength(4);
    unmount();
  });

  test('fills digits into the correct inputs from value prop', () => {
    const { container, unmount } = render(
      createElement(OTP, { length: 4, value: '1234', onValueChange: () => {} }),
    );
    const boxes = inputs(container);
    expect(boxes[0].value).toBe('1');
    expect(boxes[1].value).toBe('2');
    expect(boxes[2].value).toBe('3');
    expect(boxes[3].value).toBe('4');
    unmount();
  });

  test('renders masked inputs when mask=true', () => {
    const { container, unmount } = render(
      createElement(OTP, { length: 4, value: '1234', onValueChange: () => {}, mask: true }),
    );
    for (const el of inputs(container)) {
      // mask converts input type to 'password', but our component always keeps type="text"
      // and uses the mask prop for masking; let's verify the type is "text" (not password)
      // Actually our impl switches to password when mask=true:
      expect(el.type).toBe('password');
    }
    unmount();
  });

  test('label is rendered and input count matches default length 6', () => {
    const { container, unmount } = render(
      createElement(OTP, { value: '', onValueChange: () => {}, label: 'Enter code' }),
    );
    expect(container.textContent).toContain('Enter code');
    expect(Array.from(container.querySelectorAll('input'))).toHaveLength(6);
    unmount();
  });

  test('typing into the first box updates the displayed digit', () => {
    const calls: string[] = [];
    const { container, unmount } = render(
      createElement(OTP, {
        length: 4,
        value: '',
        onValueChange: (v: string) => calls.push(v),
      }),
    );
    const box0 = inputs(container)[0];
    // Simulate typing '5' into the first cell via onInput
    box0.value = '5';
    act(() => box0.dispatchEvent(new Event('input', { bubbles: true })));
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[calls.length - 1]).toBe('5');
    unmount();
  });
});
