/** @jsxImportSource react */
import { describe, expect, it } from 'bun:test';
import {
  ScrollProgress,
  ScrollReveal,
  ScrollSpy,
  ScrollToTop,
  useScrollSpy,
} from '../components/feedback/ScrollUtils';
import { act, dispatchDomEvent, fire, registerDom, render, renderHook } from './_dom';

registerDom();

const first = (container: HTMLElement) => container.firstElementChild as HTMLElement;
const rect = (top: number) => ({ top }) as DOMRect;

describe('batch 25 scroll utilities', () => {
  it('ScrollProgress renders a controlled progress bar', () => {
    const { container } = render(<ScrollProgress value={0.5} />);
    const bar = first(container);
    expect(bar.getAttribute('role')).toBe('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('50');
    expect((bar.firstElementChild as HTMLElement).style.width).toBe('50%');
  });

  it('ScrollProgress clamps out-of-range values', () => {
    const over = render(<ScrollProgress value={2} />);
    expect(first(over.container).getAttribute('aria-valuenow')).toBe('100');
    const under = render(<ScrollProgress value={-1} />);
    expect(first(under.container).getAttribute('aria-valuenow')).toBe('0');
  });

  it('useScrollSpy reports the last section scrolled past', () => {
    const a = document.createElement('div');
    a.id = 'sa';
    const b = document.createElement('div');
    b.id = 'sb';
    document.body.append(a, b);
    a.getBoundingClientRect = () => rect(-300);
    b.getBoundingClientRect = () => rect(-40);

    const hook = renderHook(() => useScrollSpy(['sa', 'sb']));
    expect(hook.latest()).toBe('sb');

    b.getBoundingClientRect = () => rect(120);
    act(() => dispatchDomEvent(window, 'scroll'));
    expect(hook.latest()).toBe('sa');

    a.remove();
    b.remove();
  });

  it('ScrollSpy highlights the first section when nothing is scrolled', () => {
    const { container } = render(
      <ScrollSpy
        items={[
          { id: 'one', label: 'One' },
          { id: 'two', label: 'Two' },
        ]}
      />,
    );
    const links = container.querySelectorAll('a');
    expect(links.length).toBe(2);
    expect(links[0]?.getAttribute('aria-current')).toBe('true');
  });

  it('ScrollReveal toggles visibility from its controlled prop', () => {
    const shown = render(<ScrollReveal visible>content</ScrollReveal>);
    const shownEl = first(shown.container);
    expect(shownEl.getAttribute('data-visible')).toBe('true');
    expect(shownEl.className).toContain('opacity-100');

    const hidden = render(<ScrollReveal visible={false}>content</ScrollReveal>);
    const hiddenEl = first(hidden.container);
    expect(hiddenEl.getAttribute('data-visible')).toBe('false');
    expect(hiddenEl.className).toContain('opacity-0');
  });

  it('ScrollToTop exposes a labelled button and fires onClick', () => {
    let clicks = 0;
    const { container } = render(<ScrollToTop visible onClick={() => clicks++} />);
    const button = container.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Back to top');
    expect(button.getAttribute('data-visible')).toBe('true');
    act(() => fire(button, 'click'));
    expect(clicks).toBe(1);

    const hidden = render(<ScrollToTop visible={false} />);
    const hiddenButton = hidden.container.querySelector('button') as HTMLButtonElement;
    expect(hiddenButton.getAttribute('data-visible')).toBe('false');
    expect(hiddenButton.tabIndex).toBe(-1);
  });
});
