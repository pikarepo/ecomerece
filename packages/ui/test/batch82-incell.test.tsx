import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { Bullet } from '../components/data/Bullet';
import { HeatCell, heatClass, heatIntensity } from '../components/data/HeatCell';
import { formatDelta, StatusLights, TrendArrow } from '../components/data/IconIndicators';
import { registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

describe('Bullet', () => {
  test('renders img semantics with the default label and value', () => {
    const { container, unmount } = render(createElement(Bullet, { value: 42 }));
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('role')).toBe('img');
    expect(root.getAttribute('aria-label')).toBe('Bullet chart: 42');
    unmount();
  });

  test('measure bar width tracks value / max', () => {
    const { container, unmount } = render(createElement(Bullet, { value: 40, max: 100 }));
    const measure = container.querySelectorAll('span[style]');
    expect((measure[measure.length - 1] as HTMLElement).style.width).toBe('40%');
    unmount();
  });

  test('renders target tick at target / max', () => {
    const { container, unmount } = render(createElement(Bullet, { value: 30, target: 70 }));
    const tick = container.querySelector('.bg-ink');
    expect((tick as HTMLElement).style.left).toBe('70%');
    unmount();
  });

  test('renders one band per range threshold', () => {
    const { container, unmount } = render(createElement(Bullet, { value: 10, ranges: [60, 85] }));
    const bands = container.querySelectorAll('.bg-line\\/10, .bg-line\\/20, .bg-line\\/30');
    expect(bands.length).toBe(3);
    unmount();
  });

  test('showValue prints the value / target readout', () => {
    const { container, unmount } = render(
      createElement(Bullet, { value: 12, target: 20, showValue: true }),
    );
    expect(container.textContent).toContain('12 / 20');
    unmount();
  });
});

describe('HeatCell', () => {
  test('applies an alpha-scaled role class from the ramp', () => {
    const { container, unmount } = render(
      createElement(HeatCell, { value: 50, min: 0, max: 100, ramp: 'success' }),
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('bg-success/');
    unmount();
  });

  test('clamps intensity to 0–1 outside the range', () => {
    expect(heatIntensity(-10, 0, 100)).toBe(0);
    expect(heatIntensity(150, 0, 100)).toBe(1);
  });

  test('diverging ramp picks danger for negatives and success for positives', () => {
    expect(heatClass('diverging', -4, -5, 5)).toContain('bg-danger/');
    expect(heatClass('diverging', 4, -5, 5)).toContain('bg-success/');
  });

  test('uses a custom formatter for display and label', () => {
    const { container, unmount } = render(
      createElement(HeatCell, { value: 0.25, format: (v: number) => `${v * 100}%` }),
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.textContent).toBe('25%');
    expect(root.getAttribute('aria-label')).toBe('Heat cell: 25% (accent)');
    unmount();
  });

  test('respects children override', () => {
    const { container, unmount } = render(createElement(HeatCell, { value: 3 }, 'hot!'));
    expect(container.textContent).toBe('hot!');
    unmount();
  });
});

describe('StatusLights', () => {
  test('lights the green dot when good', () => {
    const { container, unmount } = render(createElement(StatusLights, { level: 'good' }));
    expect(container.querySelector('.bg-success')).not.toBeNull();
    expect(container.querySelector('.bg-danger')).toBeNull();
    unmount();
  });

  test('lights the red dot when bad', () => {
    const { container, unmount } = render(createElement(StatusLights, { level: 'bad' }));
    expect(container.querySelector('.bg-danger')).not.toBeNull();
    expect(container.querySelector('.bg-success')).toBeNull();
    unmount();
  });

  test('mutes all lights when neutral and exposes a label', () => {
    const { container, unmount } = render(createElement(StatusLights, { level: 'neutral' }));
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('aria-label')).toBe('Status: neutral');
    expect(container.querySelectorAll('.bg-line\\/25').length).toBe(3);
    unmount();
  });
});

describe('TrendArrow', () => {
  test('defaults up to the success tone with a signed percent label', () => {
    const { container, unmount } = render(
      createElement(TrendArrow, { direction: 'up', value: 12.4, percent: true }),
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('text-success');
    expect(root.getAttribute('aria-label')).toBe('up +12.4%');
    expect(container.textContent).toContain('+12.4%');
    unmount();
  });

  test('upIsGood=false flips an increase to the danger tone', () => {
    const { container, unmount } = render(
      createElement(TrendArrow, { direction: 'up', value: 3, upIsGood: false }),
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('text-danger');
    unmount();
  });

  test('flat trend renders no signed value and the neutral tone', () => {
    const { container, unmount } = render(
      createElement(TrendArrow, { direction: 'flat', value: 0 }),
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('text-ink-3');
    expect(root.textContent).toBe('0');
    unmount();
  });
});

describe('formatDelta', () => {
  test('signs, rounds and appends percent', () => {
    expect(formatDelta(12.4, true)).toBe('+12.4%');
    expect(formatDelta(-3.2)).toBe('-3.2');
    expect(formatDelta(0)).toBe('0');
    expect(formatDelta(5, true)).toBe('+5%');
  });
});
