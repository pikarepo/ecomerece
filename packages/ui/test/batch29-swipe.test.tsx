/** @jsxImportSource react */
import { describe, expect, it } from 'bun:test';
import { SwipeActions, Swipeable, type SwipeDirection } from '../components/surface/Swipe';
import { act, fire, registerDom, render } from './_dom';

registerDom();

const first = (container: HTMLElement) => container.firstElementChild as HTMLElement;

describe('batch 29 swipe gestures', () => {
  it('Swipeable reports the dominant horizontal direction', () => {
    const dirs: SwipeDirection[] = [];
    const { container } = render(<Swipeable onSwipe={(d) => dirs.push(d)} />);
    const el = first(container);
    act(() => fire(el, 'pointerdown', { clientX: 200, clientY: 100 }));
    act(() => fire(el, 'pointerup', { clientX: 100, clientY: 100 }));
    expect(dirs).toEqual(['left']);
  });

  it('Swipeable picks the dominant vertical axis and ignores tiny moves', () => {
    const dirs: SwipeDirection[] = [];
    const { container } = render(<Swipeable threshold={30} onSwipe={(d) => dirs.push(d)} />);
    const el = first(container);
    act(() => fire(el, 'pointerdown', { clientX: 100, clientY: 200 }));
    act(() => fire(el, 'pointerup', { clientX: 110, clientY: 60 }));
    act(() => fire(el, 'pointerdown', { clientX: 0, clientY: 0 }));
    act(() => fire(el, 'pointerup', { clientX: 5, clientY: 5 }));
    expect(dirs).toEqual(['up']);
  });

  it('SwipeActions stays closed on a short pull', () => {
    const { container } = render(
      <SwipeActions actions={[{ label: 'Delete' }]}>
        <div>Row</div>
      </SwipeActions>,
    );
    const root = first(container);
    const content = root.querySelector('[data-testid="swipe-row-content"]') as HTMLElement;
    act(() => fire(content, 'pointerdown', { clientX: 200 }));
    act(() => fire(content, 'pointermove', { clientX: 190 }));
    act(() => fire(content, 'pointerup', { clientX: 190 }));
    expect(root.getAttribute('data-open')).toBe('false');
  });

  it('SwipeActions latches open and runs an action', () => {
    let ran = 0;
    const { container } = render(
      <SwipeActions
        actions={[
          {
            label: 'Delete',
            tone: 'danger',
            onAction: () => {
              ran++;
            },
          },
        ]}
      >
        <div>Row</div>
      </SwipeActions>,
    );
    const root = first(container);
    const content = root.querySelector('[data-testid="swipe-row-content"]') as HTMLElement;
    act(() => fire(content, 'pointerdown', { clientX: 200 }));
    act(() => fire(content, 'pointermove', { clientX: 120 }));
    act(() => fire(content, 'pointerup', { clientX: 120 }));
    expect(root.getAttribute('data-open')).toBe('true');

    const action = root.querySelector('button') as HTMLButtonElement;
    expect(action.textContent).toBe('Delete');
    expect(action.className).toContain('bg-danger');
    act(() => fire(action, 'click'));
    expect(ran).toBe(1);
    expect(root.getAttribute('data-open')).toBe('false');
  });

  it('SwipeActions is inert when disabled', () => {
    const { container } = render(
      <SwipeActions disabled actions={[{ label: 'Delete' }]}>
        <div>Row</div>
      </SwipeActions>,
    );
    const root = first(container);
    const content = root.querySelector('[data-testid="swipe-row-content"]') as HTMLElement;
    act(() => fire(content, 'pointerdown', { clientX: 200 }));
    act(() => fire(content, 'pointermove', { clientX: 100 }));
    act(() => fire(content, 'pointerup', { clientX: 100 }));
    expect(root.getAttribute('data-open')).toBe('false');
  });
});
