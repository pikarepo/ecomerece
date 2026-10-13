/** @jsxImportSource react */
import { describe, expect, it } from 'bun:test';
import { KeyboardAvoidingView, PullToRefresh, SafeArea } from '../components/surface/Mobile';
import { act, fire, registerDom, render } from './_dom';

registerDom();

const first = (container: HTMLElement) => container.firstElementChild as HTMLElement;

describe('batch 28 mobile layout', () => {
  it('SafeArea insets only the requested edges', () => {
    const { container } = render(<SafeArea edges={['top', 'bottom']} />);
    const el = first(container);
    expect(el.getAttribute('data-edges')).toBe('top,bottom');
    expect(el.getAttribute('style') ?? '').not.toContain('left');

    const all = render(<SafeArea />);
    expect(first(all.container).getAttribute('data-edges')).toBe('top,right,bottom,left');
  });

  it('KeyboardAvoidingView reserves space as padding or height', () => {
    const pad = render(<KeyboardAvoidingView offset={120} />);
    expect(first(pad.container).style.paddingBottom).toBe('120px');

    const height = render(<KeyboardAvoidingView behavior="height" offset={120} />);
    expect(first(height.container).style.maxHeight).toBe('calc(100% - 120px)');
  });

  it('PullToRefresh triggers onRefresh once the pull passes the threshold', () => {
    let refreshes = 0;
    const { container } = render(
      <PullToRefresh
        threshold={50}
        onRefresh={() => {
          refreshes++;
        }}
      >
        <div>content</div>
      </PullToRefresh>,
    );
    const el = first(container);
    act(() => fire(el, 'pointerdown', { clientY: 0 }));
    act(() => fire(el, 'pointermove', { clientY: 80 }));
    expect(el.getAttribute('data-pull')).toBe('75');
    act(() => fire(el, 'pointerup'));
    expect(refreshes).toBe(1);
    expect(el.getAttribute('data-pull')).toBe('0');
  });

  it('PullToRefresh ignores short pulls and disabled state', () => {
    let refreshes = 0;
    const pull = render(
      <PullToRefresh
        threshold={50}
        onRefresh={() => {
          refreshes++;
        }}
      >
        <div>content</div>
      </PullToRefresh>,
    );
    const el = first(pull.container);
    act(() => fire(el, 'pointerdown', { clientY: 0 }));
    act(() => fire(el, 'pointermove', { clientY: 20 }));
    act(() => fire(el, 'pointerup'));
    expect(refreshes).toBe(0);

    const off = render(
      <PullToRefresh
        disabled
        threshold={10}
        onRefresh={() => {
          refreshes++;
        }}
      >
        <div>content</div>
      </PullToRefresh>,
    );
    const offEl = first(off.container);
    act(() => fire(offEl, 'pointerdown', { clientY: 0 }));
    act(() => fire(offEl, 'pointermove', { clientY: 200 }));
    act(() => fire(offEl, 'pointerup'));
    expect(refreshes).toBe(0);
  });

  it('PullToRefresh marks itself refreshing during an async refresh', async () => {
    let resolve!: () => void;
    const done = new Promise<void>((r) => {
      resolve = r;
    });
    const { container } = render(
      <PullToRefresh threshold={10} onRefresh={() => done}>
        <div>content</div>
      </PullToRefresh>,
    );
    const el = first(container);
    act(() => fire(el, 'pointerdown', { clientY: 0 }));
    act(() => fire(el, 'pointermove', { clientY: 40 }));
    await act(async () => {
      fire(el, 'pointerup');
    });
    expect(el.getAttribute('data-refreshing')).toBe('true');
    await act(async () => {
      resolve();
      await done;
    });
    expect(el.getAttribute('data-refreshing')).toBe('false');
  });
});
