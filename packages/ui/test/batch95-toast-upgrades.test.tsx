/** @jsxImportSource react */

import { afterAll, describe, expect, it } from 'bun:test';
import {
  clampProgress,
  type ToastPosition,
  ToastProvider,
  useToast,
} from '../components/feedback/Toast';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

type Api = ReturnType<typeof useToast>;
let api: Api = null as unknown as Api;

function Grab() {
  api = useToast();
  return null;
}

const sleep = (ms: number) =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });

function mount(position?: ToastPosition) {
  return render(
    <ToastProvider position={position}>
      <Grab />
    </ToastProvider>,
  );
}

function region(position: ToastPosition): HTMLElement | null {
  return document.querySelector(`[data-toast-region][data-position="${position}"]`);
}

function cards(position: ToastPosition = 'bottom-right'): HTMLElement[] {
  const el = region(position);
  return el ? Array.from(el.querySelectorAll('[role="status"]')) : [];
}

function texts(position: ToastPosition = 'bottom-right'): string[] {
  return cards(position).map((c) => c.textContent ?? '');
}

describe('Toast upgrades (batch 95)', () => {
  it('push returns an id and the toast renders in the default region', () => {
    const { unmount } = mount();
    let id = '';
    act(() => {
      id = api.push({ message: 'Saved' });
    });
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
    expect(region('bottom-right')).not.toBeNull();
    expect(texts()).toContain('Saved');
    unmount();
  });

  it('baseline: the stack never exceeds three toasts', () => {
    const { unmount } = mount();
    act(() => {
      api.push({ message: 'one' });
      api.push({ message: 'two' });
      api.push({ message: 'three' });
      api.push({ message: 'four' });
    });
    const all = texts().join(' ');
    expect(cards().length).toBe(3);
    expect(all).not.toContain('one');
    expect(all).toContain('four');
    unmount();
  });

  it('baseline: action runs then dismisses the card; X dismisses too', () => {
    const { unmount } = mount();
    let actions = 0;
    act(() => {
      api.push({ message: 'Unsaved draft', action: { label: 'Undo', onAction: () => actions++ } });
    });
    const card = cards()[0];
    const actionBtn = Array.from(card.querySelectorAll('button')).find(
      (b) => b.textContent === 'Undo',
    ) as HTMLButtonElement;
    act(() => actionBtn.click());
    expect(actions).toBe(1);
    expect(cards().length).toBe(0);

    act(() => {
      api.push({ message: 'Another' });
    });
    const x = cards()[0].querySelector('[aria-label="Dismiss"]') as HTMLButtonElement;
    act(() => x.click());
    expect(cards().length).toBe(0);
    unmount();
  });

  it('durationMs 0 is sticky; a short duration auto-dismisses', async () => {
    const { unmount } = mount();
    act(() => {
      api.push({ message: 'Sticky', durationMs: 0 });
    });
    await sleep(40);
    expect(texts()).toContain('Sticky');

    act(() => {
      api.push({ message: 'Ephemeral', durationMs: 20 });
    });
    await sleep(80);
    expect(texts().join(' ')).not.toContain('Ephemeral');
    expect(texts()).toContain('Sticky');
    unmount();
  });

  it('provider position pins the region; per-toast position overrides it', () => {
    const { unmount } = mount('top-left');
    act(() => {
      api.push({ message: 'Top left toast' });
    });
    expect(region('top-left')?.className).toContain('top-4');
    expect(region('top-left')?.className).toContain('items-start');
    expect(texts('top-left')).toContain('Top left toast');
    // No stray default region when nothing uses it.
    expect(region('bottom-right')).toBeNull();

    act(() => {
      api.push({ message: 'Corner toast', position: 'top-right' });
    });
    expect(texts('top-right')).toContain('Corner toast');
    expect(region('top-right')?.getAttribute('data-position')).toBe('top-right');
    expect(texts('top-left').length).toBe(1);
    unmount();
  });

  it('default provider keeps the baseline bottom-right region', () => {
    const { unmount } = mount();
    expect(region('bottom-right')?.className).toContain('sm:right-6');
    expect(region('bottom-right')?.className).toContain('env(safe-area-inset-bottom)');
    unmount();
  });

  it('loading toast swaps the tone dot for a spinner', () => {
    const { unmount } = mount();
    act(() => {
      api.push({ message: 'Uploading…', loading: true, durationMs: 0 });
    });
    const card = cards()[0];
    expect(card.querySelector('svg.animate-spin')).not.toBeNull();
    expect(card.querySelector('span.rounded-full.bg-line\\/30')).toBeNull();
    unmount();
  });

  it('promise() starts as loading and settles to success', async () => {
    const { unmount } = mount();
    let resolvePromise: ((v: string) => void) | undefined;
    const pending = new Promise<string>((resolve) => {
      resolvePromise = resolve;
    });
    act(() => {
      api
        .promise(pending, {
          loading: 'Exporting…',
          success: (file: string) => `Exported ${file}`,
          error: 'Export failed',
        })
        .catch(() => {});
    });
    let card = cards()[0];
    expect(card.textContent).toContain('Exporting…');
    expect(card.querySelector('svg.animate-spin')).not.toBeNull();

    await act(async () => {
      resolvePromise?.('report.csv');
      await pending;
    });
    await sleep(0);
    card = cards()[0];
    expect(card.textContent).toContain('Exported report.csv');
    expect(card.querySelector('svg.animate-spin')).toBeNull();
    expect(card.querySelector('.bg-success')).not.toBeNull();
    unmount();
  });

  it('promise() settles to danger and rethrows the original error', async () => {
    const { unmount } = mount();
    let rejectPromise: ((e?: unknown) => void) | undefined;
    const pending = new Promise<string>((_resolve, reject) => {
      rejectPromise = reject;
    });
    let caught: unknown = null;
    act(() => {
      api
        .promise(pending, {
          loading: 'Signing in…',
          success: 'Welcome',
          error: (e: unknown) => `Failed: ${(e as Error).message}`,
        })
        .catch((e) => {
          caught = e;
        });
    });

    await act(async () => {
      rejectPromise?.(new Error('offline'));
      await pending.catch(() => {});
    });
    await sleep(0);
    const card = cards()[0];
    expect(card.textContent).toContain('Failed: offline');
    expect(card.querySelector('.bg-danger')).not.toBeNull();
    expect((caught as Error).message).toBe('offline');
    unmount();
  });

  it('grouped pushes collapse into one card with a +N badge (latest message wins)', () => {
    const { unmount } = mount();
    act(() => {
      api.push({ message: 'Saved Alpha', tone: 'success', group: 'save' });
      api.push({ message: 'Saved Beta', tone: 'success', group: 'save' });
      api.push({ message: 'Saved Gamma', tone: 'success', group: 'save' });
    });
    expect(cards().length).toBe(1);
    const text = texts()[0];
    expect(text).toContain('Saved Gamma');
    expect(text).not.toContain('Saved Alpha');
    expect(text).toContain('+2');
    expect(cards()[0].querySelector('.bg-success')).not.toBeNull();

    act(() => {
      api.push({ message: 'Other group', group: 'sync' });
    });
    expect(cards().length).toBe(2);

    // A different group never merges into the first card.
    expect(texts()[0]).toContain('Saved Gamma');
    unmount();
  });

  it('progress toast renders a clamped bar and update() drives it', () => {
    const { unmount } = mount();
    let id = '';
    act(() => {
      id = api.push({ message: 'Uploading', progress: 10, durationMs: 0 });
    });
    let bar = cards()[0].querySelector('[role="progressbar"]') as HTMLElement;
    expect(bar).not.toBeNull();
    expect(bar.getAttribute('aria-valuenow')).toBe('10');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
    expect(cards()[0].textContent).toContain('10%');

    act(() => {
      api.update(id, { progress: 75, message: 'Uploading 75%' });
    });
    bar = cards()[0].querySelector('[role="progressbar"]') as HTMLElement;
    expect(bar.getAttribute('aria-valuenow')).toBe('75');
    expect(cards()[0].textContent).toContain('Uploading 75%');

    act(() => {
      api.push({ message: 'Overflow', progress: 150, durationMs: 0 });
    });
    const overflowBar = cards()
      .map((c) => c.querySelector('[role="progressbar"]'))
      .find((b) => b?.getAttribute('aria-valuenow') === '100');
    expect(overflowBar).not.toBeNull();

    // Settling clears the bar when the patch carries progress: undefined.
    act(() => {
      api.update(id, { progress: undefined, message: 'Done' });
    });
    expect(
      cards()
        .map((c) => c.querySelector('[role="progressbar"]'))
        .filter(Boolean).length,
    ).toBe(1);
    unmount();
  });

  it('update() on an unknown id is a no-op, dismiss() removes by id', () => {
    const { unmount } = mount();
    let id = '';
    act(() => {
      api.update('nope', { message: 'ghost' });
      id = api.push({ message: 'Dismiss me', durationMs: 0 });
    });
    expect(texts()).toContain('Dismiss me');
    act(() => {
      api.dismiss(id);
    });
    expect(cards().length).toBe(0);
    unmount();
  });

  it('useToast throws outside a ToastProvider', () => {
    expect(() => render(<Grab />)).toThrow('useToast must be used within a <ToastProvider>');
  });

  it('clampProgress bounds values to 0–100', () => {
    expect(clampProgress(-5)).toBe(0);
    expect(clampProgress(42)).toBe(42);
    expect(clampProgress(250)).toBe(100);
    expect(clampProgress(Number.NaN)).toBe(0);
  });
});
