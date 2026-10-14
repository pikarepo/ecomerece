/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import {
  DoubleClickToConfirm,
  HoldToConfirmButton,
  SwipeToConfirm,
} from '../components/controls/Confirm';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

const first = (container: HTMLElement) => container.firstElementChild as HTMLElement;

const sleep = (ms: number) =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });

describe('batch 40 confirmation controls', () => {
  it('HoldToConfirmButton fires onConfirm only after the hold elapses', async () => {
    let confirmed = 0;
    const { container, unmount } = render(
      <HoldToConfirmButton duration={60} onConfirm={() => confirmed++}>
        Delete
      </HoldToConfirmButton>,
    );
    const btn = first(container) as HTMLButtonElement;

    act(() => fire(btn, 'pointerdown'));
    expect(btn.getAttribute('data-holding')).toBe('');
    expect(confirmed).toBe(0);

    await sleep(140);
    expect(confirmed).toBe(1);
    expect(btn.getAttribute('data-confirmed')).toBe('');
    unmount();
  });

  it('HoldToConfirmButton cancels when released early', async () => {
    let confirmed = 0;
    const { container, unmount } = render(
      <HoldToConfirmButton duration={200} onConfirm={() => confirmed++}>
        Delete
      </HoldToConfirmButton>,
    );
    const btn = first(container) as HTMLButtonElement;

    act(() => fire(btn, 'pointerdown'));
    act(() => fire(btn, 'pointerup'));
    await sleep(140);
    expect(confirmed).toBe(0);
    expect(btn.getAttribute('data-holding')).toBeNull();
    unmount();
  });

  it('SwipeToConfirm confirms past the threshold and resets on a short drag', () => {
    let confirmed = 0;
    const { container, unmount } = render(
      <SwipeToConfirm onConfirm={() => confirmed++}>Slide to pay</SwipeToConfirm>,
    );
    const track = first(container) as HTMLDivElement;
    track.getBoundingClientRect = () =>
      ({ width: 300, height: 48, left: 0, top: 0, right: 300, bottom: 48 }) as DOMRect;
    const thumb = container.querySelector('button') as HTMLButtonElement;

    act(() => fire(thumb, 'pointerdown', { pointerId: 1 }));
    act(() => fire(thumb, 'pointermove', { clientX: 60 }));
    act(() => fire(thumb, 'pointerup'));
    expect(confirmed).toBe(0);
    expect(thumb.style.transform).toContain('translateX(0px)');

    act(() => fire(thumb, 'pointerdown', { pointerId: 2 }));
    act(() => fire(thumb, 'pointermove', { clientX: 290 }));
    act(() => fire(thumb, 'pointerup'));
    expect(confirmed).toBe(1);
    unmount();
  });

  it('DoubleClickToConfirm arms on the first click and confirms on the second', () => {
    let confirmed = 0;
    const { container, unmount } = render(
      <DoubleClickToConfirm onConfirm={() => confirmed++}>Delete</DoubleClickToConfirm>,
    );
    const btn = first(container) as HTMLButtonElement;

    act(() => btn.click());
    expect(btn.getAttribute('data-armed')).toBe('');
    expect(confirmed).toBe(0);

    act(() => btn.click());
    expect(confirmed).toBe(1);
    expect(btn.getAttribute('data-armed')).toBeNull();
    unmount();
  });
});
