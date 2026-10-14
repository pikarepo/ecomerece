/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import {
  BubbleMenu,
  FloatingToolbar,
  InlineToolbar,
} from '../components/navigation/FloatingToolbar';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

describe('batch 59 toolbars', () => {
  it('FloatingToolbar renders only when open and positions itself', () => {
    const closed = render(<FloatingToolbar open={false} />);
    expect(closed.container.querySelector('[role="toolbar"]')).toBeNull();
    closed.unmount();

    const { container, unmount } = render(
      <FloatingToolbar x={10} y={20}>
        <button type="button">B</button>
      </FloatingToolbar>,
    );
    const bar = container.querySelector('[role="toolbar"]') as HTMLElement;
    expect(bar).not.toBeNull();
    expect(bar.style.position).toBe('fixed');
    unmount();
  });

  it('BubbleMenu prevents mousedown default to keep the selection', () => {
    const { container, unmount } = render(<BubbleMenu x={10} y={10} />);
    const menu = container.querySelector('[data-bubble-menu]') as HTMLElement;
    expect(menu).not.toBeNull();
    let prevented = false;
    act(() => {
      const ev = new Event('mousedown', { bubbles: true, cancelable: true });
      menu.dispatchEvent(ev);
      prevented = ev.defaultPrevented;
    });
    expect(prevented).toBe(true);
    unmount();
  });

  it('InlineToolbar exposes a toolbar role', () => {
    const { container, unmount } = render(
      <InlineToolbar>
        <button type="button">B</button>
      </InlineToolbar>,
    );
    expect(container.querySelector('[role="toolbar"]')).not.toBeNull();
    unmount();
  });
});
