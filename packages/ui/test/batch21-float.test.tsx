/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import { Window } from 'happy-dom';
import { useState } from 'react';
import { FloatingPanel } from '../components/overlay/FloatingPanel';
import { PinnedPanel } from '../components/overlay/PinnedPanel';
import { PipContainer } from '../components/overlay/PipContainer';
import { PopoutPanel } from '../components/overlay/PopoutPanel';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

const first = (container: HTMLElement) => container.firstElementChild as HTMLElement;

describe('batch 21 floating surfaces', () => {
  it('PinnedPanel fixes to the requested edge', () => {
    const { container } = render(<PinnedPanel edge="top">hi</PinnedPanel>);
    const el = first(container);
    expect(el.className).toContain('fixed');
    expect(el.className).toContain('top-0');
    expect(el.className).toContain('rounded-b-sheet');
    expect(el.getAttribute('data-edge')).toBe('top');
  });

  it('FloatingPanel drags by its grip and closes', () => {
    let closed = 0;
    const { container } = render(
      <FloatingPanel title="Tools" onClose={() => (closed += 1)}>
        body
      </FloatingPanel>,
    );
    const grip = container.querySelector('[aria-label="Drag panel"]') as HTMLButtonElement;
    const panel = first(container);
    expect(panel.style.left).toBe('24px');

    act(() => fire(grip, 'pointerdown', { clientX: 24, clientY: 24 }));
    act(() => fire(window, 'pointermove', { clientX: 124, clientY: 84 }));
    expect(panel.style.left).toBe('124px');
    expect(panel.style.top).toBe('84px');
    act(() => fire(window, 'pointerup'));

    const close = container.querySelector('[aria-label="Close panel"]') as HTMLButtonElement;
    act(() => fire(close, 'click'));
    expect(closed).toBe(1);
  });

  it('PipContainer expands and reflects controlled state', () => {
    function Harness() {
      const [expanded, setExpanded] = useState(false);
      return (
        <PipContainer label="Now playing" expanded={expanded} onToggle={setExpanded}>
          <div>clip</div>
        </PipContainer>
      );
    }
    const { container } = render(<Harness />);
    const el = first(container);
    expect(el.getAttribute('data-expanded')).toBe('false');
    const toggle = container.querySelector('[aria-label="Expand panel"]') as HTMLButtonElement;
    act(() => fire(toggle, 'click'));
    expect(el.getAttribute('data-expanded')).toBe('true');
  });

  it('PopoutPanel portals children into a popup window', () => {
    const popup = new Window({ url: 'about:blank' });
    Object.defineProperty(globalThis.window, 'open', {
      value: () => popup,
      configurable: true,
      writable: true,
    });
    render(
      <PopoutPanel open title="Inspector">
        <span>portalled</span>
      </PopoutPanel>,
    );
    expect(popup.document.title).toBe('Inspector');
    expect(popup.document.body.textContent).toContain('portalled');
  });

  it('PopoutPanel renders the fallback when popups are blocked', () => {
    Object.defineProperty(globalThis.window, 'open', {
      value: () => null,
      configurable: true,
      writable: true,
    });
    const { container } = render(
      <PopoutPanel open fallback={<span>popup blocked</span>}>
        <span>content</span>
      </PopoutPanel>,
    );
    expect(container.textContent).toContain('popup blocked');
  });
});
