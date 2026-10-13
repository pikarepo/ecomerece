import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { Toolbar, ToolbarButton, ToolbarSeparator } from '../components/navigation/Toolbar';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

describe('Toolbar', () => {
  test('renders a toolbar with role and aria-label', () => {
    const { container, unmount } = render(
      createElement(
        Toolbar,
        { 'aria-label': 'Text formatting' },
        createElement(ToolbarButton, null, 'Bold'),
      ),
    );
    const tb = container.querySelector('[role="toolbar"]');
    expect(tb).not.toBeNull();
    expect(tb?.getAttribute('aria-label')).toBe('Text formatting');
    unmount();
  });

  test('ToolbarButton calls onClick when clicked', () => {
    const calls: number[] = [];
    const { container, unmount } = render(
      createElement(
        Toolbar,
        null,
        createElement(ToolbarButton, { onClick: () => calls.push(1) }, 'Click'),
      ),
    );
    act(() => (container.querySelector('button') as HTMLButtonElement).click());
    expect(calls).toHaveLength(1);
    unmount();
  });

  test('pressed=true sets aria-pressed and mat-primary class', () => {
    const { container, unmount } = render(
      createElement(Toolbar, null, createElement(ToolbarButton, { pressed: true }, 'Bold')),
    );
    const btn = container.querySelector('button') as HTMLButtonElement;
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(btn.getAttribute('data-pressed')).toBe('true');
    expect(btn.className).toContain('mat-primary');
    unmount();
  });

  test('ToolbarSeparator renders a separator element', () => {
    const { container, unmount } = render(
      createElement(
        Toolbar,
        null,
        createElement(ToolbarButton, null, 'A'),
        createElement(ToolbarSeparator, null),
        createElement(ToolbarButton, null, 'B'),
      ),
    );
    expect(container.querySelector('hr')).not.toBeNull();
    unmount();
  });

  test('vertical orientation sets aria-orientation and flex-col', () => {
    const { container, unmount } = render(
      createElement(Toolbar, { orientation: 'vertical' }, createElement(ToolbarButton, null, 'X')),
    );
    const tb = container.querySelector('[role="toolbar"]') as HTMLElement;
    expect(tb.getAttribute('aria-orientation')).toBe('vertical');
    expect(tb.className).toContain('flex-col');
    unmount();
  });
});
