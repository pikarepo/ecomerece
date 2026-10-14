/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import { DragHandle, GripButton, PullHandle, ResizeHandle } from '../components/controls/Handles';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

describe('batch 60 handles', () => {
  it('DragHandle is a labelled grab button', () => {
    const { container, unmount } = render(<DragHandle label="Reorder item" />);
    const btn = container.querySelector('button') as HTMLButtonElement;
    expect(btn.getAttribute('aria-label')).toBe('Reorder item');
    expect(container.querySelector('[data-drag-handle]')).not.toBeNull();
    unmount();
  });

  it('ResizeHandle fires onResize on pointer down', () => {
    let fired = 0;
    const { container, unmount } = render(
      <ResizeHandle edge="horizontal" onResize={() => fired++} />,
    );
    const el = container.querySelector('[data-resize-edge="horizontal"]') as HTMLElement;
    act(() => {
      container
        .querySelector('button')
        ?.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));
    });
    expect(el.getAttribute('data-resize-edge')).toBe('horizontal');
    expect(fired).toBe(1);
    unmount();
  });

  it('PullHandle and GripButton render', () => {
    const { unmount } = render(
      <div>
        <PullHandle />
        <GripButton />
      </div>,
    );
    expect(document.querySelector('[data-pull-handle]')).not.toBeNull();
    expect(document.querySelectorAll('button').length).toBe(2);
    unmount();
  });
});
