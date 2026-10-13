import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { Combobox } from '../components/form/Combobox';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

const options = [
  { value: 'br', label: 'Brazil' },
  { value: 'ca', label: 'Canada' },
  { value: 'cn', label: 'China' },
];

function field(container: HTMLElement): HTMLInputElement {
  return container.querySelector('input') as HTMLInputElement;
}

const listbox = (container: HTMLElement) => container.querySelector('[role="listbox"]');

describe('Combobox', () => {
  test('starts closed and shows the selected label', () => {
    const { container, unmount } = render(
      createElement(Combobox, { options, value: 'ca', onValueChange: () => {} }),
    );
    const el = field(container);
    expect(el.getAttribute('role')).toBe('combobox');
    expect(el.getAttribute('aria-expanded')).toBe('false');
    expect(el.value).toBe('Canada');
    expect(listbox(container)).toBeNull();
    unmount();
  });

  test('opens on focus and lists every option', () => {
    const { container, unmount } = render(
      createElement(Combobox, { options, value: null, onValueChange: () => {} }),
    );
    act(() => fire(field(container), 'focusin'));
    expect(field(container).getAttribute('aria-expanded')).toBe('true');
    expect(container.querySelectorAll('[role="option"]')).toHaveLength(3);
    unmount();
  });

  test('filters options by the typed query', () => {
    const { container, unmount } = render(
      createElement(Combobox, { options, value: null, onValueChange: () => {} }),
    );
    const el = field(container);
    act(() => {
      el.value = 'br';
      fire(el, 'input');
    });
    const labels = Array.from(container.querySelectorAll('[role="option"]')).map(
      (option) => option.textContent,
    );
    expect(labels).toEqual(['Brazil']);
    unmount();
  });

  test('ArrowDown moves the active option and Enter selects it', () => {
    const calls: Array<string | null> = [];
    const { container, unmount } = render(
      createElement(Combobox, {
        options,
        value: null,
        onValueChange: (v: string | null) => calls.push(v),
      }),
    );
    const el = field(container);
    act(() => fire(el, 'focusin'));
    act(() => fire(el, 'keydown', { key: 'ArrowDown' }));
    act(() => fire(el, 'keydown', { key: 'Enter' }));
    expect(calls).toEqual(['ca']);
    unmount();
  });

  test('Escape closes the list', () => {
    const { container, unmount } = render(
      createElement(Combobox, { options, value: null, onValueChange: () => {} }),
    );
    const el = field(container);
    act(() => fire(el, 'focusin'));
    expect(listbox(container)).not.toBeNull();
    act(() => fire(el, 'keydown', { key: 'Escape' }));
    expect(listbox(container)).toBeNull();
    unmount();
  });
});
