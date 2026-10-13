/** @jsxImportSource react */
import { describe, expect, it } from 'bun:test';
import { Orientation, useOrientation } from '../components/surface/Orientation';
import { act, dispatchDomEvent, registerDom, render, renderHook } from './_dom';

registerDom();

const first = (container: HTMLElement) => container.firstElementChild as HTMLElement;

describe('batch 30 orientation', () => {
  it('useOrientation derives from viewport dimensions and updates on resize', () => {
    const hook = renderHook(() => useOrientation());
    expect(hook.latest()).toBe('landscape');

    Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });
    act(() => dispatchDomEvent(window, 'resize'));
    expect(hook.latest()).toBe('portrait');
  });

  it('Orientation renders the branch matching a controlled value', () => {
    const portrait = render(
      <Orientation orientation="portrait" portrait={<span>P</span>} landscape={<span>L</span>} />,
    );
    expect(first(portrait.container).getAttribute('data-orientation')).toBe('portrait');
    expect(portrait.container.textContent).toBe('P');

    const landscape = render(
      <Orientation orientation="landscape" portrait={<span>P</span>} landscape={<span>L</span>} />,
    );
    expect(landscape.container.textContent).toBe('L');
  });

  it('Orientation falls back to children when no branch matches', () => {
    const { container } = render(
      <Orientation orientation="portrait">
        <span>shared</span>
      </Orientation>,
    );
    expect(first(container).getAttribute('data-orientation')).toBe('portrait');
    expect(container.textContent).toBe('shared');
  });
});
