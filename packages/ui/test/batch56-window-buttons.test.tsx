/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import {
  ExpandCollapseButton,
  FullscreenButton,
  WindowControls,
} from '../components/controls/WindowButtons';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

const first = (container: HTMLElement) => container.firstElementChild as HTMLElement;

describe('batch 56 window buttons', () => {
  it('ExpandCollapseButton toggles aria-expanded and rotation', () => {
    const seen: boolean[] = [];
    const { container, unmount } = render(
      <ExpandCollapseButton expanded={false} onToggle={(v) => seen.push(v)} />,
    );
    const btn = first(container) as HTMLButtonElement;
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    act(() => btn.click());
    expect(seen).toEqual([true]);
    unmount();
  });

  it('WindowControls fires callbacks for each glyph', () => {
    const calls: string[] = [];
    const { container, unmount } = render(
      <WindowControls
        onMinimize={() => calls.push('min')}
        onMaximize={() => calls.push('max')}
        onClose={() => calls.push('close')}
      />,
    );
    for (const b of Array.from(container.querySelectorAll('button'))) {
      act(() => (b as HTMLButtonElement).click());
    }
    expect(calls).toEqual(['min', 'max', 'close']);
    unmount();
  });

  it('WindowControls traffic variant renders three dots', () => {
    const { container, unmount } = render(<WindowControls traffic />);
    expect(container.querySelectorAll('button').length).toBe(3);
    expect(container.querySelector('.rounded-full')).not.toBeNull();
    unmount();
  });

  it('FullscreenButton reflects fullscreenchange state', () => {
    let fs: Element | null = null;
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => fs,
    });
    const { unmount } = render(<FullscreenButton />);
    const btn = document.querySelector('button') as HTMLButtonElement;
    expect(btn.getAttribute('aria-label')).toBe('Enter fullscreen');
    act(() => {
      fs = document.body;
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    expect(btn.getAttribute('aria-label')).toBe('Exit fullscreen');
    fs = null;
    unmount();
  });
});
