import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { DataBar } from '../components/data/DataBar';
import { MetricCard } from '../components/data/MetricCard';
import { Sparkline } from '../components/data/Sparkline';
import { registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

describe('Sparkline', () => {
  test('line renders an svg with a polyline and the default role/label', () => {
    const { container, unmount } = render(
      createElement(Sparkline, { data: [1, 3, 2, 4], label: 'Weekly revenue' }),
    );
    const el = container.firstElementChild as SVGSVGElement;
    expect(el.tagName).toBe('svg');
    expect(el.getAttribute('aria-label')).toBe('Weekly revenue');
    const polyline = el.firstElementChild as SVGPolylineElement;
    expect(polyline.tagName).toBe('polyline');
    expect(polyline.getAttribute('vector-effect')).toBe('non-scaling-stroke');
    unmount();
  });

  test('bar variant renders one column per point', () => {
    const { container, unmount } = render(
      createElement(Sparkline, { data: [2, 5, 9], variant: 'bar' }),
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain('flex');
    expect(el.children.length).toBe(3);
    unmount();
  });

  test('empty data does not crash', () => {
    const { unmount } = render(createElement(Sparkline, { data: [] }));
    unmount();
  });
});

describe('DataBar', () => {
  test('descriptive img semantics with track + fill', () => {
    const { container, unmount } = render(createElement(DataBar, { value: 40, max: 80 }));
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute('role')).toBe('img');
    expect(el.getAttribute('aria-label')).toBe('Data bar: 40 of 80');
    expect(el.className).toContain('mat-well');
    unmount();
  });

  test('label carries the value when provided', () => {
    const { container, unmount } = render(
      createElement(DataBar, { value: 40, max: 80, label: 'Disk used' }),
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute('aria-label')).toBe('Disk used: 40 of 80');
    unmount();
  });

  test('showValue renders a tabular readout', () => {
    const { container, unmount } = render(
      createElement(DataBar, { value: 250, showValue: true, label: 'Units' }),
    );
    const wrapper = container.firstElementChild as HTMLElement;
    const span = wrapper.querySelector('span');
    expect(span?.className).toContain('tabular-nums');
    expect(span?.textContent).toContain('250');
    unmount();
  });

  test('clamps over-range values', () => {
    const { container, unmount } = render(createElement(DataBar, { value: 999 }));
    const fill = (container.firstElementChild as HTMLElement).firstElementChild as HTMLElement;
    expect(fill.style.width).toBe('100%');
    unmount();
  });
});

describe('MetricCard', () => {
  test('renders label, pre-formatted value, and trend with arrow', () => {
    const { container, unmount } = render(
      createElement(MetricCard, {
        label: 'Revenue',
        value: '£8,412',
        trend: 12.4,
        comparison: 'vs last month',
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Revenue');
    expect(text).toContain('£8,412');
    expect(text).toContain('+12.4%');
    expect(text).toContain('vs last month');
    unmount();
  });

  test('negative trend switches arrow and tone', () => {
    const { container, unmount } = render(
      createElement(MetricCard, { label: 'Refunds', value: '37', trend: -8 }),
    );
    const el = container.querySelector('svg') as SVGSVGElement;
    expect(el).toBeTruthy();
    unmount();
  });
});
