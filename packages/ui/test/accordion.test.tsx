import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { Accordion, AccordionItem } from '../components/list/Accordion';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

function headers(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll('button[aria-expanded]'));
}

function tree() {
  return createElement(
    Accordion,
    { type: 'single', defaultOpen: 'a' },
    createElement(AccordionItem, { id: 'a', title: 'First' }, 'Panel A'),
    createElement(AccordionItem, { id: 'b', title: 'Second' }, 'Panel B'),
  );
}

describe('Accordion', () => {
  test('renders defaultOpen and reflects it in aria-expanded', () => {
    const { container, unmount } = render(tree());
    const [first, second] = headers(container);
    expect(first.getAttribute('aria-expanded')).toBe('true');
    expect(second.getAttribute('aria-expanded')).toBe('false');
    expect(container.textContent).toContain('Panel A');
    expect(container.textContent).not.toContain('Panel B');
    unmount();
  });

  test('single type closes the open panel when another opens', () => {
    const { container, unmount } = render(tree());
    const [first, second] = headers(container);
    act(() => fire(second, 'click'));
    expect(first.getAttribute('aria-expanded')).toBe('false');
    expect(second.getAttribute('aria-expanded')).toBe('true');
    expect(container.textContent).toContain('Panel B');
    expect(container.textContent).not.toContain('Panel A');
    unmount();
  });

  test('multiple type keeps both panels open', () => {
    const { container, unmount } = render(
      createElement(
        Accordion,
        { type: 'multiple' },
        createElement(AccordionItem, { id: 'a', title: 'First' }, 'Panel A'),
        createElement(AccordionItem, { id: 'b', title: 'Second' }, 'Panel B'),
      ),
    );
    const [first, second] = headers(container);
    act(() => fire(first, 'click'));
    act(() => fire(second, 'click'));
    expect(container.textContent).toContain('Panel A');
    expect(container.textContent).toContain('Panel B');
    unmount();
  });
});
