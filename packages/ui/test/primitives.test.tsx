import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import {
  Chrome,
  Container,
  Div,
  Grid,
  Ground,
  Heading,
  HStack,
  Panel,
  Raised,
  Stack,
  Surface,
  Text,
  Well,
} from '../components/surface/Primitives';
import { registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

describe('Primitives', () => {
  test('Div and Box render plain, theme-aware divs', () => {
    const { container, unmount } = render(createElement(Div, { className: 'p-4' }, 'x'));
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe('DIV');
    expect(el.className).toContain('p-4');
    unmount();
  });

  test('Container applies width + padding', () => {
    const { container, unmount } = render(createElement(Container, { width: 'shell' }));
    const cls = (container.firstElementChild as HTMLElement).className;
    expect(cls).toContain('max-w-shell');
    expect(cls).toContain('px-4');
    unmount();
  });

  test('Container bleed removes padding', () => {
    const { container, unmount } = render(
      createElement(Container, { bleed: true, className: 'custom' }),
    );
    const cls = (container.firstElementChild as HTMLElement).className;
    expect(cls).not.toContain('px-4');
    expect(cls).toContain('custom');
    unmount();
  });

  test('Stack is a vertical flex with gap', () => {
    const { container, unmount } = render(createElement(Stack, {}, 'a'));
    const cls = (container.firstElementChild as HTMLElement).className;
    expect(cls).toContain('flex-col');
    expect(cls).toContain('gap-3');
    unmount();
  });

  test('HStack wraps horizontally', () => {
    const { container, unmount } = render(createElement(HStack, { gap: 2 }, 'a'));
    const cls = (container.firstElementChild as HTMLElement).className;
    expect(cls).toContain('flex');
    expect(cls).toContain('flex-wrap');
    expect(cls).toContain('gap-2');
    unmount();
  });

  test('Grid resolves column classes', () => {
    const { container, unmount } = render(createElement(Grid, { cols: 4 }));
    const cls = (container.firstElementChild as HTMLElement).className;
    expect(cls).toContain('grid');
    expect(cls).toContain('lg:grid-cols-4');
    unmount();
  });

  test('Surface names the requested MATERIAL', () => {
    for (const material of ['well', 'raised', 'panel', 'chrome', 'ground', 'card'] as const) {
      const { container, unmount } = render(createElement(Surface, { material }));
      const cls = (container.firstElementChild as HTMLElement).className;
      expect(cls).toContain(`mat-${material}`);
      unmount();
    }
  });

  test('Well / Raised / Panel / Chrome / Ground are role shortcuts', () => {
    for (const [Comp, role] of [
      [Well, 'well'],
      [Raised, 'raised'],
      [Panel, 'panel'],
      [Chrome, 'chrome'],
      [Ground, 'ground'],
    ] as const) {
      const { container, unmount } = render(createElement(Comp, {}));
      expect((container.firstElementChild as HTMLElement).className).toContain(`mat-${role}`);
      unmount();
    }
  });

  test('Text resolves tone + size + tag', () => {
    const { container, unmount } = render(
      createElement(Text, { tone: 'ink-3', size: 'sm', as: 'span' }, 'hi'),
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe('SPAN');
    expect(el.className).toContain('text-ink-3');
    expect(el.className).toContain('text-sm');
    unmount();
  });

  test('Heading renders matching hN with themed classes', () => {
    const { container, unmount } = render(createElement(Heading, { level: 3 }, 't'));
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe('H3');
    expect(el.className).toContain('text-base');
    unmount();
  });
});
