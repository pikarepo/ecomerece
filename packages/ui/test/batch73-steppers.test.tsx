/** @jsxImportSource react */

import { afterAll, describe, expect, it } from 'bun:test';
import { ProgressDots, Stepper, stepStatus, TimelineStepper } from '../components/navigation';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

describe('batch 73 steppers', () => {
  it('stepStatus maps index/value/errorAt to statuses', () => {
    expect(stepStatus(0, 0)).toBe('current');
    expect(stepStatus(0, 1)).toBe('complete');
    expect(stepStatus(2, 1)).toBe('upcoming');
    expect(stepStatus(1, 3, 1)).toBe('error');
    expect(stepStatus(1, 1, 1)).toBe('error'); // error wins over current
  });

  it('ProgressDots marks the active dot and reports clicks when interactive', () => {
    let picked = -1;
    const { container, unmount } = render(
      <ProgressDots count={4} value={2} onChange={(i) => (picked = i)} label="Pages" />,
    );
    const group = container.querySelector('ul') as HTMLElement;
    expect(group.getAttribute('aria-label')).toBe('Pages');
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(4);
    expect(buttons[2].getAttribute('aria-current')).toBe('step');
    expect(buttons[0].getAttribute('aria-current')).toBeNull();
    act(() => fire(buttons[0], 'click'));
    expect(picked).toBe(0);
    unmount();
  });

  it('ProgressDots renders static labelled dots without onChange', () => {
    const { container, unmount } = render(<ProgressDots count={3} value={1} />);
    expect(container.querySelector('button')).toBeNull();
    const dots = container.querySelectorAll('li');
    expect(dots.length).toBe(3);
    expect(dots[1].getAttribute('aria-current')).toBe('step');
    expect(dots[0].querySelector('[role="img"]')?.getAttribute('aria-label')).toBe('Page 1');
    unmount();
  });

  it('Stepper shows checks behind value, aria-current on active, accent connectors', () => {
    let picked = -1;
    const { container, unmount } = render(
      <Stepper
        value={1}
        onChange={(i) => (picked = i)}
        steps={[
          { label: 'Cart' },
          { label: 'Shipping', description: 'Address + method' },
          { label: 'Payment' },
        ]}
      />,
    );
    const allLis = container.querySelectorAll('ol > li');
    expect(allLis.length).toBe(5); // 3 steps + 2 connectors
    const stepLis = Array.from(allLis).filter((li) => !li.hasAttribute('aria-hidden'));
    expect(stepLis.length).toBe(3);
    const current = container.querySelector('[aria-current="step"]') as HTMLElement;
    expect(current).not.toBeNull();
    // complete step 1 shows the check glyph
    const circles = Array.from(
      container.querySelectorAll('span.rounded-full.border-2'),
    ) as HTMLElement[];
    expect(circles.length).toBe(3);
    expect(circles[0].textContent).toBe('✓');
    expect(circles[1].textContent).toBe('2'); // current shows its number
    expect(circles[2].textContent).toBe('3');
    // connector after completed step is accent-filled
    const connectors = Array.from(container.querySelectorAll('li[aria-hidden]')) as HTMLElement[];
    expect(connectors.length).toBe(2);
    expect(connectors[0].className).toContain('bg-accent');
    expect(connectors[1].className).toContain('bg-line');
    // clicking a completed step reports its index
    act(() => fire(container.querySelectorAll('button')[0], 'click'));
    expect(picked).toBe(0);
    unmount();
  });

  it('Stepper renders static circles when no onChange, and an error step', () => {
    const { container, unmount } = render(
      <Stepper
        value={2}
        errorAt={0}
        steps={[{ label: 'One' }, { label: 'Two', disabled: true }, { label: 'Three' }]}
      />,
    );
    expect(container.querySelector('button')).toBeNull();
    const circles = Array.from(
      container.querySelectorAll('span.rounded-full.border-2'),
    ) as HTMLElement[];
    expect(circles[0].textContent).toBe('!');
    expect(circles[0].className).toContain('bg-danger');
    expect(circles[1].textContent).toBe('✓'); // i=1 < value=2 → complete
    unmount();
  });

  it('Stepper vertical lays the rail down the left side', () => {
    const { container, unmount } = render(
      <Stepper
        orientation="vertical"
        value={1}
        steps={[{ label: 'A' }, { label: 'B' }, { label: 'C' }]}
      />,
    );
    const list = container.querySelector('ol') as HTMLElement;
    expect(list.className).toContain('flex-col');
    const connectors = Array.from(container.querySelectorAll('li[aria-hidden]')) as HTMLElement[];
    expect(connectors[0].className).toContain('w-0.5');
    expect(connectors[0].className).toContain('self-start');
    unmount();
  });

  it('TimelineStepper shows timestamps, descriptions and clickable titles', () => {
    let picked = -1;
    const { container, unmount } = render(
      <TimelineStepper
        value={1}
        onChange={(i) => (picked = i)}
        steps={[
          { title: 'Departure', timestamp: '09:00', description: 'Tokyo' },
          { title: 'Edo era', timestamp: '1603' },
          { title: 'Arrival', timestamp: '2112' },
        ]}
      />,
    );
    const list = container.querySelector('ol') as HTMLElement;
    expect(list.getAttribute('aria-label')).toBe('Steps');
    expect(container.textContent).toContain('09:00');
    expect(container.textContent).toContain('Tokyo');
    const markers = Array.from(
      container.querySelectorAll('span.rounded-full.border-2'),
    ) as HTMLElement[];
    expect(markers[0].textContent).toBe('✓');
    expect(markers[1].textContent).toBe('2');
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(3);
    act(() => fire(buttons[2], 'click'));
    expect(picked).toBe(2);
    const current = container.querySelector('[aria-current="step"]');
    expect(current?.tagName).toBe('LI');
    unmount();
  });

  it('TimelineStepper disabled step is inert', () => {
    let clicks = 0;
    const { container, unmount } = render(
      <TimelineStepper
        value={0}
        onChange={() => clicks++}
        steps={[{ title: 'Go' }, { title: 'Stuck', disabled: true }]}
      />,
    );
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(1); // disabled step renders no button — inert
    expect(container.textContent).toContain('Stuck');
    act(() => fire(buttons[0], 'click'));
    expect(clicks).toBe(1);
    unmount();
  });
});
