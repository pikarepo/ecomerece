/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import { useState } from 'react';
import { ArrowButton, ScrollButton, StepperButtons } from '../components/controls/NavButtons';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

const first = (container: HTMLElement) => container.firstElementChild as HTMLElement;

describe('batch 55 nav buttons', () => {
  it('ArrowButton renders a labelled chevron for the direction', () => {
    const { container, unmount } = render(<ArrowButton direction="left" />);
    const btn = first(container) as HTMLButtonElement;
    expect(btn.getAttribute('aria-label')).toBe('Scroll left');
    expect(container.querySelector('svg')).not.toBeNull();
    unmount();
  });

  it('StepperButtons clamps within min/max', () => {
    function Harness() {
      const [value, setValue] = useState(1);
      return (
        <StepperButtons value={value} min={0} max={2} onValueChange={setValue}>
          {value}
        </StepperButtons>
      );
    }
    const { container, unmount } = render(<Harness />);
    const [dec, inc] = Array.from(container.querySelectorAll('button')) as HTMLButtonElement[];

    act(() => inc.click());
    expect(container.textContent).toContain('2');
    expect(inc.disabled).toBe(true);

    act(() => dec.click());
    expect(container.textContent).toContain('1');
    expect(inc.disabled).toBe(false);
    unmount();
  });

  it('ScrollButton scrolls its target by the amount', () => {
    let scrolled = 0;
    const target = {
      current: {
        scrollBy: (opts: ScrollToOptions) => {
          scrolled += Number(opts.top ?? 0);
        },
      },
    } as unknown as React.RefObject<HTMLElement>;
    const { container, unmount } = render(
      <ScrollButton direction="down" amount={100} target={target} />,
    );
    const btn = first(container) as HTMLButtonElement;
    act(() => btn.click());
    expect(scrolled).toBe(100);
    unmount();
  });
});
