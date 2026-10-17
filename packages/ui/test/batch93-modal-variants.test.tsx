/** @jsxImportSource react */

import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { Modal } from '../components/overlay/Modal';
import { clampStep, WizardDialog } from '../components/overlay/ModalVariants';
import { act, fire, flushFrames, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

/** The dialog renders through `Portal` into `document.body`, not the container. */
function dialog(label: string): HTMLElement {
  const el = document.querySelector(`[role="dialog"][aria-label="${label}"]`);
  if (!el) throw new Error(`dialog not found: ${label}`);
  return el as HTMLElement;
}

function openModal(props: Record<string, unknown>) {
  return render(createElement(Modal, { open: true, onClose: () => {}, ...props }));
}

describe('Modal variants (batch 93)', () => {
  test('adds xl and fullscreen sizes', () => {
    const xl = openModal({ title: 'Xl modal', size: 'xl' });
    expect(dialog('Xl modal').className).toContain('max-w-4xl');
    xl.unmount();

    const fs = openModal({ title: 'Fs modal', size: 'fullscreen' });
    const panel = dialog('Fs modal');
    expect(panel.className).toContain('max-w-none');
    expect(panel.className).toContain('h-full w-full');
    fs.unmount();
  });

  test('side anchors the panel to the chosen edge', () => {
    const right = openModal({ title: 'Right modal', side: 'right' });
    const backdrop = document.querySelector('[role="presentation"]') as HTMLElement;
    expect(backdrop.className).toContain('justify-end');
    expect(dialog('Right modal').getAttribute('data-side')).toBe('right');
    expect(dialog('Right modal').className).toContain('h-full');
    right.unmount();

    const left = openModal({ title: 'Left modal', side: 'left' });
    const backdrop2 = document.querySelector('[role="presentation"]') as HTMLElement;
    expect(backdrop2.className).toContain('justify-start');
    left.unmount();
  });

  test('scrollable pins header and footer around a scrolling body', () => {
    const { unmount } = render(
      createElement(
        Modal,
        {
          open: true,
          onClose: () => {},
          title: 'Scroll modal',
          scrollable: true,
          footer: createElement('button', { type: 'button' }, 'Save'),
        },
        createElement('p', null, 'Long content'),
      ),
    );
    const panel = dialog('Scroll modal');
    expect(panel.className).toContain('flex max-h-full flex-col overflow-hidden');
    const body = panel.querySelector('p')?.parentElement as HTMLElement;
    expect(body.className).toContain('overflow-y-auto');
    expect(body.className).toContain('flex-1');
    const footer = panel.querySelector('button[type="button"]:not([aria-label])')
      ?.parentElement as HTMLElement;
    expect(footer.className).toContain('flex-none');
    unmount();
  });

  test('Escape closes by default and stays quiet when gated off', () => {
    let defaultEscapes = 0;
    const d = openModal({
      title: 'Esc modal',
      onClose: () => {
        defaultEscapes += 1;
      },
    });
    act(() => fire(document, 'keydown', { key: 'Escape' }));
    expect(defaultEscapes).toBe(1);
    d.unmount();

    let gatedEscapes = 0;
    const g = openModal({
      title: 'Gated modal',
      closeOnEscape: false,
      onClose: () => {
        gatedEscapes += 1;
      },
    });
    act(() => fire(document, 'keydown', { key: 'Escape' }));
    expect(gatedEscapes).toBe(0);
    g.unmount();
  });

  test('traps focus into the dialog unless disabled for a stack', async () => {
    const trapping = openModal({ title: 'Trap modal' });
    await flushFrames(1);
    const panel = dialog('Trap modal');
    expect(panel.contains(document.activeElement)).toBe(true);
    trapping.unmount();

    const free = openModal({ title: 'Free modal', trapFocus: false });
    await flushFrames(1);
    expect(dialog('Free modal').contains(document.activeElement)).toBe(false);
    free.unmount();
  });

  test('stacked modals: Escape only reaches the topmost one', () => {
    let outerCloses = 0;
    let innerCloses = 0;
    const { unmount } = render(
      createElement(
        Modal,
        {
          open: true,
          title: 'Outer modal',
          trapFocus: false,
          closeOnEscape: false,
          onClose: () => {
            outerCloses += 1;
          },
        },
        createElement(Modal, {
          open: true,
          title: 'Inner modal',
          onClose: () => {
            innerCloses += 1;
          },
        }),
      ),
    );
    expect(dialog('Outer modal')).toBeTruthy();
    expect(dialog('Inner modal')).toBeTruthy();
    act(() => fire(document, 'keydown', { key: 'Escape' }));
    expect(innerCloses).toBe(1);
    expect(outerCloses).toBe(0);
    unmount();
  });
});

describe('WizardDialog (batch 93)', () => {
  const steps = [
    { id: 's1', title: 'Details', content: createElement('p', null, 'Step one body') },
    { id: 's2', title: 'Members', content: createElement('p', null, 'Step two body') },
    { id: 's3', title: 'Review', content: createElement('p', null, 'Step three body') },
  ];

  test('shows the active step, count and progress dots', () => {
    const { unmount } = render(
      createElement(WizardDialog, {
        open: true,
        onClose: () => {},
        title: 'Create project',
        steps,
      }),
    );
    const panel = dialog('Create project');
    const text = panel.textContent ?? '';
    expect(text).toContain('Details');
    expect(text).toContain('Step 1 of 3');
    expect(text).toContain('Step one body');
    expect(text).not.toContain('Step two body');
    const dots = panel.querySelectorAll('[aria-label="Wizard steps"] li');
    expect(dots.length).toBe(3);
    expect(dots[0].getAttribute('aria-current')).toBe('step');
    unmount();
  });

  test('Next advances uncontrolled state and reports the step', () => {
    let changed = -1;
    const { unmount } = render(
      createElement(WizardDialog, {
        open: true,
        onClose: () => {},
        title: 'Wizard next',
        steps,
        onStepChange: (s: number) => {
          changed = s;
        },
      }),
    );
    const panel = dialog('Wizard next');
    const buttons = panel.querySelectorAll('button');
    const back = buttons[1] as HTMLButtonElement; // [close, back, next]
    const next = buttons[2] as HTMLButtonElement;
    expect(back.disabled).toBe(true);
    expect(next.textContent).toBe('Next');
    act(() => fire(next, 'click'));
    expect(changed).toBe(1);
    expect(panel.textContent).toContain('Step two body');
    expect((panel.querySelectorAll('button')[1] as HTMLButtonElement).disabled).toBe(false);
    unmount();
  });

  test('controlled mode keeps content put and reports only', () => {
    let changed = -1;
    const { unmount } = render(
      createElement(WizardDialog, {
        open: true,
        onClose: () => {},
        title: 'Wizard controlled',
        steps,
        step: 0,
        onStepChange: (s: number) => {
          changed = s;
        },
      }),
    );
    const panel = dialog('Wizard controlled');
    act(() => fire(panel.querySelectorAll('button')[2], 'click'));
    expect(changed).toBe(1);
    expect(panel.textContent).toContain('Step one body');
    expect(panel.textContent).not.toContain('Step two body');
    unmount();
  });

  test('last step swaps Next for Finish and fires onFinish', () => {
    let finished = 0;
    let changed = -1;
    const { unmount } = render(
      createElement(WizardDialog, {
        open: true,
        onClose: () => {},
        title: 'Wizard finish',
        steps,
        defaultStep: 2,
        finishLabel: 'Create',
        onFinish: () => {
          finished += 1;
        },
        onStepChange: (s: number) => {
          changed = s;
        },
      }),
    );
    const panel = dialog('Wizard finish');
    const next = panel.querySelectorAll('button')[2] as HTMLButtonElement;
    expect(next.textContent).toBe('Create');
    act(() => fire(next, 'click'));
    expect(finished).toBe(1);
    expect(changed).toBe(-1);
    unmount();
  });

  test('clampStep bounds the index and survives empty step lists', () => {
    expect(clampStep(-1, 3)).toBe(0);
    expect(clampStep(9, 3)).toBe(2);
    expect(clampStep(5, 0)).toBe(0);
    expect(clampStep(2, 3)).toBe(2);
  });
});
