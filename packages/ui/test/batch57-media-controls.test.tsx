/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import { MediaControls, PlayPauseButton } from '../components/controls/MediaControls';
import { PanPad, RotateControl, ZoomControls } from '../components/controls/ViewportControls';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

const buttons = (c: HTMLElement) => Array.from(c.querySelectorAll('button')) as HTMLButtonElement[];

describe('batch 57 viewport controls', () => {
  it('ZoomControls clamps and shows percentage', () => {
    const seen: number[] = [];
    const { container, unmount } = render(
      <ZoomControls value={1} min={0.5} max={1.5} step={0.5} onValueChange={(v) => seen.push(v)} />,
    );
    const [out, , inc] = buttons(container);
    act(() => inc.click());
    expect(seen.at(-1)).toBe(1.5);
    act(() => out.click());
    expect(seen.at(-1)).toBe(0.5);
    unmount();
  });

  it('PanPad emits direction vectors', () => {
    const seen: Array<[number, number]> = [];
    const { container, unmount } = render(<PanPad onPan={(dx, dy) => seen.push([dx, dy])} />);
    const [up, left, right, down] = buttons(container);
    act(() => up.click());
    act(() => left.click());
    act(() => right.click());
    act(() => down.click());
    expect(seen).toEqual([
      [0, -1],
      [-1, 0],
      [1, 0],
      [0, 1],
    ]);
    unmount();
  });

  it('RotateControl wraps around 360', () => {
    const seen: number[] = [];
    const { container, unmount } = render(
      <RotateControl value={0} step={90} onValueChange={(v) => seen.push(v)} />,
    );
    const [left, right] = buttons(container);
    act(() => left.click());
    expect(seen.at(-1)).toBe(270);
    act(() => right.click());
    expect(seen.at(-1)).toBe(90);
    unmount();
  });
});

describe('batch 57 media controls', () => {
  it('MediaControls fires transport callbacks and cycles repeat', () => {
    const calls: string[] = [];
    const repeats: string[] = [];
    const { container, unmount } = render(
      <MediaControls
        playing
        onPlayPause={() => calls.push('play')}
        onStop={() => calls.push('stop')}
        onNext={() => calls.push('next')}
        onPrevious={() => calls.push('prev')}
        onShuffle={() => calls.push('shuffle')}
        repeat="off"
        onRepeatToggle={(m) => repeats.push(m)}
      />,
    );
    const [shuffle, prev, play, stop, next, repeat] = buttons(container);
    expect(play.getAttribute('aria-label')).toBe('Pause');
    act(() => play.click());
    act(() => stop.click());
    act(() => next.click());
    act(() => prev.click());
    act(() => shuffle.click());
    act(() => repeat.click());
    expect(calls).toEqual(['play', 'stop', 'next', 'prev', 'shuffle']);
    expect(repeats).toEqual(['all']);
    expect(repeat.getAttribute('aria-label')).toBe('Repeat: off');
    unmount();
  });

  it('PlayPauseButton reflects playing state', () => {
    const { unmount } = render(<PlayPauseButton playing={false} />);
    expect(document.querySelector('button')?.getAttribute('aria-label')).toBe('Play');
    unmount();
  });
});
