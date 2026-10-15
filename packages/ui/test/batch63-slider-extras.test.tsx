/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import {
  HistogramSlider,
  MarksSlider,
  StepperSlider,
  TooltipSlider,
  VerticalSlider,
} from '../components/controls/SliderExtras';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

describe('batch 63 slider extras', () => {
  it('MarksSlider renders a tick + label per mark', () => {
    const { container, unmount } = render(
      <MarksSlider
        value={50}
        onValueChange={() => {}}
        marks={[
          { value: 0, label: 'Low' },
          { value: 50, label: 'Mid' },
          { value: 100, label: 'High' },
        ]}
      />,
    );
    expect(container.querySelectorAll('[data-mark]').length).toBe(3);
    expect(container.textContent).toContain('Mid');
    unmount();
  });

  it('TooltipSlider shows the live value in a bubble', () => {
    const { container, unmount } = render(<TooltipSlider value={42} onValueChange={() => {}} />);
    expect(container.textContent).toContain('42');
    unmount();
  });

  it('VerticalSlider exposes a vertical orientation marker', () => {
    const { container, unmount } = render(<VerticalSlider value={30} onValueChange={() => {}} />);
    const input = container.querySelector('input[type="range"]') as HTMLInputElement;
    expect(input.getAttribute('data-orientation')).toBe('vertical');
    unmount();
  });

  it('HistogramSlider renders a bar per bin', () => {
    const { container, unmount } = render(
      <HistogramSlider value={2} onValueChange={() => {}} bins={[1, 3, 5, 2, 4]} />,
    );
    expect(container.querySelectorAll('[data-bin]').length).toBe(5);
    unmount();
  });

  it('StepperSlider +/- emit clamped stepped values', () => {
    const calls: number[] = [];
    const { container, unmount } = render(
      <StepperSlider value={50} step={10} min={0} max={100} onValueChange={(v) => calls.push(v)} />,
    );
    act(() =>
      (container.querySelector('button[aria-label="Increase"]') as HTMLButtonElement).click(),
    );
    act(() =>
      (container.querySelector('button[aria-label="Decrease"]') as HTMLButtonElement).click(),
    );
    expect(calls).toEqual([60, 40]);
    unmount();
  });
});
